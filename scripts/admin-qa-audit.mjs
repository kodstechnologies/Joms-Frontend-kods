
import axios from 'axios'

const TOKEN =
  process.env.QA_ADMIN_TOKEN ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhNDRmYWM4MDdiYTVjNDAxODZkODNmMSIsInVzZXJUeXBlIjoiYWRtaW4iLCJuYW1lIjoiU3VwZXIgQWRtaW4iLCJlbWFpbCI6ImFkbWluQGtvZHMuY29tIiwia2luZCI6InN1cGVyYWRtaW4iLCJpc1N1cGVyQWRtaW4iOnRydWUsInBlcm1pc3Npb25zIjpbXSwic3ViQWRtaW5JZCI6bnVsbCwiaWF0IjoxNzg4MDc4MTk0LCJleHAiOjE3ODg2ODI5OTR9.rAdgtIZq_RSq-NILdwFXi7Yj9hPhojBZlqH3yBGI_fE'

const FRONTEND = 'http://localhost:5173'

const admin = axios.create({
  baseURL: 'http://localhost:8001',
  timeout: 45000,
  headers: { Authorization: `Bearer ${TOKEN}` },
})
const expert = axios.create({
  baseURL: 'http://localhost:8004',
  timeout: 45000,
  headers: { Authorization: `Bearer ${TOKEN}` },
})
const venue = axios.create({
  baseURL: 'http://localhost:8005',
  timeout: 45000,
  headers: { Authorization: `Bearer ${TOKEN}` },
})
const membership = axios.create({
  baseURL: 'http://localhost:8006',
  timeout: 45000,
  headers: { Authorization: `Bearer ${TOKEN}` },
})
const settings = axios.create({
  baseURL: 'http://localhost:8007',
  timeout: 45000,
  headers: { Authorization: `Bearer ${TOKEN}` },
})
const payment = axios.create({
  baseURL: 'http://localhost:8008',
  timeout: 45000,
  headers: { Authorization: `Bearer ${TOKEN}` },
})

const ROUTES = [
  { name: 'Executive Dashboard', path: '/dashboard/executive', apis: [{ c: admin, m: 'GET', u: '/admin/dashboard/executive-overview' }] },
  { name: 'My Task', path: '/my-tasks', apis: [{ c: admin, m: 'GET', u: '/admin/tasks?tab=all' }] },
  { name: 'Expert Dashboard', path: '/experts/dashboard', apis: [{ c: admin, m: 'GET', u: '/admin/internal/admin/experts/dashboard' }] },
  { name: 'Expert Management', path: '/experts/management', apis: [{ c: admin, m: 'GET', u: '/admin/internal/admin/partners?limit=5' }] },
  { name: 'Expert Leaderboard', path: '/experts/leaderboard', apis: [{ c: admin, m: 'GET', u: '/admin/internal/admin/experts/leaderboard?limit=5' }] },
  { name: 'Services Dashboard', path: '/services/dashboard', apis: [{ c: expert, m: 'GET', u: '/admin/marketplace/dashboard' }] },
  { name: 'Service Management', path: '/services/management', apis: [{ c: expert, m: 'GET', u: '/services/internal/admin/services?limit=5' }] },
  { name: 'Service Categories', path: '/categories/management', apis: [{ c: expert, m: 'GET', u: '/categories?limit=5' }] },
  { name: 'Venue Dashboard', path: '/venues/dashboard', apis: [{ c: venue, m: 'GET', u: '/venues/dashboard' }] },
  { name: 'Venue Management', path: '/venues/management', apis: [{ c: venue, m: 'GET', u: '/venues/internal/admin/venues?limit=5' }] },
  { name: 'Venue Leaderboard', path: '/venues/leaderboard', apis: [{ c: admin, m: 'GET', u: '/admin/internal/admin/experts/leaderboard?serviceType=venue&limit=5' }] },
  { name: 'Venue Categories', path: '/venues/categories/management', apis: [{ c: venue, m: 'GET', u: '/venue-categories?limit=5' }] },
  { name: 'Expert Pending Approvals', path: '/experts/pending-approvals', apis: [{ c: admin, m: 'GET', u: '/admin/internal/admin/partners?status=pending&limit=5' }] },
  { name: 'Expert Suspended', path: '/experts/suspended', apis: [{ c: admin, m: 'GET', u: '/admin/internal/admin/partners?status=suspended&limit=5' }] },
  { name: 'Expert Deleted', path: '/experts/deleted', apis: [{ c: admin, m: 'GET', u: '/admin/internal/admin/partners?status=deleted&limit=5' }] },
  { name: 'Expert Reported', path: '/experts/reported', apis: [{ c: admin, m: 'GET', u: '/admin/internal/admin/reports/experts?limit=5' }] },
  { name: 'Service Pending', path: '/services/management/pending', apis: [{ c: expert, m: 'GET', u: '/services/internal/admin/services?status=pending&limit=5' }] },
  { name: 'Service Suspended', path: '/services/management/suspended', apis: [{ c: expert, m: 'GET', u: '/services/internal/admin/services?status=suspended&limit=5' }] },
  { name: 'Service Reported', path: '/services/management/reported', apis: [{ c: expert, m: 'GET', u: '/services/internal/admin/reports/services?limit=5' }] },
  { name: 'Service Deleted', path: '/services/management/deleted', apis: [{ c: expert, m: 'GET', u: '/services/internal/admin/services?status=deleted&limit=5' }] },
  { name: 'Venue Pending', path: '/venues/management/pending', apis: [{ c: venue, m: 'GET', u: '/venues/internal/admin/venues?status=pending&limit=5' }] },
  { name: 'Venue Suspended', path: '/venues/management/suspended', apis: [{ c: venue, m: 'GET', u: '/venues/internal/admin/venues?status=suspended&limit=5' }] },
  { name: 'Venue Reported', path: '/venues/management/reported', apis: [{ c: venue, m: 'GET', u: '/venues/internal/admin/venues?status=reported&limit=5' }] },
  { name: 'Venue Deleted', path: '/venues/management/deleted', apis: [{ c: venue, m: 'GET', u: '/venues/internal/admin/venues?status=deleted&limit=5' }] },
  { name: 'Venue Rejected', path: '/venues/management/rejected', apis: [{ c: venue, m: 'GET', u: '/venues/internal/admin/venues?status=rejected&limit=5' }] },
  { name: 'Membership Experts', path: '/memberships/experts', apis: [{ c: membership, m: 'GET', u: '/subscriptions?limit=5' }] },
  { name: 'Finance Escrow', path: '/finance/escrow', apis: [{ c: payment, m: 'GET', u: '/admin/finance/escrow?limit=5' }] },
  { name: 'Finance Events', path: '/finance/events', apis: [{ c: payment, m: 'GET', u: '/admin/finance/revenue?module=event&limit=5' }] },
  { name: 'Settings Logs', path: '/settings/logs', apis: [{ c: settings, m: 'GET', u: '/settings/logs?limit=5' }] },
  { name: 'Settings Policies', path: '/settings/policies', apis: [{ c: settings, m: 'GET', u: '/settings/policies?limit=5' }] },
  { name: 'Locked Accounts', path: '/settings/security/locked-accounts', apis: [{ c: settings, m: 'GET', u: '/settings/security/locked-accounts?limit=5' }] },
  { name: 'Login Trails', path: '/settings/security/login-trails', apis: [{ c: settings, m: 'GET', u: '/settings/security/login-trails?limit=5' }] },
  { name: 'Communication', path: '/communication/management', apis: [{ c: settings, m: 'GET', u: '/settings/communications?limit=5' }] },
  { name: 'Templates', path: '/content-moderation/templates', apis: [{ c: settings, m: 'GET', u: '/settings/templates/categories' }] },
  { name: 'Membership Plans', path: '/memberships/plans', apis: [{ c: membership, m: 'GET', u: '/memberships?limit=5' }] },
  { name: 'Referrals', path: '/referrals/management', apis: [{ c: admin, m: 'GET', u: '/admin/referrals/expert-invites?limit=5' }] },
  { name: 'Finance Dashboard', path: '/finance/dashboard', apis: [{ c: payment, m: 'GET', u: '/admin/finance/dashboard' }] },
  { name: 'Finance Revenue', path: '/finance/revenue', apis: [{ c: payment, m: 'GET', u: '/admin/finance/revenue?limit=5' }] },
  { name: 'Finance Services', path: '/finance/services', apis: [{ c: payment, m: 'GET', u: '/admin/finance/revenue?module=service&limit=5' }] },
  { name: 'Finance Venues', path: '/finance/venues', apis: [{ c: payment, m: 'GET', u: '/admin/finance/revenue?module=venue&limit=5' }] },
  { name: 'Finance Memberships', path: '/finance/memberships', apis: [{ c: membership, m: 'GET', u: '/subscriptions?limit=5' }] },
  { name: 'Finance Payouts', path: '/finance/payouts', apis: [{ c: payment, m: 'GET', u: '/admin/finance/payouts?limit=5' }] },
  { name: 'Finance Refunds', path: '/finance/refunds', apis: [{ c: payment, m: 'GET', u: '/admin/finance/refunds?limit=5' }] },
  { name: 'Finance Tax', path: '/finance/tax', apis: [{ c: payment, m: 'GET', u: '/admin/finance/tax?limit=5' }] },
  { name: 'Finance Invoices', path: '/finance/invoices', apis: [{ c: payment, m: 'GET', u: '/admin/finance/invoices?limit=5' }] },
  { name: 'Finance Reconciliation', path: '/finance/reconciliation', apis: [{ c: payment, m: 'GET', u: '/admin/finance/reconciliation?limit=5' }] },
  { name: 'Support Dashboard', path: '/support/dashboard', apis: [{ c: admin, m: 'GET', u: '/admin/support-dashboard/stats' }] },
  { name: 'Support Tickets', path: '/support/tickets', apis: [{ c: admin, m: 'GET', u: '/admin/support-dashboard/tickets?limit=5' }] },
  { name: 'Support Workspace', path: '/support/workspace', apis: [{ c: admin, m: 'GET', u: '/admin/support-dashboard/tickets?limit=5' }] },
  { name: 'Platform Health', path: '/settings/health', apis: [{ c: settings, m: 'GET', u: '/settings/platform-health/dashboard' }] },
  { name: 'Main Settings', path: '/settings/main', apis: [{ c: settings, m: 'GET', u: '/settings/platform' }] },
  { name: 'RBAC', path: '/settings/access', apis: [{ c: admin, m: 'GET', u: '/admin/rbac/roles?limit=5' }] },
  { name: 'Escalations', path: '/settings/escalations', apis: [{ c: admin, m: 'GET', u: '/admin/escalations?limit=5' }] },
]

async function hitApi({ c, m, u }) {
  try {
    const res = await c.request({ method: m, url: u })
    const ok = res.status >= 200 && res.status < 400
    return { ok, status: res.status, message: res.data?.message || 'ok', is500: res.status >= 500 }
  } catch (err) {
    const status = err.response?.status || 0
    const message = err.response?.data?.message || err.message
    return { ok: status >= 200 && status < 400, status, message, is500: status >= 500 }
  }
}

async function checkFrontend(path) {
  try {
    const res = await axios.get(`${FRONTEND}${path}`, { timeout: 15000, validateStatus: () => true })
    const html = String(res.data || '')
    const spaOk = res.status === 200 && html.includes('id="root"')
    return { ok: spaOk, status: res.status, note: spaOk ? 'SPA shell loads' : 'Missing root mount' }
  } catch (err) {
    return { ok: false, status: 0, note: err.message }
  }
}

const results = []

for (const route of ROUTES) {
  const apiResults = await Promise.all(route.apis.map((a) => hitApi(a)))
  const apiOk = apiResults.every((r) => r.ok)
  const has500 = apiResults.some((r) => r.is500)
  const apiDetail = apiResults
    .map((r, i) => `${route.apis[i].m} ${route.apis[i].u} → ${r.status} ${r.message}`)
    .join('; ')
  const fe = await checkFrontend(route.path)
  const status = has500
    ? 'ERROR'
    : fe.ok && apiOk
      ? 'Pass'
      : fe.ok && !apiOk
        ? 'Partial'
        : !fe.ok
          ? 'Fail'
          : 'Partial'
  results.push({ ...route, status, fe, apiDetail, apiOk, has500 })
  process.stdout.write(`${status.padEnd(8)} ${route.name}${has500 ? ' (500)' : ''}\n`)
}

const errors = results.filter((r) => r.has500 || r.status === 'ERROR' || r.status === 'Fail')
const partials = results.filter((r) => r.status === 'Partial')

console.log(`\n--- Summary: ${results.filter((r) => r.status === 'Pass').length} pass, ${partials.length} partial, ${errors.length} errors ---`)
if (errors.length) {
  console.log('\n--- Errors / 500s ---')
  for (const r of errors) console.log(`${r.name}: ${r.apiDetail}`)
}
if (partials.length) {
  console.log('\n--- Partial (non-500 API issues) ---')
  for (const r of partials) console.log(`${r.name}: ${r.apiDetail}`)
}

console.log('\n--- JSON ---')
console.log(JSON.stringify(results, null, 2))
