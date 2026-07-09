import { settingsApiClient } from '@/shared/lib/axios'

export type ModerationCategory = {
  id: string
  slug: string
  title: string
  description: string
  isActive: boolean
  reasonCount: number
  sortOrder: number
}

export type ModerationReason = {
  id: string
  categoryId: string
  title: string
  description: string
  defaultMessageTemplate: string
  isActive: boolean
  usageCount: number
  createdAt?: string
  updatedAt?: string
}

type ApiEnvelope<T> = {
  success: boolean
  message: string
  data: T
}

export const fetchModerationCategories = async (params?: { search?: string }) => {
  const response = await settingsApiClient.get<ApiEnvelope<ModerationCategory[]>>(
    '/settings/templates/categories',
    { params },
  )
  return response.data.data
}

export const updateModerationCategory = async (
  id: string,
  payload: Partial<Pick<ModerationCategory, 'title' | 'description' | 'isActive'>>,
) => {
  const response = await settingsApiClient.patch<ApiEnvelope<ModerationCategory>>(
    `/settings/templates/categories/${id}`,
    payload,
  )
  return response.data.data
}

export const fetchModerationReasons = async (categoryId: string) => {
  const response = await settingsApiClient.get<ApiEnvelope<ModerationReason[]>>(
    `/settings/templates/categories/${categoryId}/reasons`,
  )
  return response.data.data
}

export const createModerationReason = async (payload: {
  categoryId: string
  title: string
  description?: string
  defaultMessageTemplate?: string
  isActive?: boolean
}) => {
  const response = await settingsApiClient.post<ApiEnvelope<ModerationReason>>(
    '/settings/templates/reasons',
    payload,
  )
  return response.data.data
}

export const updateModerationReason = async (
  id: string,
  payload: Partial<
    Pick<ModerationReason, 'title' | 'description' | 'defaultMessageTemplate' | 'isActive'>
  >,
) => {
  const response = await settingsApiClient.patch<ApiEnvelope<ModerationReason>>(
    `/settings/templates/reasons/${id}`,
    payload,
  )
  return response.data.data
}

export const toggleModerationReason = async (id: string) => {
  const response = await settingsApiClient.patch<ApiEnvelope<ModerationReason>>(
    `/settings/templates/reasons/${id}/toggle`,
  )
  return response.data.data
}

export const deleteModerationReason = async (id: string) => {
  const response = await settingsApiClient.delete<ApiEnvelope<{ id: string }>>(
    `/settings/templates/reasons/${id}`,
  )
  return response.data.data
}
