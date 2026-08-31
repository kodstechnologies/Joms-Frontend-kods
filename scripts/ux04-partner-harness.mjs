
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const base = process.env.ADMIN_URL || 'http://127.0.0.1:5173'
const evidence = path.join(root, '..', 'docs', 'tests', 'evidence-eng-finish-2026-08-26')
fs.mkdirSync(evidence, { recursive: true })

const edgePath =
  process.env.EDGE_PATH || 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'

const browser = await chromium.launch({ headless: true, executablePath: edgePath })
const page = await browser.newPage()
const netErrors = []
page.on('response', (res) => {
  if (res.status() >= 500) netErrors.push(`${res.status()} ${res.url().slice(0, 120)}`)
})

const out = { date: new Date().toISOString(), steps: [] }

async function step(name, fn) {
  try {
    const notes = await fn()
    out.steps.push({ name, result: 'Pass', notes })
    console.log(`Pass\t${name}\t${notes}`)
  } catch (e) {
    out.steps.push({ name, result: 'Fail', notes: e.message })
    console.log(`Fail\t${name}\t${e.message}`)
  }
}

await step('landing', async () => {
  await page.goto(`${base}/dev/chat-test`, { waitUntil: 'domcontentloaded', timeout: 60_000 })
  await page.waitForTimeout(1500)
  const body = await page.locator('body').innerText()
  if (!/partner|user|venue|finance/i.test(body)) throw new Error('landing_missing_roles')
  await page.screenshot({ path: path.join(evidence, 'ux04-landing.png') })
  return 'roles_visible'
})

await step('partner_page', async () => {
  await page.goto(`${base}/dev/chat-partner`, { waitUntil: 'domcontentloaded', timeout: 60_000 })
  await page.waitForTimeout(2000)
  const hasPhone =
    (await page
      .locator('input[type="tel"], input[name*="phone" i], label:has-text("phone")')
      .count()) > 0 || (await page.getByText(/phone/i).count()) > 0
  const hasLogin =
    (await page.getByRole('button', { name: /login as partner|login|sign in/i }).count()) > 0
  await page.screenshot({ path: path.join(evidence, 'ux04-partner.png') })
  if (!hasLogin && !hasPhone) throw new Error('partner_form_missing')
  return `phoneHint=${hasPhone}; loginBtn=${hasLogin}; server5xx=${netErrors.length}`
})

await browser.close()

const pass = out.steps.every((s) => s.result === 'Pass')
const blockedComplete = netErrors.length > 0
out.result = pass ? (blockedComplete ? 'Pass with observation' : 'Pass') : 'Fail'
out.note =
  'Harness UI reachable. Full partner login+listing needs a dedicated test partner password (not used here).'

const md = path.join(root, '..', 'temp', '25-8-26', 'eng-ux04-partner-harness.md')
fs.writeFileSync(
  md,
  [
    '# UX-04 Partner harness',
    '',
    `**Date:** ${out.date}`,
    `**Result:** **${out.result}**`,
    '',
    '| Step | Result | Notes |',
    '|---|---|---|',
    ...out.steps.map((s) => `| ${s.name} | **${s.result}** | ${s.notes} |`),
    '',
    out.note,
    '',
    `Evidence: \`docs/tests/evidence-eng-finish-2026-08-26/\``,
    '',
  ].join('\n'),
)
console.log(`wrote ${md} overall=${out.result}`)
process.exit(pass ? 0 : 2)
