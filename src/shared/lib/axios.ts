import axios from 'axios'
import type { AxiosInstance } from 'axios'
import { toast } from 'sonner'

import { env } from '@/config/env'
import { useAuthStore } from '@/modules/auth/store/auth-store'
import { markSessionActivity } from '@/shared/lib/session-activity'

const defaultConfigs = {
  timeout: 30000,
  withCredentials: true,
}

const SESSION_TERMINATED_MESSAGES = [
  'account is suspended',
  'account suspended',
  'account is inactive',
  'account is disabled',
  'session expired',
]

// A 401 or 403 signs them out only when the account is suspended, inactive, disabled, or the session has ended.
function isSessionTerminated(error: {
  response?: { status?: number; data?: { message?: string; data?: { code?: string } } }
}) {
  const status = error?.response?.status
  if (status !== 401 && status !== 403) return false

  if (error?.response?.data?.data?.code === 'SESSION_TERMINATED') return true

  const message = String(error?.response?.data?.message || '')
    .trim()
    .toLowerCase()
  return SESSION_TERMINATED_MESSAGES.some((phrase) => message.startsWith(phrase))
}

let lastOfflineToastAt = 0

// The offline message is shown at most once every few seconds.
function notifyOffline() {
  const now = Date.now()
  if (now - lastOfflineToastAt < 4000) return
  lastOfflineToastAt = now
  toast.error('You are offline. Check your connection and try again.')
}

function isBrowserOffline() {
  return typeof navigator !== 'undefined' && navigator.onLine === false
}

// Each call sends the saved token. A successful call counts as activity. A terminated session clears the login and returns them to the sign-in page.
function attachAuthInterceptor(client: AxiosInstance) {
  client.interceptors.request.use((config) => {
    if (isBrowserOffline()) {
      notifyOffline()
      return Promise.reject(
        Object.assign(new Error('You are offline. Check your connection and try again.'), {
          code: 'ERR_NETWORK',
          isOffline: true,
          config,
        }),
      )
    }
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  })

  client.interceptors.response.use(
    (response) => {
      markSessionActivity()
      return response
    },
    (error) => {
      if (error?.isOffline || (error?.code === 'ERR_NETWORK' && isBrowserOffline())) {
        notifyOffline()
      } else if (error?.response) {
        markSessionActivity()
      }

      const authState = useAuthStore.getState()
      if (authState.isAuthenticated && isSessionTerminated(error)) {
        authState.clearSession()
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/auth')) {
          window.location.assign('/auth/login')
        }
      }

      return Promise.reject(error)
    },
  )
}

function createApiClient(baseURL: string) {
  const client = axios.create({
    ...defaultConfigs,
    baseURL,
  })
  attachAuthInterceptor(client)
  return client
}

export const authApiClient = createApiClient(env.authApiBaseUrl)

export const expertApiClient = createApiClient(env.serviceApiBaseUrl)

export const adminApiClient = createApiClient(env.adminApiBaseUrl)
export const venueApiClient = createApiClient(env.venueApiBaseUrl)

export const profileApiClient = createApiClient(env.profileApiBaseUrl)

export const kycApiClient = createApiClient(env.kycApiBaseUrl)

export const membershipApiClient = createApiClient(env.membershipApiBaseUrl)

export const paymentApiClient = createApiClient(env.paymentApiBaseUrl)

export const settingsApiClient = createApiClient(env.settingsApiBaseUrl)

export const chatApiClient = createApiClient(env.chatApiBaseUrl)

export const notificationApiClient = createApiClient(env.notificationApiBaseUrl)
