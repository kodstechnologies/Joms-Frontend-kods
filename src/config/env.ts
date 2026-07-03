const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '')

const DEFAULT_API_BASE_URL = import.meta.env.PROD
  ? 'http://52.66.76.145'
  : 'http://localhost'

const apiBaseUrl = trimTrailingSlash(
  import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL,
)

const resolveApiUrl = (override: string | undefined, port: number) =>
  override ? trimTrailingSlash(override) : `${apiBaseUrl}:${port}`

export const env = {
  authApiBaseUrl: resolveApiUrl(import.meta.env.VITE_AUTH_API_BASE_URL, 8000),
  adminApiBaseUrl: resolveApiUrl(import.meta.env.VITE_ADMIN_API_BASE_URL, 8001),
  serviceApiBaseUrl: resolveApiUrl(import.meta.env.VITE_SERVICE_API_BASE_URL, 8004),
  venueApiBaseUrl: resolveApiUrl(import.meta.env.VITE_VENUE_API_BASE_URL, 8005),
  kycApiBaseUrl: resolveApiUrl(import.meta.env.VITE_KYC_API_BASE_URL, 8003),
  membershipApiBaseUrl: resolveApiUrl(import.meta.env.VITE_MEMBERSHIP_API_BASE_URL, 8006),
}
