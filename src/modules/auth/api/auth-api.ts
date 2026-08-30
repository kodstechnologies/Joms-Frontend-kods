import { authApiClient } from '@/shared/lib/axios'

export type LoginPayload = {
  email: string
  password: string
}

export type VerifyOtpPayload = {
  email: string
  otp: string
}

export type AdminSessionUser = {
  id: string
  email: string
  fullname: string
  kind: 'superadmin' | 'subadmin'
  isSuperAdmin: boolean
  permissions: string[]
  mfaEnabled?: boolean
  status?: string
  subAdminId?: string | null
}

export type LoginResponse = {
  email: string
  mfaRequired: boolean
  mfaMethod?: 'emailOtp'
  token?: string
  admin?: AdminSessionUser
}

export async function login(payload: LoginPayload) {
  const response = await authApiClient.post<{ success: boolean; data: LoginResponse }>(
    '/auth/admin/login',
    payload,
  )
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

export async function sendPartnerPhoneOtp(phone: string) {
  const response = await authApiClient.post('/auth/otp/send', {
    phone,
    type: 'register',
  })
  return response.data
}

export async function verifyPartnerPhoneOtp(phone: string, otp: string) {
  const response = await authApiClient.post('/auth/otp/verify', {
    phone,
    otp,
  })
  return response.data
}

export async function sendPartnerEmailOtp(email: string) {
  const response = await authApiClient.post('/auth/otp/email/send', { email })
  return response.data
}

export async function verifyPartnerEmailOtp(email: string, otp: string) {
  const response = await authApiClient.post('/auth/otp/email/verify', { email, otp })
  return response.data
}
