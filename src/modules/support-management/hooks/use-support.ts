import { useCallback } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  assignSupportTicket,
  deleteSupportTicket,
  escalateSupportTicket,
  exportSupportTickets,
  fetchPastTickets,
  fetchSupportAgents,
  fetchSupportStats,
  fetchSupportTicket,
  fetchSupportTickets,
  mergeSupportTickets,
  reopenSupportTicket,
  resolveSupportTicket,
  sendSupportMessage,
  updateSupportTicket,
  type SupportTicketsParams,
} from '../api/support-api'
import { useSupportSocket } from './use-support-socket'
import { useAuthStore } from '@/modules/auth/store/auth-store'
import type { ChatMessage } from '../types/support'

const invalidateSupport = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries({ queryKey: ['support-stats'] })
  queryClient.invalidateQueries({ queryKey: ['support-tickets'] })
  queryClient.invalidateQueries({ queryKey: ['support-ticket'] })
  queryClient.invalidateQueries({ queryKey: ['support-past-tickets'] })
}

export const useSupportStats = () =>
  useQuery({
    queryKey: ['support-stats'],
    queryFn: fetchSupportStats,
  })

export const useSupportTickets = (params?: SupportTicketsParams) =>
  useQuery({
    queryKey: ['support-tickets', params],
    queryFn: () => fetchSupportTickets(params),
  })

export const useSupportTicket = (id?: string) =>
  useQuery({
    queryKey: ['support-ticket', id],
    queryFn: () => fetchSupportTicket(id!),
    enabled: Boolean(id),
  })

export const usePastTickets = (userId?: string, params?: { page?: number; limit?: number }) =>
  useQuery({
    queryKey: ['support-past-tickets', userId, params],
    queryFn: () => fetchPastTickets(userId!, params),
    enabled: Boolean(userId),
  })

export const useUpdateSupportTicket = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: Parameters<typeof updateSupportTicket>[1]
    }) => updateSupportTicket(id, payload),
    onSuccess: () => invalidateSupport(queryClient),
  })
}

export const useAssignSupportTicket = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: Parameters<typeof assignSupportTicket>[1]
    }) => assignSupportTicket(id, payload),
    onSuccess: () => invalidateSupport(queryClient),
  })
}

export const useEscalateSupportTicket = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload?: Parameters<typeof escalateSupportTicket>[1]
    }) => escalateSupportTicket(id, payload),
    onSuccess: () => invalidateSupport(queryClient),
  })
}

export const useResolveSupportTicket = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload?: Parameters<typeof resolveSupportTicket>[1]
    }) => resolveSupportTicket(id, payload),
    onSuccess: () => invalidateSupport(queryClient),
  })
}

export const useReopenSupportTicket = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => reopenSupportTicket(id),
    onSuccess: () => invalidateSupport(queryClient),
  })
}

export const useSendSupportMessage = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      content,
      attachments,
    }: {
      id: string
      content: string
      attachments?: ChatMessage['attachments']
    }) => sendSupportMessage(id, content, attachments),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['support-ticket', vars.id] })
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] })
    },
  })
}

export const useMergeSupportTickets = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: mergeSupportTickets,
    onSuccess: () => invalidateSupport(queryClient),
  })
}

export const useExportSupportTickets = () =>
  useMutation({
    mutationFn: exportSupportTickets,
  })

export const useDeleteSupportTicket = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteSupportTicket(id),
    onSuccess: () => invalidateSupport(queryClient),
  })
}

export const useSupportAgents = () =>
  useQuery({
    queryKey: ['support-agents'],
    queryFn: fetchSupportAgents,
  })

export const useLiveSupportUpdates = () => {
  const queryClient = useQueryClient()
  const token = useAuthStore((state) => state.token)

  const refresh = useCallback(() => {
    invalidateSupport(queryClient)
  }, [queryClient])

  const refreshTicket = useCallback(
    (ticketId?: string) => {
      if (ticketId) {
        queryClient.invalidateQueries({ queryKey: ['support-ticket', ticketId] })
        queryClient.invalidateQueries({ queryKey: ['support-tickets'] })
        return
      }
      refresh()
    },
    [queryClient, refresh],
  )

  const handlers = useCallback(
    () => ({
      onTicketCreated: refresh,
      onTicketUpdated: (payload: unknown) => {
        const data = payload as { ticket?: { id?: string } }
        refreshTicket(data.ticket?.id)
      },
      onTicketDeleted: refresh,
      onNewMessage: (payload: unknown) => {
        const data = payload as { ticketId?: string; ticket?: { id?: string } }
        refreshTicket(data.ticketId || data.ticket?.id)
      },
    }),
    [refresh, refreshTicket],
  )

  const socket = useSupportSocket(token, handlers)

  const sendSupportMessage = useCallback(
    async (payload: Record<string, unknown>) => {
      const result = await socket.sendSupportMessage(payload)
      if (result.success) refresh()
      return result
    },
    [refresh, socket],
  )

  return { ...socket, sendSupportMessage }
}
