import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { requestNotificationPermission, onForegroundMessage } from '@/shared/lib/firebase'
import { useAuthStore } from '@/modules/auth/store/auth-store'
import { registerDeviceToken } from '../api/notifications-api'
import { notificationKeys } from './use-notifications'

export const usePushNotifications = () => {
  const queryClient = useQueryClient()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const registeredTokenRef = useRef<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) return

    let unsubscribeForeground: (() => void) | null = null

    const init = async () => {
      try {
        const token = await requestNotificationPermission()

        if (token && token !== registeredTokenRef.current) {
          registeredTokenRef.current = token
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
      } catch (err) {
        console.error('[usePushNotifications] Failed to initialize push notifications:', err)
      }
    }

    void init()

    return () => {
      unsubscribeForeground?.()
    }
  }, [isAuthenticated, queryClient])
}
