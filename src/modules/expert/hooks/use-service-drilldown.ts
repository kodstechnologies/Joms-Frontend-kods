import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  fetchAdminChatMessages,
  fetchAdminChatThread,
  fetchAdminChatVault,
  fetchAdminOrderDetail,
  fetchAdminOrderPayment,
  fetchAdminProposal,
  fetchAdminQuotation,
  fetchAdminServiceDetail,
  fetchServiceOrders,
  fetchServicePerformance,
  fetchServiceRevisionSnapshot,
  fetchServiceRevisions,
  fetchServiceSupportTickets,
  flagAdminChatMessage,
  flagAdminChatThread,
  flagServiceForReview,
  pauseServiceListing,
  requestServiceChanges,
  unflagService,
  unpauseServiceListing,
  type FlagServicePayload,
  type PauseServicePayload,
  type RequestServiceChangesPayload,
} from '../api/service-drilldown-api'
import type { ServiceOrdersQuery } from '../type/service-drilldown'

export const useAdminServiceDetail = (serviceId?: string) =>
  useQuery({
    queryKey: ['admin-service-detail', serviceId],
    queryFn: () => fetchAdminServiceDetail(serviceId as string),
    enabled: Boolean(serviceId),
  })

export const useServiceRevisions = (serviceId?: string, enabled = true) =>
  useQuery({
    queryKey: ['admin-service-revisions', serviceId],
    queryFn: () => fetchServiceRevisions(serviceId as string, { page: 1, limit: 50 }),
    enabled: Boolean(serviceId) && enabled,
  })

export const useServiceRevisionSnapshot = (serviceId?: string, revisionId?: string) =>
  useQuery({
    queryKey: ['admin-service-revision', serviceId, revisionId],
    queryFn: () => fetchServiceRevisionSnapshot(serviceId as string, revisionId as string),
    enabled: Boolean(serviceId && revisionId),
  })

export const useServiceSupportTickets = (serviceId?: string, expertId?: string) =>
  useQuery({
    queryKey: ['admin-service-tickets', serviceId, expertId],
    queryFn: () => fetchServiceSupportTickets(serviceId as string, { expertId, limit: 10 }),
    enabled: Boolean(serviceId),
  })

export const useServicePerformance = (serviceId?: string) =>
  useQuery({
    queryKey: ['admin-service-performance', serviceId],
    queryFn: () => fetchServicePerformance(serviceId as string),
    enabled: Boolean(serviceId),
  })

export const useServiceOrders = (serviceId: string | undefined, params: ServiceOrdersQuery) =>
  useQuery({
    queryKey: ['admin-service-orders', serviceId, params],
    queryFn: () => fetchServiceOrders(serviceId as string, params),
    enabled: Boolean(serviceId),
    placeholderData: (previous) => previous,
  })

export const useAdminOrderDetail = (orderId?: string, type?: string) =>
  useQuery({
    queryKey: ['admin-order-detail', orderId, type],
    queryFn: () => fetchAdminOrderDetail(orderId as string, type),
    enabled: Boolean(orderId),
  })

export const useAdminOrderPayment = (orderId?: string, type?: string, enabled = true) =>
  useQuery({
    queryKey: ['admin-order-payment', orderId, type],
    queryFn: () => fetchAdminOrderPayment(orderId as string, type),
    enabled: Boolean(orderId) && enabled,
  })

export const useAdminQuotation = (quotationId?: string) =>
  useQuery({
    queryKey: ['admin-quotation', quotationId],
    queryFn: () => fetchAdminQuotation(quotationId as string),
    enabled: Boolean(quotationId),
  })

export const useAdminProposal = (proposalId?: string) =>
  useQuery({
    queryKey: ['admin-proposal', proposalId],
    queryFn: () => fetchAdminProposal(proposalId as string),
    enabled: Boolean(proposalId),
  })

export const useAdminChatThread = (threadId?: string) =>
  useQuery({
    queryKey: ['admin-chat-thread', threadId],
    queryFn: () => fetchAdminChatThread(threadId as string),
    enabled: Boolean(threadId),
  })

export const useAdminChatMessages = (
  threadId?: string,
  params: { page?: number; limit?: number; flaggedOnly?: boolean } = {},
) =>
  useQuery({
    queryKey: ['admin-chat-messages', threadId, params],
    queryFn: () => fetchAdminChatMessages(threadId as string, params),
    enabled: Boolean(threadId),
    placeholderData: (previous) => previous,
  })

export const useAdminChatVault = (threadId?: string) =>
  useQuery({
    queryKey: ['admin-chat-vault', threadId],
    queryFn: () => fetchAdminChatVault(threadId as string),
    enabled: Boolean(threadId),
  })

export const useFlagChatMessage = (threadId?: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (variables: { messageId: string; isFlagged: boolean; reason?: string }) =>
      flagAdminChatMessage(variables.messageId, {
        isFlagged: variables.isFlagged,
        reason: variables.reason,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-chat-messages', threadId] })
      queryClient.invalidateQueries({ queryKey: ['admin-chat-thread', threadId] })
      queryClient.invalidateQueries({ queryKey: ['admin-chat-vault', threadId] })
    },
  })
}

export const useFlagChatThread = (threadId?: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (variables: { isFlagged: boolean; reason?: string }) =>
      flagAdminChatThread(threadId as string, variables),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-chat-thread', threadId] })
    },
  })
}

const useServiceActionMutation = <TPayload>(
  mutationFn: (variables: { serviceId: string; payload: TPayload }) => Promise<unknown>,
) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['admin-service-detail', variables.serviceId],
      })
      queryClient.invalidateQueries({
        queryKey: ['admin-service-revisions', variables.serviceId],
      })
      queryClient.invalidateQueries({ queryKey: ['expert-services'] })
      queryClient.invalidateQueries({ queryKey: ['services'] })
    },
  })
}

export const usePauseServiceListing = () =>
  useServiceActionMutation<PauseServicePayload>(({ serviceId, payload }) =>
    pauseServiceListing(serviceId, payload),
  )

export const useRequestServiceChanges = () =>
  useServiceActionMutation<RequestServiceChangesPayload>(({ serviceId, payload }) =>
    requestServiceChanges(serviceId, payload),
  )

export const useFlagServiceForReview = () =>
  useServiceActionMutation<FlagServicePayload>(({ serviceId, payload }) =>
    flagServiceForReview(serviceId, payload),
  )

export const useUnpauseServiceListing = () =>
  useServiceActionMutation<void>(({ serviceId }) => unpauseServiceListing(serviceId))

export const useUnflagService = () =>
  useServiceActionMutation<void>(({ serviceId }) => unflagService(serviceId))
