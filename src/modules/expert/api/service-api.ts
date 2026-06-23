import { expertApiClient } from '@/shared/lib/axios'
import type {
  ConsultationDetail,
  ConsultationDetailResponse,
  ConsultationStatusUpdateResponse,
  CreateConsultationPayload,
  CreateConsultationResponse,
  CreateServicePayload,
  CreateServiceResponse,
  PublishResponse,
  ServiceDetail,
  ServiceDetailResponse,
  ServiceResponse,
  ServiceStatusUpdateResponse,
  UpdateConsultationAdditionalInfoPayload,
  UpdateConsultationPricingPayload,
  UpdateConsultationStatusPayload,
  UpdateServicePricingPayload,
  UpdateServiceStatusPayload,
} from '../type/service'

export const fetchServices = async (params?: {
  page?: number
  limit?: number
  status?: string
  search?: string
}) => {
  const response = await expertApiClient.get<ServiceResponse>('/services/internal/admin/services', {
    params,
  })
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

export const updateServicePricing = async (id: string, payload: UpdateServicePricingPayload) => {
  const response = await expertApiClient.patch<ServiceDetailResponse>(
    `/api/admin/services/${id}/pricing`,
    payload,
  )
  return response.data
}

export const updateServiceGallery = async (id: string, images: File[]) => {
  const formData = new FormData()
  images.forEach((file) => formData.append('images', file))

  const response = await expertApiClient.patch<ServiceDetailResponse>(
    `/api/admin/services/${id}/gallery`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  )
  return response.data
}

export const publishService = async (id: string) => {
  const response = await expertApiClient.patch<PublishResponse<ServiceDetail>>(
    `/api/admin/services/${id}/publish`,
  )
  return response.data
}

export const createConsultation = async (payload: CreateConsultationPayload) => {
  const response = await expertApiClient.post<CreateConsultationResponse>(
    '/admin/consultations',
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

