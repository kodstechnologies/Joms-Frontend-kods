import { paymentApiClient } from '@/shared/lib/axios';

/**
 * Tags API for payment and finance records
 */

interface Tag {
  name: string;
  color?: string;
}

interface TagsResponse {
  success: boolean;
  message: string;
  data?: any;
}

/**
 * Add tags to a finance record
 * @param recordId - ID of the finance record
 * @param tags - Array of tag names
 * @param adminNotes - Optional admin notes
 */
export const addTagsToRecord = async (
  recordId: string,
  tags: string[],
  adminNotes?: string
): Promise<TagsResponse> => {
  try {
    const response = await paymentApiClient.post(
      `/api/finance/records/${recordId}/tags`,
      {
        tags,
        adminNotes,
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error adding tags:', error);
    throw error;
  }
};

/**
 * Get tags for a finance record
 * @param recordId - ID of the finance record
 */
export const getRecordTags = async (recordId: string): Promise<TagsResponse> => {
  try {
    const response = await paymentApiClient.get(
      `/api/finance/records/${recordId}/tags`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching tags:', error);
    throw error;
  }
};

/**
 * Remove tags from a finance record
 * @param recordId - ID of the finance record
 * @param tags - Array of tag names to remove
 */
export const removeTagsFromRecord = async (
  recordId: string,
  tags: string[]
): Promise<TagsResponse> => {
  try {
    const response = await paymentApiClient.delete(
      `/api/finance/records/${recordId}/tags`,
      {
        data: { tags },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error removing tags:', error);
    throw error;
  }
};

/**
 * Update tags for a finance record
 * @param recordId - ID of the finance record
 * @param tags - Array of new tags
 * @param adminNotes - Optional admin notes
 */
export const updateRecordTags = async (
  recordId: string,
  tags: string[],
  adminNotes?: string
): Promise<TagsResponse> => {
  try {
    const response = await paymentApiClient.put(
      `/api/finance/records/${recordId}/tags`,
      {
        tags,
        adminNotes,
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating tags:', error);
    throw error;
  }
};

/**
 * Get all available tags
 */
export const getAvailableTags = async (): Promise<TagsResponse> => {
  try {
    const response = await paymentApiClient.get('/api/finance/tags');
    return response.data;
  } catch (error) {
    console.error('Error fetching available tags:', error);
    throw error;
  }
};

/**
 * Merge multiple tickets/records
 * @param ticketIds - Array of ticket IDs to merge
 * @param adminNotes - Optional admin notes
 */
export const mergeTickets = async (
  ticketIds: string[],
  adminNotes?: string
): Promise<TagsResponse> => {
  try {
    const response = await paymentApiClient.post('/api/finance/tickets/merge', {
      ticketIds,
      adminNotes,
    });
    return response.data;
  } catch (error) {
    console.error('Error merging tickets:', error);
    throw error;
  }
};

/**
 * Get merge preview before merging
 * @param ticketIds - Array of ticket IDs
 */
export const getMergePreview = async (ticketIds: string[]): Promise<TagsResponse> => {
  try {
    const response = await paymentApiClient.post('/api/finance/tickets/merge-preview', {
      ticketIds,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching merge preview:', error);
    throw error;
  }
};

/**
 * Get tag statistics
 */
export const getTagStatistics = async (): Promise<TagsResponse> => {
  try {
    const response = await paymentApiClient.get('/api/finance/tags/statistics');
    return response.data;
  } catch (error) {
    console.error('Error fetching tag statistics:', error);
    throw error;
  }
};

/**
 * Search records by tags
 * @param tags - Array of tag names to search for
 * @param recordType - Type of records (payment, refund, etc.)
 */
export const searchByTags = async (
  tags: string[],
  recordType?: string
): Promise<TagsResponse> => {
  try {
    const params = new URLSearchParams();
    tags.forEach((tag) => params.append('tags', tag));
    if (recordType) params.append('recordType', recordType);

    const response = await paymentApiClient.get(`/api/finance/records/search?${params}`);
    return response.data;
  } catch (error) {
    console.error('Error searching by tags:', error);
    throw error;
  }
};

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
};
