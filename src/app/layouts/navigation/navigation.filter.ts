import type { AdminUser } from '@/modules/auth/store/auth-store'

import { navigationConfig, type NavItem } from './navigation.config'
import {
  hasModulePermissionAccess,
  normalizePermissionGrant,
  normalizePermissionKey,
  normalizeUserPermissions,
  type PermissionModuleKey,
} from '@/shared/lib/permissions'

export type PermissionModule = PermissionModuleKey
export { normalizePermissionKey, normalizeUserPermissions }

// A signed-out admin has no modules. A super admin has all of them.
export function hasModuleAccess(
  user: AdminUser | null | undefined,
  module: PermissionModule,
): boolean {
  if (!user) return false
  const grants = (user.permissions || []).map((grant) => normalizePermissionGrant(grant))
  return hasModulePermissionAccess(grants, module, user.isSuperAdmin)
}

type NavFilterContext = {
  allowedModule?: PermissionModule
}

// My Tasks stays in the menu for every signed-in admin. A sub-admin otherwise sees only modules they were granted, plus the expert application item.
function isNavItemVisible(
  item: NavItem,
  user: AdminUser | null | undefined,
  context: NavFilterContext = {},
): boolean {
  const isSuperAdmin = user?.isSuperAdmin ?? false

  if (item.permissionModule) {
    return hasModuleAccess(user, item.permissionModule)
  }

  if (item.superAdminOnly && !isSuperAdmin) {
    return false
  }

  if (item.key === 'my-task') {
    return true
  }

  if (!isSuperAdmin && context.allowedModule) {
    return hasModuleAccess(user, context.allowedModule)
  }

  if (!isSuperAdmin && item.key !== 'expert-application') {
    return false
  }

  return true
}

// A group is dropped when none of its children are left for this admin.
function filterNavItem(
  item: NavItem,
  user: AdminUser | null | undefined,
  context: NavFilterContext = {},
): NavItem | null {
  if (!isNavItemVisible(item, user, context)) {
    return null
  }

  const childContext: NavFilterContext = item.permissionModule
    ? { allowedModule: item.permissionModule }
    : context

  if (!item.children?.length) {
    return item
  }

  const children = item.children
    .map((child) => filterNavItem(child, user, childContext))
    .filter((child): child is NavItem => child !== null)

  if (!children.length) {
    return null
  }

  return { ...item, children }
}

// The menu is the config with every item this admin cannot open removed.
export function getVisibleNavigation(user: AdminUser | null | undefined): NavItem[] {
  return navigationConfig
    .map((item) => filterNavItem(item, user))
    .filter((item): item is NavItem => item !== null)
}

// A super admin lands on the executive dashboard. A sub-admin lands on the first module they can open, or My Tasks when they have none.
export function getDefaultHomeRoute(user: AdminUser | null | undefined): string {
  if (!user) {
    return '/auth/login'
  }

  if (user.isSuperAdmin) {
    return '/dashboard/executive'
  }

  if (hasModuleAccess(user, 'services')) {
    return '/services/dashboard'
  }

  if (hasModuleAccess(user, 'venues')) {
    return '/venues/dashboard'
  }

  if (hasModuleAccess(user, 'experts')) {
    return '/experts/management'
  }

  if (hasModuleAccess(user, 'finance')) {
    return '/finance/dashboard'
  }

  if (hasModuleAccess(user, 'memberships')) {
    return '/memberships/plans'
  }

  if (hasModuleAccess(user, 'referrals')) {
    return '/referrals/management'
  }

  if (hasModuleAccess(user, 'support')) {
    return '/support/dashboard'
  }

  if (hasModuleAccess(user, 'settings')) {
    return '/settings/main'
  }

  return '/my-tasks'
}
