import { expertApiClient } from '@/shared/lib/axios'
import type {
  ConsultationDetail,
  ConsultationDetailResponse,
  ConsultationStatusUpdateResponse,
  CreateConsultationPayload,
  CreateConsultationResponse,
  TopicListResponse,
  CreateServicePayload,
  CreateServiceResponse,
  PublishResponse,
  ServiceDetail,
  ServiceDetailResponse,
  ServiceResponse,
  ServiceStatusUpdateResponse,
  ServiceSuspendActivateResponse,
  SuspendServicePayload,
  UpdateServiceSuspensionPayload,
  UpdateConsultationAdditionalInfoPayload,
  UpdateConsultationPricingPayload,
  UpdateConsultationStatusPayload,
  UpdateServiceBasicPayload,
  UpdateServiceBasicResponse,
  UpdateServicePricingPayload,
  UpdateServiceStatusPayload,
} from '../type/service'

export const fetchServices = async (params?: Record<string, unknown>) => {
  const response = await expertApiClient.get<ServiceResponse>('/services/internal/admin/services', {
    params,
  })
  return response.data
}

export const suspendService = async (id: string, payload: SuspendServicePayload) => {
  const response = await expertApiClient.patch<ServiceSuspendActivateResponse>(
    `/services/internal/admin/services/${id}/suspend`,
    payload,
  )
  return response.data
}

export const updateServiceSuspension = async (
  id: string,
  payload: UpdateServiceSuspensionPayload,
) => {
  const response = await expertApiClient.patch<ServiceSuspendActivateResponse>(
    `/services/internal/admin/services/${id}/suspension`,
    payload,
  )
  return response.data
}

export type DeleteServicePayload = {
  selectedReasons: string[]
  reasonDetails?: string
  adminNotes: string
}

export const deleteService = async (id: string, payload: DeleteServicePayload) => {
  const response = await expertApiClient.patch(
    `/services/internal/admin/services/${id}/delete`,
    payload,
  )
  return response.data
}

export const restoreService = async (id: string) => {
  const response = await expertApiClient.patch(`/services/internal/admin/services/${id}/restore`)
  return response.data
}

export const purgeService = async (id: string, payload: { adminNotes: string }) => {
  const response = await expertApiClient.delete(`/services/internal/admin/services/${id}/purge`, {
    data: payload,
  })
  return response.data
}

export const activateService = async (id: string) => {
  const response = await expertApiClient.patch<ServiceSuspendActivateResponse>(
    `/services/internal/admin/services/${id}/activate`,
  )
  return response.data
}

export const fetchServiceById = async (id: string) => {
  const response = await expertApiClient.get<ServiceDetailResponse>(`/api/admin/services/${id}`)
  return response.data
}

export const createService = async (payload: CreateServicePayload) => {
  const response = await expertApiClient.post<CreateServiceResponse>('/api/admin/services', payload)
  return response.data
}

export const updateServiceBasic = async (id: string, payload: UpdateServiceBasicPayload) => {
  const response = await expertApiClient.patch<UpdateServiceBasicResponse>(
    `/api/admin/services/${id}/basic`,
    payload,
  )
  return response.data
}

export const updateServicePricing = async (id: string, payload: UpdateServicePricingPayload) => {
  const response = await expertApiClient.patch<ServiceDetailResponse>(
    `/api/admin/services/${id}/pricing`,
    payload,
  )
  return response.data
}

export const updateServiceGallery = async (
  id: string,
  images: File[],
  existingImageUrls: string[] = [],
) => {
  const formData = new FormData()
  images.forEach((file) => formData.append('images', file))
  if (existingImageUrls.length > 0) {
    formData.append('existingImages', JSON.stringify(existingImageUrls))
  }

  // Do not set Content-Type manually — the browser must add the multipart boundary.
  const response = await expertApiClient.patch<ServiceDetailResponse>(
    `/api/admin/services/${id}/gallery`,
    formData,
  )
  return response.data
}

export const publishService = async (id: string) => {
  const response = await expertApiClient.patch<PublishResponse<ServiceDetail>>(
    `/api/admin/services/${id}/publish`,
  )
  return response.data
}

export const fetchConsultationTopics = async (params?: {
  search?: string
  page?: number
  limit?: number
}) => {
  const response = await expertApiClient.get<TopicListResponse>('/consultations/topics', { params })
  return response.data
}

export const createConsultation = async (payload: CreateConsultationPayload) => {
  const response = await expertApiClient.post<CreateConsultationResponse>(
    '/admin/consultations',
    payload,
  )
  return response.data
}

export const updateConsultationBasic = async (
  id: string,
  payload: Omit<CreateConsultationPayload, 'partnerId'>,
) => {
  const response = await expertApiClient.patch<ConsultationDetailResponse>(
    `/admin/consultations/${id}/basic`,
    payload,
  )
  return response.data
}

export const updateConsultationAdditionalInfo = async (
  id: string,
  payload: UpdateConsultationAdditionalInfoPayload,
) => {
  const response = await expertApiClient.patch<ConsultationDetailResponse>(
    `/admin/consultations/${id}/additional-info`,
    payload,
  )
  return response.data
}

export const updateConsultationPricing = async (
  id: string,
  payload: UpdateConsultationPricingPayload,
) => {
  const response = await expertApiClient.patch<ConsultationDetailResponse>(
    `/admin/consultations/${id}/pricing`,
    payload,
  )
  return response.data
}

export const publishConsultation = async (id: string) => {
  const response = await expertApiClient.patch<PublishResponse<ConsultationDetail>>(
    `/admin/consultations/${id}/publish`,
  )
  return response.data
}

export const fetchConsultationById = async (id: string) => {
  const response = await expertApiClient.get<ConsultationDetailResponse>(`/consultations/${id}`)
  return response.data
}

export const updateServiceStatus = async (id: string, payload: UpdateServiceStatusPayload) => {
  const response = await expertApiClient.patch<ServiceStatusUpdateResponse>(
    `/services/internal/services/${id}/status`,
    payload,
  )
  return response.data
}

export const updateConsultationStatus = async (
  id: string,
  payload: UpdateConsultationStatusPayload,
) => {
  const response = await expertApiClient.patch<ConsultationStatusUpdateResponse>(
    `/consultations/internal/${id}/status`,
    payload,
  )
  return response.data
}

export type PricingRecommendationParams = {
  service_id?: string
  service_name?: string
  scope?: 'basic' | 'standard' | 'premium'
  turnaround?: 'express_24h' | 'priority_48h' | 'standard_3_5d' | 'flexible_7d_plus'
  seniority?: 'junior' | 'mid' | 'senior' | 'specialist'
  region?: 'metro_tier_1' | 'tier_2' | 'tier_3'
  proposed_price?: number
  requested_discount_pct?: number
}

export type PricingRecommendationResult = {
  recommendation: string
  short_badge_text: string
  service: {
    service_id: string
    name: string
    category: string
    sub_category?: string
    billing_unit?: string
    pricing_notes?: string
  } | null
  benchmarks: {
    currency: string
    base_average: number
    suggested_price: number
    min_range: number
    max_range: number
    combined_multiplier: number
  } | null
  breakdown: {
    proposed_price: number
    discount_pct: number
    discounted_price: number
    platform_fee: number
    platform_fee_pct: number
    gst: number
    gst_pct: number
    estimated_earnings: number
  }
  guardrails: {
    status: string
    severity: string
    block_submission: boolean
    notes?: string
  }
  ai_metadata: {
    model: string
    source: string
  }
}

export type PricingRecommendationResponse = {
  success: boolean
  message: string
  data: PricingRecommendationResult
}

export type ListingPricingConfig = {
  currency: string
  region?: string
  platformFeePercent: number
  gstPercent: number
  taxType?: string
  taxHandling?: string
  minPrice: number
  maxPrice: number
  maxDiscountPercent: number
  discountPresets: number[]
  allowManualDiscount: boolean
  platformFee?: number
  gstAmount?: number
  estimatedEarnings?: number
  discountedPrice?: number
  breakdown: {
    proposed_price: number
    proposedPrice?: number
    discount_pct: number
    discountPct?: number
    discounted_price: number
    discountedPrice?: number
    platform_fee: number
    platformFee?: number
    platform_fee_pct: number
    platformFeePct?: number
    gst: number
    gstAmount?: number
    gst_pct: number
    gstPct?: number
    estimated_earnings: number
    estimatedEarnings?: number
  } | null
}

export type ListingPricingConfigResponse = {
  success: boolean
  message: string
  data: ListingPricingConfig
}

export const fetchListingPricingConfig = async (params?: {
  price?: number
  discountPercent?: number
}) => {
  const response = await expertApiClient.get<ListingPricingConfigResponse>(
    '/services/pricing-config',
    { params },
  )
  return response.data
}

export const fetchPricingRecommendation = async (params: PricingRecommendationParams) => {
  const response = await expertApiClient.get<PricingRecommendationResponse>(
    '/services/pricing-recommendation',
    {
      params,
    },
  )
  return response.data
}

export type BulkServiceActionPayload = {
  serviceIds: string[]
  selectedReasons?: string[]
  adminNotes?: string
  startDate?: string
  endDate?: string
  indefinite?: boolean
}

export const bulkDeleteServices = async (
  serviceIdsOrPayload: string[] | BulkServiceActionPayload,
) => {
  const payload = Array.isArray(serviceIdsOrPayload)
    ? { serviceIds: serviceIdsOrPayload }
    : serviceIdsOrPayload
  const response = await expertApiClient.post(
    '/services/internal/admin/services/bulk-delete',
    payload,
  )
  return response.data
}

export const bulkPauseServices = async (
  serviceIdsOrPayload: string[] | BulkServiceActionPayload,
) => {
  const payload = Array.isArray(serviceIdsOrPayload)
    ? { serviceIds: serviceIdsOrPayload }
    : serviceIdsOrPayload
  const response = await expertApiClient.post(
    '/services/internal/admin/services/bulk-pause',
    payload,
  )
  return response.data
}

export const bulkHideServices = async (serviceIds: string[]) => {
  const response = await expertApiClient.post('/services/internal/admin/services/bulk-hide', {
    serviceIds,
  })
  return response.data
}

export const bulkDisableServices = async (serviceIds: string[]) => {
  const response = await expertApiClient.post('/services/internal/admin/services/bulk-disable', {
    serviceIds,
  })
  return response.data
}

export const bulkExportServices = async (serviceIds: string[]) => {
  const response = await expertApiClient.post('/services/internal/admin/services/bulk-export', {
    serviceIds,
  })
  return response.data
}

export const bulkNotifyServices = async (serviceIds: string[]) => {
  const response = await expertApiClient.post('/services/internal/admin/services/bulk-notify', {
    serviceIds,
  })
  return response.data
}

export const bulkMessageServices = async (serviceIds: string[]) => {
  const response = await expertApiClient.post('/services/internal/admin/services/bulk-message', {
    serviceIds,
  })
  return response.data
}

export const fetchServiceReports = async (params?: Record<string, unknown>) => {
  const response = await expertApiClient.get('/services/internal/admin/reports/services', {
    params,
  })
  return response.data
}

export const fetchServiceReportDetail = async (id: string) => {
  const response = await expertApiClient.get(`/services/internal/admin/reports/services/${id}`)
  return response.data
}

export const updateServiceReport = async (id: string, payload: Record<string, unknown>) => {
  const response = await expertApiClient.patch(
    `/services/internal/admin/reports/services/${id}`,
    payload,
  )
  return response.data
}

export type SubmitServiceReportPayload = {
  serviceId: string
  partnerId?: string
  issueType: string
  reason: string
  reporterId: string
  reporterName: string
  reporterType?: string
  supportingDocuments?: string[]
}

export const submitServiceReport = async (payload: SubmitServiceReportPayload) => {
  const response = await expertApiClient.post('/services/internal/reports/services', payload)
  return response.data
}

export const exportServiceReportsCSV = async (params?: Record<string, unknown>) => {
  const data = await fetchServiceReports({ ...params, limit: 1000 })
  const items = data?.data?.items || data?.items || []

  if (!items || items.length === 0) {
    throw new Error('No report records found to export.')
  }

  const headers = [
    'Report ID',
    'Service ID',
    'Service Title',
    'Partner ID',
    'Reporter Type',
    'Reporter ID',
    'Reporter Name',
    'Issue Type',
    'Business Impact',
    'Status',
    'Report Date',
  ]

  const rows = items.map((item: Record<string, unknown>) => [
    item.reportId || '',
    item.serviceId || '',
    item.serviceTitle || '',
    item.partnerId || '',
    item.reporterType || '',
    item.reporterId || '',
    item.reporterName || '',
    item.issueType || '',
    item.businessImpact || '',
    item.investigationStatus || '',
    item.createdAt ? new Date(item.createdAt as string).toISOString() : '',
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map((row: (string | number)[]) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','),
    ),
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `Service_Reports_${new Date().toISOString().split('T')[0]}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
