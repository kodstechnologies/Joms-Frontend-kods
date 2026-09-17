/**
 * Phase 1 Full Sidebar Action QA — API smoke for Dashboard, My Tasks, Expert Application
 * (Expert / Services / Venues) including status lists and key detail endpoints.
 *
 * Usage:
 *   $env:QA_ADMIN_TOKEN = (Get-Content reports/_qa-token.txt -Raw).Trim()
 *   node scripts/phase1-sidebar-qa-audit.mjs
 */
import axios from 'axios'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPORT_DIR = path.join(__dirname, '..', 'reports')

const TOKEN =
  process.env.QA_ADMIN_TOKEN ||
  (fs.existsSync(path.join(REPORT_DIR, '_qa-token.txt'))
    ? fs.readFileSync(path.join(REPORT_DIR, '_qa-token.txt'), 'utf8').trim()
    : '')

if (!TOKEN) {
  console.error('Set QA_ADMIN_TOKEN or write reports/_qa-token.txt')
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
const services = client('http://localhost:8004')
const venue = client('http://localhost:8005')
const auth = client('http://localhost:8000')
const kyc = client('http://localhost:8003')

const results = []

function classify(status) {
  if (status >= 500) return 'Fail'
  if (status >= 200 && status < 400) return 'Pass'
  if ([400, 401, 403, 404, 409, 422].includes(status)) return 'Partial'
  return 'Partial'
}

async function step({ group, page, action, c, method, url, data, params }) {
  const started = Date.now()
  try {
    const res = await c.request({ method, url, data, params })
    const status = res.status
    const message = String(res.data?.message || res.data?.error || 'ok').slice(0, 200)
    const row = {
      group,
      page,
      action,
      method,
      url,
      status,
      message,
      ms: Date.now() - started,
      bucket: classify(status),
      is500: status >= 500,
    }
    results.push(row)
    const flag = row.is500 ? 'FAIL' : row.bucket.toUpperCase().padEnd(7)
    console.log(`${flag} [${group}] ${page} › ${action} — ${method} ${url} → ${status}`)
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
      bucket: 'Fail',
      is500: true,
    }
    results.push(row)
    console.log(`FAIL    [${group}] ${page} › ${action} — ${err.message}`)
    return { res: null, row }
  }
}

function firstId(payload) {
  const d = payload?.data ?? payload
  const rows =
    d?.experts ||
    d?.partners ||
    d?.items ||
    d?.venues ||
    d?.services ||
    d?.listings ||
    d?.categories ||
    d?.tasks ||
    (Array.isArray(d) ? d : null) ||
    d?.data ||
    []
  const row = Array.isArray(rows) ? rows[0] : null
  return String(row?.id || row?._id || row?.partnerId || row?.venueId || '').trim()
}

async function main() {
  // ── 1A Dashboard + My Tasks ──
  await step({
    group: '1A',
    page: 'Executive Dashboard',
    action: 'Load overview',
    c: admin,
    method: 'GET',
    url: '/admin/dashboard/executive-overview',
  })
  await step({
    group: '1A',
    page: 'Executive Dashboard',
    action: 'Refresh overview',
    c: admin,
    method: 'GET',
    url: '/admin/dashboard/executive-overview',
    params: { refresh: 1 },
  })
  await step({
    group: '1A',
    page: 'My Task',
    action: 'List tasks',
    c: admin,
    method: 'GET',
    url: '/admin/tasks',
  })

  // ── 1B Expert ──
  // Paths aligned with FE clients (expert-api / leaderboard-api / expert-onboarding-api)
  await step({
    group: '1B',
    page: 'Expert Dashboard',
    action: 'Expert dashboard analytics',
    c: admin,
    method: 'GET',
    url: '/admin/internal/admin/experts/dashboard',
  })

  const expertsList = await step({
    group: '1B',
    page: 'Expert Management',
    action: 'List partners/experts',
    c: auth,
    method: 'GET',
    url: '/auth/partners/admin-list',
    params: { page: 1, limit: 10, serviceType: 'concierge' },
  })
  const expertId = firstId(expertsList.res?.data)

  for (const [page, params] of [
    ['Pending Approvals', { page: 1, limit: 10, status: 'pending' }],
    ['Suspended Experts', { page: 1, limit: 10, accountStatus: 'suspended' }],
    ['Reported Experts', { page: 1, limit: 10 }],
    ['Deleted Experts', { page: 1, limit: 10, accountStatus: 'deactivated' }],
  ]) {
    await step({
      group: '1B',
      page,
      action: 'List',
      c: auth,
      method: 'GET',
      url: '/auth/partners/admin-list',
      params: { ...params, serviceType: 'concierge' },
    })
  }

  if (expertId) {
    await step({
      group: '1B',
      page: 'Expert Profile',
      action: 'Get partner by id',
      c: auth,
      method: 'GET',
      url: `/auth/partners/${expertId}`,
    })
  }

  await step({
    group: '1B',
    page: 'Expert Leaderboard',
    action: 'Leaderboard',
    c: admin,
    method: 'GET',
    url: '/admin/internal/admin/experts/leaderboard',
    params: { serviceType: 'concierge', page: 1, limit: 10 },
  })

  await step({
    group: '1B',
    page: 'Expert Categories',
    action: 'List service categories (concierge)',
    c: auth,
    method: 'GET',
    url: '/service-category/getservicebyservicetype',
    params: { serviceType: 'concierge' },
  })

  // ── 1C Services ──
  await step({
    group: '1C',
    page: 'Services Dashboard',
    action: 'Marketplace dashboard',
    c: admin,
    method: 'GET',
    url: '/admin/marketplace/dashboard',
  })

  const svcList = await step({
    group: '1C',
    page: 'Service Management',
    action: 'List services',
    c: services,
    method: 'GET',
    url: '/services/internal/admin/services',
    params: { limit: 10 },
  })
  const serviceId = firstId(svcList.res?.data)

  for (const status of ['in_review', 'suspended', 'reported', 'deleted', 'active']) {
    await step({
      group: '1C',
      page: `Services ${status}`,
      action: 'List by status',
      c: services,
      method: 'GET',
      url: '/services/internal/admin/services',
      params: { status, limit: 5 },
    })
  }

  if (serviceId) {
    await step({
      group: '1C',
      page: 'Service View',
      action: 'Get service detail',
      c: services,
      method: 'GET',
      url: `/api/admin/services/${serviceId}`,
    })
  }

  await step({
    group: '1C',
    page: 'Service Categories',
    action: 'Categories list',
    c: auth,
    method: 'GET',
    url: '/service-category/getservicebyservicetype',
    params: { serviceType: 'concierge' },
  })

  // ── 1D Venues ──
  await step({
    group: '1D',
    page: 'Venue Dashboard',
    action: 'Venue dashboard',
    c: venue,
    method: 'GET',
    url: '/venues/dashboard',
  })

  const venuePartners = await step({
    group: '1D',
    page: 'Venue Management',
    action: 'List venue partners',
    c: auth,
    method: 'GET',
    url: '/auth/partners/admin-list',
    params: { page: 1, limit: 10, serviceType: 'venue' },
  })
  const venuePartnerId = firstId(venuePartners.res?.data)

  await step({
    group: '1D',
    page: 'Venue Listings',
    action: 'Admin venues list',
    c: venue,
    method: 'GET',
    url: '/venues/internal/admin/venues',
    params: { limit: 10 },
  })

  for (const status of ['pending', 'suspended', 'rejected', 'reported', 'deleted']) {
    await step({
      group: '1D',
      page: `Venues ${status}`,
      action: 'List partners/venues filtered',
      c: auth,
      method: 'GET',
      url: '/auth/partners/admin-list',
      params: { page: 1, limit: 5, serviceType: 'venue', status },
    })
  }

  if (venuePartnerId) {
    await step({
      group: '1D',
      page: 'Venue Profile',
      action: 'Get venue partner',
      c: auth,
      method: 'GET',
      url: `/auth/partners/${venuePartnerId}`,
    })
    await step({
      group: '1D',
      page: 'Venue KYC',
      action: 'KYC by partner',
      c: kyc,
      method: 'GET',
      url: `/venue-kyc/admin/partner/${venuePartnerId}`,
    })
  }

  await step({
    group: '1D',
    page: 'Venue Leaderboard',
    action: 'Leaderboard',
    c: admin,
    method: 'GET',
    url: '/admin/internal/admin/experts/leaderboard',
    params: { serviceType: 'venue', page: 1, limit: 10 },
  })

  await step({
    group: '1D',
    page: 'Venue Categories',
    action: 'Categories list',
    c: auth,
    method: 'GET',
    url: '/service-category/getservicebyservicetype',
    params: { serviceType: 'venue' },
  })

  // Summary
  const byBucket = results.reduce((acc, r) => {
    acc[r.bucket] = (acc[r.bucket] || 0) + 1
    return acc
  }, {})
  const fails = results.filter((r) => r.bucket === 'Fail' || r.is500)

  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  const outPath = path.join(REPORT_DIR, `phase1-sidebar-qa-${stamp}.json`)
  fs.mkdirSync(REPORT_DIR, { recursive: true })
  fs.writeFileSync(
    outPath,
    JSON.stringify(
      {
        phase: 1,
        generatedAt: new Date().toISOString(),
        counts: byBucket,
        total: results.length,
        fails,
        results,
        seed: { expertId, serviceId, venuePartnerId },
      },
      null,
      2,
    ),
  )

  console.log('\n=== Phase 1 API summary ===')
  console.log(byBucket)
  console.log('total', results.length)
  console.log('report', outPath)
  if (fails.length) {
    console.log('\nFailures:')
    fails.forEach((f) => console.log(` - [${f.group}] ${f.page} › ${f.action}: ${f.status} ${f.message}`))
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
