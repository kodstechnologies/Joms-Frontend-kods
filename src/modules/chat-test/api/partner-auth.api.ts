import axios from 'axios'
import { env } from '@/config/env'

export type PartnerLoginResult = {
  id: string
  fullname: string
  phone: string
  accessToken: string
  servicetype?: string
}

const PARTNER_SESSION_KEY = 'joms_dev_partner_chat'
const PARTNER_CREDS_KEY = 'joms_finance_test_partner_creds'

export async function partnerLoginWithPhone(phone: string, password: string) {
  const res = await axios.post(
    `${env.authApiBaseUrl}/auth/loginwithphone`,
    { phone, password },
    { timeout: 30000, withCredentials: true },
  )
  return res.data?.data as PartnerLoginResult
}

/** Re-login using harness-saved partner creds (invalidates other partner tabs). */
export async function refreshPartnerFromStoredCreds(): Promise<PartnerLoginResult> {
  const raw = localStorage.getItem(PARTNER_CREDS_KEY)
  if (!raw) {
    throw new Error('No saved partner credentials — login Partner in the session bar first.')
  }
  let phone = ''
  let password = ''
  try {
    const parsed = JSON.parse(raw) as { phone?: string; password?: string }
    phone = String(parsed.phone || '').trim()
    password = String(parsed.password || '')
  } catch {
    throw new Error('Corrupt partner credentials — login Partner in the session bar again.')
  }
  if (!phone || !password) {
    throw new Error('Missing partner phone/password — login Partner in the session bar first.')
  }
  const data = await partnerLoginWithPhone(phone, password)
  if (!data?.accessToken || !data?.id) {
    throw new Error('Partner login response missing token')
  }
  localStorage.setItem(PARTNER_SESSION_KEY, JSON.stringify(data))
  return data
}
