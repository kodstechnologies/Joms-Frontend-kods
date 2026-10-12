/**
 * Phase 2 Full Sidebar Action QA — API smoke
 * Content Moderation, Membership, Referrals, Finance
 *
 * Usage:
 *   $env:QA_ADMIN_TOKEN = (Get-Content reports/_qa-token.txt -Raw).Trim()
 *   node scripts/phase2-sidebar-qa-audit.mjs
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
const membership = client('http://localhost:8006')
const payment = client('http://localhost:8008')

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
  // 2A Content
  await step({
    group: '2A',
    page: 'Communication',
    action: 'List communications',
    c: settings,
    method: 'GET',
    url: '/settings/communications',
    params: { page: 1, limit: 10 },
  })
  await step({
    group: '2A',
    page: 'Communication',
    action: 'Options/audiences',
    c: settings,
    method: 'GET',
    url: '/settings/communications/options',
  })
  await step({
    group: '2A',
    page: 'Templates',
    action: 'List template categories',
    c: settings,
    method: 'GET',
    url: '/settings/templates/categories',
  })

  // 2B Membership
  await step({
    group: '2B',
    page: 'Membership Plans',
    action: 'List plans',
    c: membership,
    method: 'GET',
    url: '/memberships',
    params: { page: 1, limit: 20 },
  })
  await step({
    group: '2B',
    page: 'Membership Plans',
    action: 'Plan stats',
    c: membership,
    method: 'GET',
    url: '/memberships/stats',
  })
  await step({
    group: '2B',
    page: 'Expert Memberships',
    action: 'List subscriptions',
    c: membership,
    method: 'GET',
    url: '/subscriptions',
    params: { page: 1, limit: 10 },
  })

  // 2C Referrals
  await step({
    group: '2C',
    page: 'Referrals',
    action: 'List expert invites',
    c: admin,
    method: 'GET',
    url: '/admin/referrals/expert-invites',
    params: { page: 1, limit: 10 },
  })
  await step({
    group: '2C',
    page: 'Referrals',
    action: 'Referral stats',
    c: admin,
    method: 'GET',
    url: '/admin/referrals/stats',
  })

  // 2D Finance — paths from finance-api.ts
  const financeGets = [
    ['Finance Dashboard', '/admin/finance/dashboard'],
    ['Revenue Overview', '/admin/finance/revenue'],
    ['Finance Escrow', '/admin/finance/escrow'],
    ['Payouts', '/admin/finance/payouts'],
    ['Refunds', '/admin/finance/refunds'],
    ['Disputes', '/admin/finance/disputes'],
    ['Tax', '/admin/finance/tax'],
    ['Invoices', '/admin/finance/invoices'],
    ['Reconciliation', '/admin/finance/reconciliation'],
  ]

  for (const [page, url] of financeGets) {
    await step({
      group: '2D',
      page,
      action: 'List/load',
      c: payment,
      method: 'GET',
      url,
      params: { page: 1, limit: 10 },
    })
  }

  const byBucket = results.reduce((acc, r) => {
    acc[r.bucket] = (acc[r.bucket] || 0) + 1
    return acc
  }, {})
  const fails = results.filter((r) => r.bucket === 'Fail' || r.is500)
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  const outPath = path.join(REPORT_DIR, `phase2-sidebar-qa-${stamp}.json`)
  fs.mkdirSync(REPORT_DIR, { recursive: true })
  fs.writeFileSync(
    outPath,
    JSON.stringify(
      { phase: 2, generatedAt: new Date().toISOString(), counts: byBucket, total: results.length, fails, results },
      null,
      2,
    ),
  )
  console.log('\n=== Phase 2 API summary ===')
  console.log(byBucket)
  console.log('total', results.length)
  console.log('report', outPath)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
