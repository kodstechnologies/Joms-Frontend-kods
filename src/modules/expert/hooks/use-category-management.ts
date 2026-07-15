import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  addSubCategory,
  createCategory,
  fetchCategories,
  fetchCategoryById,
  pauseCategory,
  pauseSubCategory,
  permanentDeleteCategory,
  permanentDeleteSubCategory,
  resumeCategory,
  resumeSubCategory,
  revokeCategory,
  revokeSubCategory,
  softDeleteCategory,
  softDeleteSubCategory,
  updateCategory,
  type AddSubCategoryPayload,
  type CategoryListParams,
  type CreateCategoryPayload,
  type UpdateCategoryPayload,
} from '../api/category-api'
import { mapServiceCategoryToUi } from '../utils/category-mapper'

const CATEGORY_QUERY_KEY = 'service-categories'

const invalidateCategories = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries({ queryKey: [CATEGORY_QUERY_KEY] })
}

export const useServiceCategories = (params?: CategoryListParams) =>
  useQuery({
    queryKey: [CATEGORY_QUERY_KEY, params],
    queryFn: () => fetchCategories(params),
    select: (response) => ({
      categories: (response.data || []).map(mapServiceCategoryToUi),
      pagination: response.meta?.pagination,
      message: response.message,
    }),
  })

export const useServiceCategory = (id?: string) =>
  useQuery({
    queryKey: [CATEGORY_QUERY_KEY, 'detail', id],
    queryFn: () => fetchCategoryById(id!),
    enabled: Boolean(id),
    select: (response) => mapServiceCategoryToUi(response.data),
  })

export const useCreateServiceCategory = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateCategoryPayload) => createCategory(payload),
    onSuccess: () => invalidateCategories(queryClient),
  })
}

export const useUpdateServiceCategory = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCategoryPayload }) =>
      updateCategory(id, payload),
    onSuccess: () => invalidateCategories(queryClient),
  })
}

export const useAddServiceSubCategory = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ categoryId, payload }: { categoryId: string; payload: AddSubCategoryPayload }) =>
      addSubCategory(categoryId, payload),
    onSuccess: () => invalidateCategories(queryClient),
  })
}

export const usePauseServiceCategory = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => pauseCategory(id),
    onSuccess: () => invalidateCategories(queryClient),
  })
}

export const useResumeServiceCategory = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => resumeCategory(id),
    onSuccess: () => invalidateCategories(queryClient),
  })
}

export const useSoftDeleteServiceCategory = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => softDeleteCategory(id),
    onSuccess: () => invalidateCategories(queryClient),
  })
}

export const useRevokeServiceCategory = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => revokeCategory(id),
    onSuccess: () => invalidateCategories(queryClient),
  })
}

export const usePermanentDeleteServiceCategory = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => permanentDeleteCategory(id),
    onSuccess: () => invalidateCategories(queryClient),
  })
}

export const usePauseServiceSubCategory = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ categoryId, subCategoryId }: { categoryId: string; subCategoryId: string }) =>
      pauseSubCategory(categoryId, subCategoryId),
    onSuccess: () => invalidateCategories(queryClient),
  })
}

export const useResumeServiceSubCategory = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ categoryId, subCategoryId }: { categoryId: string; subCategoryId: string }) =>
      resumeSubCategory(categoryId, subCategoryId),
    onSuccess: () => invalidateCategories(queryClient),
  })
}

export const useSoftDeleteServiceSubCategory = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ categoryId, subCategoryId }: { categoryId: string; subCategoryId: string }) =>
      softDeleteSubCategory(categoryId, subCategoryId),
    onSuccess: () => invalidateCategories(queryClient),
  })
}

export const useRevokeServiceSubCategory = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ categoryId, subCategoryId }: { categoryId: string; subCategoryId: string }) =>
      revokeSubCategory(categoryId, subCategoryId),
    onSuccess: () => invalidateCategories(queryClient),
  })
}

export const usePermanentDeleteServiceSubCategory = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ categoryId, subCategoryId }: { categoryId: string; subCategoryId: string }) =>
      permanentDeleteSubCategory(categoryId, subCategoryId),
    onSuccess: () => invalidateCategories(queryClient),
  })
}
