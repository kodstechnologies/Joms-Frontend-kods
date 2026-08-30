import { adminApiClient, authApiClient, profileApiClient } from '@/shared/lib/axios'

export type ExpertOnboardingApiResponse<T = unknown> = {
  success: boolean
  message: string
  data: T
  meta: unknown
}

export type ExpertServiceCategoryGroups = Record<string, ExpertServiceCategoryItem[]>

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
  const response = await authApiClient.post<ExpertOnboardingApiResponse<ExpertBasicProfileData>>(
    '/auth/partners/basic-profile',
    payload,
  )
  return response.data
}

export const updateExpertBasicProfile = async (id: string, payload: FormData) => {
  const response = await authApiClient.patch<ExpertOnboardingApiResponse<ExpertBasicProfileData>>(
    `/auth/partners/${id}/basic-profile`,
    payload,
  )
  return response.data
}

export const updateExpertIdentityVerification = async (id: string, payload: FormData) => {
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

export const fetchPartnerDocumentBlob = async (
  partnerId: string,
  documentType: 'pan-card' | 'certificate' | 'gst-certificate',
) => {
  const response = await authApiClient.get(
    `/auth/partners/${partnerId}/documents/${documentType}`,
    { responseType: 'blob' },
  )

  const blob = response.data as Blob

  if (blob.type.includes('json') || blob.size < 128) {
    const text = await blob.text()
    try {
      const parsed = JSON.parse(text) as { message?: string }
      throw new Error(parsed.message || 'Failed to load document')
    } catch (error) {
      if (error instanceof Error && error.message !== 'Failed to load document') {
        throw error
      }
      throw new Error('Failed to load document', { cause: error })
    }
  }

  if (blob.type === 'application/pdf') return blob
  return new Blob([await blob.arrayBuffer()], { type: 'application/pdf' })
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

export const fetchServiceCategoriesByType = async (params: {
  servicetype: 'concierge' | 'venue'
  search?: string
}) => {
  const response = await authApiClient.get<
    ExpertOnboardingApiResponse<ExpertServiceCategoryGroups>
  >('/service-category/getservicebyservicetype', { params })
  return response.data
}

export type OfferingApiItem = {
  _id: string
  name: string
}

export const fetchOfferingsList = async (params?: {
  search?: string
  page?: number
  limit?: number
}) => {
  try {
    const response = await profileApiClient.get<{
      data?: { offerings?: OfferingApiItem[] } | OfferingApiItem[]
    }>('/offerings', {
      params: { limit: 100, ...params },
    })
    const payload = response.data?.data
    const list = Array.isArray(payload)
      ? payload
      : payload &&
          typeof payload === 'object' &&
          Array.isArray((payload as { offerings?: OfferingApiItem[] }).offerings)
        ? (payload as { offerings: OfferingApiItem[] }).offerings
        : []
    return list.map((item) => (typeof item === 'string' ? item : item.name)).filter(Boolean)
  } catch {
    return []
  }
}
