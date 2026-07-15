import { membershipApiClient } from '@/shared/lib/axios'
import type {
  BuyMembershipPayload,
  CancelSubscriptionPayload,
  PauseSubscriptionPayload,
  ChangePlanPayload,
  ExtendSubscriptionPayload,
  SubscriptionDetailResponse,
  SubscriptionListResponse,
  SubscriptionStatus,
} from '../types/membership-subscription'

export const fetchExpertSubscriptions = async (params?: {
  status?: SubscriptionStatus
  search?: string
  page?: number
  limit?: number
}) => {
  const response = await membershipApiClient.get<SubscriptionListResponse>('/subscriptions', {
    params,
  })
  return response.data
}

export const fetchSubscriptionById = async (id: string) => {
  const response = await membershipApiClient.get<SubscriptionDetailResponse>(`/subscriptions/${id}`)
  return response.data
}

export const buyMembership = async (payload: BuyMembershipPayload) => {
  const response = await membershipApiClient.post<SubscriptionDetailResponse>(
    '/subscriptions/buy',
    payload,
  )
  return response.data
}

export const upgradeSubscription = async (id: string, payload: ChangePlanPayload) => {
  const response = await membershipApiClient.patch<SubscriptionDetailResponse>(
    `/subscriptions/${id}/upgrade`,
    payload,
  )
  return response.data
}

export const downgradeSubscription = async (id: string, payload: ChangePlanPayload) => {
  const response = await membershipApiClient.patch<SubscriptionDetailResponse>(
    `/subscriptions/${id}/downgrade`,
    payload,
  )
  return response.data
}

export const extendSubscription = async (id: string, payload: ExtendSubscriptionPayload) => {
  const response = await membershipApiClient.patch<SubscriptionDetailResponse>(
    `/subscriptions/${id}/extend`,
    payload,
  )
  return response.data
}

export const cancelSubscription = async (id: string, payload: CancelSubscriptionPayload) => {
  const response = await membershipApiClient.patch<SubscriptionDetailResponse>(
    `/subscriptions/${id}/cancel`,
    payload,
  )
  return response.data
}

export const pauseSubscription = async (id: string, payload: PauseSubscriptionPayload) => {
  const response = await membershipApiClient.patch<SubscriptionDetailResponse>(
    `/subscriptions/${id}/pause`,
    payload,
  )
  return response.data
}
