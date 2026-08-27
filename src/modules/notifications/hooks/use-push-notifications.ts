import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { requestNotificationPermission, onForegroundMessage } from '@/shared/lib/firebase'
import { useAuthStore } from '@/modules/auth/store/auth-store'
import { registerDeviceToken, unregisterDeviceToken } from '../api/notifications-api'
import { notificationKeys } from './use-notifications'
import { getRegisteredPushToken, setRegisteredPushToken } from '../lib/push-token-session'

export const usePushNotifications = () => {
  const queryClient = useQueryClient()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const registeredTokenRef = useRef<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      // Best-effort cleanup if session ended without going through logout mutation
      const token = getRegisteredPushToken() || registeredTokenRef.current
      if (token) {
        void unregisterDeviceToken(token).catch(() => {})
        registeredTokenRef.current = null
        setRegisteredPushToken(null)
      }
      return
    }

    let unsubscribeForeground: (() => void) | null = null
    let cancelled = false

    const init = async () => {
      try {
        const token = await requestNotificationPermission()
        if (cancelled || !token) return

        if (token !== registeredTokenRef.current) {
          registeredTokenRef.current = token
          setRegisteredPushToken(token)
          await registerDeviceToken(token, 'web').catch(() => {})
        }

        unsubscribeForeground = onForegroundMessage((payload) => {
          const title = payload.notification?.title || 'JOMS'
          const body = payload.notification?.body || ''

          toast(title, {
            description: body,
            duration: 6000,
          })

          void queryClient.invalidateQueries({ queryKey: notificationKeys.all })
        })
      } catch {
        // Push init is best-effort; failures leave in-app notifications unaffected.
      }
    }

    void init()

    return () => {
      cancelled = true
      unsubscribeForeground?.()
    }
  }, [isAuthenticated, queryClient])
}
