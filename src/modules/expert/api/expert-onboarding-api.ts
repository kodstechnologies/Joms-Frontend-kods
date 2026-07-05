import { adminApiClient, authApiClient } from '@/shared/lib/axios'

export type ExpertOnboardingApiResponse<T = unknown> = {
  success: boolean
  message: string
  data: T
  meta: unknown
}

export type ExpertBasicProfileData = {
  _id: string
  fullname: string
  phone: string
  email: string
  phoneVerified: boolean
  emailVerified: boolean
  basicProfile?: Record<string, unknown>
  createdAt?: string
  updatedAt?: string
}

export const createExpertBasicProfile = async (payload: FormData) => {
  const response = await authApiClient.post<
    ExpertOnboardingApiResponse<ExpertBasicProfileData>
  >('/auth/partners/basic-profile', payload)
  return response.data
}

export const updateExpertIdentityVerification = async (
  id: string,
  payload: FormData,
) => {
  const response = await authApiClient.patch<ExpertOnboardingApiResponse>(
    `/auth/partners/${id}/identity-verification`,
    payload,
  )
  return response.data
}

export const updateExpertWorkExperience = async (
  id: string,
  payload: { workExperience: unknown[] },
) => {
  const response = await authApiClient.patch<ExpertOnboardingApiResponse>(
    `/auth/partners/${id}/work-experience`,
    payload,
  )
  return response.data
}

export const updateExpertGallery = async (id: string, payload: FormData) => {
  const response = await authApiClient.patch<ExpertOnboardingApiResponse>(
    `/auth/partners/${id}/gallery`,
    payload,
  )
  return response.data
}

export const submitExpertApplication = async (
  id: string,
  payload: { internalNotes?: string; isVerified: boolean },
) => {
  const response = await adminApiClient.patch<ExpertOnboardingApiResponse>(
    `/admin/internal/admin/partners/${id}/submit`,
    payload,
  )
  return response.data
}

export type ExpertServiceCategoryItem = {
  id: string
  name: string
  icon: string
}

export type ExpertServiceCategoryGroups = Record<string, ExpertServiceCategoryItem[]>

export const fetchServiceCategoriesByType = async (params: {
  servicetype: 'concierge' | 'venue'
  search?: string
}) => {
  const response = await authApiClient.get<
    ExpertOnboardingApiResponse<ExpertServiceCategoryGroups>
  >('/service-category/getservicebyservicetype', { params })
  return response.data
}
