import { adminApiClient } from '@/shared/lib/axios'
import type { ExpertResponse } from '../type/expert'
import type {
  ExpertAnalyticsResponse,
  ExpertConsultationsResponse,
  ExpertProfileResponse,
  ExpertServicesResponse,
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

export const fetchExpertServices = async (
  expertId: string,
  params?: { page?: number; limit?: number },
) => {
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
