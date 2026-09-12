import { useEffect, useRef, type PropsWithChildren } from 'react'
import { toast } from 'sonner'

import { useLogoutMutation } from '@/modules/auth/hooks/use-logout-mutation'
import { useAuthStore } from '@/modules/auth/store/auth-store'
import { useSecurityPolicy } from '@/modules/settings/hooks/use-security-policy'
import { getLastSessionActivity, markSessionActivity } from '@/shared/lib/session-activity'

const ACTIVITY_EVENTS: Array<keyof WindowEventMap> = [
  'mousemove',
  'mousedown',
  'keydown',
  'scroll',
  'touchstart',
  'click',
  'focus',
]

export function SessionTimeoutProvider({ children }: PropsWithChildren) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const token = useAuthStore((state) => state.token)
  const clearSession = useAuthStore((state) => state.clearSession)
  const { sessionTimeoutMinutes, isLoading: isPolicyLoading } = useSecurityPolicy()
  const logoutMutation = useLogoutMutation()

  const logoutRef = useRef(logoutMutation)
  const loggingOutRef = useRef(false)

  useEffect(() => {
    logoutRef.current = logoutMutation
  })

  useEffect(() => {
    if (!isAuthenticated || !token) return
    if (isPolicyLoading) return

    markSessionActivity()
    loggingOutRef.current = false

    for (const eventName of ACTIVITY_EVENTS) {
      window.addEventListener(eventName, markSessionActivity, { passive: true })
    }

    const timeoutMs = Math.max(15, Number(sessionTimeoutMinutes) || 30) * 60_000
    const intervalId = window.setInterval(() => {
      if (loggingOutRef.current) return
      if (Date.now() - getLastSessionActivity() < timeoutMs) return

      loggingOutRef.current = true
      logoutRef.current.mutate(undefined, {
        onSettled: () => {
          clearSession()
          toast.message('You were logged out due to inactivity')
          window.location.replace('/auth/login')
        },
      })
    }, 15_000)

    return () => {
      for (const eventName of ACTIVITY_EVENTS) {
        window.removeEventListener(eventName, markSessionActivity)
      }
      window.clearInterval(intervalId)
    }
  }, [clearSession, isAuthenticated, isPolicyLoading, sessionTimeoutMinutes, token])

  return children
}
