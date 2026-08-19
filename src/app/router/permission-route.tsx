import { Navigate, Outlet, useLocation } from 'react-router-dom'

import {
  getDefaultHomeRoute,
  hasModuleAccess,
  type PermissionModule,
} from '@/app/layouts/navigation/navigation.filter'
import { useAuthStore } from '@/modules/auth/store/auth-store'
import { PERMISSION_LEVELS, type PermissionLevel } from '@/shared/lib/permissions'

type PermissionRouteProps = {
  module?: PermissionModule
  permission?: string
  minLevel?: PermissionLevel
}

export function PermissionRoute({
  module,
  permission,
  minLevel = PERMISSION_LEVELS.FULL,
}: PermissionRouteProps) {
  const location = useLocation()
  const user = useAuthStore((state) => state.user)
  const hasPermission = useAuthStore((state) => state.hasPermission)

  const allowed = permission
    ? hasPermission(permission, minLevel)
    : module
      ? hasModuleAccess(user, module)
      : false

  if (allowed) {
    return <Outlet />
  }

  return <Navigate to={getDefaultHomeRoute(user)} replace state={{ from: location }} />
}
