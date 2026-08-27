import { paymentApiClient } from '@/shared/lib/axios'

export type FinanceTag = {
  name: string
  color?: string
}

export type TagsData = {
  tags?: string[]
  records?: Record<string, unknown>[]
  availableTags?: FinanceTag[]
}

export type TagsResponse = {
  success: boolean
  message: string
  data?: TagsData
}

export const addTagsToRecord = async (
  recordId: string,
  tags: string[],
  adminNotes?: string,
): Promise<TagsResponse> => {
  const response = await paymentApiClient.post(`/api/finance/records/${recordId}/tags`, {
    tags,
    adminNotes,
  })
  return response.data
}

export const getRecordTags = async (recordId: string): Promise<TagsResponse> => {
  const response = await paymentApiClient.get(`/api/finance/records/${recordId}/tags`)
  return response.data
}

export const removeTagsFromRecord = async (
  recordId: string,
  tags: string[],
): Promise<TagsResponse> => {
  const response = await paymentApiClient.delete(`/api/finance/records/${recordId}/tags`, {
    data: { tags },
  })
  return response.data
}

export const updateRecordTags = async (
  recordId: string,
  tags: string[],
  adminNotes?: string,
): Promise<TagsResponse> => {
  const response = await paymentApiClient.put(`/api/finance/records/${recordId}/tags`, {
    tags,
    adminNotes,
  })
  return response.data
}

export const getAvailableTags = async (): Promise<TagsResponse> => {
  const response = await paymentApiClient.get('/api/finance/tags')
  return response.data
}

export const mergeTickets = async (
  ticketIds: string[],
  adminNotes?: string,
): Promise<TagsResponse> => {
  const response = await paymentApiClient.post('/api/finance/tickets/merge', {
    ticketIds,
    adminNotes,
  })
  return response.data
}

export const getMergePreview = async (ticketIds: string[]): Promise<TagsResponse> => {
  const response = await paymentApiClient.post('/api/finance/tickets/merge-preview', {
    ticketIds,
  })
  return response.data
}

export const getTagStatistics = async (): Promise<TagsResponse> => {
  const response = await paymentApiClient.get('/api/finance/tags/statistics')
  return response.data
}

export const searchByTags = async (tags: string[], recordType?: string): Promise<TagsResponse> => {
  const params = new URLSearchParams()
  tags.forEach((tag) => params.append('tags', tag))
  if (recordType) params.append('recordType', recordType)

  const response = await paymentApiClient.get(`/api/finance/records/search?${params}`)
  return response.data
}

export default {
  addTagsToRecord,
  getRecordTags,
  removeTagsFromRecord,
  updateRecordTags,
  getAvailableTags,
  mergeTickets,
  getMergePreview,
  getTagStatistics,
  searchByTags,
}
