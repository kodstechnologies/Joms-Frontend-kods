import axios from 'axios'
import { env } from '@/config/env'

export type ServiceOrderWorkStatus =
  | 'payment_pending'
  | 'awaiting_acceptance'
  | 'awaiting_first_message'
  | 'ongoing'
  | 'review_pending'
  | 'approved'

export type ServiceOrder = {
  _id: string
  partnerId: string
  userId: string
  username?: string
  phone_e164?: string
  serviceId: string
  title: string
  category?: string
  packageName?: string
  description?: string
  inclusions?: string
  timeline?: { value: number | null; unit: string | null } | null
  price: number
  currency?: string
  serviceImage?: string | null
  pricingType: 'fixed' | 'tiered'
  selectedTier?: {
    name: string
    description?: string
    price: number
    timelineValue?: number | null
    timelineUnit?: string | null
  } | null
  paymentStatus: 'pending' | 'paid'
  workStatus: ServiceOrderWorkStatus
  threadId?: string | null
  firstMessageAt?: string | null
  paidAt?: string | null
  acceptedAt?: string | null
  completedAt?: string | null
  approvedAt?: string | null
  createdAt?: string
  updatedAt?: string
}

function client(token: string) {
  return axios.create({
    baseURL: env.serviceApiBaseUrl,
    timeout: 60000,
    headers: { Authorization: `Bearer ${token}` },
  })
}

export async function createServiceOrder(
  token: string,
  body: {
    serviceId: string
    tierName?: 'basic' | 'standard' | 'premium'
    username?: string
    phone_e164?: string
  },
) {
  const res = await client(token).post('/service-orders', body)
  return res.data?.data as ServiceOrder
}

export async function payServiceOrder(token: string, orderId: string) {
  const res = await client(token).post(`/service-orders/${orderId}/pay`)
  return res.data?.data as ServiceOrder
}

export async function acceptServiceOrder(token: string, orderId: string) {
  const res = await client(token).post(`/service-orders/${orderId}/accept`)
  return res.data?.data as ServiceOrder
}

export async function getServiceOrder(token: string, orderId: string) {
  const res = await client(token).get(`/service-orders/${orderId}`)
  return res.data?.data as ServiceOrder
}

export async function listMyServiceOrders(token: string) {
  const res = await client(token).get('/service-orders/mine', { params: { limit: 50 } })
  return (res.data?.data || []) as ServiceOrder[]
}

export async function markServiceOrderCompleted(token: string, orderId: string) {
  const res = await client(token).post(`/service-orders/${orderId}/mark-completed`)
  return res.data?.data as ServiceOrder
}

export async function approveServiceOrder(token: string, orderId: string) {
  const res = await client(token).post(`/service-orders/${orderId}/approve`)
  return res.data?.data as ServiceOrder
}

export async function linkServiceOrderThread(token: string, orderId: string, threadId: string) {
  const res = await client(token).post(`/service-orders/${orderId}/link-thread`, { threadId })
  return res.data?.data as ServiceOrder
}
