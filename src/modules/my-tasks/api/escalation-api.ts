import { adminApiClient } from '@/shared/lib/axios'

import { fetchEscalationAssignees } from '@/modules/expert/api/expert-application-api'

export type AdminEscalationEntityType = 'partner' | 'service' | 'consultation' | 'venue_space'

export type AdminEscalation = {
  _id?: string
  entityType: AdminEscalationEntityType
  entityId: string
  entityTitle?: string
  partnerId?: string
  venueId?: string
  moduleKey?: string
  escalationTarget?: 'kyc' | 'banking' | 'application'
  applicationUrl?: string
  escalatedToSubAdminId?: string
  escalatedToAuthAdminId?: string
  escalatedToName?: string
  escalatedAt?: string
  escalationNote?: string
  escalatedByAdminId?: string
  escalatedByName?: string
  escalationStatus?: 'assigned' | 'in_progress' | 'completed'
  priority?: 'Low' | 'Medium' | 'High' | 'Critical'
}

export type EscalateAdminEntityPayload = {
  assigneeSubAdminId: string
  assigneeName?: string
  adminNote: string
  venueId?: string
  applicationUrl?: string
  entityTitle?: string
  escalationTarget?: 'kyc' | 'banking' | 'application'
}

export type EscalationListItem = {
  escalationId: string
  roleId: string
  roleName: string
  escalationType: string
  priority: 'Low' | 'Medium' | 'High' | 'Critical'
  status: 'Open' | 'In Review' | 'Resolved'
  createdOn: string
  applicationUrl: string
  entityType: AdminEscalationEntityType
  entityId: string
  moduleKey: string
  escalationTarget?: string
  escalatedByName?: string
  escalationNote?: string
}

export type EscalationMetrics = {
  total: number
  open: number
  inReview: number
  resolved: number
}

export { fetchEscalationAssignees }

export const fetchAllEscalations = async (params?: Record<string, unknown>) => {
  const response = await adminApiClient.get<{
    success: boolean
    data: {
      escalations: EscalationListItem[]
      meta: {
        page: number
        limit: number
        total: number
        totalPages: number
      }
    }
  }>('/admin/escalations', { params })
  return response.data
}

export const fetchEscalationMetrics = async () => {
  const response = await adminApiClient.get<{
    success: boolean
    data: EscalationMetrics
  }>('/admin/escalations/metrics')
  return response.data
}

export const fetchAdminEscalation = async (
  entityType: AdminEscalationEntityType,
  entityId: string,
) => {
  const response = await adminApiClient.get<{
    success: boolean
    data: AdminEscalation | null
  }>(`/admin/internal/admin/escalations/${entityType}/${entityId}`)
  return response.data
}

export const escalatePartnerApplication = async (
  id: string,
  payload: EscalateAdminEntityPayload,
) => {
  const response = await adminApiClient.patch(
    `/admin/internal/admin/partners/${id}/escalate`,
    payload,
  )
  return response.data
}

export const escalateServiceApplication = async (
  id: string,
  payload: EscalateAdminEntityPayload,
) => {
  const response = await adminApiClient.patch(
    `/admin/internal/admin/services/${id}/escalate`,
    payload,
  )
  return response.data
}

export const escalateConsultationApplication = async (
  id: string,
  payload: EscalateAdminEntityPayload,
) => {
  const response = await adminApiClient.patch(
    `/admin/internal/admin/consultations/${id}/escalate`,
    payload,
  )
  return response.data
}

export const escalateVenueSpaceApplication = async (
  spaceId: string,
  payload: EscalateAdminEntityPayload,
) => {
  const response = await adminApiClient.patch(
    `/admin/internal/admin/venue-spaces/${spaceId}/escalate`,
    payload,
  )
  return response.data
}

export const startAdminEscalationReview = async (
  entityType: AdminEscalationEntityType,
  entityId: string,
) => {
  const response = await adminApiClient.patch(
    `/admin/internal/admin/escalations/${entityType}/${entityId}/start`,
  )
  return response.data
}
