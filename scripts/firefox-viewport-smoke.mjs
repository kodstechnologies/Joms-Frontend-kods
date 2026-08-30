/**
 * Firefox viewport smoke for Admin login (no secrets).
 *   pnpm dlx playwright@1.55.0 test -- skipped; run via node:
 *   node scripts/firefox-viewport-smoke.mjs
 */
import { firefox } from 'playwright'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const out = path.join(root, '..', 'docs', 'tests', 'cross-platform-testing', 'evidence')
fs.mkdirSync(out, { recursive: true })

const viewports = [
  { name: '390', width: 390, height: 844 },
  { name: '1366', width: 1366, height: 768 },
  { name: '1920', width: 1920, height: 1080 },
]

const url = process.env.ADMIN_URL || 'https://kods.online/auth/login'
const browser = await firefox.launch({ headless: true })
const results = []

for (const vp of viewports) {
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } })
  const started = Date.now()
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60_000 })
  await page
    .waitForFunction(
      () => {
        const h1 = document.querySelector('h1')
        const t = h1?.textContent?.trim() || ''
        return t && t !== 'Loading...'
      },
      { timeout: 45_000 },
    )
    .catch(() => null)
  const h1 = await page
    .locator('h1')
    .first()
    .textContent()
    .catch(() => null)
  const metrics = await page.evaluate(() => ({
    innerWidth: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    overflowX: document.documentElement.scrollWidth > window.innerWidth + 1,
  }))
  const png = path.join(out, `firefox-playwright-login-${vp.name}.png`)
  await page.screenshot({ path: png, fullPage: false })
  results.push({
    viewport: vp.name,
    ms: Date.now() - started,
    h1: h1?.trim() || null,
    ...metrics,
    png: path.basename(png),
  })
  await page.close()
}

await browser.close()
console.log(JSON.stringify({ url, browser: 'firefox', results }, null, 2))
const bad = results.filter((r) => r.overflowX || !r.h1)
process.exit(bad.length ? 2 : 0)
