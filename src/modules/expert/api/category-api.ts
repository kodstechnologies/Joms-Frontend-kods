import { expertApiClient } from '@/shared/lib/axios'
import type {
  ApiSuccessResponse,
  CategoryListResponse,
  ServiceCategoryApi,
  SubCategoryListResponse,
} from '../type/category'

export type CategoryListParams = {
  search?: string
  status?: 'ACTIVE' | 'PAUSED' | 'DELETED'
  page?: number
  limit?: number
}

export type CategorySubCategoryInput = {
  name: string
  description: string
  vectorIconFile?: File | null
  vectorIconUrl?: string
}

export type CreateCategoryPayload = {
  name: string
  description: string
  iconFile?: File | null
  imageFile?: File | null
  subCategories: CategorySubCategoryInput[]
}

export type UpdateCategoryPayload = {
  name?: string
  description?: string
  iconFile?: File | null
  imageFile?: File | null
}

export type AddSubCategoryPayload = {
  name: string
  description: string
  vectorIconFile?: File | null
  vectorIconUrl?: string
}

const buildCategoryFormData = (payload: CreateCategoryPayload) => {
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
    ...(sub.vectorIconUrl && !sub.vectorIconFile
      ? { vectorIcon: sub.vectorIconUrl }
      : {}),
  }))

  formData.append('subCategories', JSON.stringify(subCategories))

  payload.subCategories.forEach((sub) => {
    if (sub.vectorIconFile) {
      formData.append('vectorIcons', sub.vectorIconFile)
    }
  })

  return formData
}

export const fetchCategories = async (params?: CategoryListParams) => {
  const response = await expertApiClient.get<CategoryListResponse>('/categories', {
    params,
  })
  return response.data
}

export const fetchCategoryById = async (id: string) => {
  const response = await expertApiClient.get<ApiSuccessResponse<ServiceCategoryApi>>(
    `/categories/${id}`,
  )
  return response.data
}

export const fetchSubcategories = async (
  categoryId: string,
  params?: { search?: string; page?: number; limit?: number },
) => {
  const response = await expertApiClient.get<SubCategoryListResponse>(
    `/categories/${categoryId}/subcategories`,
    { params },
  )
  return response.data
}

export const createCategory = async (payload: CreateCategoryPayload) => {
  const formData = buildCategoryFormData(payload)
  const response = await expertApiClient.post<ApiSuccessResponse<ServiceCategoryApi>>(
    '/categories',
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  )
  return response.data
}

export const updateCategory = async (id: string, payload: UpdateCategoryPayload) => {
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

  const response = await expertApiClient.patch<ApiSuccessResponse<ServiceCategoryApi>>(
    `/categories/${id}`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  )
  return response.data
}

export const addSubCategory = async (categoryId: string, payload: AddSubCategoryPayload) => {
  const formData = new FormData()
  formData.append('name', payload.name)
  formData.append('description', payload.description)

  if (payload.vectorIconFile) {
    formData.append('vectorIcon', payload.vectorIconFile)
  } else if (payload.vectorIconUrl) {
    formData.append('vectorIcon', payload.vectorIconUrl)
  }

  const response = await expertApiClient.post<ApiSuccessResponse<ServiceCategoryApi>>(
    `/categories/${categoryId}/subcategories`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  )
  return response.data
}

export const updateSubCategory = async (
  categoryId: string,
  subCategoryId: string,
  payload: { name?: string; description?: string; vectorIcon?: string },
) => {
  const response = await expertApiClient.patch<ApiSuccessResponse<ServiceCategoryApi>>(
    `/categories/${categoryId}/subcategories/${subCategoryId}`,
    payload,
  )
  return response.data
}

export const pauseCategory = async (id: string) => {
  const response = await expertApiClient.patch<ApiSuccessResponse<ServiceCategoryApi>>(
    `/categories/${id}/pause`,
  )
  return response.data
}

export const resumeCategory = async (id: string) => {
  const response = await expertApiClient.patch<ApiSuccessResponse<ServiceCategoryApi>>(
    `/categories/${id}/resume`,
  )
  return response.data
}

export const softDeleteCategory = async (id: string) => {
  const response = await expertApiClient.patch<ApiSuccessResponse<ServiceCategoryApi>>(
    `/categories/${id}/delete`,
  )
  return response.data
}

export const revokeCategory = async (id: string) => {
  const response = await expertApiClient.patch<ApiSuccessResponse<ServiceCategoryApi>>(
    `/categories/${id}/revoke`,
  )
  return response.data
}

export const permanentDeleteCategory = async (id: string) => {
  const response = await expertApiClient.delete<ApiSuccessResponse<null>>(
    `/categories/${id}/permanent-delete`,
  )
  return response.data
}

export const pauseSubCategory = async (categoryId: string, subCategoryId: string) => {
  const response = await expertApiClient.patch<ApiSuccessResponse<ServiceCategoryApi>>(
    `/categories/${categoryId}/subcategories/${subCategoryId}/pause`,
  )
  return response.data
}

export const resumeSubCategory = async (categoryId: string, subCategoryId: string) => {
  const response = await expertApiClient.patch<ApiSuccessResponse<ServiceCategoryApi>>(
    `/categories/${categoryId}/subcategories/${subCategoryId}/resume`,
  )
  return response.data
}

export const softDeleteSubCategory = async (categoryId: string, subCategoryId: string) => {
  const response = await expertApiClient.patch<ApiSuccessResponse<ServiceCategoryApi>>(
    `/categories/${categoryId}/subcategories/${subCategoryId}/delete`,
  )
  return response.data
}

export const revokeSubCategory = async (categoryId: string, subCategoryId: string) => {
  const response = await expertApiClient.patch<ApiSuccessResponse<ServiceCategoryApi>>(
    `/categories/${categoryId}/subcategories/${subCategoryId}/revoke`,
  )
  return response.data
}

export const permanentDeleteSubCategory = async (
  categoryId: string,
  subCategoryId: string,
) => {
  const response = await expertApiClient.delete<ApiSuccessResponse<null>>(
    `/categories/${categoryId}/subcategories/${subCategoryId}/permanent-delete`,
  )
  return response.data
}

export const fetchSubCategoryById = async (categoryId: string, subCategoryId: string) => {
  const response = await expertApiClient.get<
    ApiSuccessResponse<ServiceCategoryApi['subCategories'][number]>
  >(`/categories/${categoryId}/subcategories/${subCategoryId}`)
  return response.data
}
