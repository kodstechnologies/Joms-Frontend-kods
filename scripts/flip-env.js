import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const frontendRoot = join(__dirname, '..')
const envPath = join(frontendRoot, '.env')
const productionEnvPath = join(frontendRoot, '.env.production')

const PROD_BASE = 'http://52.66.76.145'
const LOCAL_BASE = 'http://localhost'

function getActiveBaseUrl(content) {
  const match = content.match(/^VITE_API_BASE_URL=(.+)$/m)
  return match?.[1]?.trim() ?? null
}

function detectMode(content) {
  const activeBase = getActiveBaseUrl(content)
  if (!activeBase) return 'production'
  return activeBase.includes('localhost') ? 'local' : 'production'
}

function resolveTargetMode(arg) {
  const mode = (arg || '').toLowerCase()

  if (mode === 'local' || mode === 'dev') return 'local'
  if (mode === 'production' || mode === 'prod') return 'production'

  if (mode === 'toggle' || mode === '') {
    if (!existsSync(envPath)) return 'local'
    const current = readFileSync(envPath, 'utf8')
    return detectMode(current) === 'local' ? 'production' : 'local'
  }

  console.error(`Unknown mode: "${arg}"`)
  console.error('Usage: node scripts/flip-env.js [local|production|toggle]')
  process.exit(1)
}

function flipContent(content, target) {
  const activeBase = target === 'local' ? LOCAL_BASE : PROD_BASE

  if (/^VITE_API_BASE_URL=/m.test(content)) {
    return content.replace(/^VITE_API_BASE_URL=.*$/m, `VITE_API_BASE_URL=${activeBase}`)
  }

  return `VITE_API_BASE_URL=${activeBase}\n${content}`
}

function main() {
  const target = resolveTargetMode(process.argv[2])
  const activeBase = target === 'local' ? LOCAL_BASE : PROD_BASE

  for (const filePath of [envPath, productionEnvPath]) {
    if (!existsSync(filePath)) continue

    const original = readFileSync(filePath, 'utf8')
    const updated = flipContent(original, target)
    writeFileSync(filePath, updated.endsWith('\n') ? updated : `${updated}\n`, 'utf8')
  }

  console.log(`Frontend environment switched to: ${target.toUpperCase()}`)
  console.log(`VITE_API_BASE_URL=${activeBase}`)
  console.log('Updated: .env' + (existsSync(productionEnvPath) ? ', .env.production' : ''))
}

main()
