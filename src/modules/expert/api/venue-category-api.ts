import { venueApiClient } from '@/shared/lib/axios'
import type {
  ApiSuccessResponse,
  VenueCategoryApi,
  VenueCategoryListResponse,
} from '../type/category'
import type {
  AddSubCategoryPayload,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from './category-api'

const buildVenueCategoryFormData = (payload: CreateCategoryPayload) => {
  const formData = new FormData()
  formData.append('name', payload.name)
  formData.append('description', payload.description)

  if (payload.iconFile) {
    formData.append('icon', payload.iconFile)
  }

  if (payload.imageFile) {
    formData.append('image', payload.imageFile)
  }

  // Keep subCategories JSON small — icons are uploaded as vectorIcons files.
  const subCategories = payload.subCategories.map((sub) => ({
    name: sub.name,
    description: sub.description,
    ...(sub.vectorIconUrl && !sub.vectorIconFile ? { vectorIcon: sub.vectorIconUrl } : {}),
  }))

  formData.append('subCategories', JSON.stringify(subCategories))

  payload.subCategories.forEach((sub) => {
    if (sub.vectorIconFile) {
      formData.append('vectorIcons', sub.vectorIconFile)
    }
  })

  return formData
}

export const fetchVenueCategoryList = async (params?: Record<string, unknown>) => {
  const response = await venueApiClient.get<VenueCategoryListResponse>('/venue-categories', {
    params,
  })
  return response.data
}

export const fetchPausedVenueCategories = async (params?: Record<string, unknown>) => {
  const response = await venueApiClient.get<VenueCategoryListResponse>('/venue-categories/paused', {
    params,
  })
  return response.data
}

export const fetchDeletedVenueCategories = async (params?: Record<string, unknown>) => {
  const response = await venueApiClient.get<VenueCategoryListResponse>(
    '/venue-categories/deleted',
    { params },
  )
  return response.data
}

export const fetchVenueCategoryDetails = async () => {
  const response = await venueApiClient.get<
    ApiSuccessResponse<
      Array<{
        categoryId: string
        categoryName: string
        subCategoryCount: number
        status: string
      }>
    >
  >('/venue-categories/details')
  return response.data
}

export const fetchVenueCategoryById = async (id: string) => {
  const response = await venueApiClient.get<ApiSuccessResponse<VenueCategoryApi>>(
    `/venue-categories/${id}`,
  )
  return response.data
}

export const createVenueCategory = async (payload: CreateCategoryPayload) => {
  const formData = buildVenueCategoryFormData(payload)
  const response = await venueApiClient.post<ApiSuccessResponse<VenueCategoryApi>>(
    '/venue-categories',
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  )
  return response.data
}

export const updateVenueCategory = async (id: string, payload: UpdateCategoryPayload) => {
  const formData = new FormData()

  if (payload.name !== undefined) {
    formData.append('name', payload.name)
  }

  if (payload.description !== undefined) {
    formData.append('description', payload.description)
  }

  if (payload.iconFile) {
    formData.append('icon', payload.iconFile)
  }

  if (payload.imageFile) {
    formData.append('image', payload.imageFile)
  }

  const response = await venueApiClient.patch<ApiSuccessResponse<VenueCategoryApi>>(
    `/venue-categories/${id}`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  )
  return response.data
}

export const addVenueSubCategories = async (
  categoryId: string,
  existing: VenueCategoryApi,
  newSubCategories: AddSubCategoryPayload[],
) => {
  const existingSubs = (existing.subCategories || []).map((sub) => ({
    name: sub.name,
    description: sub.description || '',
    vectorIcon: sub.vectorIcon || '',
  }))

  const createdSubs = newSubCategories.map((sub) => ({
    name: sub.name,
    description: sub.description,
    ...(sub.vectorIconUrl && !sub.vectorIconFile ? { vectorIcon: sub.vectorIconUrl } : {}),
  }))

  const formData = new FormData()
  formData.append('subCategories', JSON.stringify([...existingSubs, ...createdSubs]))

  newSubCategories.forEach((sub) => {
    if (sub.vectorIconFile) {
      formData.append('vectorIcons', sub.vectorIconFile)
    }
  })

  const response = await venueApiClient.patch<ApiSuccessResponse<VenueCategoryApi>>(
    `/venue-categories/${categoryId}`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  )
  return response.data
}

export const pauseVenueCategory = async (id: string) => {
  const response = await venueApiClient.patch<ApiSuccessResponse<VenueCategoryApi>>(
    `/venue-categories/${id}/pause`,
  )
  return response.data
}

export const resumeVenueCategory = async (id: string) => {
  const response = await venueApiClient.patch<ApiSuccessResponse<VenueCategoryApi>>(
    `/venue-categories/${id}/resume`,
  )
  return response.data
}

export const softDeleteVenueCategory = async (id: string) => {
  const response = await venueApiClient.patch<ApiSuccessResponse<VenueCategoryApi>>(
    `/venue-categories/${id}/soft-delete`,
  )
  return response.data
}

export const revokeVenueCategory = async (id: string) => {
  const response = await venueApiClient.patch<ApiSuccessResponse<VenueCategoryApi>>(
    `/venue-categories/${id}/revoke`,
  )
  return response.data
}

export const hardDeleteVenueCategory = async (id: string) => {
  const response = await venueApiClient.delete<ApiSuccessResponse<null>>(
    `/venue-categories/${id}/hard-delete`,
  )
  return response.data
}

export const pauseVenueSubCategory = async (categoryId: string, subCategoryId: string) => {
  const response = await venueApiClient.patch<ApiSuccessResponse<VenueCategoryApi>>(
    `/venue-categories/${categoryId}/subcategories/${subCategoryId}/pause`,
  )
  return response.data
}

export const resumeVenueSubCategory = async (categoryId: string, subCategoryId: string) => {
  const response = await venueApiClient.patch<ApiSuccessResponse<VenueCategoryApi>>(
    `/venue-categories/${categoryId}/subcategories/${subCategoryId}/resume`,
  )
  return response.data
}

export const softDeleteVenueSubCategory = async (categoryId: string, subCategoryId: string) => {
  const response = await venueApiClient.patch<ApiSuccessResponse<VenueCategoryApi>>(
    `/venue-categories/${categoryId}/subcategories/${subCategoryId}/soft-delete`,
  )
  return response.data
}

export const revokeVenueSubCategory = async (categoryId: string, subCategoryId: string) => {
  const response = await venueApiClient.patch<ApiSuccessResponse<VenueCategoryApi>>(
    `/venue-categories/${categoryId}/subcategories/${subCategoryId}/revoke`,
  )
  return response.data
}

export const hardDeleteVenueSubCategory = async (categoryId: string, subCategoryId: string) => {
  const response = await venueApiClient.delete<ApiSuccessResponse<VenueCategoryApi>>(
    `/venue-categories/${categoryId}/subcategories/${subCategoryId}/hard-delete`,
  )
  return response.data
}

export const fetchVenueSubCategoryById = async (categoryId: string, subCategoryId: string) => {
  const response = await venueApiClient.get<
    ApiSuccessResponse<VenueCategoryApi['subCategories'][number]>
  >(`/venue-categories/${categoryId}/subcategories/${subCategoryId}`)
  return response.data
}
