/**
 * Expert Application full QA — every sidebar page + actions.
 * Flags: 500 ISE, unexpected errors, empty/static-looking payloads.
 *
 * Usage:
 *   set QA_ADMIN_TOKEN=eyJ...
 *   node scripts/expert-application-qa-audit.mjs
 */
import axios from 'axios'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPORT_DIR = path.join(__dirname, '..', 'reports')

const TOKEN =
  process.env.QA_ADMIN_TOKEN ||
  ''

if (!TOKEN) {
  console.error('Set QA_ADMIN_TOKEN before running')
  process.exit(1)
}

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
const kyc = client('http://localhost:8003')
const auth = client('http://localhost:8000')

const results = []

function classify(status) {
  if (status >= 500) return 'ERROR'
  if (status >= 200 && status < 400) return 'Pass'
  if ([400, 401, 403, 404, 409, 422].includes(status)) return 'Expected'
  return 'Partial'
}

function looksStatic(data) {
  if (data == null) return false
  const s = JSON.stringify(data)
  if (!s || s === '{}' || s === '[]' || s === 'null') return 'empty-payload'
  // Heuristic: hardcoded demo strings
  if (/lorem ipsum|dummy data|sample data|TODO|placeholder/i.test(s)) return 'placeholder-text'
  return false
}

async function step({ group, page, action, c, method, url, data, expect = [] }) {
  const started = Date.now()
  try {
    const res = await c.request({ method, url, data })
    const status = res.status
    const message = String(res.data?.message || res.data?.error || 'ok').slice(0, 220)
    let bucket = classify(status)
    if (expect.length && expect.includes(status)) bucket = 'Pass'
    const staticHint = status < 400 ? looksStatic(res.data?.data ?? res.data) : false
    const row = {
      group,
      page,
      action,
      method,
      url,
      status,
      message,
      ms: Date.now() - started,
      bucket,
      is500: status >= 500,
      staticHint: staticHint || null,
      sampleKeys:
        res.data?.data && typeof res.data.data === 'object' && !Array.isArray(res.data.data)
          ? Object.keys(res.data.data).slice(0, 12)
          : Array.isArray(res.data?.data)
            ? [`array(${res.data.data.length})`]
            : [],
    }
    results.push(row)
    const flag = row.is500 ? ' ERROR ' : row.staticHint ? ' STATIC ' : row.bucket.padEnd(8)
    console.log(`${flag} [${group}] ${page} › ${action} — ${method} ${url} → ${status} ${message}${row.staticHint ? ` (${row.staticHint})` : ''}`)
    return { res, row }
  } catch (err) {
    const row = {
      group,
      page,
      action,
      method,
      url,
      status: 0,
      message: err.message,
      ms: Date.now() - started,
      bucket: 'ERROR',
      is500: true,
      staticHint: null,
      sampleKeys: [],
    }
    results.push(row)
    console.log(` ERROR  [${group}] ${page} › ${action} — ${method} ${url} → 0 ${err.message}`)
    return { res: null, row }
  }
}

function pickId(data, keys = ['_id', 'id', 'partnerId', 'venueId', 'kycId']) {
  if (!data) return ''
  for (const k of keys) if (data[k]) return String(data[k])
  if (Array.isArray(data) && data[0]) return pickId(data[0], keys)
  if (data.partners?.[0]) return pickId(data.partners[0], keys)
  if (data.experts?.[0]) return pickId(data.experts[0], keys)
  if (data.data?.[0]) return pickId(data.data[0], keys)
  return ''
}

function firstRow(data) {
  if (Array.isArray(data)) return data[0]
  if (Array.isArray(data?.partners)) return data.partners[0]
  if (Array.isArray(data?.experts)) return data.experts[0]
  if (Array.isArray(data?.data)) return data.data[0]
  if (Array.isArray(data?.items)) return data.items[0]
  if (Array.isArray(data?.venues)) return data.venues[0]
  if (Array.isArray(data?.categories)) return data.categories[0]
  if (Array.isArray(data?.reports)) return data.reports[0]
  return null
}

async function run() {
  // ═══════════ EXPERT ═══════════
  await step({ group: 'Expert', page: 'Dashboard', action: 'Load dashboard metrics', c: admin, method: 'GET', url: '/admin/internal/admin/experts/dashboard' })
  await step({ group: 'Expert', page: 'Dashboard', action: 'UI prefs metrics', c: admin, method: 'GET', url: '/admin/ui-preferences/experts-dashboard/dashboard-metrics' })

  const partnersRes = await step({ group: 'Expert', page: 'Management', action: 'List partners', c: admin, method: 'GET', url: '/admin/internal/admin/partners?limit=5' })
  const partner = firstRow(partnersRes.res?.data?.data)
  const partnerId = pickId(partner)

  await step({ group: 'Expert', page: 'Pending', action: 'List pending', c: admin, method: 'GET', url: '/admin/internal/admin/partners?status=pending&limit=5' })
  await step({ group: 'Expert', page: 'Suspended', action: 'List suspended', c: admin, method: 'GET', url: '/admin/internal/admin/partners?status=suspended&limit=5' })
  await step({ group: 'Expert', page: 'Deleted', action: 'List deactivated', c: admin, method: 'GET', url: '/admin/internal/admin/partners?status=deactivated&limit=5' })
  await step({ group: 'Expert', page: 'Reported', action: 'List expert reports', c: admin, method: 'GET', url: '/admin/internal/admin/reports/experts?limit=5' })
  await step({ group: 'Expert', page: 'Leaderboard', action: 'List leaderboard', c: admin, method: 'GET', url: '/admin/internal/admin/experts/leaderboard?serviceType=concierge&limit=10' })

  if (partnerId) {
    await step({ group: 'Expert', page: 'Management', action: 'Get partner detail', c: admin, method: 'GET', url: `/admin/internal/admin/partners/${partnerId}` })
    await step({ group: 'Expert', page: 'Management', action: 'Application view', c: admin, method: 'GET', url: `/admin/internal/admin/partners/${partnerId}/application-view` })
    await step({ group: 'Expert', page: 'Management', action: 'Update admin notes', c: admin, method: 'PATCH', url: `/admin/internal/admin/partners/${partnerId}/admin-notes`, data: { internalNotes: `QA note ${Date.now()}` } })
    await step({ group: 'Expert', page: 'Management', action: 'Update admin tags', c: admin, method: 'PATCH', url: `/admin/internal/admin/partners/${partnerId}/admin-tags`, data: { tags: ['qa-audit'] } })
    await step({ group: 'Expert', page: 'Leaderboard', action: 'Leaderboard partner drawer', c: admin, method: 'GET', url: `/admin/internal/admin/experts/leaderboard/${partnerId}` })
    // Non-destructive: only verify suspend endpoint exists via OPTIONS-less dry note update already covered
  }

  await step({ group: 'Expert', page: 'Pending', action: 'Escalate assignees list', c: admin, method: 'GET', url: '/admin/rbac/sub-admins?limit=5' })
  // Create-onboarding category lookup (UI may send wrong casing)
  await step({ group: 'Expert', page: 'Create', action: 'Categories by serviceType (camel — UI bug?)', c: auth, method: 'GET', url: '/service-category/getservicebyservicetype?serviceType=concierge', expect: [200, 400] })
  await step({ group: 'Expert', page: 'Create', action: 'Categories by servicetype (lowercase — works)', c: auth, method: 'GET', url: '/service-category/getservicebyservicetype?servicetype=concierge' })

  // ═══════════ SERVICES ═══════════
  await step({ group: 'Services', page: 'Dashboard', action: 'Marketplace dashboard', c: expert, method: 'GET', url: '/admin/marketplace/dashboard' })
  const svcRes = await step({ group: 'Services', page: 'Management', action: 'List services', c: expert, method: 'GET', url: '/services/internal/admin/services?limit=5' })
  const service = firstRow(svcRes.res?.data?.data)
  const serviceId = pickId(service)

  await step({ group: 'Services', page: 'Pending', action: 'List in_review', c: expert, method: 'GET', url: '/services/internal/admin/services?status=in_review&limit=5' })
  await step({ group: 'Services', page: 'Suspended', action: 'List suspended', c: expert, method: 'GET', url: '/services/internal/admin/services?status=suspended&limit=5' })
  await step({ group: 'Services', page: 'Deleted', action: 'List deleted', c: expert, method: 'GET', url: '/services/internal/admin/services?status=deleted&limit=5' })
  await step({ group: 'Services', page: 'Reported', action: 'List service reports', c: expert, method: 'GET', url: '/services/internal/admin/reports/services?limit=5' })

  if (serviceId) {
    await step({ group: 'Services', page: 'Management', action: 'Drilldown detail', c: expert, method: 'GET', url: `/services/internal/admin/services/${serviceId}/detail`, expect: [200, 404] })
    await step({ group: 'Services', page: 'Management', action: 'Drilldown performance', c: expert, method: 'GET', url: `/services/internal/admin/services/${serviceId}/performance`, expect: [200, 404] })
    await step({ group: 'Services', page: 'Management', action: 'Drilldown orders', c: expert, method: 'GET', url: `/services/internal/admin/services/${serviceId}/orders?limit=5`, expect: [200, 404] })
    await step({ group: 'Services', page: 'Management', action: 'Drilldown revisions', c: expert, method: 'GET', url: `/services/internal/admin/services/${serviceId}/revisions?limit=5`, expect: [200, 404] })
    await step({ group: 'Services', page: 'Create/Edit', action: 'GET /api/admin/services/:id (onboarding editor)', c: expert, method: 'GET', url: `/api/admin/services/${serviceId}`, expect: [200, 404] })
  }

  await step({ group: 'Services', page: 'Categories', action: 'List categories', c: expert, method: 'GET', url: '/categories?limit=10' })
  await step({ group: 'Services', page: 'Categories', action: 'Category metrics', c: expert, method: 'GET', url: '/categories/metrics' })
  await step({ group: 'Services', page: 'Categories', action: 'Paused categories', c: expert, method: 'GET', url: '/categories?status=PAUSED&limit=5' })
  await step({ group: 'Services', page: 'Categories', action: 'Deleted categories', c: expert, method: 'GET', url: '/categories?status=DELETED&limit=5' })
  const catRes = await step({ group: 'Services', page: 'Categories', action: 'Category detail probe', c: expert, method: 'GET', url: '/categories?limit=1' })
  const catId = pickId(firstRow(catRes.res?.data?.data) || firstRow(catRes.res?.data))
  if (catId) {
    await step({ group: 'Services', page: 'Categories', action: 'Get category by id', c: expert, method: 'GET', url: `/categories/${catId}` })
    await step({ group: 'Services', page: 'Categories', action: 'List subcategories', c: expert, method: 'GET', url: `/categories/${catId}/sub-categories?limit=10`, expect: [200, 404] })
  }
  await step({ group: 'Services', page: 'Create', action: 'Pricing config', c: expert, method: 'GET', url: '/services/pricing-config' })
  await step({ group: 'Services', page: 'Create', action: 'Consultation topics', c: expert, method: 'GET', url: '/consultations/topics?limit=5' })
  await step({ group: 'Services', page: 'Management', action: 'List consultations (admin)', c: expert, method: 'GET', url: '/consultations?limit=5', expect: [200, 404] })
  await step({ group: 'Services', page: 'Management', action: 'Admin consultations list', c: expert, method: 'GET', url: '/admin/consultations?limit=5', expect: [200, 404] })

  // ═══════════ VENUES ═══════════
  await step({ group: 'Venues', page: 'Dashboard', action: 'Venue dashboard', c: venue, method: 'GET', url: '/venues/dashboard' })
  await step({ group: 'Venues', page: 'Management', action: 'Management metrics', c: venue, method: 'GET', url: '/venues/management/metrics' })
  const venueRes = await step({ group: 'Venues', page: 'Management', action: 'List venues', c: venue, method: 'GET', url: '/venues/internal/admin/venues?limit=5' })
  const venueRow = firstRow(venueRes.res?.data?.data)
  const venueId = pickId(venueRow, ['_id', 'id', 'venueId'])

  await step({ group: 'Venues', page: 'Pending', action: 'List in_review', c: venue, method: 'GET', url: '/venues/internal/admin/venues?status=in_review&limit=5' })
  await step({ group: 'Venues', page: 'Suspended', action: 'List suspended', c: venue, method: 'GET', url: '/venues/internal/admin/venues?status=suspended&limit=5' })
  await step({ group: 'Venues', page: 'Deleted', action: 'List deleted', c: venue, method: 'GET', url: '/venues/internal/admin/venues?status=deleted&limit=5' })
  await step({ group: 'Venues', page: 'Rejected', action: 'List rejected', c: venue, method: 'GET', url: '/venues/internal/admin/venues?status=rejected&limit=5' })
  // Frontend currently calls venueApiClient + /kyc/... (wrong host + path)
  await step({ group: 'Venues', page: 'Reported', action: 'List venue reports (UI path via venue :8005)', c: venue, method: 'GET', url: '/kyc/internal/admin/reports/venues?limit=5', expect: [200, 404] })
  await step({ group: 'Venues', page: 'Reported', action: 'List venue reports (correct kyc :8003)', c: kyc, method: 'GET', url: '/venue-kyc/internal/admin/reports/venues?limit=5' })
  await step({ group: 'Venues', page: 'Leaderboard', action: 'Venue leaderboard', c: admin, method: 'GET', url: '/admin/internal/admin/experts/leaderboard?serviceType=venue&limit=10' })

  if (venueId) {
    await step({ group: 'Venues', page: 'Management', action: 'Venue detail', c: venue, method: 'GET', url: `/venues/${venueId}`, expect: [200, 404] })
    await step({ group: 'Venues', page: 'Management', action: 'Venue admin get', c: venue, method: 'GET', url: `/venues/admin/${venueId}`, expect: [200, 404] })
    await step({ group: 'Venues', page: 'Management', action: 'Venue full-view', c: venue, method: 'GET', url: `/venues/admin/${venueId}/full-view`, expect: [200, 404] })
    await step({ group: 'Venues', page: 'Management', action: 'Venue KYC application details', c: kyc, method: 'GET', url: `/venue-kyc/admin/application/${venueId}`, expect: [200, 404] })
  }

  await step({ group: 'Venues', page: 'Categories', action: 'List venue categories', c: venue, method: 'GET', url: '/venue-categories?limit=10' })
  await step({ group: 'Venues', page: 'Categories', action: 'Venue category metrics', c: venue, method: 'GET', url: '/venue-categories/metrics' })
  await step({ group: 'Venues', page: 'Categories', action: 'Paused venue categories', c: venue, method: 'GET', url: '/venue-categories/paused?limit=5' })
  await step({ group: 'Venues', page: 'Categories', action: 'Deleted venue categories', c: venue, method: 'GET', url: '/venue-categories/deleted?limit=5' })
  const vCatRes = await step({ group: 'Venues', page: 'Categories', action: 'Venue category list for id', c: venue, method: 'GET', url: '/venue-categories?limit=1' })
  const vCatId = pickId(firstRow(vCatRes.res?.data?.data) || firstRow(vCatRes.res?.data))
  if (vCatId) {
    await step({ group: 'Venues', page: 'Categories', action: 'Get venue category by id', c: venue, method: 'GET', url: `/venue-categories/${vCatId}` })
  }
  await step({ group: 'Venues', page: 'Create', action: 'Amenities master', c: venue, method: 'GET', url: '/amenities-master' })

  // KYC helpers used by application flows
  if (partnerId) {
    await step({ group: 'Expert', page: 'Application', action: 'Concierge KYC by partner', c: kyc, method: 'GET', url: `/concierge-kyc/admin/partner/${partnerId}`, expect: [200, 400, 404] })
    await step({ group: 'Expert', page: 'Application', action: 'Concierge application details', c: kyc, method: 'GET', url: `/concierge-kyc/admin/application/${partnerId}`, expect: [200, 400, 404] })
  }

  // Summary
  const errors = results.filter((r) => r.is500)
  const passes = results.filter((r) => r.bucket === 'Pass')
  const expected = results.filter((r) => r.bucket === 'Expected')
  const partial = results.filter((r) => r.bucket === 'Partial')
  const staticRows = results.filter((r) => r.staticHint)

  console.log('\n=== Expert Application QA Summary ===')
  console.log(
    `Steps: ${results.length} | Pass: ${passes.length} | Expected: ${expected.length} | Partial: ${partial.length} | Static hints: ${staticRows.length} | 500 errors: ${errors.length}`,
  )

  if (errors.length) {
    console.log('\n--- Internal Server Errors (500+) ---')
    for (const e of errors) {
      console.log(`[${e.group}/${e.page}] ${e.action} — ${e.method} ${e.url} → ${e.status} ${e.message}`)
    }
  }
  if (staticRows.length) {
    console.log('\n--- Possible static / empty payloads ---')
    for (const s of staticRows) {
      console.log(`[${s.group}/${s.page}] ${s.action} — ${s.staticHint}`)
    }
  }

  fs.mkdirSync(REPORT_DIR, { recursive: true })
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  const out = path.join(REPORT_DIR, `expert-application-qa-${stamp}.json`)
  fs.writeFileSync(
    out,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        scope: 'Expert Application (Expert + Services + Venues)',
        summary: {
          total: results.length,
          pass: passes.length,
          expected: expected.length,
          partial: partial.length,
          staticHints: staticRows.length,
          errors500: errors.length,
        },
        errors: errors.map(({ group, page, action, method, url, status, message }) => ({
          group,
          page,
          action,
          method,
          url,
          status,
          message,
        })),
        staticHints: staticRows.map(({ group, page, action, url, staticHint }) => ({
          group,
          page,
          action,
          url,
          staticHint,
        })),
        results,
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
