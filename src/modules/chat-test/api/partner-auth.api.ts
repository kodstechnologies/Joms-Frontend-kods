import axios from 'axios'
import { env } from '@/config/env'

export type PartnerLoginResult = {
  id: string
  fullname: string
  phone: string | null
  email?: string | null
  accessToken: string
  servicetype?: string
  isNewUser?: boolean
}

const PARTNER_SESSION_KEY = 'joms_dev_partner_chat'
const PARTNER_CREDS_KEY = 'joms_finance_test_partner_creds'

export const GOOGLE_WEB_CLIENT_ID =
  '989282193672-ocn2g4rqsmn09lpprehgn6bv5i3eo1ip.apps.googleusercontent.com'

export async function partnerLoginWithPhone(phone: string, password: string) {
  const res = await axios.post(
    `${env.authApiBaseUrl}/auth/loginwithphone`,
    { phone, password },
    { timeout: 30000, withCredentials: true },
  )
  return res.data?.data as PartnerLoginResult
}

export async function fetchGoogleAuthConfig() {
  try {
    const res = await axios.get(`${env.authApiBaseUrl}/auth/google/config`, { timeout: 15000 })
    const data = res.data?.data as { configured?: boolean; clientId?: string } | undefined
    return {
      configured: Boolean(data?.configured ?? data?.clientId),
      clientId: String(data?.clientId || GOOGLE_WEB_CLIENT_ID),
    }
  } catch {
    return { configured: true, clientId: GOOGLE_WEB_CLIENT_ID }
  }
}

export async function partnerSignInWithGoogle(idToken: string) {
  const res = await axios.post(
    `${env.authApiBaseUrl}/auth/google/signin`,
    { idToken, platform: 'web', deviceName: 'chat-test' },
    { timeout: 30000, withCredentials: true },
  )
  return res.data?.data as PartnerLoginResult
}

export function persistPartnerSession(data: PartnerLoginResult) {
  const raw = JSON.stringify(data)
  localStorage.setItem(PARTNER_SESSION_KEY, raw)
  sessionStorage.setItem(PARTNER_SESSION_KEY, raw)
}

export function clearPartnerSession() {
  localStorage.removeItem(PARTNER_SESSION_KEY)
  sessionStorage.removeItem(PARTNER_SESSION_KEY)
}

export async function refreshPartnerFromStoredCreds(): Promise<PartnerLoginResult> {
  const raw = localStorage.getItem(PARTNER_CREDS_KEY)
  if (!raw) {
    throw new Error('No saved partner credentials — login Partner in the session bar first.')
  }
  let parsed: { phone?: string; password?: string }
  try {
    parsed = JSON.parse(raw) as { phone?: string; password?: string }
  } catch {
    throw new Error('Corrupt partner credentials — login Partner in the session bar again.')
  }
  const phone = String(parsed.phone || '').trim()
  const password = String(parsed.password || '')
  if (!phone || !password) {
    throw new Error('Missing partner phone/password — login Partner in the session bar first.')
  }
  const data = await partnerLoginWithPhone(phone, password)
  if (!data?.accessToken || !data?.id) {
    throw new Error('Partner login response missing token')
  }
  persistPartnerSession(data)
  return data
}
