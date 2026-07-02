import type { AdminUser } from '@/modules/auth/store/auth-store'

import type { NavItem, PermissionModule } from './navigation.config'
import { navigationConfig } from './navigation.config'

const LEGACY_PERMISSION_MAP: Record<string, string> = {
  'events.view': 'venues.view',
  'events.create': 'venues.create',
  'events.update': 'venues.update',
  'events.delete': 'venues.delete',
  'events.approve': 'venues.approve',
}

export function normalizePermissionKey(key: string): string {
  return LEGACY_PERMISSION_MAP[key] || key
}

export function normalizeUserPermissions(permissions: string[] = []): string[] {
  return [...new Set(permissions.map((key) => normalizePermissionKey(key)))]
}

export function hasModuleAccess(
  user: AdminUser | null | undefined,
  module: PermissionModule,
): boolean {
  if (!user) return false
  if (user.isSuperAdmin) return true

  const permissions = normalizeUserPermissions(user.permissions)
  return permissions.some((permission) => permission.startsWith(`${module}.`))
}

type NavFilterContext = {
  allowedModule?: PermissionModule
}

function isNavItemVisible(
  item: NavItem,
  user: AdminUser | null | undefined,
  context: NavFilterContext = {},
): boolean {
  const isSuperAdmin = user?.isSuperAdmin ?? false

  if (item.superAdminOnly && !isSuperAdmin) {
    return false
  }

  if (item.permissionModule) {
    return hasModuleAccess(user, item.permissionModule)
  }

  if (!isSuperAdmin && context.allowedModule) {
    return hasModuleAccess(user, context.allowedModule)
  }

  if (!isSuperAdmin && item.key !== 'expert-application') {
    return false
  }

  return true
}

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

export function getVisibleNavigation(user: AdminUser | null | undefined): NavItem[] {
  return navigationConfig
    .map((item) => filterNavItem(item, user))
    .filter((item): item is NavItem => item !== null)
}

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

  return '/auth/login'
}
