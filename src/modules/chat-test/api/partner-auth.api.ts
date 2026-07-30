import axios from 'axios'
import { env } from '@/config/env'

export type PartnerLoginResult = {
  id: string
  fullname: string
  phone: string
  accessToken: string
  servicetype?: string
}

export async function partnerLoginWithPhone(phone: string, password: string) {
  const res = await axios.post(
    `${env.authApiBaseUrl}/auth/loginwithphone`,
    { phone, password },
    { timeout: 30000, withCredentials: true },
  )
  return res.data?.data as PartnerLoginResult
}
