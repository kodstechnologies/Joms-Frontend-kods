import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { fetchRbacMe } from '@/modules/rbac/api/rbac-api'
import { useAuthStore } from '@/modules/auth/store/auth-store'
import { normalizeUserPermissions } from '@/app/layouts/navigation/navigation.filter'

const SYNC_INTERVAL_MS = 5_000

const permissionFingerprint = (permissions: string[] = []) =>
  [...permissions].map(String).sort().join('|')

export function useSyncSubAdminPermissions() {
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)
  const userId = user?.id
  const updateUser = useAuthStore((state) => state.updateUser)
  const inFlight = useRef(false)

  useEffect(() => {
    if (!userId) return

    let cancelled = false

    const sync = async () => {
      if (cancelled || inFlight.current) return
      inFlight.current = true

      try {
        const response = await fetchRbacMe()
        if (cancelled) return

        const profile = response.data
        const nextPermissions = normalizeUserPermissions(profile.permissions ?? [])
        const currentPermissions = useAuthStore.getState().user?.permissions ?? []
        const prevFingerprint = permissionFingerprint(currentPermissions)
        const nextFingerprint = permissionFingerprint(nextPermissions)
        const newMfaEnabled = Boolean(profile.mfaEnabled ?? profile.profile?.mfaEnabled)
        const prevMfaEnabled = Boolean(useAuthStore.getState().user?.mfaEnabled)

        updateUser({
          subAdminId: profile.subAdminId,
          ...(prevFingerprint !== nextFingerprint ? { permissions: nextPermissions } : {}),
          requiresContactSetup: Boolean(profile.requiresContactSetup),
          contactSetupCompleted: Boolean(profile.contactSetupCompleted),
          mfaEnabled: newMfaEnabled,
          fullname: profile.name || undefined,
        })

        if (prevMfaEnabled !== newMfaEnabled) {
          void queryClient.invalidateQueries({ queryKey: ['rbac'] })
        }
      } catch {
        // Keep existing session permissions if profile sync fails
      } finally {
        inFlight.current = false
      }
    }

    void sync()

    const onFocus = () => {
      void sync()
    }
    const onVisibility = () => {
      if (document.visibilityState === 'visible') void sync()
    }

    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onVisibility)
    const intervalId = window.setInterval(() => {
      void sync()
    }, SYNC_INTERVAL_MS)

    return () => {
      cancelled = true
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onVisibility)
      window.clearInterval(intervalId)
    }
  }, [userId, updateUser])
}
