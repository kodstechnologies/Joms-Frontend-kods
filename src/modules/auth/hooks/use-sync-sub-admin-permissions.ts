import { useEffect, useRef } from 'react'

import { fetchRbacMe } from '@/modules/rbac/api/rbac-api'
import { useAuthStore } from '@/modules/auth/store/auth-store'
import { normalizeUserPermissions } from '@/app/layouts/navigation/navigation.filter'

export function useSyncSubAdminPermissions() {
  const userId = useAuthStore((state) => state.user?.id)
  const isSuperAdmin = useAuthStore((state) => state.user?.isSuperAdmin)
  const updateUser = useAuthStore((state) => state.updateUser)
  const syncedForUserId = useRef<string | null>(null)

  useEffect(() => {
    if (!userId || isSuperAdmin) return
    if (syncedForUserId.current === userId) return

    let cancelled = false

    const sync = async () => {
      try {
        const response = await fetchRbacMe()
        if (cancelled) return

        const profile = response.data
        syncedForUserId.current = userId
        updateUser({
          subAdminId: profile.subAdminId,
          permissions: normalizeUserPermissions(profile.permissions ?? []),
          requiresContactSetup: Boolean(profile.requiresContactSetup),
          contactSetupCompleted: Boolean(profile.contactSetupCompleted),
        })
      } catch {
      }
    }

    void sync()

    return () => {
      cancelled = true
    }
  }, [userId, isSuperAdmin, updateUser])
}
