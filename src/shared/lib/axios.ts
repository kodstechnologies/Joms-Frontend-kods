import axios from 'axios'
import type { AxiosInstance } from 'axios'

import { env } from '@/config/env'
import { useAuthStore } from '@/modules/auth/store/auth-store'

const defaultConfigs = {
  timeout: 30000,
  withCredentials: true,
}

function attachAuthInterceptor(client: AxiosInstance) {
  client.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  })
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

export const kycApiClient = createApiClient(env.kycApiBaseUrl)

export const membershipApiClient = createApiClient(env.membershipApiBaseUrl)
