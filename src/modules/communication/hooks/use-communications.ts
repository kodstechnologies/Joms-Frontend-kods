import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  cancelCommunication,
  createCommunication,
  deleteCommunication,
  duplicateCommunication,
  fetchCommunicationById,
  fetchCommunicationMetrics,
  fetchCommunicationOptions,
  fetchCommunications,
  pauseCommunication,
  resumeCommunication,
  retryFailedCommunication,
  updateCommunication,
  type CommunicationListParams,
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

export const useCommunications = (params?: CommunicationListParams) =>
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

const useInvalidateCommunications = () => {
  const queryClient = useQueryClient()
  return (id?: string) => {
    void queryClient.invalidateQueries({ queryKey: communicationKeys.all })
    if (id) {
      void queryClient.invalidateQueries({ queryKey: communicationKeys.detail(id) })
    }
  }
}

export const useCreateCommunication = () => {
  const invalidate = useInvalidateCommunications()

  return useMutation({
    mutationFn: (payload: CreateCommunicationPayload) => createCommunication(payload),
    onSuccess: () => invalidate(),
  })
}

export const useUpdateCommunication = () => {
  const invalidate = useInvalidateCommunications()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCommunicationPayload }) =>
      updateCommunication(id, payload),
    onSuccess: (_data, variables) => invalidate(variables.id),
  })
}

export const useDeleteCommunication = () => {
  const invalidate = useInvalidateCommunications()

  return useMutation({
    mutationFn: (id: string) => deleteCommunication(id),
    onSuccess: () => invalidate(),
  })
}

export const useDuplicateCommunication = () => {
  const invalidate = useInvalidateCommunications()

  return useMutation({
    mutationFn: (id: string) => duplicateCommunication(id),
    onSuccess: () => invalidate(),
  })
}

export const useCancelCommunication = () => {
  const invalidate = useInvalidateCommunications()

  return useMutation({
    mutationFn: (id: string) => cancelCommunication(id),
    onSuccess: (_data, id) => invalidate(id),
  })
}

export const usePauseCommunication = () => {
  const invalidate = useInvalidateCommunications()

  return useMutation({
    mutationFn: (id: string) => pauseCommunication(id),
    onSuccess: (_data, id) => invalidate(id),
  })
}

export const useResumeCommunication = () => {
  const invalidate = useInvalidateCommunications()

  return useMutation({
    mutationFn: (id: string) => resumeCommunication(id),
    onSuccess: (_data, id) => invalidate(id),
  })
}

export const useRetryFailedCommunication = () => {
  const invalidate = useInvalidateCommunications()

  return useMutation({
    mutationFn: (id: string) => retryFailedCommunication(id),
    onSuccess: (_data, id) => invalidate(id),
  })
}
