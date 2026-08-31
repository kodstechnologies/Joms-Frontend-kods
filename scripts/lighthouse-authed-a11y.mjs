
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import { chromium } from 'playwright'
import { createServer } from 'node:net'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const require = createRequire(path.join(root, 'package.json'))
const lighthouse = require('lighthouse').default || require('lighthouse')

const chromeLauncherRoot = path.join(
  root,
  'node_modules',
  '.pnpm',
  'chrome-launcher@1.2.1',
  'node_modules',
  'chrome-launcher',
)
const chromeLauncher = require(chromeLauncherRoot)

const base = process.env.ADMIN_URL || 'http://127.0.0.1:5173'
const storagePath = path.join(os.tmpdir(), 'joms-local-auth-storage.json')
const outDir = path.join(root, '..', 'docs', 'tests', 'accessibility-testing', 'evidence')
fs.mkdirSync(outDir, { recursive: true })

if (!fs.existsSync(storagePath)) {
  console.error('missing_storage run: node Joms-backend/scripts/mint-local-admin-jwt.mjs')
  process.exit(2)
}
const storageJson = fs.readFileSync(storagePath, 'utf8')

const targets = [
  { id: 'A11Y-02', path: '/dashboard/executive', file: 'lighthouse-dashboard-a11y' },
  { id: 'A11Y-03', path: '/finance/revenue', file: 'lighthouse-finance-a11y' },
]

function freePort() {
  return new Promise((resolve, reject) => {
    const s = createServer()
    s.listen(0, () => {
      const { port } = s.address()
      s.close(() => resolve(port))
    })
    s.on('error', reject)
  })
}

const debugPort = await freePort()
const edgePath =
  process.env.EDGE_PATH || 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'

// Prefer system Edge/Chrome via chrome-launcher if Chromium path works; else Edge flags.
let chrome
try {
  chrome = await chromeLauncher.launch({
    chromeFlags: ['--headless=new', '--no-sandbox', '--disable-dev-shm-usage'],
    port: debugPort,
  })
} catch {
  chrome = await chromeLauncher.launch({
    chromePath: edgePath,
    chromeFlags: ['--headless=new', '--no-sandbox', '--disable-dev-shm-usage'],
    port: debugPort,
  })
}

const browser = await chromium.connectOverCDP(`http://127.0.0.1:${chrome.port}`)
const context = browser.contexts()[0] || (await browser.newContext())
await context.addInitScript((raw) => {
  localStorage.setItem('auth-storage', raw)
}, storageJson)

const results = []

for (const t of targets) {
  const url = `${base}${t.path}`
  const page = await context.newPage()
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60_000 })
  await page.waitForTimeout(2500)
  const landed = page.url()
  const h1 =
    (
      await page
        .locator('h1')
        .first()
        .textContent()
        .catch(() => '')
    )?.trim() || ''
  await page.close()

  if (landed.includes('/auth/login')) {
    results.push({ id: t.id, result: 'Fail', score: null, notes: `redirected_login; h1=${h1}` })
    console.log(`${t.id}\tFail\tredirected_login`)
    continue
  }

  const runnerResult = await lighthouse(url, {
    port: chrome.port,
    output: ['html', 'json'],
    onlyCategories: ['accessibility'],
    disableStorageReset: true,
  })

  const score = runnerResult.lhr.categories.accessibility?.score
  const reports = Array.isArray(runnerResult.report) ? runnerResult.report : [runnerResult.report]
  fs.writeFileSync(path.join(outDir, `${t.file}.report.html`), reports[0] || '')
  if (reports[1]) fs.writeFileSync(path.join(outDir, `${t.file}.report.json`), reports[1])

  const pct = score == null ? null : Math.round(score * 100)
  const pass = score != null && score >= 0.9
  results.push({
    id: t.id,
    result: pass ? 'Pass' : 'Partial',
    score: pct,
    notes: `urlOk=${!landed.includes('/auth')}; h1=${h1.slice(0, 40)}; score=${pct}`,
  })
  console.log(`${t.id}\t${pass ? 'Pass' : 'Partial'}\tscore=${pct}`)
}

await browser.close().catch(() => null)
try {
  await chrome.kill()
} catch {
  /* Windows often EPERM on lighthouse temp dir cleanup — scores already saved */
}

const reportPath = path.join(root, '..', 'temp', '25-8-26', 'eng-a11y-authed-lighthouse.md')
fs.writeFileSync(
  reportPath,
  [
    '# Authenticated Lighthouse a11y',
    '',
    `**Date:** ${new Date().toISOString()}`,
    `**Base:** ${base}`,
    '',
    '| ID | Result | Score | Notes |',
    '|---|---|---|---|',
    ...results.map((r) => `| ${r.id} | **${r.result}** | ${r.score ?? '—'} | ${r.notes} |`),
    '',
    'Evidence: `docs/tests/accessibility-testing/evidence/lighthouse-*-a11y.report.html`',
    '',
    '*No tokens recorded.*',
    '',
  ].join('\n'),
)
console.log(`wrote ${reportPath}`)
process.exit(results.some((r) => r.result === 'Fail') ? 2 : 0)
