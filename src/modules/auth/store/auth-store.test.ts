import { beforeEach, describe, expect, it } from 'vitest'

import { useAuthStore } from '@/modules/auth/store/auth-store'

const adminUser = {
  id: '1',
  email: 'admin@example.com',
  fullname: 'Admin',
  kind: 'superadmin' as const,
  isSuperAdmin: true,
  permissions: ['finance.view'],
}

describe('auth-store', () => {
  beforeEach(() => {
    useAuthStore.getState().clearSession()
    localStorage.clear()
  })

  it('starts logged out with no token (REG-01 gate)', () => {
    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(false)
    expect(state.token).toBeNull()
    expect(state.user).toBeNull()
  })

  it('setSession then clearSession drops the token so ProtectedRoute must redirect', () => {
    useAuthStore.getState().setSession(adminUser, 'test-token')
    expect(useAuthStore.getState().isAuthenticated).toBe(true)
    expect(useAuthStore.getState().token).toBe('test-token')

    useAuthStore.getState().clearSession()
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
    expect(useAuthStore.getState().token).toBeNull()
  })

  it('super-admin has module access', () => {
    useAuthStore.getState().setSession(adminUser, 'test-token')
    expect(useAuthStore.getState().hasModuleAccess('finance')).toBe(true)
  })
})
