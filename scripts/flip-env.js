import { writeFileSync, existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const frontendRoot = join(__dirname, '..')
const envPath = join(frontendRoot, '.env')
const productionEnvPath = join(frontendRoot, '.env.production')

const LOCAL_ENV = `VITE_AUTH_API_BASE_URL=http://localhost:8000
VITE_ADMIN_API_BASE_URL=http://localhost:8001
VITE_SERVICE_API_BASE_URL=http://localhost:8004
VITE_VENUE_API_BASE_URL=http://localhost:8005
VITE_KYC_API_BASE_URL=http://localhost:8003
VITE_MEMBERSHIP_API_BASE_URL=http://localhost:8006
VITE_SETTINGS_API_BASE_URL=http://localhost:8007
VITE_GOOGLE_MAPS_API_KEY=AIzaSyC7gzHb0335ZzYsdSLRdkDF7uFhWjlxYus
`

const PROD_ENV = `VITE_AUTH_API_BASE_URL=https://auth.api.kods.online
VITE_ADMIN_API_BASE_URL=https://admin.api.kods.online
VITE_SERVICE_API_BASE_URL=https://services.api.kods.online
VITE_VENUE_API_BASE_URL=https://venues.api.kods.online
VITE_KYC_API_BASE_URL=https://kyc.api.kods.online
VITE_MEMBERSHIP_API_BASE_URL=https://membership.api.kods.online
VITE_SETTINGS_API_BASE_URL=https://settings.api.kods.online
VITE_GOOGLE_MAPS_API_KEY=AIzaSyC7gzHb0335ZzYsdSLRdkDF7uFhWjlxYus
`

function detectMode(content) {
  return content.includes('localhost') ? 'local' : 'production'
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

function main() {
  const target = resolveTargetMode(process.argv[2])
  const content = target === 'local' ? LOCAL_ENV : PROD_ENV

  writeFileSync(envPath, content, 'utf8')
  if (existsSync(productionEnvPath)) {
    writeFileSync(productionEnvPath, content, 'utf8')
  }

  console.log(`Frontend environment switched to: ${target.toUpperCase()}`)
  console.log(content.trim())
  console.log('Updated: .env' + (existsSync(productionEnvPath) ? ', .env.production' : ''))
}

main()
