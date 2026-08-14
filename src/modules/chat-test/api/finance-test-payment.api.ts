import axios from 'axios'
import { env } from '@/config/env'
import type { MembershipPlan } from '@/modules/memberships/types/membership'

export type PaymentOrder = {
  orderId: string
  razorpayOrderId: string
  amount: number
  amountPaise: number
  currency: string
  keyId: string
  description?: string
  module: string
  prefill?: { name?: string; email?: string }
}

export type PaymentOrderStatus = {
  orderId: string
  status: string
  fulfillmentStatus?: string
  fulfillmentResult?: Record<string, unknown>
  amount?: number
  currency?: string
}

function bearer(token: string) {
  return token.startsWith('Bearer ') ? token : `Bearer ${token}`
}

/** Partner list API returns `id`; admin list returns `_id`. Normalize to MembershipPlan. */
export async function listExpertMembershipPlans(token: string) {
  const res = await axios.get(`${env.membershipApiBaseUrl}/memberships`, {
    params: { type: 'expert', status: 'active', limit: 50 },
    headers: { Authorization: bearer(token) },
    timeout: 30000,
  })
  const data = res.data?.data
  const raw = (data?.memberships || data || []) as Array<
    MembershipPlan & { id?: string; _id?: string }
  >
  return raw
    .map((plan) => {
      const id = String(plan._id || plan.id || '')
      if (!id) return null
      return {
        ...plan,
        _id: id,
      } as MembershipPlan
    })
    .filter(Boolean) as MembershipPlan[]
}

export async function createPaymentOrder(
  token: string,
  body: {
    module: 'membership' | 'service' | 'consultation' | 'venue'
    moduleData: Record<string, unknown>
    /** When true, payment-service must create a live Razorpay order (test QR). */
    requireLiveGateway?: boolean
  },
) {
  const res = await axios.post(`${env.paymentApiBaseUrl}/payments/orders`, body, {
    headers: {
      Authorization: bearer(token),
      'Content-Type': 'application/json',
    },
    timeout: 60000,
  })
  return res.data?.data as PaymentOrder
}

export async function verifyPaymentOrder(
  token: string,
  body: {
    orderId: string
    razorpayOrderId: string
    razorpayPaymentId: string
    razorpaySignature: string
  },
) {
  const res = await axios.post(`${env.paymentApiBaseUrl}/payments/verify`, body, {
    headers: {
      Authorization: bearer(token),
      'Content-Type': 'application/json',
    },
    timeout: 60000,
  })
  return res.data?.data as PaymentOrderStatus
}

/** Local/dev: fulfill order without Razorpay QR (payment-service ALLOW_DUMMY_PAY). */
export async function dummyPayOrder(token: string, orderId: string) {
  const res = await axios.post(
    `${env.paymentApiBaseUrl}/payments/orders/${orderId}/dummy-pay`,
    {},
    {
      headers: {
        Authorization: bearer(token),
        'Content-Type': 'application/json',
      },
      timeout: 60000,
    },
  )
  return res.data?.data as PaymentOrderStatus & { dummy?: boolean; finance?: unknown }
}
