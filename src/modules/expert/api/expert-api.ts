import { adminApiClient, profileApiClient } from '@/shared/lib/axios'
import type { ExpertResponse } from '../type/expert'
import type {
  ExpertAnalyticsResponse,
  ExpertConsultationsResponse,
  ExpertProfileResponse,
  ExpertServicesResponse,
  PartnerInsightsResponse,
} from '../type/expert-profile'

export const fetchExperts = async (params?: Record<string, unknown>) => {
  const response = await adminApiClient.get<ExpertResponse>('/admin/internal/admin/partners', {
    params,
  })

  return response.data
}
export const fetchExpertById = async (id: string) => {
  const response = await adminApiClient.get(`/internal/admin/partners/${id}`)

  return response.data
}

export const fetchExpertProfile = async (id: string) => {
  const response = await adminApiClient.get<ExpertProfileResponse>(
    `/admin/internal/admin/partners/${id}`,
  )
  return response.data
}

export const fetchExpertAnalytics = async (expertId: string, timeRange?: string) => {
  const response = await adminApiClient.get<ExpertAnalyticsResponse>(
    `/admin/internal/admin/partners/${expertId}/analytics`,
    { params: timeRange ? { timeRange } : undefined },
  )
  return response.data
}

export const fetchPartnerInsights = async (
  partnerUserId: string,
  params?: { sort?: 'recent' | 'top' | 'all'; page?: number; limit?: number },
) => {
  const response = await profileApiClient.get<PartnerInsightsResponse>(
    `/profile/${partnerUserId}/insights`,
    {
      params: {
        sort: params?.sort || 'recent',
        page: params?.page || 1,
        limit: params?.limit || 20,
      },
    },
  )
  return response.data
}

export const fetchExpertDashboardAnalytics = async (params?: Record<string, unknown>) => {
  const response = await adminApiClient.get('/admin/internal/admin/experts/dashboard', {
    params,
  })
  return response.data
}

export const fetchExpertClientele = async (expertId: string, params?: Record<string, unknown>) => {
  const response = await adminApiClient.get(
    `/admin/internal/admin/partners/${expertId}/clientele`,
    {
      params,
    },
  )
  return response.data
}

export const fetchExpertServices = async (expertId: string, params?: Record<string, unknown>) => {
  const response = await adminApiClient.get<ExpertServicesResponse>(
    `/admin/internal/admin/services/expert/${expertId}/services`,
    { params },
  )
  return response.data
}

export const fetchExpertConsultations = async (
  expertId: string,
  params?: { page?: number; limit?: number },
) => {
  const response = await adminApiClient.get<ExpertConsultationsResponse>(
    `/admin/internal/admin/services/expert/${expertId}/consultations`,
    { params },
  )
  return response.data
}

export type SuspendExpertPayload = {
  selectedReasons: string[]
  startDate?: string
  endDate?: string
  suspendIndefinitely: boolean
  reasonDetails: string
  adminNotes: string
}

export type DeactivateExpertPayload = {
  selectedReasons?: string[]
  reason?: string
  reasonDetails?: string
  adminNotes: string
}

export const restoreExpert = async (id: string) => {
  const response = await adminApiClient.patch(`/admin/internal/admin/partners/${id}/restore`)
  return response.data
}

export const suspendExpert = async (id: string, payload: SuspendExpertPayload) => {
  const response = await adminApiClient.patch(
    `/admin/internal/admin/partners/${id}/suspend`,
    payload,
  )
  return response.data
}

export const blockExpert = async (id: string) => {
  const response = await adminApiClient.patch(`/admin/internal/admin/partners/${id}/block`)
  return response.data
}

export const forceLogoutExpert = async (id: string) => {
  const response = await adminApiClient.post(`/admin/internal/admin/partners/${id}/force-logout`)
  return response.data
}

export const activateExpert = async (id: string) => {
  const response = await adminApiClient.patch(`/admin/internal/admin/partners/${id}/activate`)
  return response.data
}

export const deactivateExpert = async (id: string, payload: DeactivateExpertPayload) => {
  const response = await adminApiClient.patch(
    `/admin/internal/admin/partners/${id}/deactivate`,
    payload,
  )
  return response.data
}

export type SetExpertPasswordPayload = {
  newPassword: string
  confirmNewPassword: string
}

export const setExpertPassword = async (id: string, payload: SetExpertPasswordPayload) => {
  const response = await adminApiClient.patch(
    `/admin/internal/admin/partners/${id}/password`,
    payload,
  )
  return response.data
}

export const fetchExpertPayoutHistory = async (expertId: string) => {
  const response = await adminApiClient.get(`/admin/internal/admin/partners/${expertId}/payouts`)
  return response.data
}

export const fetchExpertPayoutDetail = async (expertId: string, payoutId: string) => {
  const response = await adminApiClient.get(
    `/admin/internal/admin/partners/${expertId}/payouts/${payoutId}`,
  )
  return response.data
}

export const fetchExpertReports = async (params?: Record<string, unknown>) => {
  const response = await adminApiClient.get('/admin/internal/admin/reports/experts', { params })
  return response.data
}

export const fetchExpertReportDetail = async (id: string) => {
  const response = await adminApiClient.get(`/admin/internal/admin/reports/experts/${id}`)
  return response.data
}

export const updateExpertReport = async (id: string, payload: Record<string, unknown>) => {
  const response = await adminApiClient.patch(
    `/admin/internal/admin/reports/experts/${id}`,
    payload,
  )
  return response.data
}

export type SubmitExpertReportPayload = {
  partnerId: string
  issueType: string
  reason: string
  reporterId: string
  reporterName: string
  reporterType?: string
}

export const submitExpertReport = async (payload: SubmitExpertReportPayload) => {
  const response = await adminApiClient.post('/admin/internal/reports/expert', payload)
  return response.data
}

export const exportExpertReportsCSV = async (params?: Record<string, unknown>) => {
  const data = await fetchExpertReports({ ...params, limit: 1000 })
  const items = data?.data?.items || data?.items || []

  if (!items || items.length === 0) {
    throw new Error('No report records found to export.')
  }

  const headers = [
    'Report ID',
    'Expert ID',
    'Expert Name',
    'Reporter Type',
    'Reporter ID',
    'Reporter Name',
    'Issue Type',
    'Reason',
    'Business Impact',
    'Investigation Status',
    'Investigating Admin',
    'Final Outcome',
    'Submitted At',
  ]

  const rows = items.map((r: Record<string, unknown>) => [
    r.reportId || '',
    r.partnerId || '',
    `"${(r.expertName || '').toString().replace(/"/g, '""')}"`,
    r.reporterType || '',
    r.reporterId || '',
    `"${(r.reporterName || '').toString().replace(/"/g, '""')}"`,
    r.issueType || '',
    `"${(r.reason || '').toString().replace(/"/g, '""')}"`,
    r.businessImpact || '',
    r.investigationStatus || '',
    `"${(r.investigatingAdmin || '').toString().replace(/"/g, '""')}"`,
    r.finalOutcome || '',
    r.submittedAt ? new Date(r.submittedAt as string).toLocaleString() : '',
  ])

  const csvContent = [headers.join(','), ...rows.map((row: string[]) => row.join(','))].join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `expert-reports-${new Date().toISOString().slice(0, 10)}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export type BulkActionPayload = {
  partnerIds: string[]
  reason?: string
  adminNote?: string
  adminNotes?: string
  selectedReasons?: string[]
  reasons?: string[]
  title?: string
  message?: string
  subject?: string
  body?: string
  channel?: string
  planTier?: string
  planId?: string
  newMembershipPlanId?: string
  billingCycleName?: string
  isPremium?: boolean
  verificationStatus?: string
  ticketSubject?: string
  priority?: string
  targetAdminId?: string
  assigneeSubAdminId?: string
  assigneeName?: string
  applicationUrl?: string
  entityTitle?: string
  escalationTarget?: 'kyc' | 'banking' | 'application'
}

export const bulkSuspendExperts = async (payload: BulkActionPayload) => {
  const response = await adminApiClient.post('/admin/internal/admin/partners/bulk-suspend', payload)
  return response.data
}

export const bulkDeactivateExperts = async (payload: BulkActionPayload) => {
  const response = await adminApiClient.post(
    '/admin/internal/admin/partners/bulk-deactivate',
    payload,
  )
  return response.data
}

export const bulkNotifyExperts = async (payload: BulkActionPayload) => {
  const response = await adminApiClient.post('/admin/internal/admin/partners/bulk-notify', payload)
  return response.data
}

export const bulkMessageExperts = async (payload: BulkActionPayload) => {
  const response = await adminApiClient.post('/admin/internal/admin/partners/bulk-message', payload)
  return response.data
}

export const bulkUpdateMembershipExperts = async (payload: BulkActionPayload) => {
  const response = await adminApiClient.post(
    '/admin/internal/admin/partners/bulk-update-membership',
    payload,
  )
  return response.data
}

export const bulkApproveExperts = async (payload: BulkActionPayload) => {
  const response = await adminApiClient.post('/admin/internal/admin/partners/bulk-approve', payload)
  return response.data
}

export const bulkRejectExperts = async (payload: BulkActionPayload) => {
  const response = await adminApiClient.post('/admin/internal/admin/partners/bulk-reject', payload)
  return response.data
}

export const bulkRestoreExperts = async (payload: BulkActionPayload) => {
  const response = await adminApiClient.post('/admin/internal/admin/partners/bulk-restore', payload)
  return response.data
}

export const bulkVerifyKycExperts = async (payload: BulkActionPayload) => {
  const response = await adminApiClient.post(
    '/admin/internal/admin/partners/bulk-verify-kyc',
    payload,
  )
  return response.data
}

export const bulkEscalateExperts = async (payload: BulkActionPayload) => {
  const response = await adminApiClient.post(
    '/admin/internal/admin/partners/bulk-escalate',
    payload,
  )
  return response.data
}

export const bulkRaiseTicketExperts = async (payload: BulkActionPayload) => {
  const response = await adminApiClient.post(
    '/admin/internal/admin/partners/bulk-raise-ticket',
    payload,
  )
  return response.data
}

export const updateExpertAdminNotes = async (partnerId: string, internalNotes: string) => {
  const response = await adminApiClient.patch(
    `/admin/internal/admin/partners/${partnerId}/admin-notes`,
    { internalNotes },
  )
  return response.data
}

export const updateExpertAdminTags = async (partnerId: string, tags: string[]) => {
  const response = await adminApiClient.patch(
    `/admin/internal/admin/partners/${partnerId}/admin-tags`,
    { tags },
  )
  return response.data
}

export type ExpertCustomLinkDetails = {
  partnerId: string
  expertName?: string | null
  username?: string | null
  link: string | null
  visible: boolean
  createdAt?: string | null
  status: string
  usage: string
  traffic: string
  trafficCount?: number
  orders: number
}

export const fetchExpertCustomLink = async (partnerId: string) => {
  const response = await adminApiClient.get<{
    success: boolean
    data: ExpertCustomLinkDetails
  }>(`/admin/internal/admin/partners/${partnerId}/custom-link`)
  return response.data.data
}

export const updateExpertCustomLinkVisibility = async (partnerId: string, visible: boolean) => {
  const response = await adminApiClient.patch<{
    success: boolean
    data: ExpertCustomLinkDetails
  }>(`/admin/internal/admin/partners/${partnerId}/custom-link`, { visible })
  return response.data.data
}

export type PartnerAvailabilityWindow = {
  day?: string
  from?: string
  to?: string
}

export type PartnerUnavailabilityWindow = {
  date?: string
  from?: string
  to?: string
}

export type PartnerAvailability = {
  weeklyAvailability?: PartnerAvailabilityWindow[]
  unavailableDates?: PartnerUnavailabilityWindow[]
}

export const fetchExpertAvailability = async (partnerId: string) => {
  const response = await adminApiClient.get<{ success: boolean; data: PartnerAvailability }>(
    `/admin/internal/admin/partners/${partnerId}/availability`,
  )
  return response.data
}
