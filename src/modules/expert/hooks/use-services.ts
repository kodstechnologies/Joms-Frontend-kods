import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  fetchServices,
  fetchServiceById,
  fetchConsultationById,
  updateServiceStatus,
  updateConsultationStatus,
  suspendService,
  activateService,
} from '../api/service-api'
import type {
  SuspendServicePayload,
  UpdateConsultationStatusPayload,
  UpdateServiceStatusPayload,
} from '../type/service'

export const useServices = (params?: {
  page?: number
  limit?: number
  status?: string
  search?: string
}) => {
  return useQuery({
    queryKey: ['services', params],
    queryFn: () => fetchServices(params),
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
    },
  })
}

export const useSuspendService = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: SuspendServicePayload }) =>
      suspendService(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
    },
  })
}

export const useActivateService = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => activateService(id),
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
    },
  })
}

