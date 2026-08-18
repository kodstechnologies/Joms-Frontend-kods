import { useAuthStore } from '@/modules/auth/store/auth-store'
import {
  PERMISSION_LEVELS,
  hasModulePermissionAccess,
  hasPermissionGrant,
  type PermissionLevel,
} from '@/shared/lib/permissions'

export function usePermission() {
  const user = useAuthStore((state) => state.user)
  const isSuperAdmin = user?.isSuperAdmin ?? false
  const grants = user?.permissions ?? []

  return {
    user,
    isSuperAdmin,
    grants,
    can: (key: string, minLevel: PermissionLevel = PERMISSION_LEVELS.FULL) =>
      hasPermissionGrant(grants, key, minLevel, isSuperAdmin),
    canRead: (key: string) =>
      hasPermissionGrant(grants, key, PERMISSION_LEVELS.READ_ONLY, isSuperAdmin),
    canAny: (keys: string[], minLevel: PermissionLevel = PERMISSION_LEVELS.FULL) =>
      keys.some((key) => hasPermissionGrant(grants, key, minLevel, isSuperAdmin)),
    hasModuleAccess: (modulePrefix: string) =>
      hasModulePermissionAccess(grants, modulePrefix, isSuperAdmin),
  }
}
