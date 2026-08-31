import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type {
  AddSubCategoryPayload,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from '../api/category-api'
import {
  addVenueSubCategories,
  createVenueCategory,
  fetchDeletedVenueCategories,
  fetchPausedVenueCategories,
  fetchVenueCategoryById,
  fetchVenueCategoryDetails,
  fetchVenueCategoryList,
  fetchVenueCategoryMetrics,
  hardDeleteVenueCategory,
  hardDeleteVenueSubCategory,
  pauseVenueCategory,
  pauseVenueSubCategory,
  resumeVenueCategory,
  resumeVenueSubCategory,
  revokeVenueCategory,
  revokeVenueSubCategory,
  softDeleteVenueCategory,
  softDeleteVenueSubCategory,
  updateVenueCategory,
} from '../api/venue-category-api'
import { mapVenueCategoryToUi } from '../utils/category-mapper'

const VENUE_CATEGORY_QUERY_KEY = 'venue-category-management'

const invalidateVenueCategories = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries({ queryKey: [VENUE_CATEGORY_QUERY_KEY] })
  queryClient.invalidateQueries({ queryKey: ['venue-categories'] })
}

export const useVenueCategoryManagementList = (params?: Record<string, unknown>) =>
  useQuery({
    queryKey: [VENUE_CATEGORY_QUERY_KEY, 'list', params],
    queryFn: () => fetchVenueCategoryList(params),
    retry: 1,
    staleTime: 15_000,
    select: (response) => {
      const rows = Array.isArray(response.data) ? response.data : []
      const categories = []
      for (const row of rows) {
        try {
          categories.push(mapVenueCategoryToUi(row))
        } catch (error) {
          console.error('[venue-categories] skipped unreadable row', error)
        }
      }
      return {
        categories,
        pagination: response.meta,
        message: response.message,
      }
    },
  })

export const useVenueCategoryMetrics = () =>
  useQuery({
    queryKey: [VENUE_CATEGORY_QUERY_KEY, 'metrics'],
    queryFn: fetchVenueCategoryMetrics,
    select: (response) => response.data,
  })

export const usePausedVenueCategoryList = (params?: Record<string, unknown>) =>
  useQuery({
    queryKey: [VENUE_CATEGORY_QUERY_KEY, 'paused', params],
    queryFn: () => fetchPausedVenueCategories(params),
    select: (response) => ({
      categories: (response.data || []).map(mapVenueCategoryToUi),
      pagination: response.meta,
      message: response.message,
    }),
  })

export const useDeletedVenueCategoryList = (params?: Record<string, unknown>) =>
  useQuery({
    queryKey: [VENUE_CATEGORY_QUERY_KEY, 'deleted', params],
    queryFn: () => fetchDeletedVenueCategories(params),
    select: (response) => ({
      categories: (response.data || []).map(mapVenueCategoryToUi),
      pagination: response.meta,
      message: response.message,
    }),
  })

export const useVenueCategoryDetails = () =>
  useQuery({
    queryKey: [VENUE_CATEGORY_QUERY_KEY, 'details'],
    queryFn: fetchVenueCategoryDetails,
    select: (response) => response.data || [],
  })

export const useVenueCategory = (id?: string) =>
  useQuery({
    queryKey: [VENUE_CATEGORY_QUERY_KEY, 'detail', id],
    queryFn: () => fetchVenueCategoryById(id!),
    enabled: Boolean(id),
    select: (response) => mapVenueCategoryToUi(response.data),
  })

export const useCreateVenueCategory = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateCategoryPayload) => createVenueCategory(payload),
    onSuccess: () => invalidateVenueCategories(queryClient),
  })
}

export const useUpdateVenueCategory = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCategoryPayload }) =>
      updateVenueCategory(id, payload),
    onSuccess: () => invalidateVenueCategories(queryClient),
  })
}

export const useAddVenueSubCategories = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      categoryId,
      payload,
    }: {
      categoryId: string
      payload: AddSubCategoryPayload[]
    }) => {
      const existing = await fetchVenueCategoryById(categoryId)
      return addVenueSubCategories(categoryId, existing.data, payload)
    },
    onSuccess: () => invalidateVenueCategories(queryClient),
  })
}

export const usePauseVenueCategory = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => pauseVenueCategory(id),
    onSuccess: () => invalidateVenueCategories(queryClient),
  })
}

export const useResumeVenueCategory = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => resumeVenueCategory(id),
    onSuccess: () => invalidateVenueCategories(queryClient),
  })
}

export const useSoftDeleteVenueCategory = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => softDeleteVenueCategory(id),
    onSuccess: () => invalidateVenueCategories(queryClient),
  })
}

export const useRevokeVenueCategory = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => revokeVenueCategory(id),
    onSuccess: () => invalidateVenueCategories(queryClient),
  })
}

export const useHardDeleteVenueCategory = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => hardDeleteVenueCategory(id),
    onSuccess: () => invalidateVenueCategories(queryClient),
  })
}

export const usePauseVenueSubCategory = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ categoryId, subCategoryId }: { categoryId: string; subCategoryId: string }) =>
      pauseVenueSubCategory(categoryId, subCategoryId),
    onSuccess: () => invalidateVenueCategories(queryClient),
  })
}

export const useResumeVenueSubCategory = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ categoryId, subCategoryId }: { categoryId: string; subCategoryId: string }) =>
      resumeVenueSubCategory(categoryId, subCategoryId),
    onSuccess: () => invalidateVenueCategories(queryClient),
  })
}

export const useSoftDeleteVenueSubCategory = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ categoryId, subCategoryId }: { categoryId: string; subCategoryId: string }) =>
      softDeleteVenueSubCategory(categoryId, subCategoryId),
    onSuccess: () => invalidateVenueCategories(queryClient),
  })
}

export const useRevokeVenueSubCategory = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ categoryId, subCategoryId }: { categoryId: string; subCategoryId: string }) =>
      revokeVenueSubCategory(categoryId, subCategoryId),
    onSuccess: () => invalidateVenueCategories(queryClient),
  })
}

export const useHardDeleteVenueSubCategory = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ categoryId, subCategoryId }: { categoryId: string; subCategoryId: string }) =>
      hardDeleteVenueSubCategory(categoryId, subCategoryId),
    onSuccess: () => invalidateVenueCategories(queryClient),
  })
}
