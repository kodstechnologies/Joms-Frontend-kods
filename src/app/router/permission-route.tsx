import { Navigate, Outlet, useLocation } from 'react-router-dom'

import {
  getDefaultHomeRoute,
  hasModuleAccess,
  type PermissionModule,
} from '@/app/layouts/navigation/navigation.filter'
import { useAuthStore } from '@/modules/auth/store/auth-store'

type PermissionRouteProps = {
  module: PermissionModule
}

export function PermissionRoute({ module }: PermissionRouteProps) {
  const location = useLocation()
  const user = useAuthStore((state) => state.user)

  if (hasModuleAccess(user, module)) {
    return <Outlet />
  }

  return <Navigate to={getDefaultHomeRoute(user)} replace state={{ from: location }} />
}
