import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  activateExpert,
  deactivateExpert,
  fetchExperts,
  fetchExpertById,
  restoreExpert,
  setExpertPassword,
  suspendExpert,
  type DeactivateExpertPayload,
  type SetExpertPasswordPayload,
  type SuspendExpertPayload,
} from '../api/expert-api'

export const useExperts = (params?: {
  page?: number
  limit?: number
  search?: string
  status?: string
  serviceType?: string
}) => {
  const isDeletedList = params?.status === 'deactivated' || params?.status === 'deleted'

  return useQuery({
    queryKey: isDeletedList ? ['experts', 'deleted', params] : ['experts', params],
    queryFn: () => fetchExperts(params),
    refetchOnMount: isDeletedList ? 'always' : true,
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

export const useActivateExpert = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => activateExpert(id),
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

export const useRestoreExpert = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => restoreExpert(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experts'] })
    },
  })
}

export const useSetExpertPassword = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: SetExpertPasswordPayload }) =>
      setExpertPassword(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['experts'] })
      queryClient.invalidateQueries({ queryKey: ['expert-profile', variables.id] })
    },
  })
}
