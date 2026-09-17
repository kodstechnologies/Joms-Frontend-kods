/**
 * Phase 3 Full Sidebar Action QA — API smoke
 * Support, Settings, RBAC
 *
 * Usage:
 *   $env:QA_ADMIN_TOKEN = (Get-Content reports/_qa-token.txt -Raw).Trim()
 *   node scripts/phase3-sidebar-qa-audit.mjs
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
const settings = client('http://localhost:8007')

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

async function main() {
  // 3A Support
  await step({
    group: '3A',
    page: 'Support Dashboard',
    action: 'Stats',
    c: admin,
    method: 'GET',
    url: '/admin/support-dashboard/stats',
  })
  await step({
    group: '3A',
    page: 'Support Tickets',
    action: 'List tickets',
    c: admin,
    method: 'GET',
    url: '/admin/support-dashboard/tickets',
    params: { page: 1, limit: 10 },
  })
  await step({
    group: '3A',
    page: 'Support Agents',
    action: 'List agents',
    c: admin,
    method: 'GET',
    url: '/admin/support-dashboard/agents',
  })

  // 3B Settings
  for (const mod of [
    'platform',
    'security',
    'notifications',
    'finance',
    'expert',
    'venue',
    'service',
  ]) {
    await step({
      group: '3B',
      page: 'Main Settings',
      action: `Get ${mod}`,
      c: settings,
      method: 'GET',
      url: `/settings/${mod}`,
    })
  }
  await step({
    group: '3B',
    page: 'Setting Logs',
    action: 'List logs',
    c: settings,
    method: 'GET',
    url: '/settings/logs',
    params: { page: 1, limit: 10 },
  })
  await step({
    group: '3B',
    page: 'Locked Accounts',
    action: 'List',
    c: settings,
    method: 'GET',
    url: '/settings/security/locked-accounts',
    params: { page: 1, limit: 10 },
  })
  await step({
    group: '3B',
    page: 'Login Trails',
    action: 'List',
    c: settings,
    method: 'GET',
    url: '/settings/security/login-trails',
    params: { page: 1, limit: 10 },
  })
  await step({
    group: '3B',
    page: 'Backups',
    action: 'List',
    c: settings,
    method: 'GET',
    url: '/settings/backups',
    params: { page: 1, limit: 10 },
  })
  await step({
    group: '3B',
    page: 'Incidents',
    action: 'List',
    c: settings,
    method: 'GET',
    url: '/settings/incidents',
    params: { page: 1, limit: 10 },
  })
  await step({
    group: '3B',
    page: 'Templates',
    action: 'Categories',
    c: settings,
    method: 'GET',
    url: '/settings/templates/categories',
  })
  await step({
    group: '3B',
    page: 'Platform Health',
    action: 'Dashboard',
    c: settings,
    method: 'GET',
    url: '/settings/platform-health/dashboard',
  })
  await step({
    group: '3B',
    page: 'Escalations',
    action: 'List',
    c: admin,
    method: 'GET',
    url: '/admin/escalations',
    params: { page: 1, limit: 10 },
  })

  // 3C RBAC
  await step({
    group: '3C',
    page: 'RBAC',
    action: 'Me',
    c: admin,
    method: 'GET',
    url: '/admin/rbac/me',
  })
  await step({
    group: '3C',
    page: 'RBAC',
    action: 'Stats',
    c: admin,
    method: 'GET',
    url: '/admin/rbac/stats',
  })
  await step({
    group: '3C',
    page: 'RBAC Roles',
    action: 'List roles',
    c: admin,
    method: 'GET',
    url: '/admin/rbac/roles',
    params: { page: 1, limit: 20 },
  })
  await step({
    group: '3C',
    page: 'RBAC Users',
    action: 'List sub-admins',
    c: admin,
    method: 'GET',
    url: '/admin/rbac/sub-admins',
    params: { page: 1, limit: 20 },
  })
  await step({
    group: '3C',
    page: 'RBAC Invites',
    action: 'List invites',
    c: admin,
    method: 'GET',
    url: '/admin/rbac/invites',
    params: { page: 1, limit: 20 },
  })
  await step({
    group: '3C',
    page: 'RBAC Permissions',
    action: 'List permissions',
    c: admin,
    method: 'GET',
    url: '/admin/rbac/permissions',
  })

  const byBucket = results.reduce((acc, r) => {
    acc[r.bucket] = (acc[r.bucket] || 0) + 1
    return acc
  }, {})
  const fails = results.filter((r) => r.bucket === 'Fail' || r.is500)
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  const outPath = path.join(REPORT_DIR, `phase3-sidebar-qa-${stamp}.json`)
  fs.mkdirSync(REPORT_DIR, { recursive: true })
  fs.writeFileSync(
    outPath,
    JSON.stringify(
      { phase: 3, generatedAt: new Date().toISOString(), counts: byBucket, total: results.length, fails, results },
      null,
      2,
    ),
  )
  const consolePath = path.join(REPORT_DIR, 'phase3-api-console.txt')
  const lines = results.map(
    (r) =>
      `${r.is500 ? 'FAIL' : r.bucket.toUpperCase().padEnd(7)} [${r.group}] ${r.page} › ${r.action} — ${r.method} ${r.url} → ${r.status}`,
  )
  fs.writeFileSync(
    consolePath,
    lines.join('\n') + `\n\n=== Phase 3 API summary ===\n${JSON.stringify(byBucket)}\ntotal ${results.length}\nreport ${outPath}\n`,
  )
  console.log('\n=== Phase 3 API summary ===')
  console.log(byBucket)
  console.log('total', results.length)
  console.log('report', outPath)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
