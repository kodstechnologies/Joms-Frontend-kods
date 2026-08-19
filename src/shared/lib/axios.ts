import axios from 'axios'
import type { AxiosInstance } from 'axios'
import { toast } from 'sonner'

import { env } from '@/config/env'
import { useAuthStore } from '@/modules/auth/store/auth-store'

const defaultConfigs = {
  timeout: 30000,
  withCredentials: true,
}

let lastOfflineToastAt = 0

function notifyOffline() {
  const now = Date.now()
  if (now - lastOfflineToastAt < 4000) return
  lastOfflineToastAt = now
  toast.error('You are offline. Check your connection and try again.')
}

function isBrowserOffline() {
  return typeof navigator !== 'undefined' && navigator.onLine === false
}

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
    (response) => response,
    (error) => {
      if (error?.isOffline || (error?.code === 'ERR_NETWORK' && isBrowserOffline())) {
        notifyOffline()
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
