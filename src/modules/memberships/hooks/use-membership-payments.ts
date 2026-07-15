import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createMembershipPaymentOrder,
  fetchMyPayments,
  fetchPaymentOrderStatus,
  verifyMembershipPayment,
} from '../api/payment-api'
import type {
  CreateMembershipPaymentOrderPayload,
  VerifyMembershipPaymentPayload,
} from '../api/payment-api'

export const useCreateMembershipPaymentOrder = () => {
  return useMutation({
    mutationFn: (payload: CreateMembershipPaymentOrderPayload) =>
      createMembershipPaymentOrder(payload),
  })
}

export const useVerifyMembershipPayment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: VerifyMembershipPaymentPayload) => verifyMembershipPayment(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expert-subscriptions'] })
      queryClient.invalidateQueries({ queryKey: ['subscription'] })
      queryClient.invalidateQueries({ queryKey: ['my-payments'] })
    },
  })
}

export const usePaymentOrderStatus = (orderId: string, enabled = true) => {
  return useQuery({
    queryKey: ['payment-order-status', orderId],
    queryFn: () => fetchPaymentOrderStatus(orderId),
    enabled: enabled && !!orderId,
  })
}

export const useMyPayments = (params?: {
  module?: 'membership'
  status?: 'created' | 'paid' | 'fulfilled' | 'failed' | 'expired'
  page?: number
  limit?: number
}) => {
  return useQuery({
    queryKey: ['my-payments', params],
    queryFn: () => fetchMyPayments(params),
  })
}
