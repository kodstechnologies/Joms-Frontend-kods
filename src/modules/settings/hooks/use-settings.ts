import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createErrorTemplate,
  deleteErrorTemplate,
  fetchErrorTemplates,
  fetchSettings,
  fetchSettingsLog,
  fetchSettingsLogMetrics,
  fetchSettingsLogs,
  fetchSettingsModuleVersions,
  resetSettings,
  restoreSettingsLog,
  updateErrorTemplate,
  updateSettings,
} from '../api/settings-api'
import type { ModuleSettingsMap, SettingsModule } from '../types/settings'
import { getModulePlaceholder, mergeWithDefaults } from '../utils/branding-defaults'

export const settingsKeys = {
  all: ['settings'] as const,
  module: (module: SettingsModule) => [...settingsKeys.all, module] as const,
  logs: (params?: object) => [...settingsKeys.all, 'logs', params] as const,
  log: (id: string) => [...settingsKeys.all, 'log', id] as const,
  logMetrics: (params?: object) => [...settingsKeys.all, 'logs', 'metrics', params] as const,
  versions: (module: SettingsModule, params?: object) =>
    [...settingsKeys.all, 'versions', module, params] as const,
  errorTemplates: () => [...settingsKeys.all, 'platform', 'error-templates'] as const,
}

export const useSettingsModule = <M extends SettingsModule>(module: M) =>
  useQuery({
    queryKey: settingsKeys.module(module),
    queryFn: () => fetchSettings(module),
    // Keep UI filled with general defaults while loading / if the request fails.
    placeholderData: getModulePlaceholder(module),
    retry: 1,
  })

export const useUpdateSettings = <M extends SettingsModule>(module: M) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (config: ModuleSettingsMap[M]) => updateSettings(module, config),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: settingsKeys.module(module) })
      void queryClient.invalidateQueries({ queryKey: [...settingsKeys.all, 'logs'] })
      if (module === 'platform') {
        void queryClient.invalidateQueries({ queryKey: ['settings', 'public', 'maintenance'] })
      }
      if (module === 'security') {
        void queryClient.invalidateQueries({
          queryKey: ['settings', 'public', 'security-policy'],
        })
      }
    },
  })
}

export const useResetSettings = <M extends SettingsModule>(module: M) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => resetSettings(module),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: settingsKeys.module(module) })
      void queryClient.invalidateQueries({ queryKey: [...settingsKeys.all, 'logs'] })
      if (module === 'platform') {
        void queryClient.invalidateQueries({ queryKey: ['settings', 'public', 'maintenance'] })
      }
      if (module === 'security') {
        void queryClient.invalidateQueries({
          queryKey: ['settings', 'public', 'security-policy'],
        })
      }
    },
  })
}

/**
 * Local editable draft of a settings config, seeded from query data once it
 * loads (and re-seeded whenever the query data reference changes, e.g. after
 * a reset). Syncing happens during render rather than in an effect.
 * Always falls back to defaults when API data is missing.
 */
export function useSettingsDraft<T>(queryData: { config: T } | undefined, defaults: T) {
  const [draft, setDraft] = useState<T>(defaults)
  const [hydratedData, setHydratedData] = useState(queryData)

  if (queryData && queryData !== hydratedData) {
    setHydratedData(queryData)
    setDraft(mergeWithDefaults(defaults, queryData.config))
  }

  return [draft, setDraft] as const
}

export function useSettingsLogs(params?: {
  page?: number
  limit?: number
  search?: string
  module?: SettingsModule
  action?: 'update' | 'reset' | 'restore'
  status?: 'success' | 'failed' | 'pending'
}) {
  return useQuery({
    queryKey: settingsKeys.logs(params),
    queryFn: () => fetchSettingsLogs(params),
    retry: 1,
  })
}

export function useSettingsLog(id?: string) {
  return useQuery({
    queryKey: settingsKeys.log(id || ''),
    queryFn: () => fetchSettingsLog(id || ''),
    enabled: Boolean(id),
    retry: 1,
  })
}

export function useSettingsLogMetrics(params?: { module?: SettingsModule }) {
  return useQuery({
    queryKey: settingsKeys.logMetrics(params),
    queryFn: () => fetchSettingsLogMetrics(params),
    retry: 1,
  })
}

export function useSettingsModuleVersions(
  module?: SettingsModule,
  params?: { page?: number; limit?: number },
) {
  return useQuery({
    queryKey: settingsKeys.versions(module || 'platform', params),
    queryFn: () => fetchSettingsModuleVersions(module || 'platform', params),
    enabled: Boolean(module),
    retry: 1,
  })
}

export function useRestoreSettingsLog() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => restoreSettingsLog(id),
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: settingsKeys.all })
      if (result?.settings?.module) {
        void queryClient.invalidateQueries({
          queryKey: settingsKeys.module(result.settings.module as SettingsModule),
        })
      }
    },
  })
}

export function useErrorTemplates() {
  return useQuery({
    queryKey: settingsKeys.errorTemplates(),
    queryFn: fetchErrorTemplates,
    retry: 1,
  })
}

export function useCreateErrorTemplate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (message: string) => createErrorTemplate(message),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: settingsKeys.errorTemplates() })
      void queryClient.invalidateQueries({ queryKey: settingsKeys.module('platform') })
    },
  })
}

export function useUpdateErrorTemplate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ index, message }: { index: number; message: string }) =>
      updateErrorTemplate(index, message),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: settingsKeys.errorTemplates() })
      void queryClient.invalidateQueries({ queryKey: settingsKeys.module('platform') })
    },
  })
}

export function useDeleteErrorTemplate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (index: number) => deleteErrorTemplate(index),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: settingsKeys.errorTemplates() })
      void queryClient.invalidateQueries({ queryKey: settingsKeys.module('platform') })
    },
  })
}
