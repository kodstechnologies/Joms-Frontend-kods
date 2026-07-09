import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createModerationReason,
  deleteModerationReason,
  fetchModerationCategories,
  fetchModerationReasons,
  toggleModerationReason,
  updateModerationCategory,
  updateModerationReason,
  type ModerationReason,
} from '../api/templates-api'

export const templateKeys = {
  all: ['settings', 'templates'] as const,
  categories: (search?: string) => [...templateKeys.all, 'categories', search ?? ''] as const,
  reasons: (categoryId: string) => [...templateKeys.all, 'reasons', categoryId] as const,
}

export const useModerationCategories = (search = '') =>
  useQuery({
    queryKey: templateKeys.categories(search),
    queryFn: () => fetchModerationCategories({ search }),
  })

export const useModerationReasons = (categoryId: string) =>
  useQuery({
    queryKey: templateKeys.reasons(categoryId),
    queryFn: () => fetchModerationReasons(categoryId),
    enabled: Boolean(categoryId),
  })

export const useUpdateModerationCategory = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: Partial<{ title: string; description: string; isActive: boolean }>
    }) => updateModerationCategory(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: templateKeys.all })
    },
  })
}

export const useCreateModerationReason = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createModerationReason,
    onSuccess: (reason) => {
      void queryClient.invalidateQueries({ queryKey: templateKeys.reasons(reason.categoryId) })
      void queryClient.invalidateQueries({ queryKey: templateKeys.all })
    },
  })
}

export const useUpdateModerationReason = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: Partial<
        Pick<ModerationReason, 'title' | 'description' | 'defaultMessageTemplate' | 'isActive'>
      >
    }) => updateModerationReason(id, payload),
    onSuccess: (reason) => {
      void queryClient.invalidateQueries({ queryKey: templateKeys.reasons(reason.categoryId) })
    },
  })
}

export const useToggleModerationReason = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: toggleModerationReason,
    onSuccess: (reason) => {
      void queryClient.invalidateQueries({ queryKey: templateKeys.reasons(reason.categoryId) })
    },
  })
}

export const useDeleteModerationReason = (categoryId?: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteModerationReason,
    onSuccess: () => {
      if (categoryId) {
        void queryClient.invalidateQueries({ queryKey: templateKeys.reasons(categoryId) })
      }
      void queryClient.invalidateQueries({ queryKey: templateKeys.all })
    },
  })
}
