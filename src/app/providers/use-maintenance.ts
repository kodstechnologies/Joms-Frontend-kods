import { createContext, useContext } from 'react'

import { platformDefaults } from '@/modules/settings/config/settings.config'

export type MaintenanceStatus = {
  active: boolean
  enabled: boolean
  message: string
  adminNotes: string
  startsAt: string | null
  endsAt: string | null
  applicationName: string
}

export const DEFAULT_MAINTENANCE_STATUS: MaintenanceStatus = {
  active: false,
  enabled: false,
  message: platformDefaults.generalSettings.customErrorMessage,
  adminNotes: '',
  startsAt: null,
  endsAt: null,
  applicationName: 'JOMS Applications',
}

export type MaintenanceContextValue = {
  status: MaintenanceStatus
  isLoading: boolean
  isBlocked: boolean
  refetch: () => void
}

export const MaintenanceContext = createContext<MaintenanceContextValue>({
  status: DEFAULT_MAINTENANCE_STATUS,
  isLoading: false,
  isBlocked: false,
  refetch: () => undefined,
})

export function useMaintenance() {
  return useContext(MaintenanceContext)
}
