import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  activateExpert,
  deactivateExpert,
  fetchExperts,
  fetchExpertById,
  restoreExpert,
  setExpertPassword,
  suspendExpert,
  bulkSuspendExperts,
  bulkDeactivateExperts,
  bulkNotifyExperts,
  bulkMessageExperts,
  bulkUpdateMembershipExperts,
  bulkApproveExperts,
  bulkRejectExperts,
  bulkRestoreExperts,
  bulkVerifyKycExperts,
  bulkVerifyDigilockerExperts,
  bulkEscalateExperts,
  bulkRaiseTicketExperts,
  type BulkActionPayload,
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
  [key: string]: unknown
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

export const useBulkSuspendExperts = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: BulkActionPayload) => bulkSuspendExperts(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experts'] })
    },
  })
}

export const useBulkDeactivateExperts = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: BulkActionPayload) => bulkDeactivateExperts(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experts'] })
    },
  })
}

export const useBulkNotifyExperts = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: BulkActionPayload) => bulkNotifyExperts(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experts'] })
    },
  })
}

export const useBulkMessageExperts = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: BulkActionPayload) => bulkMessageExperts(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experts'] })
    },
  })
}

export const useBulkUpdateMembershipExperts = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: BulkActionPayload) => bulkUpdateMembershipExperts(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experts'] })
    },
  })
}

export const useBulkApproveExperts = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: BulkActionPayload) => bulkApproveExperts(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experts'] })
    },
  })
}

export const useBulkRejectExperts = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: BulkActionPayload) => bulkRejectExperts(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experts'] })
    },
  })
}

export const useBulkRestoreExperts = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: BulkActionPayload) => bulkRestoreExperts(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experts'] })
    },
  })
}

export const useBulkVerifyKycExperts = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: BulkActionPayload) => bulkVerifyKycExperts(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experts'] })
    },
  })
}

export const useBulkVerifyDigilockerExperts = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: BulkActionPayload) => bulkVerifyDigilockerExperts(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experts'] })
    },
  })
}

export const useBulkEscalateExperts = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: BulkActionPayload) => bulkEscalateExperts(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experts'] })
    },
  })
}

export const useBulkRaiseTicketExperts = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: BulkActionPayload) => bulkRaiseTicketExperts(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experts'] })
    },
  })
}
