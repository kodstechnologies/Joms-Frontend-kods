import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  addSubCategory,
  createCategory,
  fetchCategories,
  fetchCategoryById,
  fetchCategoryMetrics,
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
  updateSubCategory,
  type AddSubCategoryPayload,
  type CategoryListParams,
  type CreateCategoryPayload,
  type UpdateCategoryPayload,
} from '../api/category-api'
import { useCategoryManagementScope } from '../components/category/category-management-scope'
import { mapServiceCategoryToUi } from '../utils/category-mapper'

const invalidateCategories = (queryClient: ReturnType<typeof useQueryClient>, queryKey: string) => {
  queryClient.invalidateQueries({ queryKey: [queryKey] })
}

export const useServiceCategories = (params?: CategoryListParams) => {
  const { categoryType, queryKey } = useCategoryManagementScope()
  return useQuery({
    queryKey: [queryKey, params, categoryType],
    queryFn: () => fetchCategories({ ...params, categoryType }),
    retry: 2,
    select: (response) => ({
      categories: (Array.isArray(response.data) ? response.data : []).map(mapServiceCategoryToUi),
      pagination: response.meta?.pagination,
      message: response.message,
    }),
  })
}

export const useServiceCategoryMetrics = () => {
  const { categoryType, queryKey } = useCategoryManagementScope()
  return useQuery({
    queryKey: [queryKey, 'metrics', categoryType],
    queryFn: () => fetchCategoryMetrics({ categoryType }),
    select: (response) => response.data,
  })
}

export const useServiceCategory = (id?: string) => {
  const { queryKey } = useCategoryManagementScope()
  return useQuery({
    queryKey: [queryKey, 'detail', id],
    queryFn: () => fetchCategoryById(id!),
    enabled: Boolean(id),
    select: (response) => mapServiceCategoryToUi(response.data),
  })
}

export const useCreateServiceCategory = () => {
  const queryClient = useQueryClient()
  const { categoryType, queryKey } = useCategoryManagementScope()
  return useMutation({
    mutationFn: (payload: CreateCategoryPayload) =>
      createCategory({ ...payload, categoryType: payload.categoryType || categoryType }),
    onSuccess: () => invalidateCategories(queryClient, queryKey),
  })
}

export const useUpdateServiceCategory = () => {
  const queryClient = useQueryClient()
  const { queryKey } = useCategoryManagementScope()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCategoryPayload }) =>
      updateCategory(id, payload),
    onSuccess: () => invalidateCategories(queryClient, queryKey),
  })
}

export const useAddServiceSubCategory = () => {
  const queryClient = useQueryClient()
  const { queryKey } = useCategoryManagementScope()
  return useMutation({
    mutationFn: ({ categoryId, payload }: { categoryId: string; payload: AddSubCategoryPayload }) =>
      addSubCategory(categoryId, payload),
    onSuccess: () => invalidateCategories(queryClient, queryKey),
  })
}

export const useUpdateServiceSubCategory = () => {
  const queryClient = useQueryClient()
  const { queryKey } = useCategoryManagementScope()
  return useMutation({
    mutationFn: ({
      categoryId,
      subCategoryId,
      payload,
    }: {
      categoryId: string
      subCategoryId: string
      payload: { name?: string; description?: string; vectorIcon?: string }
    }) => updateSubCategory(categoryId, subCategoryId, payload),
    onSuccess: () => invalidateCategories(queryClient, queryKey),
  })
}

export const usePauseServiceCategory = () => {
  const queryClient = useQueryClient()
  const { queryKey } = useCategoryManagementScope()
  return useMutation({
    mutationFn: (id: string) => pauseCategory(id),
    onSuccess: () => invalidateCategories(queryClient, queryKey),
  })
}

export const useResumeServiceCategory = () => {
  const queryClient = useQueryClient()
  const { queryKey } = useCategoryManagementScope()
  return useMutation({
    mutationFn: (id: string) => resumeCategory(id),
    onSuccess: () => invalidateCategories(queryClient, queryKey),
  })
}

export const useSoftDeleteServiceCategory = () => {
  const queryClient = useQueryClient()
  const { queryKey } = useCategoryManagementScope()
  return useMutation({
    mutationFn: (id: string) => softDeleteCategory(id),
    onSuccess: () => invalidateCategories(queryClient, queryKey),
  })
}

export const useRevokeServiceCategory = () => {
  const queryClient = useQueryClient()
  const { queryKey } = useCategoryManagementScope()
  return useMutation({
    mutationFn: (id: string) => revokeCategory(id),
    onSuccess: () => invalidateCategories(queryClient, queryKey),
  })
}

export const usePermanentDeleteServiceCategory = () => {
  const queryClient = useQueryClient()
  const { queryKey } = useCategoryManagementScope()
  return useMutation({
    mutationFn: (id: string) => permanentDeleteCategory(id),
    onSuccess: () => invalidateCategories(queryClient, queryKey),
  })
}

export const usePauseServiceSubCategory = () => {
  const queryClient = useQueryClient()
  const { queryKey } = useCategoryManagementScope()
  return useMutation({
    mutationFn: ({ categoryId, subCategoryId }: { categoryId: string; subCategoryId: string }) =>
      pauseSubCategory(categoryId, subCategoryId),
    onSuccess: () => invalidateCategories(queryClient, queryKey),
  })
}

export const useResumeServiceSubCategory = () => {
  const queryClient = useQueryClient()
  const { queryKey } = useCategoryManagementScope()
  return useMutation({
    mutationFn: ({ categoryId, subCategoryId }: { categoryId: string; subCategoryId: string }) =>
      resumeSubCategory(categoryId, subCategoryId),
    onSuccess: () => invalidateCategories(queryClient, queryKey),
  })
}

export const useSoftDeleteServiceSubCategory = () => {
  const queryClient = useQueryClient()
  const { queryKey } = useCategoryManagementScope()
  return useMutation({
    mutationFn: ({ categoryId, subCategoryId }: { categoryId: string; subCategoryId: string }) =>
      softDeleteSubCategory(categoryId, subCategoryId),
    onSuccess: () => invalidateCategories(queryClient, queryKey),
  })
}

export const useRevokeServiceSubCategory = () => {
  const queryClient = useQueryClient()
  const { queryKey } = useCategoryManagementScope()
  return useMutation({
    mutationFn: ({ categoryId, subCategoryId }: { categoryId: string; subCategoryId: string }) =>
      revokeSubCategory(categoryId, subCategoryId),
    onSuccess: () => invalidateCategories(queryClient, queryKey),
  })
}

export const usePermanentDeleteServiceSubCategory = () => {
  const queryClient = useQueryClient()
  const { queryKey } = useCategoryManagementScope()
  return useMutation({
    mutationFn: ({ categoryId, subCategoryId }: { categoryId: string; subCategoryId: string }) =>
      permanentDeleteSubCategory(categoryId, subCategoryId),
    onSuccess: () => invalidateCategories(queryClient, queryKey),
  })
}
