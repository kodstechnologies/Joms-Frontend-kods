/**
 * Admin functional QA — create / update / delete + table actions.
 * Skips: advanced filter, export data, manage metrics.
 *
 * Usage:
 *   set QA_ADMIN_TOKEN=eyJ...
 *   node scripts/admin-functional-qa-audit.mjs
 */
import axios from 'axios'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import FormData from 'form-data'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPORT_DIR = path.join(__dirname, '..', 'reports')

const TOKEN =
  process.env.QA_ADMIN_TOKEN ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhNDRmYWM4MDdiYTVjNDAxODZkODNmMSIsInVzZXJUeXBlIjoiYWRtaW4iLCJuYW1lIjoiU3VwZXIgQWRtaW4iLCJlbWFpbCI6ImFkbWluQGtvZHMuY29tIiwia2luZCI6InN1cGVyYWRtaW4iLCJpc1N1cGVyQWRtaW4iOnRydWUsInBlcm1pc3Npb25zIjpbXSwic3ViQWRtaW5JZCI6bnVsbCwiaWF0IjoxNzg4MDc4MTk0LCJleHAiOjE3ODg2ODI5OTR9.rAdgtIZq_RSq-NILdwFXi7Yj9hPhojBZlqH3yBGI_fE'

const stamp = Date.now()
const tag = `qa-fn-${stamp}`

function client(baseURL) {
  return axios.create({
    baseURL,
    timeout: 60000,
    headers: { Authorization: `Bearer ${TOKEN}` },
    validateStatus: () => true,
  })
}

const admin = client('http://localhost:8001')
const expert = client('http://localhost:8004')
const venue = client('http://localhost:8005')
const membership = client('http://localhost:8006')
const settings = client('http://localhost:8007')
const payment = client('http://localhost:8008')
const kyc = client('http://localhost:8003')

const results = []

function classify(status, expect = []) {
  if (status >= 500) return 'ERROR'
  if (expect.length && expect.includes(status)) return 'Pass'
  if (status >= 200 && status < 400) return 'Pass'
  if ([400, 401, 403, 404, 409, 422].includes(status)) return 'Expected'
  return 'Partial'
}

async function step({ module, action, c, method, url, data, headers, expect, formData }) {
  const started = Date.now()
  try {
    const cfg = { method, url, data: formData || data, headers: { ...headers } }
    if (formData && typeof formData.getHeaders === 'function') {
      Object.assign(cfg.headers, formData.getHeaders())
    }
    const res = await c.request(cfg)
    const status = res.status
    const message = String(res.data?.message || res.data?.error || 'ok').slice(0, 220)
    const bucket = classify(status, expect)
    const row = {
      module,
      action,
      method,
      url,
      status,
      message,
      ms: Date.now() - started,
      bucket,
      is500: status >= 500,
      data: res.data?.data,
    }
    results.push(row)
    const flag = row.is500 ? ' ERROR ' : row.bucket.padEnd(8)
    console.log(`${flag} [${module}] ${action} — ${method} ${url} → ${status} ${message}`)
    return row
  } catch (err) {
    const row = {
      module,
      action,
      method,
      url,
      status: 0,
      message: err.message,
      ms: Date.now() - started,
      bucket: 'ERROR',
      is500: true,
    }
    results.push(row)
    console.log(` ERROR  [${module}] ${action} — ${method} ${url} → 0 ${err.message}`)
    return row
  }
}

function pickId(data, keys = ['_id', 'id']) {
  if (!data) return ''
  for (const k of keys) if (data[k]) return String(data[k])
  if (Array.isArray(data) && data[0]) return pickId(data[0], keys)
  return ''
}

async function run() {
  // ── LIST / READ smoke (roadblock check) ──
  const reads = [
    { module: 'Executive Dashboard', c: admin, url: '/admin/dashboard/executive-overview' },
    { module: 'My Task', c: admin, url: '/admin/tasks?tab=all' },
    { module: 'Expert Management', c: admin, url: '/admin/internal/admin/partners?limit=5' },
    { module: 'Expert Pending', c: admin, url: '/admin/internal/admin/partners?status=pending&limit=5' },
    { module: 'Service Management', c: expert, url: '/services/internal/admin/services?limit=5' },
    { module: 'Service Categories', c: expert, url: '/categories?limit=5' },
    { module: 'Venue Management', c: venue, url: '/venues/internal/admin/venues?limit=5' },
    { module: 'Venue Categories', c: venue, url: '/venue-categories?limit=5' },
    { module: 'Communication', c: settings, url: '/settings/communications?limit=5' },
    { module: 'Templates', c: settings, url: '/settings/templates/categories' },
    { module: 'Membership Plans', c: membership, url: '/memberships?limit=5' },
    { module: 'Referrals', c: admin, url: '/admin/referrals/expert-invites?limit=5' },
    { module: 'Finance Dashboard', c: payment, url: '/admin/finance/dashboard' },
    { module: 'Finance Payouts', c: payment, url: '/admin/finance/payouts?limit=5' },
    { module: 'Finance Refunds', c: payment, url: '/admin/finance/refunds?limit=5' },
    { module: 'Support Tickets', c: admin, url: '/admin/support-dashboard/tickets?limit=5' },
    { module: 'Platform Health', c: settings, url: '/settings/platform-health/dashboard' },
    { module: 'Main Settings', c: settings, url: '/settings/platform' },
    { module: 'RBAC Roles', c: admin, url: '/admin/rbac/roles?limit=5' },
    { module: 'Escalations', c: admin, url: '/admin/escalations?limit=5' },
  ]
  for (const r of reads) {
    await step({ module: r.module, action: 'List/load', c: r.c, method: 'GET', url: r.url })
  }

  // ── Service Category CRUD ──
  let categoryId = ''
  {
    const fd = new FormData()
    fd.append('name', `${tag}-svc-cat`)
    fd.append('description', 'Functional QA category')
    fd.append(
      'subCategories',
      JSON.stringify([]),
    )
    // Minimal 1x1 PNG so image validation passes
    const png = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
      'base64',
    )
    fd.append('image', png, { filename: 'qa.png', contentType: 'image/png' })
    const created = await step({
      module: 'Service Categories',
      action: 'Create category',
      c: expert,
      method: 'POST',
      url: '/categories',
      formData: fd,
    })
    categoryId = pickId(created.data)
    if (categoryId) {
      const fd2 = new FormData()
      fd2.append('name', `${tag}-svc-cat-edited`)
      fd2.append('description', 'Edited by functional QA')
      await step({
        module: 'Service Categories',
        action: 'Update category',
        c: expert,
        method: 'PATCH',
        url: `/categories/${categoryId}`,
        formData: fd2,
      })
      await step({
        module: 'Service Categories',
        action: 'Pause category',
        c: expert,
        method: 'PATCH',
        url: `/categories/${categoryId}/pause`,
      })
      await step({
        module: 'Service Categories',
        action: 'Resume category',
        c: expert,
        method: 'PATCH',
        url: `/categories/${categoryId}/resume`,
      })
      await step({
        module: 'Service Categories',
        action: 'Soft-delete category',
        c: expert,
        method: 'PATCH',
        url: `/categories/${categoryId}/delete`,
      })
      await step({
        module: 'Service Categories',
        action: 'Permanent-delete category',
        c: expert,
        method: 'DELETE',
        url: `/categories/${categoryId}/permanent-delete`,
      })
    }
  }

  // ── Venue Category CRUD ──
  let venueCatId = ''
  {
    const fd = new FormData()
    fd.append('name', `${tag}-venue-cat`)
    fd.append('description', 'Functional QA venue category')
    fd.append(
      'subCategories',
      JSON.stringify([{ name: `${tag}-vsub`, description: 'QA venue sub' }]),
    )
    const png = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
      'base64',
    )
    fd.append('image', png, { filename: 'qa.png', contentType: 'image/png' })
    const created = await step({
      module: 'Venue Categories',
      action: 'Create venue category',
      c: venue,
      method: 'POST',
      url: '/venue-categories',
      formData: fd,
    })
    venueCatId = pickId(created.data)
    if (venueCatId) {
      const fd2 = new FormData()
      fd2.append('name', `${tag}-venue-cat-edited`)
      fd2.append('description', 'Edited venue cat')
      await step({
        module: 'Venue Categories',
        action: 'Update venue category',
        c: venue,
        method: 'PATCH',
        url: `/venue-categories/${venueCatId}`,
        formData: fd2,
      })
      await step({
        module: 'Venue Categories',
        action: 'Pause venue category',
        c: venue,
        method: 'PATCH',
        url: `/venue-categories/${venueCatId}/pause`,
      })
      await step({
        module: 'Venue Categories',
        action: 'Resume venue category',
        c: venue,
        method: 'PATCH',
        url: `/venue-categories/${venueCatId}/resume`,
      })
      await step({
        module: 'Venue Categories',
        action: 'Soft-delete venue category',
        c: venue,
        method: 'PATCH',
        url: `/venue-categories/${venueCatId}/soft-delete`,
      })
      await step({
        module: 'Venue Categories',
        action: 'Hard-delete venue category',
        c: venue,
        method: 'DELETE',
        url: `/venue-categories/${venueCatId}/hard-delete`,
      })
    }
  }

  // ── Communication CRUD ──
  let commId = ''
  {
    const created = await step({
      module: 'Communication',
      action: 'Create communication',
      c: settings,
      method: 'POST',
      url: '/settings/communications',
      data: {
        title: `${tag} Announcement`,
        channel: 'in-app',
        type: 'announcement',
        audience: 'all-users',
        deliveryType: 'send-now',
        messageContent: 'Functional QA test message',
        priority: 'medium',
      },
    })
    commId = pickId(created.data)
    if (commId) {
      await step({
        module: 'Communication',
        action: 'Update communication',
        c: settings,
        method: 'PATCH',
        url: `/settings/communications/${commId}`,
        data: { title: `${tag} Announcement edited`, messageContent: 'Edited QA message' },
      })
      await step({
        module: 'Communication',
        action: 'Duplicate communication',
        c: settings,
        method: 'POST',
        url: `/settings/communications/${commId}/duplicate`,
      })
      await step({
        module: 'Communication',
        action: 'Delete communication',
        c: settings,
        method: 'DELETE',
        url: `/settings/communications/${commId}`,
      })
    }
  }

  // ── Templates: create/update/delete reason ──
  {
    const cats = await step({
      module: 'Templates',
      action: 'List template categories',
      c: settings,
      method: 'GET',
      url: '/settings/templates/categories',
    })
    const catList = Array.isArray(cats.data) ? cats.data : cats.data?.categories || []
    const catId = pickId(catList[0]) || pickId(cats.data)
    if (catId) {
      const created = await step({
        module: 'Templates',
        action: 'Create template reason',
        c: settings,
        method: 'POST',
        url: '/settings/templates/reasons',
        data: {
          categoryId: catId,
          title: `${tag} Reason`,
          description: 'QA reason',
          defaultMessageTemplate: 'Hello {{name}}',
          isActive: true,
        },
      })
      const reasonId = pickId(created.data)
      if (reasonId) {
        await step({
          module: 'Templates',
          action: 'Update template reason',
          c: settings,
          method: 'PATCH',
          url: `/settings/templates/reasons/${reasonId}`,
          data: { title: `${tag} Reason edited` },
        })
        await step({
          module: 'Templates',
          action: 'Toggle template reason',
          c: settings,
          method: 'PATCH',
          url: `/settings/templates/reasons/${reasonId}/toggle`,
        })
        await step({
          module: 'Templates',
          action: 'Delete template reason',
          c: settings,
          method: 'DELETE',
          url: `/settings/templates/reasons/${reasonId}`,
        })
      }
    }
  }

  // ── Membership plan CRUD ──
  {
    const fd = new FormData()
    fd.append('type', 'expert')
    fd.append('planName', `${tag}-plan`)
    fd.append(
      'pricing',
      JSON.stringify([
        { billingCycleName: 'monthly', price: 999, discount: 0 },
        { billingCycleName: 'yearly', price: 9999, discount: 10 },
      ]),
    )
    fd.append(
      'features',
      JSON.stringify({
        accessToBasicNetworkingFeatures: true,
        profileCustomization: true,
        dedicatedAccountManager: false,
        customFeatures: ['QA Feature'],
        items: [{ label: 'QA Feature', enabled: true }],
      }),
    )
    fd.append('trialPeriodDays', '7')
    fd.append('enableAutoRenew', 'true')
    fd.append('allowPlanUpgrades', 'true')
    fd.append('allowDowngradePlans', 'true')
    const created = await step({
      module: 'Membership',
      action: 'Create membership plan',
      c: membership,
      method: 'POST',
      url: '/memberships',
      formData: fd,
    })
    const planId = pickId(created.data)
    if (planId) {
      const fd2 = new FormData()
      fd2.append('planName', `${tag}-plan-edited`)
      await step({
        module: 'Membership',
        action: 'Update membership plan',
        c: membership,
        method: 'PATCH',
        url: `/memberships/${planId}`,
        formData: fd2,
      })
      await step({
        module: 'Membership',
        action: 'Pause membership plan',
        c: membership,
        method: 'PATCH',
        url: `/memberships/${planId}/pause`,
        data: {
          fromDate: new Date().toISOString(),
          toDate: new Date(Date.now() + 7 * 86400000).toISOString(),
          reasons: ['QA pause'],
          adminNotes: 'functional audit',
        },
      })
      await step({
        module: 'Membership',
        action: 'Resume membership plan',
        c: membership,
        method: 'PATCH',
        url: `/memberships/${planId}/resume`,
        data: { adminNotes: 'resume after QA' },
      })
      await step({
        module: 'Membership',
        action: 'Delete membership plan',
        c: membership,
        method: 'DELETE',
        url: `/memberships/${planId}`,
        data: { reasons: ['QA cleanup'], adminNotes: 'functional audit delete' },
      })
    }
  }

  // ── Referrals CRUD ──
  {
    const created = await step({
      module: 'Referrals',
      action: 'Create manual invite',
      c: admin,
      method: 'POST',
      url: '/admin/referrals/manual-invites',
      data: {
        name: `${tag} Invitee`,
        message: 'Join JOMS via QA invite',
        email: `qa.invite.${stamp}@example.com`,
        phone: `+9199${String(stamp).slice(-8)}`,
      },
    })
    const inviteId = pickId(created.data)
    if (inviteId) {
      await step({
        module: 'Referrals',
        action: 'Resend invite',
        c: admin,
        method: 'POST',
        url: `/admin/referrals/expert-invites/${inviteId}/resend`,
      })
      await step({
        module: 'Referrals',
        action: 'Delete invite',
        c: admin,
        method: 'DELETE',
        url: `/admin/referrals/expert-invites/${inviteId}`,
        data: { selectedReasons: ['QA cleanup'], adminNotes: 'functional audit' },
      })
    }
  }

  // ── RBAC: role create/update/delete ──
  {
    const created = await step({
      module: 'RBAC',
      action: 'Create role',
      c: admin,
      method: 'POST',
      url: '/admin/rbac/roles',
      data: {
        name: `${tag}-role`,
        description: 'Functional QA role',
        permissions: [],
        mfaRequired: false,
      },
    })
    const roleId = pickId(created.data)
    if (roleId) {
      await step({
        module: 'RBAC',
        action: 'Update role',
        c: admin,
        method: 'PATCH',
        url: `/admin/rbac/roles/${roleId}`,
        data: { description: 'Edited by functional QA' },
      })
      await step({
        module: 'RBAC',
        action: 'Disable role',
        c: admin,
        method: 'PATCH',
        url: `/admin/rbac/roles/${roleId}/disable`,
      })
      await step({
        module: 'RBAC',
        action: 'Enable role',
        c: admin,
        method: 'PATCH',
        url: `/admin/rbac/roles/${roleId}/enable`,
      })
      await step({
        module: 'RBAC',
        action: 'Delete role',
        c: admin,
        method: 'DELETE',
        url: `/admin/rbac/roles/${roleId}`,
      })
    }
  }

  // ── Main Settings save (non-destructive — send config body only) ──
  {
    const current = await step({
      module: 'Main Settings',
      action: 'Get platform settings',
      c: settings,
      method: 'GET',
      url: '/settings/platform',
    })
    const body = current.data?.config || current.data
    if (body && typeof body === 'object' && (body.applicationSettings || body.generalSettings)) {
      await step({
        module: 'Main Settings',
        action: 'Save platform settings (round-trip)',
        c: settings,
        method: 'PUT',
        url: '/settings/platform',
        data: body,
      })
    }
  }

  // ── Expert table actions (safe / reversible where possible) ──
  {
    const list = await step({
      module: 'Expert Management',
      action: 'Fetch partners for actions',
      c: admin,
      method: 'GET',
      url: '/admin/internal/admin/partners?limit=3',
    })
    const partners = list.data?.partners || list.data?.data || list.data || []
    const partner = Array.isArray(partners) ? partners[0] : null
    const partnerId = pickId(partner)
    if (partnerId) {
      await step({
        module: 'Expert Management',
        action: 'Update admin notes',
        c: admin,
        method: 'PATCH',
        url: `/admin/internal/admin/partners/${partnerId}/admin-notes`,
        data: { internalNotes: `QA note ${tag}` },
      })
      await step({
        module: 'Expert Management',
        action: 'Update admin tags',
        c: admin,
        method: 'PATCH',
        url: `/admin/internal/admin/partners/${partnerId}/admin-tags`,
        data: { tags: ['qa-audit'] },
      })
    }
  }

  // ── Support ticket actions ──
  {
    const tickets = await step({
      module: 'Support',
      action: 'List tickets',
      c: admin,
      method: 'GET',
      url: '/admin/support-dashboard/tickets?limit=3',
    })
    const list = tickets.data?.tickets || tickets.data?.data || tickets.data || []
    const ticket = Array.isArray(list) ? list[0] : null
    const ticketId = pickId(ticket)
    if (ticketId) {
      await step({
        module: 'Support',
        action: 'Post ticket message',
        c: admin,
        method: 'POST',
        url: `/admin/support-dashboard/tickets/${ticketId}/messages`,
        data: { content: `QA audit message ${tag}`, role: 'agent' },
      })
      await step({
        module: 'Support',
        action: 'Update ticket (priority)',
        c: admin,
        method: 'PATCH',
        url: `/admin/support-dashboard/tickets/${ticketId}`,
        data: { priority: ticket.priority || 'medium' },
      })
    }
  }

  // ── Finance non-destructive reads + note if resource exists ──
  {
    const payouts = await step({
      module: 'Finance',
      action: 'List payouts',
      c: payment,
      method: 'GET',
      url: '/admin/finance/payouts?limit=3',
    })
    const rows = payouts.data?.data || payouts.data?.payouts || payouts.data || []
    const payout = Array.isArray(rows) ? rows[0] : null
    const payoutId = pickId(payout)
    if (payoutId) {
      await step({
        module: 'Finance',
        action: 'Add finance note',
        c: payment,
        method: 'POST',
        url: `/admin/finance/${payoutId}/notes`,
        data: { resourceType: 'payout', adminNote: `QA note ${tag}` },
      })
    }
  }

  // ── Escalations list + start if any pending ──
  {
    const esc = await step({
      module: 'Escalations',
      action: 'List escalations',
      c: admin,
      method: 'GET',
      url: '/admin/escalations?limit=5',
    })
    const items = esc.data?.data || esc.data?.escalations || esc.data || []
    const first = Array.isArray(items) ? items[0] : null
    if (first?.entityType && (first.entityId || first.id)) {
      const entityId = first.entityId || first.id
      await step({
        module: 'Escalations',
        action: 'Start escalation review (if allowed)',
        c: admin,
        method: 'PATCH',
        url: `/admin/internal/admin/escalations/${first.entityType}/${entityId}/start`,
        expect: [200, 400, 404, 409],
      })
    }
  }

  // Summary
  const errors = results.filter((r) => r.is500)
  const passes = results.filter((r) => r.bucket === 'Pass')
  const expected = results.filter((r) => r.bucket === 'Expected')
  const partial = results.filter((r) => r.bucket === 'Partial')

  console.log('\n=== Admin Functional QA Summary ===')
  console.log(
    `Steps: ${results.length} | Pass: ${passes.length} | Expected: ${expected.length} | Partial: ${partial.length} | 500 errors: ${errors.length}`,
  )
  if (errors.length) {
    console.log('\n--- Internal Server Errors (roadblocks) ---')
    for (const e of errors) {
      console.log(`[${e.module}] ${e.action} — ${e.method} ${e.url} → ${e.status} ${e.message}`)
    }
  }

  fs.mkdirSync(REPORT_DIR, { recursive: true })
  const out = path.join(
    REPORT_DIR,
    `admin-functional-qa-${new Date().toISOString().replace(/[:.]/g, '-')}.json`,
  )
  fs.writeFileSync(
    out,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        skipped: ['advanced filter', 'export data', 'manage metrics'],
        summary: {
          total: results.length,
          pass: passes.length,
          expected: expected.length,
          partial: partial.length,
          errors500: errors.length,
        },
        errors: errors.map(({ module, action, method, url, status, message }) => ({
          module,
          action,
          method,
          url,
          status,
          message,
        })),
        results: results.map(({ data, ...rest }) => rest),
      },
      null,
      2,
    ),
  )
  console.log(`\nJSON report: ${out}`)
  process.exit(errors.length ? 1 : 0)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
