import { useEffect, useRef, type PropsWithChildren } from 'react'
import { toast } from 'sonner'

import { useLogoutMutation } from '@/modules/auth/hooks/use-logout-mutation'
import { useAuthStore } from '@/modules/auth/store/auth-store'
import { useSecurityPolicy } from '@/modules/settings/hooks/use-security-policy'

const ACTIVITY_EVENTS: Array<keyof WindowEventMap> = [
  'mousemove',
  'mousedown',
  'keydown',
  'scroll',
  'touchstart',
  'click',
]

/**
 * Logs the admin out after configured idle minutes (Security & Access → Session Timeout).
 */
export function SessionTimeoutProvider({ children }: PropsWithChildren) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const token = useAuthStore((state) => state.token)
  const clearSession = useAuthStore((state) => state.clearSession)
  const { sessionTimeoutMinutes } = useSecurityPolicy()
  const logoutMutation = useLogoutMutation()

  const lastActivityRef = useRef(0)
  const loggingOutRef = useRef(false)

  useEffect(() => {
    if (!isAuthenticated || !token) return

    lastActivityRef.current = Date.now()
    loggingOutRef.current = false

    const markActivity = () => {
      lastActivityRef.current = Date.now()
    }

    for (const eventName of ACTIVITY_EVENTS) {
      window.addEventListener(eventName, markActivity, { passive: true })
    }

    const timeoutMs = Math.max(1, sessionTimeoutMinutes) * 60_000
    const intervalId = window.setInterval(() => {
      if (loggingOutRef.current) return
      const idleFor = Date.now() - lastActivityRef.current
      if (idleFor < timeoutMs) return

      loggingOutRef.current = true
      logoutMutation.mutate(undefined, {
        onSettled: () => {
          clearSession()
          toast.message('You were logged out due to inactivity')
          window.location.replace('/auth/login')
        },
      })
    }, 15_000)

    return () => {
      for (const eventName of ACTIVITY_EVENTS) {
        window.removeEventListener(eventName, markActivity)
      }
      window.clearInterval(intervalId)
    }
  }, [clearSession, isAuthenticated, logoutMutation, sessionTimeoutMinutes, token])

  return children
}
