const getEnv = (key: string, fallback = '') =>
  (import.meta.env as Record<string, string | undefined>)[key] ?? fallback

export const env = {
  authApiBaseUrl: getEnv('VITE_AUTH_API_BASE_URL', 'http://localhost:8081'),
  serviceApiBaseUrl: getEnv('VITE_SERVICE_API_BASE_URL', 'http://localhost:8004'),
}
