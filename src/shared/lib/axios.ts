import axios from 'axios'

import { useAuthStore } from '@/app/store/auth-store'
import { env } from '@/config/env'

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 30000,
})

apiClient.interceptors.request.use((config) => {
  const accessToken = useAuthStore.getState().accessToken

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }

  return config
})
