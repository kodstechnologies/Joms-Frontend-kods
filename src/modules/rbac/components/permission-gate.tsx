import type { ReactNode } from 'react'

import { usePermission } from '@/modules/rbac/hooks/use-permission'
import type { PermissionLevel } from '@/shared/lib/permissions'

type PermissionGateProps = {
  permission?: string
  permissions?: string[]
  module?: string
  minLevel?: PermissionLevel
  fallback?: ReactNode
  children: ReactNode
}

// A super admin always sees the content. Anyone else needs the module and the listed permissions, or the fallback is shown.
export function PermissionGate({
  permission,
  permissions = [],
  module,
  minLevel,
  fallback = null,
  children,
}: PermissionGateProps) {
  const { can, canAny, hasModuleAccess, isSuperAdmin } = usePermission()

  if (isSuperAdmin) {
    return <>{children}</>
  }

  if (module && !hasModuleAccess(module)) {
    return <>{fallback}</>
  }

  if (permission && !can(permission, minLevel)) {
    return <>{fallback}</>
  }

  if (permissions.length > 0 && !canAny(permissions, minLevel)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
