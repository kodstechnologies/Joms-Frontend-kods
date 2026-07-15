import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  fetchTableColumnPreferences,
  resetTableColumnPreferences,
  saveTableColumnPreferences,
} from '../api/ui-preferences-api'

export const tableColumnPreferencesQueryKey = (moduleKey: string) =>
  ['ui-preferences', moduleKey, 'table-columns'] as const

export const useTableColumnPreferences = (moduleKey: string) => {
  return useQuery({
    queryKey: tableColumnPreferencesQueryKey(moduleKey),
    queryFn: () => fetchTableColumnPreferences(moduleKey),
    enabled: Boolean(moduleKey),
  })
}

export const useSaveTableColumnPreferences = (moduleKey: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (visibleColumnIds: string[]) =>
      saveTableColumnPreferences(moduleKey, visibleColumnIds),
    onSuccess: (data) => {
      queryClient.setQueryData(tableColumnPreferencesQueryKey(moduleKey), data)
    },
  })
}

export const useResetTableColumnPreferences = (moduleKey: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => resetTableColumnPreferences(moduleKey),
    onSuccess: (data) => {
      queryClient.setQueryData(tableColumnPreferencesQueryKey(moduleKey), data)
    },
  })
}
