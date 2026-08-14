import { useMutation, useQueryClient } from '@tanstack/react-query'

import { logout } from '@/modules/auth/api/auth-api'
import { unregisterDeviceToken } from '@/modules/notifications/api/notifications-api'
import {
  getRegisteredPushToken,
  setRegisteredPushToken,
} from '@/modules/notifications/lib/push-token-session'

export function useLogoutMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const token = getRegisteredPushToken()
      if (token) {
        // Best-effort — never block logout if notification-service is down
        await unregisterDeviceToken(token).catch(() => {})
        setRegisteredPushToken(null)
      }
      return logout()
    },
    onSettled: () => {
      queryClient.clear()
    },
  })
}
