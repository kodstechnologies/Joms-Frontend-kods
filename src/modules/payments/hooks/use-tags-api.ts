import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import tagsApi from '../api/tags-api'

interface UseTagsApiReturn {
  // State
  tags: string[]
  loading: boolean
  error: string | null

  // Methods
  fetchTags: (recordId: string) => Promise<void>
  addTags: (recordId: string, tags: string[], adminNotes?: string) => Promise<void>
  removeTags: (recordId: string, tags: string[]) => Promise<void>
  updateTags: (recordId: string, tags: string[], adminNotes?: string) => Promise<void>
  clearTags: () => void

  // Merge operations
  mergeTickets: (ticketIds: string[], adminNotes?: string) => Promise<void>
  getMergePreview: (ticketIds: string[]) => Promise<any>

  // Search
  searchByTags: (tags: string[], recordType?: string) => Promise<any>
}

export const useTagsApi = (): UseTagsApiReturn => {
  const [tags, setTags] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const fetchTags = useCallback(
    async (recordId: string) => {
      try {
        setLoading(true)
        clearError()
        const response = await tagsApi.getRecordTags(recordId)
        if (response.success && response.data) {
          setTags(response.data.tags || [])
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to fetch tags'
        setError(errorMsg)
        toast.error(errorMsg)
      } finally {
        setLoading(false)
      }
    },
    [clearError],
  )

  const addTags = useCallback(
    async (recordId: string, newTags: string[], adminNotes?: string) => {
      try {
        setLoading(true)
        clearError()
        const response = await tagsApi.addTagsToRecord(recordId, newTags, adminNotes)
        if (response.success) {
          setTags((prev) => [...new Set([...prev, ...newTags])])
          toast.success(`${newTags.length} tag(s) added successfully`)
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to add tags'
        setError(errorMsg)
        toast.error(errorMsg)
      } finally {
        setLoading(false)
      }
    },
    [clearError],
  )

  const removeTags = useCallback(
    async (recordId: string, tagsToRemove: string[]) => {
      try {
        setLoading(true)
        clearError()
        const response = await tagsApi.removeTagsFromRecord(recordId, tagsToRemove)
        if (response.success) {
          setTags((prev) => prev.filter((tag) => !tagsToRemove.includes(tag)))
          toast.success(`${tagsToRemove.length} tag(s) removed`)
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to remove tags'
        setError(errorMsg)
        toast.error(errorMsg)
      } finally {
        setLoading(false)
      }
    },
    [clearError],
  )

  const updateTags = useCallback(
    async (recordId: string, newTags: string[], adminNotes?: string) => {
      try {
        setLoading(true)
        clearError()
        const response = await tagsApi.updateRecordTags(recordId, newTags, adminNotes)
        if (response.success) {
          setTags(newTags)
          toast.success('Tags updated successfully')
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to update tags'
        setError(errorMsg)
        toast.error(errorMsg)
      } finally {
        setLoading(false)
      }
    },
    [clearError],
  )

  const clearTags = useCallback(() => {
    setTags([])
    clearError()
  }, [clearError])

  const mergeTickets = useCallback(
    async (ticketIds: string[], adminNotes?: string) => {
      try {
        setLoading(true)
        clearError()
        const response = await tagsApi.mergeTickets(ticketIds, adminNotes)
        if (response.success) {
          toast.success(`${ticketIds.length} ticket(s) merged successfully`)
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to merge tickets'
        setError(errorMsg)
        toast.error(errorMsg)
      } finally {
        setLoading(false)
      }
    },
    [clearError],
  )

  const getMergePreview = useCallback(
    async (ticketIds: string[]) => {
      try {
        setLoading(true)
        clearError()
        const response = await tagsApi.getMergePreview(ticketIds)
        return response.data
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to get merge preview'
        setError(errorMsg)
        return null
      } finally {
        setLoading(false)
      }
    },
    [clearError],
  )

  const searchByTags = useCallback(
    async (searchTags: string[], recordType?: string) => {
      try {
        setLoading(true)
        clearError()
        const response = await tagsApi.searchByTags(searchTags, recordType)
        return response.data
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to search by tags'
        setError(errorMsg)
        return null
      } finally {
        setLoading(false)
      }
    },
    [clearError],
  )

  return {
    tags,
    loading,
    error,
    fetchTags,
    addTags,
    removeTags,
    updateTags,
    clearTags,
    mergeTickets,
    getMergePreview,
    searchByTags,
  }
}

export default useTagsApi
