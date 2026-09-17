import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createErrorTemplate,
  deleteErrorTemplate,
  fetchErrorTemplates,
  fetchNotificationCatalog,
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
import { mergeWithDefaults } from '../utils/branding-config'

export const settingsKeys = {
  all: ['settings'] as const,
  module: (module: SettingsModule) => [...settingsKeys.all, module] as const,
  logs: (params?: object) => [...settingsKeys.all, 'logs', params] as const,
  log: (id: string) => [...settingsKeys.all, 'log', id] as const,
  logMetrics: (params?: object) => [...settingsKeys.all, 'logs', 'metrics', params] as const,
  versions: (module: SettingsModule, params?: object) =>
    [...settingsKeys.all, 'versions', module, params] as const,
  errorTemplates: () => [...settingsKeys.all, 'platform', 'error-templates'] as const,
  notificationCatalog: () => [...settingsKeys.all, 'notifications', 'catalog'] as const,
}

export const useSettingsModule = <M extends SettingsModule>(module: M) =>
  useQuery({
    queryKey: settingsKeys.module(module),
    queryFn: () => fetchSettings(module),
    staleTime: 60 * 1000,
    retry: 1,
  })

export const useUpdateSettings = <M extends SettingsModule>(module: M) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (config: ModuleSettingsMap[M]) => updateSettings(module, config),
    onSuccess: (data) => {
      queryClient.setQueryData(settingsKeys.module(module), data)
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
      if (module === 'service' || module === 'venue' || module === 'expert') {
        void queryClient.invalidateQueries({ queryKey: ['app-restrictions'] })
      }
      if (module === 'service') {
        void queryClient.invalidateQueries({ queryKey: ['service-public-settings'] })
      }
      if (module === 'venue') {
        void queryClient.invalidateQueries({ queryKey: ['venue-public-settings'] })
      }
      if (module === 'expert') {
        void queryClient.invalidateQueries({ queryKey: ['expert-public-settings'] })
      }
    },
  })
}

export const useResetSettings = <M extends SettingsModule>(module: M) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => resetSettings(module),
    onSuccess: (data) => {
      queryClient.setQueryData(settingsKeys.module(module), data)
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
      if (module === 'service' || module === 'venue' || module === 'expert') {
        void queryClient.invalidateQueries({ queryKey: ['app-restrictions'] })
      }
      if (module === 'service') {
        void queryClient.invalidateQueries({ queryKey: ['service-public-settings'] })
      }
      if (module === 'venue') {
        void queryClient.invalidateQueries({ queryKey: ['venue-public-settings'] })
      }
      if (module === 'expert') {
        void queryClient.invalidateQueries({ queryKey: ['expert-public-settings'] })
      }
    },
  })
}

export function useSettingsDraft<T>(
  queryData: { config: T } | undefined,
  defaults: T,
  normalize?: (config: T) => T,
) {
  const applyNormalize = (config: T) => (normalize ? normalize(config) : config)

  const [draft, setDraft] = useState<T>(() =>
    queryData?.config ? applyNormalize(mergeWithDefaults(defaults, queryData.config)) : defaults,
  )
  const [hydratedData, setHydratedData] = useState(queryData)

  if (queryData && queryData !== hydratedData) {
    setHydratedData(queryData)
    setDraft(applyNormalize(mergeWithDefaults(defaults, queryData.config)))
  }

  return [draft, setDraft] as const
}

export function useSettingsLogs(params?: Record<string, unknown>) {
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

export function useSettingsLogMetrics(params?: { module?: string }) {
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

export const useNotificationCatalog = () =>
  useQuery({
    queryKey: settingsKeys.notificationCatalog(),
    queryFn: fetchNotificationCatalog,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })
