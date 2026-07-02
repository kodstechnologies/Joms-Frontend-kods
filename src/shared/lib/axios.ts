import axios from 'axios'

import { env } from '@/config/env'

const defaultConfigs = {
  timeout: 30000,
  withCredentials: true,
}

export const authApiClient = axios.create({
  ...defaultConfigs,
  baseURL: env.authApiBaseUrl,
})

export const expertApiClient = axios.create({
  ...defaultConfigs,
  baseURL: env.serviceApiBaseUrl,
})

export const adminApiClient = axios.create({
  ...defaultConfigs,
  baseURL: env.adminApiBaseUrl,
})
export const venueApiClient = axios.create({
  ...defaultConfigs,
  baseURL: env.venueApiBaseUrl,
})

export const kycApiClient = axios.create({
  ...defaultConfigs,
  baseURL: env.kycApiBaseUrl,
})

export const membershipApiClient = axios.create({
  ...defaultConfigs,
  baseURL: env.membershipApiBaseUrl,
})
