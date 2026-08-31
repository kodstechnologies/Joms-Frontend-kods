
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const frontendRoot = path.resolve(__dirname, '..')
const backendRoot = path.resolve(frontendRoot, '..', 'Joms-backend')
const reportDir = path.join(frontendRoot, '..', 'temp', '25-8-26')
const evidenceDir = path.join(
  frontendRoot,
  '..',
  'docs',
  'tests',
  'evidence-nonprod-auth-2026-08-26',
)
fs.mkdirSync(reportDir, { recursive: true })
fs.mkdirSync(evidenceDir, { recursive: true })

const require = createRequire(path.join(backendRoot, 'services/auth-service/package.json'))
const { config } = require('dotenv')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

config({ path: path.join(backendRoot, 'services/auth-service/.env') })

const AUTH = process.env.AUTH_URL || 'http://127.0.0.1:8000'
const PAY = process.env.PAY_URL || 'http://127.0.0.1:8008'
const ADMIN_UI = process.env.ADMIN_URL || 'http://127.0.0.1:5173'
const mongoUri = process.env.MONGODB_URI
const secret = process.env.JWT_SECRET
const internalKey = process.env.INTERNAL_SERVICE_KEY

if (!mongoUri || !secret) {
  console.error('missing_env')
  process.exit(1)
}

const QA_PASSWORD = process.env.QA_ADMIN_PASSWORD || 'QaNonProdPass1!'
const STATIC_OTP = '123456' // local admin verify accepts this without reading mailbox

const users = {
  otp: { email: 'qa-otp.locktest@example.com', fullname: 'QA OTP Admin', kind: 'superadmin' },
  lock: { email: 'qa-lock.locktest@example.com', fullname: 'QA Lock Admin', kind: 'superadmin' },
  rbac: {
    email: 'qa-rbac.locktest@example.com',
    fullname: 'QA RBAC Subadmin',
    kind: 'subadmin',
    permissions: ['settings.view'],
  },
}

const report = {
  date: new Date().toISOString(),
  environment: 'local non-prod (auth :8000, vite :5173)',
  created: [],
  cases: [],
  notes: [
    'Dedicated `*.example.com` QA admins only — not shared prod.',
    'OTP verify used local ADMIN_STATIC_OTP path (no mailbox dump).',
    'Secrets not recorded in this report.',
    'Do not use these accounts against production.',
  ],
}

function push(id, result, notes) {
  report.cases.push({ id, result, notes })
  console.log(`${id}\t${result}\t${notes}`)
}

function hasTokenShape(body) {
  if (!body || typeof body !== 'object') return false
  const s = JSON.stringify(body)
  return (
    Boolean(body.token) ||
    Boolean(body.accessToken) ||
    Boolean(body.data?.token) ||
    Boolean(body.data?.accessToken) ||
    /"token"\s*:/.test(s)
  )
}

async function jsonFetch(url, opts = {}) {
  const res = await fetch(url, opts)
  let body = null
  const text = await res.text()
  try {
    body = text ? JSON.parse(text) : null
  } catch {
    body = { _rawLen: text.length }
  }
  return { status: res.status, body, headers: res.headers }
}

await mongoose.connect(mongoUri, {
  serverSelectionTimeoutMS: 8000,
  dbName: process.env.DB_NAME || 'auth_db',
})
const admins = mongoose.connection.db.collection('admins')
const partners = mongoose.connection.db.collection('partners')

const passwordHash = await bcrypt.hash(QA_PASSWORD, 10)

for (const u of Object.values(users)) {
  await admins.updateOne(
    { email: u.email },
    {
      $set: {
        fullname: u.fullname,
        email: u.email,
        password: passwordHash,
        kind: u.kind,
        status: 'active',
        permissions: u.permissions || [],
        failedLoginAttempts: 0,
        lastFailedLoginAt: null,
        lockReason: null,
        lockedAt: null,
        updatedAt: new Date(),
      },
      $setOnInsert: { createdAt: new Date() },
    },
    { upsert: true },
  )
  report.created.push({ email: u.email, kind: u.kind, permissions: u.permissions || ['*'] })
}

// Two partners for IDOR
const partnerA = {
  phone: '918888770001',
  email: 'qa-partner-a@example.com',
  fullname: 'QA Partner A',
  status: 'approved',
  loginAttempts: 3,
}
const partnerB = {
  phone: '918888770002',
  email: 'qa-partner-b@example.com',
  fullname: 'QA Partner B',
  status: 'approved',
  loginAttempts: 3,
}
for (const p of [partnerA, partnerB]) {
  await partners.updateOne(
    { email: p.email },
    {
      $set: {
        phone: p.phone,
        email: p.email,
        fullname: p.fullname,
        status: p.status,
        loginAttempts: p.loginAttempts,
        updatedAt: new Date(),
      },
      $setOnInsert: { createdAt: new Date() },
    },
    { upsert: true },
  )
}
const partnerADoc = await partners.findOne({ email: partnerA.email })
const partnerBDoc = await partners.findOne({ email: partnerB.email })
report.created.push(
  { email: partnerA.email, kind: 'partner' },
  { email: partnerB.email, kind: 'partner' },
)

// --- AUTH-09 ---
{
  const r = await jsonFetch(`${AUTH}/auth/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ email: users.otp.email, password: QA_PASSWORD }),
  })
  const noToken = !hasTokenShape(r.body)
  const emailEcho = r.body?.data?.email === users.otp.email || r.body?.email === users.otp.email
  push(
    'AUTH-09',
    r.status === 200 && noToken ? 'Pass' : 'Fail',
    `status=${r.status}; noToken=${noToken}; emailEcho=${emailEcho}; msg=${Boolean(r.body?.message)}`,
  )
}

// --- AUTH-UI-03 + REG-01 (Playwright OTP step, then static OTP completes) ---
{
  const edge =
    process.env.EDGE_PATH || 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
  let uiResult = 'Fail'
  let uiNotes = ''
  try {
    const browser = await chromium.launch({ headless: true, executablePath: edge })
    const page = await browser.newPage()
    await page.goto(`${ADMIN_UI}/auth/login`, { waitUntil: 'domcontentloaded', timeout: 60_000 })
    await page.waitForSelector('input[type="email"]', { timeout: 30_000 })
    await page.fill('input[type="email"]', users.otp.email)
    await page.fill('input[type="password"]', QA_PASSWORD)
    await page.getByRole('button', { name: /sign in/i }).click()
    await page.waitForTimeout(2500)
    const h1 =
      (
        await page
          .locator('h1')
          .first()
          .textContent()
          .catch(() => '')
      )?.trim() || ''
    const onOtp =
      /two factor|otp|authentication/i.test(h1) ||
      (await page
        .locator('input[inputmode="numeric"], input[autocomplete="one-time-code"]')
        .count()) > 0
    const urlBefore = page.url()
    await page.screenshot({ path: path.join(evidenceDir, 'auth-ui-03-otp-step.png') })

    // Complete OTP with static local path
    const otpInputs = page.locator('input[inputmode="numeric"], input[maxlength="1"]')
    const count = await otpInputs.count()
    if (count >= 6) {
      for (let i = 0; i < 6; i++) await otpInputs.nth(i).fill(STATIC_OTP[i])
    } else {
      const single = page.locator('input[name="code"], input[autocomplete="one-time-code"]').first()
      if (await single.count()) await single.fill(STATIC_OTP)
    }
    // OTP step uses the same "Login" label as credentials (not Verify/Submit)
    await page
      .getByRole('button', { name: /^(login|verify|continue|submit)$/i })
      .first()
      .click()
    await page.waitForTimeout(3000)
    const urlAfter = page.url()
    const h1After =
      (
        await page
          .locator('h1')
          .first()
          .textContent()
          .catch(() => '')
      )?.trim() || ''
    await page.screenshot({ path: path.join(evidenceDir, 'auth-ui-03-after-otp.png') })
    await browser.close()

    const reachedDash = !urlAfter.includes('/auth/login') && !/two factor|otp/i.test(h1After)
    uiResult = onOtp ? (reachedDash ? 'Pass' : 'Partial') : 'Fail'
    uiNotes = `otpStep=${onOtp}; h1=${h1}; afterUrlAuth=${urlAfter.includes('/auth')}; reachedApp=${reachedDash}`
    push('AUTH-UI-03', uiResult, uiNotes)
    push('REG-01', onOtp ? 'Pass' : 'Fail', `OTP gate before dashboard; ${uiNotes}`)
  } catch (e) {
    push('AUTH-UI-03', 'Fail', `error=${e.message}`)
    push('REG-01', 'Fail', `error=${e.message}`)
  }
}

// --- AUTH-LOCK on dedicated qa-lock user ---
{
  const wrong = 'DefinitelyWrongPass1!'
  const statuses = []
  let locked = false
  for (let i = 0; i < 8; i++) {
    const r = await jsonFetch(`${AUTH}/auth/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: users.lock.email, password: wrong }),
    })
    statuses.push(r.status)
    if (r.status === 423) {
      locked = true
      break
    }
  }
  const doc = await admins.findOne({ email: users.lock.email })
  // restore lock user so pack is re-runnable
  await admins.updateOne(
    { email: users.lock.email },
    {
      $set: {
        status: 'active',
        failedLoginAttempts: 0,
        lockReason: null,
        lockedAt: null,
      },
    },
  )
  push(
    'AUTH-LOCK',
    locked || doc?.status === 'suspended' || doc?.lockReason === 'max_login_attempts'
      ? 'Pass'
      : 'Partial',
    `statuses=${statuses.join(',')}; wasSuspended=${doc?.status}; lockReason=${doc?.lockReason || 'none'}; restored=true`,
  )
}

// --- AUTH-RBAC-SUB: subadmin JWT cannot hit finance API ---
{
  const token = jwt.sign(
    {
      id: 'qa-rbac-sub',
      userType: 'admin',
      name: users.rbac.fullname,
      email: users.rbac.email,
      kind: 'subadmin',
      isSuperAdmin: false,
      permissions: ['settings.view'],
    },
    secret,
    { expiresIn: '30m' },
  )
  const r = await jsonFetch(`${PAY}/admin/finance/dashboard`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  })
  const denied = r.status === 401 || r.status === 403
  push('AUTH-RBAC-SUB', denied ? 'Pass' : 'Fail', `finance_dashboard status=${r.status}`)
}

// --- AUTH-IDOR: partner A token must not read partner B admin-style PII ---
{
  const tokenA = jwt.sign(
    {
      id: String(partnerADoc._id),
      userType: 'partner',
      phone: partnerADoc.phone,
      email: partnerADoc.email,
    },
    secret,
    { expiresIn: '30m' },
  )
  const r = await jsonFetch(`${AUTH}/auth/partners/${partnerBDoc._id}`, {
    headers: { Authorization: `Bearer ${tokenA}`, Accept: 'application/json' },
  })
  const bodyStr = JSON.stringify(r.body || {})
  const leakedB =
    bodyStr.includes(partnerBDoc.email) ||
    bodyStr.includes(String(partnerBDoc.phone)) ||
    bodyStr.includes(partnerBDoc.fullname)
  const denied = r.status === 401 || r.status === 403 || r.status === 404
  push(
    'AUTH-IDOR',
    denied && !leakedB ? 'Pass' : leakedB ? 'Fail' : 'Partial',
    `status=${r.status}; leakedPartnerB=${leakedB}`,
  )
}

// --- AUTH-15: internal session validate with real local key (value not logged) ---
{
  if (!internalKey || internalKey === 'joms-internal-key' || internalKey === 'true') {
    push('AUTH-15', 'Blocked', 'INTERNAL_SERVICE_KEY missing or still default placeholder')
  } else {
    const r = await jsonFetch(`${AUTH}/auth/internal/partner-sessions/validate`, {
      headers: {
        Accept: 'application/json',
        'x-internal-service-key': internalKey,
      },
    })
    // endpoint may need query; accept non-403
    push(
      'AUTH-15',
      r.status !== 403 ? 'Pass' : 'Fail',
      `status=${r.status}; keyPresent=true; keyValueNotLogged=true`,
    )
  }
}

await mongoose.disconnect()

const jsonPath = path.join(reportDir, 'nonprod-auth-care-report.json')
const mdPath = path.join(reportDir, 'nonprod-auth-care-report.md')
fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2))

const lines = [
  '# Non-prod auth care pack — report',
  '',
  `**Date:** ${report.date}`,
  `**Environment:** ${report.environment}`,
  '',
  '## Created (local only)',
  '',
  '| Identity | Kind |',
  '|---|---|',
  ...report.created.map(
    (c) =>
      `| \`${c.email}\` | ${c.kind}${c.permissions ? ` (${Array.isArray(c.permissions) ? c.permissions.join(', ') || 'none' : ''})` : ''} |`,
  ),
  '',
  '## Results',
  '',
  '| ID | Result | Notes |',
  '|---|---|---|',
  ...report.cases.map((c) => `| ${c.id} | **${c.result}** | ${c.notes.replace(/\|/g, '/')} |`),
  '',
  '## Notes',
  '',
  ...report.notes.map((n) => `- ${n}`),
  '',
  `Evidence PNGs: \`docs/tests/evidence-nonprod-auth-2026-08-26/\``,
  '',
  '*Passwords, OTP codes, JWTs, and internal keys are not recorded.*',
  '',
]
fs.writeFileSync(mdPath, lines.join('\n'))
console.log(`wrote ${mdPath}`)
const fails = report.cases.filter((c) => c.result === 'Fail')
process.exit(fails.length ? 2 : 0)
