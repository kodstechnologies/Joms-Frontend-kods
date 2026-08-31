/**
 * Partner API QA audit — smoke-test partner-scoped endpoints.
 *
 * Usage (provide YOUR partner JWT):
 *   set QA_PARTNER_TOKEN=eyJhbGci...
 *   node scripts/partner-qa-audit.mjs
 *
 * Or login first:
 *   set QA_PARTNER_PHONE=9900000001
 *   set QA_PARTNER_PASSWORD=your-password
 *   node scripts/partner-qa-audit.mjs
 *
 * Optional: QA_PARTNER_ID overrides partner id used in path params (default: decoded from JWT).
 */
import axios from 'axios'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPORT_DIR = path.join(__dirname, '..', 'reports')

const AUTH_BASE = process.env.QA_AUTH_BASE || 'http://localhost:8000'
const SERVICE_BASE = process.env.QA_SERVICE_BASE || 'http://localhost:8004'
const VENUE_BASE = process.env.QA_VENUE_BASE || 'http://localhost:8005'
const KYC_BASE = process.env.QA_KYC_BASE || 'http://localhost:8003'
const MEMBERSHIP_BASE = process.env.QA_MEMBERSHIP_BASE || 'http://localhost:8006'
const CHAT_BASE = process.env.QA_CHAT_BASE || 'http://localhost:8009'
const NOTIFICATION_BASE = process.env.QA_NOTIFICATION_BASE || 'http://localhost:8010'
const PROFILE_BASE = process.env.QA_PROFILE_BASE || 'http://localhost:8002'

async function resolveToken() {
  if (process.env.QA_PARTNER_TOKEN) {
    return process.env.QA_PARTNER_TOKEN.trim()
  }

  const phone = process.env.QA_PARTNER_PHONE?.trim()
  const password = process.env.QA_PARTNER_PASSWORD
  if (phone && password) {
    const res = await axios.post(
      `${AUTH_BASE}/auth/loginwithphone`,
      { phone, password },
      { timeout: 30000, validateStatus: () => true },
    )
    const token = res.data?.data?.accessToken
    if (!token) {
      throw new Error(
        `Partner login failed (${res.status}): ${res.data?.message || 'no token in response'}`,
      )
    }
    return token
  }

  throw new Error(
    'Set QA_PARTNER_TOKEN or QA_PARTNER_PHONE + QA_PARTNER_PASSWORD before running this audit.',
  )
}

function decodePartner(token) {
  try {
    const part = token.split('.')[1]
    if (!part) return { id: '', userType: '', servicetype: '', name: '' }
    const payload = JSON.parse(Buffer.from(part, 'base64url').toString('utf8'))
    return {
      id: String(payload?.id || payload?._id || ''),
      userType: String(payload?.userType || ''),
      servicetype: String(payload?.servicetype || payload?.serviceType || ''),
      name: String(payload?.name || payload?.fullname || ''),
    }
  } catch {
    return { id: '', userType: '', servicetype: '', name: '' }
  }
}

function client(baseURL, token) {
  return axios.create({
    baseURL,
    timeout: 45000,
    headers: { Authorization: `Bearer ${token}` },
    validateStatus: () => true,
  })
}

async function hit({ c, m, u, name, group }) {
  const started = Date.now()
  try {
    const res = await c.request({ method: m, url: u })
    const ms = Date.now() - started
    const status = res.status
    const message = res.data?.message || res.data?.error || 'ok'
    const is500 = status >= 500
    const isPass = status >= 200 && status < 400
    const isExpectedDenied = status === 401 || status === 403 || status === 404 || status === 400
    const bucket = is500 ? 'ERROR' : isPass ? 'Pass' : isExpectedDenied ? 'Expected' : 'Partial'
    return {
      group,
      name,
      method: m,
      url: u,
      status,
      message: String(message).slice(0, 200),
      ms,
      bucket,
      is500,
    }
  } catch (err) {
    const ms = Date.now() - started
    return {
      group,
      name,
      method: m,
      url: u,
      status: 0,
      message: err.message,
      ms,
      bucket: 'ERROR',
      is500: true,
    }
  }
}

function buildChecks(partnerId, serviceType) {
  const auth = (token) => client(AUTH_BASE, token)
  const svc = (token) => client(SERVICE_BASE, token)
  const venue = (token) => client(VENUE_BASE, token)
  const kyc = (token) => client(KYC_BASE, token)
  const membership = (token) => client(MEMBERSHIP_BASE, token)
  const chat = (token) => client(CHAT_BASE, token)
  const notify = (token) => client(NOTIFICATION_BASE, token)
  const profile = (token) => client(PROFILE_BASE, token)

  const checks = (token) => [
    // Auth & account
    { group: 'Auth', name: 'Referral info', c: auth(token), m: 'GET', u: '/auth/referral-info' },
    { group: 'Auth', name: 'Contact details', c: auth(token), m: 'GET', u: '/auth/contact-details' },
    { group: 'Auth', name: 'Account report status', c: auth(token), m: 'GET', u: '/auth/account-report' },
    { group: 'Auth', name: 'Delete account status', c: auth(token), m: 'GET', u: '/auth/delete-account' },
    { group: 'Auth', name: 'Two-step status', c: auth(token), m: 'GET', u: '/auth/two-step' },
    { group: 'Auth', name: 'Walkthrough', c: auth(token), m: 'GET', u: '/auth/walkthrough' },
    {
      group: 'Auth',
      name: 'Own partner profile',
      c: auth(token),
      m: 'GET',
      u: `/auth/partners/${partnerId}`,
    },

    // KYC (concierge + shared)
    { group: 'KYC', name: 'Digilocker config', c: kyc(token), m: 'GET', u: '/digilocker/config' },
    {
      group: 'KYC',
      name: 'Concierge KYC me',
      c: kyc(token),
      m: 'GET',
      u: '/concierge-kyc/concierge/me',
    },
    {
      group: 'KYC',
      name: 'Concierge banking me',
      c: kyc(token),
      m: 'GET',
      u: '/concierge-banking/me',
    },
    {
      group: 'KYC',
      name: 'Venue KYC me',
      c: kyc(token),
      m: 'GET',
      u: '/venue-kyc/me',
    },

    // Services & consultations
    { group: 'Services', name: 'My services', c: svc(token), m: 'GET', u: '/services/my-services' },
    {
      group: 'Services',
      name: 'Listing pricing config',
      c: svc(token),
      m: 'GET',
      u: '/services/pricing-config',
    },
    {
      group: 'Services',
      name: 'My banking details',
      c: svc(token),
      m: 'GET',
      u: '/services/banking/me',
    },
    { group: 'Services', name: 'Consultations list', c: svc(token), m: 'GET', u: '/consultations?limit=5' },
    { group: 'Services', name: 'Consultation topics', c: svc(token), m: 'GET', u: '/consultations/topics' },
    { group: 'Services', name: 'Partner quotations', c: svc(token), m: 'GET', u: '/quotations?limit=5' },
    {
      group: 'Services',
      name: 'Partner insights home',
      c: svc(token),
      m: 'GET',
      u: '/partner-insights/home',
    },
    {
      group: 'Services',
      name: 'Partner insights overview',
      c: svc(token),
      m: 'GET',
      u: '/partner-insights/overview',
    },
    {
      group: 'Services',
      name: 'Partner insights earnings',
      c: svc(token),
      m: 'GET',
      u: '/partner-insights/earnings',
    },
    {
      group: 'Services',
      name: 'Partner insights bookings',
      c: svc(token),
      m: 'GET',
      u: '/partner-insights/bookings?limit=5',
    },

    // Venues (venue partners — concierge may get 403/404, that is Expected)
    { group: 'Venues', name: 'Owner venues', c: venue(token), m: 'GET', u: '/venues/owner' },
    { group: 'Venues', name: 'Venue profile', c: venue(token), m: 'GET', u: '/venues/profile' },
    {
      group: 'Venues',
      name: 'Venue partner insights home',
      c: venue(token),
      m: 'GET',
      u: '/partner-insights/home',
    },

    // Membership
    {
      group: 'Membership',
      name: 'Membership catalog',
      c: membership(token),
      m: 'GET',
      u: '/memberships?limit=5',
    },
    {
      group: 'Membership',
      name: 'My subscription',
      c: membership(token),
      m: 'GET',
      u: '/subscriptions/me',
    },

    // Chat & notifications
    { group: 'Chat', name: 'Chat threads', c: chat(token), m: 'GET', u: '/chat/threads?limit=5' },
    {
      group: 'Notifications',
      name: 'In-app notifications',
      c: notify(token),
      m: 'GET',
      u: '/notifications/in-app/me?limit=5',
    },
    {
      group: 'Notifications',
      name: 'In-app unread count',
      c: notify(token),
      m: 'GET',
      u: '/notifications/in-app/me/unread-count',
    },
    {
      group: 'Notifications',
      name: 'In-app preference',
      c: notify(token),
      m: 'GET',
      u: '/notifications/in-app/preference',
    },
    {
      group: 'Notifications',
      name: 'Alert preferences',
      c: notify(token),
      m: 'GET',
      u: '/notifications/alerts/preference',
    },

    // Profile / offerings
    {
      group: 'Profile',
      name: 'Concierge profile me',
      c: profile(token),
      m: 'GET',
      u: '/profile/me',
    },
    {
      group: 'Profile',
      name: 'My offerings',
      c: profile(token),
      m: 'GET',
      u: '/offerings/',
    },
  ]

  if (serviceType === 'venue') {
    // venue-specific ordering — already included above
  }

  return checks
}

function printReport(partner, results) {
  const errors = results.filter((r) => r.is500)
  const passes = results.filter((r) => r.bucket === 'Pass')
  const expected = results.filter((r) => r.bucket === 'Expected')
  const partial = results.filter((r) => r.bucket === 'Partial')

  console.log('\n=== Partner API Audit Report ===')
  console.log(`Partner: ${partner.name || partner.id || 'unknown'} (${partner.userType || '?'})`)
  console.log(`Service type: ${partner.servicetype || 'unknown'}`)
  console.log(`Checks: ${results.length} | Pass: ${passes.length} | Expected deny: ${expected.length} | Partial: ${partial.length} | 500 errors: ${errors.length}`)

  for (const row of results) {
    const flag = row.is500 ? ' ERROR ' : row.bucket.padEnd(8)
    console.log(`${flag} [${row.group}] ${row.name} — ${row.status} ${row.message}`)
  }

  if (errors.length) {
    console.log('\n--- Internal Server Errors (500+) ---')
    for (const e of errors) {
      console.log(`[${e.group}] ${e.method} ${e.url} → ${e.status} ${e.message}`)
    }
  }

  return { errors, passes, expected, partial }
}

async function main() {
  const token = await resolveToken()
  const partner = decodePartner(token)
  const partnerId = process.env.QA_PARTNER_ID?.trim() || partner.id
  if (!partnerId) {
    throw new Error('Could not decode partner id from token. Set QA_PARTNER_ID if needed.')
  }

  const checks = buildChecks(partnerId, partner.servicetype)
  const results = []
  for (const check of checks(token)) {
    results.push(await hit(check))
  }

  const summary = printReport(partner, results)

  fs.mkdirSync(REPORT_DIR, { recursive: true })
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  const reportPath = path.join(REPORT_DIR, `partner-qa-audit-${stamp}.json`)
  const payload = {
    generatedAt: new Date().toISOString(),
    partner: { ...partner, id: partnerId },
    summary: {
      total: results.length,
      pass: summary.passes.length,
      expected: summary.expected.length,
      partial: summary.partial.length,
      errors500: summary.errors.length,
    },
    results,
  }
  fs.writeFileSync(reportPath, JSON.stringify(payload, null, 2))
  console.log(`\nJSON report: ${reportPath}`)

  process.exit(summary.errors.length ? 1 : 0)
}

main().catch((err) => {
  console.error(err.message || err)
  process.exit(1)
})
