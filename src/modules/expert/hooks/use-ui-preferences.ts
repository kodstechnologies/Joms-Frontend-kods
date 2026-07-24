import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  fetchDashboardMetricPreferences,
  fetchTableColumnPreferences,
  resetDashboardMetricPreferences,
  resetTableColumnPreferences,
  saveDashboardMetricPreferences,
  saveTableColumnPreferences,
} from '../api/ui-preferences-api'

export const tableColumnPreferencesQueryKey = (moduleKey: string) =>
  ['ui-preferences', moduleKey, 'table-columns'] as const

export const dashboardMetricPreferencesQueryKey = (moduleKey: string) =>
  ['ui-preferences', moduleKey, 'dashboard-metrics'] as const

export const useTableColumnPreferences = (moduleKey: string, enabled = true) => {
  return useQuery({
    queryKey: tableColumnPreferencesQueryKey(moduleKey),
    queryFn: () => fetchTableColumnPreferences(moduleKey),
    enabled: Boolean(moduleKey) && enabled,
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

export const useDashboardMetricPreferences = (moduleKey: string, enabled = true) => {
  return useQuery({
    queryKey: dashboardMetricPreferencesQueryKey(moduleKey),
    queryFn: () => fetchDashboardMetricPreferences(moduleKey),
    enabled: Boolean(moduleKey) && enabled,
  })
}

export const useSaveDashboardMetricPreferences = (moduleKey: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (activeMetricIds: string[]) =>
      saveDashboardMetricPreferences(moduleKey, activeMetricIds),
    onSuccess: (data) => {
      queryClient.setQueryData(dashboardMetricPreferencesQueryKey(moduleKey), data)
    },
  })
}

export const useResetDashboardMetricPreferences = (moduleKey: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => resetDashboardMetricPreferences(moduleKey),
    onSuccess: (data) => {
      queryClient.setQueryData(dashboardMetricPreferencesQueryKey(moduleKey), data)
    },
  })
}
