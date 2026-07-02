import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  deactivateExpert,
  fetchExperts,
  fetchExpertById,
  suspendExpert,
  type DeactivateExpertPayload,
  type SuspendExpertPayload,
} from '../api/expert-api'

export const useExperts = (params?: {
  page?: number
  limit?: number
  search?: string
  status?: string
}) => {
  return useQuery({
    queryKey: ['experts', params],
    queryFn: () => fetchExperts(params),
  })
}

export const useExpert = (id: string) => {
  return useQuery({
    queryKey: ['expert', id],
    queryFn: () => fetchExpertById(id),
    enabled: !!id,
  })
}

export const useSuspendExpert = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: SuspendExpertPayload }) =>
      suspendExpert(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experts'] })
    },
  })
}

export const useDeactivateExpert = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: DeactivateExpertPayload }) =>
      deactivateExpert(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experts'] })
    },
  })
}