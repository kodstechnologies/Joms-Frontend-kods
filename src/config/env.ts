const getEnv = (key: string, fallback = '') =>
  (import.meta.env as Record<string, string | undefined>)[key] ?? fallback

export const env = {
  authApiBaseUrl: getEnv('VITE_AUTH_API_BASE_URL', 'http://localhost:8001'),
  serviceApiBaseUrl: getEnv('VITE_SERVICE_API_BASE_URL', 'http://localhost:8004'),
  adminApiBaseUrl: getEnv('VITE_ADMIN_API_BASE_URL', 'http://localhost:8001'),
  venueApiBaseUrl: getEnv('VITE_VENUE_API_BASE_URL', 'http://localhost:8005'),
  kycApiBaseUrl: getEnv('VITE_KYC_API_BASE_URL', 'http://localhost:8003'),
}
