import { authApiClient } from '@/shared/lib/axios'

export type LoginPayload = {
  email: string
  password: string
}

export type VerifyOtpPayload = {
  email: string
  otp: string
}

export async function login(payload: LoginPayload) {
  const response = await authApiClient.post('/auth/admin/login', payload)
  return response.data
}

export async function verifyOtp(payload: VerifyOtpPayload) {
  const response = await authApiClient.post('/auth/admin/verify-otp', payload)
  return response.data
}

export async function logout() {
  const response = await authApiClient.post('/auth/admin/logout')
  return response.data
}
