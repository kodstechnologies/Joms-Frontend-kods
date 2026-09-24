import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  fetchServices,
  fetchServiceById,
  fetchConsultationById,
  updateServiceStatus,
  updateConsultationStatus,
  suspendService,
  updateServiceSuspension,
  activateService,
  deleteService,
  restoreService,
  bulkDeleteServices,
  bulkPauseServices,
  bulkHideServices,
  bulkDisableServices,
  bulkExportServices,
  bulkNotifyServices,
  bulkMessageServices,
  type BulkServiceActionPayload,
} from '../api/service-api'
import type {
  SuspendServicePayload,
  UpdateServiceSuspensionPayload,
  UpdateConsultationStatusPayload,
  UpdateServiceStatusPayload,
} from '../type/service'
import type { DeleteServicePayload } from '../api/service-api'

export const useServices = (params?: Record<string, unknown>) => {
  const isDeletedList = params?.status === 'deleted'

  return useQuery({
    queryKey: isDeletedList ? ['services', 'deleted', params] : ['services', params],
    queryFn: () => fetchServices(params),
    refetchOnMount: isDeletedList ? 'always' : true,
  })
}

export const useService = (id: string, enabled = true) => {
  return useQuery({
    queryKey: ['service', id],
    queryFn: () => fetchServiceById(id),
    enabled: !!id && enabled,
  })
}

export const useConsultation = (id: string, enabled = true) => {
  return useQuery({
    queryKey: ['consultation', id],
    queryFn: () => fetchConsultationById(id),
    enabled: !!id && enabled,
  })
}

export const useUpdateServiceStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateServiceStatusPayload }) =>
      updateServiceStatus(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['service', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['services'] })
      queryClient.invalidateQueries({ queryKey: ['my-tasks'] })
    },
  })
}

export const useSuspendService = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: SuspendServicePayload }) =>
      suspendService(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
      queryClient.invalidateQueries({ queryKey: ['service', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['consultation', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['admin-service-detail', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['admin-service-revisions', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['expert-consultations'] })
      queryClient.invalidateQueries({ queryKey: ['expert-services'] })
    },
  })
}

export const useUpdateServiceSuspension = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateServiceSuspensionPayload }) =>
      updateServiceSuspension(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
      queryClient.invalidateQueries({ queryKey: ['service', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['consultation', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['admin-service-detail', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['admin-service-revisions', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['expert-consultations'] })
      queryClient.invalidateQueries({ queryKey: ['expert-services'] })
    },
  })
}

export const useActivateService = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => activateService(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
      queryClient.invalidateQueries({ queryKey: ['service', id] })
      queryClient.invalidateQueries({ queryKey: ['consultation', id] })
      queryClient.invalidateQueries({ queryKey: ['admin-service-detail', id] })
      queryClient.invalidateQueries({ queryKey: ['admin-service-revisions', id] })
      queryClient.invalidateQueries({ queryKey: ['expert-consultations'] })
      queryClient.invalidateQueries({ queryKey: ['expert-services'] })
    },
  })
}

export const useDeleteService = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: DeleteServicePayload }) =>
      deleteService(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
      queryClient.invalidateQueries({ queryKey: ['expert-consultations'] })
      queryClient.invalidateQueries({ queryKey: ['expert-services'] })
    },
  })
}

export const useRestoreService = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => restoreService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
    },
  })
}

export const useUpdateConsultationStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateConsultationStatusPayload }) =>
      updateConsultationStatus(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['consultation', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['services'] })
      queryClient.invalidateQueries({ queryKey: ['expert-consultations'] })
      queryClient.invalidateQueries({ queryKey: ['my-tasks'] })
    },
  })
}

export const useBulkDeleteServices = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: string[] | BulkServiceActionPayload) => bulkDeleteServices(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
      queryClient.invalidateQueries({ queryKey: ['expert-services'] })
    },
  })
}

export const useBulkPauseServices = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: string[] | BulkServiceActionPayload) => bulkPauseServices(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
      queryClient.invalidateQueries({ queryKey: ['expert-services'] })
    },
  })
}

export const useBulkHideServices = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (serviceIds: string[]) => bulkHideServices(serviceIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
      queryClient.invalidateQueries({ queryKey: ['expert-services'] })
    },
  })
}

export const useBulkDisableServices = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (serviceIds: string[]) => bulkDisableServices(serviceIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
      queryClient.invalidateQueries({ queryKey: ['expert-services'] })
    },
  })
}

export const useBulkExportServices = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (serviceIds: string[]) => bulkExportServices(serviceIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
      queryClient.invalidateQueries({ queryKey: ['expert-services'] })
    },
  })
}

export const useBulkNotifyServices = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (serviceIds: string[]) => bulkNotifyServices(serviceIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
      queryClient.invalidateQueries({ queryKey: ['expert-services'] })
    },
  })
}

export const useBulkMessageServices = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (serviceIds: string[]) => bulkMessageServices(serviceIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
      queryClient.invalidateQueries({ queryKey: ['expert-services'] })
    },
  })
}
