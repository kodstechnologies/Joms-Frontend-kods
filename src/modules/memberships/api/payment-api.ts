import { paymentApiClient } from '@/shared/lib/axios'

export type CreateMembershipPaymentOrderPayload = {
  module: 'membership'
  moduleData: {
    membershipPlanId: string
    billingCycleName: string
    autoRenew?: boolean
    partnerName?: string
  }
}

export type PaymentOrder = {
  orderId: string
  razorpayOrderId: string
  amount: number
  amountPaise: number
  currency: string
  keyId: string
  description?: string
  module: string
  moduleSnapshot?: Record<string, unknown>
  prefill?: {
    name?: string
    email?: string
  }
}

export type VerifyMembershipPaymentPayload = {
  orderId: string
  razorpayOrderId: string
  razorpayPaymentId: string
  razorpaySignature: string
}

export type PaymentOrderStatus = {
  orderId: string
  status: 'created' | 'paid' | 'fulfilled' | 'failed' | 'expired'
  fulfillmentStatus: 'pending' | 'success' | 'failed'
  fulfillmentResult?: {
    subscriptionId?: string
    subscriptionCode?: string
    status?: string
  }
  amount: number
  currency: string
  module: string
  razorpayOrderId?: string
  razorpayPaymentId?: string
  paymentMethod?: string | null
}

type ApiSuccess<T> = {
  success: boolean
  message: string
  data: T
}

export const createMembershipPaymentOrder = async (
  payload: CreateMembershipPaymentOrderPayload,
) => {
  const response = await paymentApiClient.post<ApiSuccess<PaymentOrder>>(
    '/payments/orders',
    payload,
  )
  return response.data
}

export const verifyMembershipPayment = async (payload: VerifyMembershipPaymentPayload) => {
  const response = await paymentApiClient.post<ApiSuccess<PaymentOrderStatus>>(
    '/payments/verify',
    payload,
  )
  return response.data
}

export const fetchPaymentOrderStatus = async (orderId: string) => {
  const response = await paymentApiClient.get<ApiSuccess<PaymentOrderStatus>>(
    `/payments/orders/${orderId}/status`,
  )
  return response.data
}

export const fetchMyPayments = async (params?: {
  module?: 'membership'
  status?: PaymentOrderStatus['status']
  page?: number
  limit?: number
}) => {
  const response = await paymentApiClient.get<
    ApiSuccess<{ payments: PaymentOrderStatus[]; meta: Record<string, number> }>
  >('/payments/me', { params })
  return response.data
}
