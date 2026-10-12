import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { useAuthStore } from '@/modules/auth/store/auth-store'
import { useRbacMe } from '@/modules/rbac/hooks/use-rbac'

// A sub-admin who still owes contact details cannot leave that page. One who has finished is sent away from it.
export function ContactSetupRoute() {
  const location = useLocation()
  const user = useAuthStore((state) => state.user)
  const profileQuery = useRbacMe()

  if (!user) {
    return <Navigate to="/auth/login" replace state={{ from: location }} />
  }

  const isContactSetupPage = location.pathname === '/auth/contact-information'

  if (profileQuery.isLoading && user.requiresContactSetup === undefined) {
    return (
      <div className="bg-brand-bg text-brand-muted flex min-h-screen items-center justify-center">
        Loading...
      </div>
    )
  }

  const needsContactSetup = user.contactSetupCompleted
    ? false
    : profileQuery.data?.data
      ? Boolean(profileQuery.data.data.requiresContactSetup)
      : Boolean(user.requiresContactSetup)

  if (needsContactSetup && !isContactSetupPage) {
    return <Navigate to="/auth/contact-information" replace />
  }

  if (!needsContactSetup && isContactSetupPage) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
