import { useMemo, type PropsWithChildren } from 'react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

import { env } from '@/config/env'
import { useAuthStore } from '@/modules/auth/store/auth-store'
import {
  DEFAULT_MAINTENANCE_STATUS,
  MaintenanceContext,
  type MaintenanceStatus,
} from '@/app/providers/use-maintenance'

async function fetchMaintenanceStatus(): Promise<MaintenanceStatus> {
  const response = await axios.get<{
    success: boolean
    data: MaintenanceStatus
  }>(`${env.settingsApiBaseUrl}/settings/public/maintenance`, {
    timeout: 10000,
  })
  return {
    ...DEFAULT_MAINTENANCE_STATUS,
    ...response.data.data,
  }
}

export function MaintenanceProvider({ children }: PropsWithChildren) {
  const user = useAuthStore((state) => state.user)
  const query = useQuery({
    queryKey: ['settings', 'public', 'maintenance'],
    queryFn: fetchMaintenanceStatus,
    refetchInterval: 30_000,
    retry: 1,
    placeholderData: DEFAULT_MAINTENANCE_STATUS,
  })

  const status = query.data || DEFAULT_MAINTENANCE_STATUS
  const isBlocked = Boolean(status.active) && !user?.isSuperAdmin
  const isLoading = query.isLoading
  const refetch = query.refetch

  const value = useMemo(
    () => ({
      status,
      isLoading,
      isBlocked,
      refetch: () => {
        void refetch()
      },
    }),
    [status, isLoading, isBlocked, refetch],
  )

  return <MaintenanceContext.Provider value={value}>{children}</MaintenanceContext.Provider>
}
