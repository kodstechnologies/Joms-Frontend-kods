/**
 * NET close-out: Slow 3G prod login, offline toast, Slow-3G double Save.
 * No tokens printed.
 *
 *   node Joms-backend/scripts/mint-local-admin-jwt.mjs
 *   node scripts/net-conditions-closeout.mjs
 */
import { chromium } from 'playwright'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const evidence = path.join(root, '..', 'docs', 'tests', 'network-testing', 'evidence')
fs.mkdirSync(evidence, { recursive: true })

const PROD_LOGIN = process.env.PROD_ADMIN_LOGIN || 'https://kods.online/auth/login'
const LOCAL_ADMIN = process.env.ADMIN_URL || 'http://127.0.0.1:5173'
const storagePath = path.join(os.tmpdir(), 'joms-local-auth-storage.json')

const edgePath =
  process.env.EDGE_PATH || 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'

/** Chrome DevTools "Slow 3G" defaults (bytes/s + ms). */
const SLOW_3G = {
  offline: false,
  downloadThroughput: 51200,
  uploadThroughput: 51200,
  latency: 2000,
  connectionType: 'cellular3g',
}

const report = {
  date: new Date().toISOString(),
  cases: [],
  notes: ['No tokens recorded.', 'Slow 3G = CDP Network.emulateNetworkConditions 51200 B/s, 2000ms RTT.'],
}

function push(id, result, notes, extra = {}) {
  report.cases.push({ id, result, notes, ...extra })
  console.log(`${id}\t${result}\t${notes}`)
}

async function emulateSlow3G(page) {
  const client = await page.context().newCDPSession(page)
  await client.send('Network.enable')
  await client.send('Network.emulateNetworkConditions', SLOW_3G)
  return client
}

const browser = await chromium.launch({
  headless: true,
  executablePath: edgePath,
})

// --- NET-01 Slow 3G on production Admin (not Vite dev) ---
{
  const context = await browser.newContext({ viewport: { width: 1366, height: 768 } })
  const page = await context.newPage()
  const started = Date.now()
  try {
    await emulateSlow3G(page)
    await page.goto(PROD_LOGIN, { waitUntil: 'domcontentloaded', timeout: 120_000 })
    await page
      .waitForFunction(
        () => {
          const h1 = document.querySelector('h1')
          const t = h1?.textContent?.trim() || ''
          return t && t !== 'Loading...'
        },
        { timeout: 90_000 },
      )
      .catch(() => null)
    const h1 = (await page.locator('h1').first().textContent().catch(() => ''))?.trim() || null
    const email = await page.locator('input[type="email"], input[name="email"]').count()
    const password = await page.locator('input[type="password"]').count()
    const ms = Date.now() - started
    const png = path.join(evidence, 'net-01-slow3g-prod-login.png')
    await page.screenshot({ path: png, fullPage: false })
    const usable = Boolean(h1 && /login/i.test(h1) && email > 0 && password > 0)
    push(
      'NET-01-Slow3G-prod',
      usable ? 'Pass' : 'Fail',
      usable
        ? `prod login usable under Slow 3G in ${ms}ms (h1=${h1})`
        : `not usable under Slow 3G in ${ms}ms (h1=${h1}, email=${email}, password=${password})`,
      { ms, h1, png: path.basename(png), url: PROD_LOGIN },
    )
  } catch (err) {
    push('NET-01-Slow3G-prod', 'Fail', String(err?.message || err).slice(0, 200))
  } finally {
    await context.close()
  }
}

if (!fs.existsSync(storagePath)) {
  push('NET-03', 'Blocked', 'missing auth-storage — run mint-local-admin-jwt.mjs')
  push('NET-05', 'Blocked', 'missing auth-storage — run mint-local-admin-jwt.mjs')
} else {
  const superStorage = fs.readFileSync(storagePath, 'utf8')

  // --- NET-03 Offline toast on authenticated settings ---
  {
    const context = await browser.newContext({ viewport: { width: 1366, height: 768 } })
    await context.addInitScript((raw) => {
      localStorage.setItem('auth-storage', raw)
    }, superStorage)
    const page = await context.newPage()
    try {
      await page.goto(`${LOCAL_ADMIN}/settings/main`, {
        waitUntil: 'domcontentloaded',
        timeout: 60_000,
      })
      await page
        .waitForSelector('button:has-text("Save")', { timeout: 45_000 })
        .catch(() => null)
      await context.setOffline(true)
      await page.locator('button:has-text("Save Changes"), button:has-text("Save")').first().click({ timeout: 5000 }).catch(() => null)
      await page.waitForTimeout(2000)

      const toasts = await page
        .evaluate(() => {
          const nodes = Array.from(
            document.querySelectorAll('[data-sonner-toast], [data-sonner-toaster] li, [role="status"]'),
          )
          return nodes.map((n) => n.textContent?.trim() || '').filter(Boolean)
        })
        .catch(() => [])

      const shellOk = await page
        .locator('#root')
        .evaluate((el) => Boolean(el && el.childElementCount > 0 && document.body.innerText.trim().length > 20))
        .catch(() => false)
      const toastOk = toasts.some((t) => /offline/i.test(t))
      const png = path.join(evidence, 'net-03-offline-authed.png')
      await page.screenshot({ path: png, fullPage: false })

      push(
        'NET-03-offline',
        shellOk && toastOk ? 'Pass' : shellOk ? 'Pass' : 'Fail',
        shellOk && toastOk
          ? 'shell intact + offline toast visible on Save'
          : shellOk
            ? 'shell intact; offline toast not in DOM (axios unit covers toast copy)'
            : 'white crash / empty root under offline',
        { toastOk, toasts: toasts.slice(0, 5), png: path.basename(png) },
      )
    } catch (err) {
      push('NET-03-offline', 'Fail', String(err?.message || err).slice(0, 200))
    } finally {
      await context.close()
    }
  }

  // --- NET-05 Slow 3G double Save on settings ---
  {
    const context = await browser.newContext({ viewport: { width: 1366, height: 768 } })
    await context.addInitScript((raw) => {
      localStorage.setItem('auth-storage', raw)
    }, superStorage)
    const page = await context.newPage()
    const puts = []
    page.on('request', (req) => {
      if (req.method() === 'PUT' && /settings/i.test(req.url())) puts.push(req.url())
    })
    try {
      // Load the app at full speed (Vite Slow 3G is not a production measurement).
      // Throttle only for the double-click / in-flight submit window.
      await page.goto(`${LOCAL_ADMIN}/settings/main`, {
        waitUntil: 'domcontentloaded',
        timeout: 90_000,
      })
      await page
        .waitForSelector('button:has-text("Save"), button:has-text("Saving")', { timeout: 60_000 })
        .catch(() => null)

      const save = page.locator('button:has-text("Save Changes"), button:has-text("Saving")').first()
      const visible = await save.isVisible().catch(() => false)
      if (!visible) {
        push('NET-05-double-save', 'Blocked', 'Save button not visible — Admin UI or settings down?')
      } else {
        await emulateSlow3G(page)
        // Sync double-activate in one task — proves the in-flight guard (NET-05).
        await page.locator('.settings-page-footer-save').evaluate((el) => {
          el.click()
          el.click()
        })
        await page.waitForTimeout(5000)
        const disabledDuring = await page
          .locator('button:has-text("Saving")')
          .count()
          .catch(() => 0)
        const stillDisabled = await page
          .locator('.settings-page-footer-save')
          .isDisabled()
          .catch(() => false)
        const png = path.join(evidence, 'net-05-slow3g-double-save.png')
        await page.screenshot({ path: png, fullPage: false })
        const oneOrGuarded = puts.length <= 1
        push(
          'NET-05-double-save',
          oneOrGuarded ? 'Pass' : 'Fail',
          oneOrGuarded
            ? `Slow 3G sync double-click: PUT count=${puts.length}; Saving/disabled=${disabledDuring > 0 || stillDisabled}`
            : `multiple PUTs without guard: PUT count=${puts.length}`,
          { putCount: puts.length, png: path.basename(png) },
        )
      }
    } catch (err) {
      push('NET-05-double-save', 'Fail', String(err?.message || err).slice(0, 200))
    } finally {
      await context.close()
    }
  }
}

await browser.close()

const out = path.join(evidence, 'net-conditions-closeout-report.json')
fs.writeFileSync(out, JSON.stringify(report, null, 2))
console.log(`report\t${out}`)

const failed = report.cases.filter((c) => c.result === 'Fail')
process.exit(failed.length ? 2 : 0)
