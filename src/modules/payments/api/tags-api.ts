import { paymentApiClient } from '@/shared/lib/axios'

interface Tag {
  name: string
  color?: string
}

interface TagsResponse {
  success: boolean
  message: string
  data?: any
}

export const addTagsToRecord = async (
  recordId: string,
  tags: string[],
  adminNotes?: string,
): Promise<TagsResponse> => {
  try {
    const response = await paymentApiClient.post(`/api/finance/records/${recordId}/tags`, {
      tags,
      adminNotes,
    })
    return response.data
  } catch (error) {
    console.error('Error adding tags:', error)
    throw error
  }
}

export const getRecordTags = async (recordId: string): Promise<TagsResponse> => {
  try {
    const response = await paymentApiClient.get(`/api/finance/records/${recordId}/tags`)
    return response.data
  } catch (error) {
    console.error('Error fetching tags:', error)
    throw error
  }
}

export const removeTagsFromRecord = async (
  recordId: string,
  tags: string[],
): Promise<TagsResponse> => {
  try {
    const response = await paymentApiClient.delete(`/api/finance/records/${recordId}/tags`, {
      data: { tags },
    })
    return response.data
  } catch (error) {
    console.error('Error removing tags:', error)
    throw error
  }
}

export const updateRecordTags = async (
  recordId: string,
  tags: string[],
  adminNotes?: string,
): Promise<TagsResponse> => {
  try {
    const response = await paymentApiClient.put(`/api/finance/records/${recordId}/tags`, {
      tags,
      adminNotes,
    })
    return response.data
  } catch (error) {
    console.error('Error updating tags:', error)
    throw error
  }
}

export const getAvailableTags = async (): Promise<TagsResponse> => {
  try {
    const response = await paymentApiClient.get('/api/finance/tags')
    return response.data
  } catch (error) {
    console.error('Error fetching available tags:', error)
    throw error
  }
}

export const mergeTickets = async (
  ticketIds: string[],
  adminNotes?: string,
): Promise<TagsResponse> => {
  try {
    const response = await paymentApiClient.post('/api/finance/tickets/merge', {
      ticketIds,
      adminNotes,
    })
    return response.data
  } catch (error) {
    console.error('Error merging tickets:', error)
    throw error
  }
}

export const getMergePreview = async (ticketIds: string[]): Promise<TagsResponse> => {
  try {
    const response = await paymentApiClient.post('/api/finance/tickets/merge-preview', {
      ticketIds,
    })
    return response.data
  } catch (error) {
    console.error('Error fetching merge preview:', error)
    throw error
  }
}

export const getTagStatistics = async (): Promise<TagsResponse> => {
  try {
    const response = await paymentApiClient.get('/api/finance/tags/statistics')
    return response.data
  } catch (error) {
    console.error('Error fetching tag statistics:', error)
    throw error
  }
}

export const searchByTags = async (tags: string[], recordType?: string): Promise<TagsResponse> => {
  try {
    const params = new URLSearchParams()
    tags.forEach((tag) => params.append('tags', tag))
    if (recordType) params.append('recordType', recordType)

    const response = await paymentApiClient.get(`/api/finance/records/search?${params}`)
    return response.data
  } catch (error) {
    console.error('Error searching by tags:', error)
    throw error
  }
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
