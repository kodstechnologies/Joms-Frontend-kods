import { Navigate, Outlet } from 'react-router-dom'

import { getDefaultHomeRoute } from '@/app/layouts/navigation/navigation.filter'
import { useAuthStore } from '@/modules/auth/store/auth-store'

export function SuperAdminRoute() {
  const user = useAuthStore((state) => state.user)

  if (!user?.isSuperAdmin) {
    return <Navigate to={getDefaultHomeRoute(user)} replace />
  }

  return <Outlet />
}
