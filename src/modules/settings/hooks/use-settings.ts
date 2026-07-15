import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  fetchSettings,
  fetchSettingsLogs,
  resetSettings,
  updateSettings,
} from '../api/settings-api'
import type { ModuleSettingsMap, SettingsModule } from '../types/settings'

export const settingsKeys = {
  all: ['settings'] as const,
  module: (module: SettingsModule) => [...settingsKeys.all, module] as const,
  logs: (params?: object) => [...settingsKeys.all, 'logs', params] as const,
}

export const useSettingsModule = <M extends SettingsModule>(module: M) =>
  useQuery({
    queryKey: settingsKeys.module(module),
    queryFn: () => fetchSettings(module),
  })

export const useUpdateSettings = <M extends SettingsModule>(module: M) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (config: ModuleSettingsMap[M]) => updateSettings(module, config),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: settingsKeys.module(module) })
    },
  })
}

export const useResetSettings = <M extends SettingsModule>(module: M) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => resetSettings(module),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: settingsKeys.module(module) })
    },
  })
}

/**
 * Local editable draft of a settings config, seeded from query data once it
 * loads (and re-seeded whenever the query data reference changes, e.g. after
 * a reset). Syncing happens during render rather than in an effect.
 */
export function useSettingsDraft<T>(queryData: { config: T } | undefined, defaults: T) {
  const [draft, setDraft] = useState<T>(defaults)
  const [hydratedData, setHydratedData] = useState(queryData)

  if (queryData && queryData !== hydratedData) {
    setHydratedData(queryData)
    setDraft(queryData.config)
  }

  return [draft, setDraft] as const
}

export function useSettingsLogs(params?: {
  page?: number
  limit?: number
  search?: string
  module?: SettingsModule
  action?: 'update' | 'reset'
}) {
  return useQuery({
    queryKey: settingsKeys.logs(params),
    queryFn: () => fetchSettingsLogs(params),
  })
}
