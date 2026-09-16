import { describe, expect, it } from 'vitest'

import type { AdminUser } from '@/modules/auth/store/auth-store'
import {
  getDefaultHomeRoute,
  getVisibleNavigation,
  hasModuleAccess,
} from '@/app/layouts/navigation/navigation.filter'
import { normalizePermissionKey } from '@/shared/lib/permissions'

const subAdmin = (permissions: string[]): AdminUser => ({
  id: '1',
  email: 'a@example.com',
  fullname: 'A',
  kind: 'subadmin',
  isSuperAdmin: false,
  permissions,
})

describe('navigation.filter', () => {
  it('maps legacy events permission keys to venues', () => {
    expect(normalizePermissionKey('events.view')).toBe('venues.view')
    expect(normalizePermissionKey('experts.view')).toBe('experts.view')
  })

  it('denies module access without matching keys', () => {
    expect(hasModuleAccess(subAdmin(['experts.view']), 'venues')).toBe(false)
  })

  it('allows module access when a matching key exists', () => {
    expect(hasModuleAccess(subAdmin(['venues.view']), 'venues')).toBe(true)
  })

  it('allows all modules for super-admin', () => {
    const user: AdminUser = {
      ...subAdmin([]),
      kind: 'superadmin',
      isSuperAdmin: true,
    }
    expect(hasModuleAccess(user, 'venues')).toBe(true)
  })

  it('routes sub-admins to the first module they can access', () => {
    expect(getDefaultHomeRoute(subAdmin(['experts.review']))).toBe('/experts/management')
    expect(getDefaultHomeRoute(subAdmin([]))).toBe('/my-tasks')
  })

  it('hides modules for a missing user and routes login', () => {
    expect(hasModuleAccess(null, 'venues')).toBe(false)
    expect(getDefaultHomeRoute(null)).toBe('/auth/login')
  })

  it('routes services and venues dashboards before experts', () => {
    expect(getDefaultHomeRoute(subAdmin(['services.view']))).toBe('/services/dashboard')
    expect(getDefaultHomeRoute(subAdmin(['venues.view']))).toBe('/venues/dashboard')
  })

  it('routes super-admins to the executive dashboard', () => {
    const user: AdminUser = {
      ...subAdmin([]),
      kind: 'superadmin',
      isSuperAdmin: true,
    }
    expect(getDefaultHomeRoute(user)).toBe('/dashboard/executive')
  })

  it('filters navigation for sub-admins and super-admins', () => {
    const keys = (user: AdminUser) => getVisibleNavigation(user).map((item) => item.key)
    expect(keys(subAdmin([]))).toContain('my-task')
    expect(keys(subAdmin([]))).not.toContain('finance')
    expect(keys(subAdmin([]))).not.toContain('executive')
    expect(keys(subAdmin(['experts.view']))).toContain('expert-application')

    const superAdmin: AdminUser = {
      ...subAdmin([]),
      kind: 'superadmin',
      isSuperAdmin: true,
    }
    expect(keys(superAdmin)).toContain('finance')
    expect(keys(superAdmin)).toContain('executive')
  })

  it('shows settings and support for sub-admins with module permissions', () => {
    const keys = (user: AdminUser) => getVisibleNavigation(user).map((item) => item.key)
    expect(keys(subAdmin(['settings.rbac_management']))).toContain('settings')
    expect(keys(subAdmin(['support.view']))).toContain('support')
    expect(keys(subAdmin(['finance.view_transactions']))).toContain('finance')
  })
})
