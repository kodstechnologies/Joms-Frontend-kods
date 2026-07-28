import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createCommunication,
  deleteCommunication,
  fetchCommunicationById,
  fetchCommunicationMetrics,
  fetchCommunicationOptions,
  fetchCommunications,
  updateCommunication,
  type CreateCommunicationPayload,
  type UpdateCommunicationPayload,
} from '../api/communication-api'

export const communicationKeys = {
  all: ['settings', 'communications'] as const,
  metrics: () => [...communicationKeys.all, 'metrics'] as const,
  options: () => [...communicationKeys.all, 'options'] as const,
  list: (params?: object) => [...communicationKeys.all, 'list', params] as const,
  detail: (id: string) => [...communicationKeys.all, 'detail', id] as const,
}

export const useCommunicationMetrics = () =>
  useQuery({
    queryKey: communicationKeys.metrics(),
    queryFn: fetchCommunicationMetrics,
  })

export const useCommunicationOptions = () =>
  useQuery({
    queryKey: communicationKeys.options(),
    queryFn: fetchCommunicationOptions,
    staleTime: 5 * 60 * 1000,
  })

export const useCommunications = (params?: {
  page?: number
  limit?: number
  search?: string
  status?: string
  channel?: string
  audience?: string
}) =>
  useQuery({
    queryKey: communicationKeys.list(params),
    queryFn: () => fetchCommunications(params),
  })

export const useCommunication = (id: string) =>
  useQuery({
    queryKey: communicationKeys.detail(id),
    queryFn: () => fetchCommunicationById(id),
    enabled: Boolean(id),
  })

export const useCreateCommunication = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateCommunicationPayload) => createCommunication(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: communicationKeys.all })
    },
  })
}

export const useUpdateCommunication = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCommunicationPayload }) =>
      updateCommunication(id, payload),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: communicationKeys.all })
      void queryClient.invalidateQueries({
        queryKey: communicationKeys.detail(variables.id),
      })
    },
  })
}

export const useDeleteCommunication = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteCommunication(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: communicationKeys.all })
    },
  })
}
