const getEnv = (key: string, fallback = '') =>
  (import.meta.env as Record<string, string | undefined>)[key] ?? fallback

export const env = {
  apiBaseUrl: getEnv('VITE_API_BASE_URL', '/api'),
}
