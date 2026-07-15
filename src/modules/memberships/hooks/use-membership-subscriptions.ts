import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  buyMembership,
  cancelSubscription,
  downgradeSubscription,
  extendSubscription,
  fetchExpertSubscriptions,
  fetchSubscriptionById,
  pauseSubscription,
  upgradeSubscription,
} from '../api/membership-subscription-api'
import type {
  BuyMembershipPayload,
  CancelSubscriptionPayload,
  ChangePlanPayload,
  ExtendSubscriptionPayload,
  PauseSubscriptionPayload,
  SubscriptionStatus,
} from '../types/membership-subscription'

export const useExpertSubscriptions = (params?: {
  status?: SubscriptionStatus
  search?: string
  page?: number
  limit?: number
}) => {
  return useQuery({
    queryKey: ['expert-subscriptions', params],
    queryFn: () => fetchExpertSubscriptions(params),
  })
}

export const useSubscription = (id: string) => {
  return useQuery({
    queryKey: ['subscription', id],
    queryFn: () => fetchSubscriptionById(id),
    enabled: !!id,
  })
}

const invalidateSubscriptionQueries = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries({ queryKey: ['expert-subscriptions'] })
  queryClient.invalidateQueries({ queryKey: ['subscription'] })
}

export const useBuyMembership = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: BuyMembershipPayload) => buyMembership(payload),
    onSuccess: () => invalidateSubscriptionQueries(queryClient),
  })
}

export const useUpgradeSubscription = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ChangePlanPayload }) =>
      upgradeSubscription(id, payload),
    onSuccess: () => invalidateSubscriptionQueries(queryClient),
  })
}

export const useDowngradeSubscription = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ChangePlanPayload }) =>
      downgradeSubscription(id, payload),
    onSuccess: () => invalidateSubscriptionQueries(queryClient),
  })
}

export const useExtendSubscription = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ExtendSubscriptionPayload }) =>
      extendSubscription(id, payload),
    onSuccess: () => invalidateSubscriptionQueries(queryClient),
  })
}

export const useCancelSubscription = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CancelSubscriptionPayload }) =>
      cancelSubscription(id, payload),
    onSuccess: () => invalidateSubscriptionQueries(queryClient),
  })
}

export const usePauseSubscription = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: PauseSubscriptionPayload }) =>
      pauseSubscription(id, payload),
    onSuccess: () => invalidateSubscriptionQueries(queryClient),
  })
}
