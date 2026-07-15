import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  escalateConsultationApplication,
  escalatePartnerApplication,
  escalateServiceApplication,
  escalateVenueSpaceApplication,
  fetchAdminEscalation,
  fetchAllEscalations,
  fetchEscalationAssignees,
  fetchEscalationMetrics,
  startAdminEscalationReview,
  type AdminEscalationEntityType,
  type EscalateAdminEntityPayload,
} from '../api/escalation-api'

export const useEscalationAssignees = (permission = 'experts.*') =>
  useQuery({
    queryKey: ['escalation-assignees', permission],
    queryFn: () => fetchEscalationAssignees(permission),
  })

export const useAllEscalations = (params?: {
  page?: number
  limit?: number
  search?: string
  status?: string
  moduleKey?: string
}) =>
  useQuery({
    queryKey: ['all-escalations', params],
    queryFn: () => fetchAllEscalations(params),
  })

export const useEscalationMetrics = () =>
  useQuery({
    queryKey: ['escalation-metrics'],
    queryFn: () => fetchEscalationMetrics(),
  })

export const useAdminEscalation = (entityType?: AdminEscalationEntityType, entityId?: string) =>
  useQuery({
    queryKey: ['admin-escalation', entityType, entityId],
    queryFn: () =>
      fetchAdminEscalation(entityType as AdminEscalationEntityType, entityId as string),
    enabled: Boolean(entityType && entityId),
  })

export const useEscalatePartnerApplication = (id?: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: EscalateAdminEntityPayload) =>
      escalatePartnerApplication(id as string, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expert-application-view', id] })
      queryClient.invalidateQueries({ queryKey: ['venue-kyc-application', id] })
      queryClient.invalidateQueries({ queryKey: ['admin-escalation', 'partner', id] })
      queryClient.invalidateQueries({ queryKey: ['my-tasks'] })
      queryClient.invalidateQueries({ queryKey: ['all-escalations'] })
      queryClient.invalidateQueries({ queryKey: ['escalation-metrics'] })
    },
  })
}

export const useEscalateServiceApplication = (id?: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: EscalateAdminEntityPayload) =>
      escalateServiceApplication(id as string, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service', id] })
      queryClient.invalidateQueries({ queryKey: ['admin-escalation', 'service', id] })
      queryClient.invalidateQueries({ queryKey: ['my-tasks'] })
      queryClient.invalidateQueries({ queryKey: ['all-escalations'] })
      queryClient.invalidateQueries({ queryKey: ['escalation-metrics'] })
    },
  })
}

export const useEscalateConsultationApplication = (id?: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: EscalateAdminEntityPayload) =>
      escalateConsultationApplication(id as string, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultation', id] })
      queryClient.invalidateQueries({ queryKey: ['admin-escalation', 'consultation', id] })
      queryClient.invalidateQueries({ queryKey: ['my-tasks'] })
      queryClient.invalidateQueries({ queryKey: ['all-escalations'] })
      queryClient.invalidateQueries({ queryKey: ['escalation-metrics'] })
    },
  })
}

export const useEscalateVenueSpaceApplication = (spaceId?: string, venueId?: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: EscalateAdminEntityPayload) =>
      escalateVenueSpaceApplication(spaceId as string, {
        ...payload,
        venueId: payload.venueId || venueId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venue-full-view', venueId, spaceId] })
      queryClient.invalidateQueries({ queryKey: ['admin-escalation', 'venue_space', spaceId] })
      queryClient.invalidateQueries({ queryKey: ['my-tasks'] })
      queryClient.invalidateQueries({ queryKey: ['all-escalations'] })
      queryClient.invalidateQueries({ queryKey: ['escalation-metrics'] })
    },
  })
}

export const useStartAdminEscalationReview = (
  entityType?: AdminEscalationEntityType,
  entityId?: string,
) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () =>
      startAdminEscalationReview(entityType as AdminEscalationEntityType, entityId as string),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-tasks'] })
      queryClient.invalidateQueries({ queryKey: ['admin-escalation', entityType, entityId] })
      queryClient.invalidateQueries({ queryKey: ['all-escalations'] })
    },
  })
}
