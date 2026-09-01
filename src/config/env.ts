const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '')

const LOCAL_API_BASE_URL = 'http://localhost'
const DEFAULT_GOOGLE_MAPS_API_KEY = 'AIzaSyC7gzHb0335ZzYsdSLRdkDF7uFhWjlxYus'

const PROD_SERVICE_URLS = {
  auth: 'https://auth.api.kods.online',
  admin: 'https://admin.api.kods.online',
  service: 'https://services.api.kods.online',
  venue: 'https://venues.api.kods.online',
  kyc: 'https://kyc.api.kods.online',
  membership: 'https://membership.api.kods.online',
  settings: 'https://settings.api.kods.online',
  payment: 'https://payment.api.kods.online',
  chat: 'https://chat.api.kods.online',
  notification: 'https://notifications.api.kods.online',
} as const

const localApiBaseUrl = trimTrailingSlash(import.meta.env.VITE_API_BASE_URL || LOCAL_API_BASE_URL)

// Production uses per-service subdomains.
// Local dev uses direct service ports unless an override is set.
const resolveApiUrl = (override: string | undefined, port: number, prodDefault: string) => {
  if (override) return trimTrailingSlash(override)
  if (import.meta.env.PROD) return prodDefault
  return `${localApiBaseUrl}:${port}`
}

export const env = {
  authApiBaseUrl: resolveApiUrl(
    import.meta.env.VITE_AUTH_API_BASE_URL,
    8000,
    PROD_SERVICE_URLS.auth,
  ),
  adminApiBaseUrl: resolveApiUrl(
    import.meta.env.VITE_ADMIN_API_BASE_URL,
    8001,
    PROD_SERVICE_URLS.admin,
  ),
  serviceApiBaseUrl: resolveApiUrl(
    import.meta.env.VITE_SERVICE_API_BASE_URL,
    8004,
    PROD_SERVICE_URLS.service,
  ),
  venueApiBaseUrl: resolveApiUrl(
    import.meta.env.VITE_VENUE_API_BASE_URL,
    8005,
    PROD_SERVICE_URLS.venue,
  ),
  kycApiBaseUrl: resolveApiUrl(import.meta.env.VITE_KYC_API_BASE_URL, 8003, PROD_SERVICE_URLS.kyc),
  membershipApiBaseUrl: resolveApiUrl(
    import.meta.env.VITE_MEMBERSHIP_API_BASE_URL,
    8006,
    PROD_SERVICE_URLS.membership,
  ),
  settingsApiBaseUrl: resolveApiUrl(
    import.meta.env.VITE_SETTINGS_API_BASE_URL,
    8007,
    PROD_SERVICE_URLS.settings,
  ),
  paymentApiBaseUrl: resolveApiUrl(
    import.meta.env.VITE_PAYMENT_API_BASE_URL,
    8008,
    PROD_SERVICE_URLS.payment,
  ),
  chatApiBaseUrl: resolveApiUrl(
    import.meta.env.VITE_CHAT_API_BASE_URL,
    8009,
    PROD_SERVICE_URLS.chat,
  ),
  profileApiBaseUrl: resolveApiUrl(
    import.meta.env.VITE_PROFILE_API_BASE_URL,
    8002,
    'https://profile.api.kods.online',
  ),
  notificationApiBaseUrl: resolveApiUrl(
    import.meta.env.VITE_NOTIFICATION_API_BASE_URL,
    8010,
    PROD_SERVICE_URLS.notification,
  ),
  firebaseApiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  firebaseAuthDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  firebaseProjectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  firebaseMessagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  firebaseAppId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  firebaseVapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY || '',

  internalServiceKey: import.meta.env.VITE_INTERNAL_SERVICE_KEY || '',
  googleMapsApiKey:
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY ||
    import.meta.env.VITE_JOMS_GOOGLE_MAPS_KEY ||
    DEFAULT_GOOGLE_MAPS_API_KEY,
}
