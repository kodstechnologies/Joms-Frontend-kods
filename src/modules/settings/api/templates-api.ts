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

export const MODERATION_CATEGORY_SLUGS = {
  suspendExpert: 'suspend-expert',
  deleteExpert: 'delete-expert',
  rejectExpert: 'reject-expert',
  requestChangesExpert: 'request-changes-expert',
  suspendService: 'suspend-service',
  deleteService: 'delete-service',
  rejectService: 'reject-service',
  pauseService: 'pause-service',
  pauseCategory: 'pause-category',
  requestChangesService: 'request-changes-service',
  suspendVenue: 'suspend-venue',
  deleteVenue: 'delete-venue',
  pauseVenue: 'pause-venue',
  hideVenue: 'hide-venue',
  rejectVenue: 'reject-venue',
  requestChangesVenue: 'request-changes-venue',
  rejectConsultation: 'reject-Consultation',
  revokeInvite: 'revoke-invite',
  reinviteUser: 'reinvite-user',
} as const

export type ModerationCategorySlug =
  (typeof MODERATION_CATEGORY_SLUGS)[keyof typeof MODERATION_CATEGORY_SLUGS]

type ApiEnvelope<T> = {
  success: boolean
  message: string
  data: T
}

export const fetchModerationCategories = async (params?: {
  search?: string
  includeInactive?: boolean
}) => {
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

export const fetchModerationReasonsBySlug = async (
  slug: string,
  params?: { activeOnly?: boolean },
) => {
  const response = await settingsApiClient.get<
    ApiEnvelope<{ category: ModerationCategory; reasons: ModerationReason[] }>
  >(`/settings/templates/categories/by-slug/${slug}/reasons`, { params })
  return response.data.data
}

export const createModerationReason = async (payload: {
  categoryId: string
  slug?: string
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

export const recordModerationReasonUsage = async (reasonIds: string[]) => {
  const response = await settingsApiClient.post<ApiEnvelope<{ updated: number }>>(
    '/settings/templates/reasons/record-usage',
    { reasonIds },
  )
  return response.data.data
}

export function buildModerationActionPayload(
  reasons: ModerationReason[],
  selectedReasonIds: string[],
) {
  const selected = reasons.filter((reason) => selectedReasonIds.includes(reason.id))
  const messageTemplates = selected
    .map((reason) => reason.defaultMessageTemplate.trim())
    .filter(Boolean)

  return {
    reasonIds: selected.map((reason) => reason.id),
    selectedReasons: selected.map((reason) => reason.title),
    reasonDetails: messageTemplates.join('\n\n'),
  }
}
