import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { fetchSettings, resetSettings, updateSettings } from '../api/settings-api'
import type { ModuleSettingsMap, SettingsModule } from '../types/settings'

export const settingsKeys = {
  all: ['settings'] as const,
  module: (module: SettingsModule) => [...settingsKeys.all, module] as const,
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
