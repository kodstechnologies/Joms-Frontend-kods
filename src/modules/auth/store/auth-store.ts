import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import {
  hasModulePermissionAccess,
  hasPermissionGrant,
  normalizePermissionGrant,
  PERMISSION_LEVELS,
  type PermissionLevel,
} from '@/shared/lib/permissions'

export type AdminUser = {
  id: string
  email: string
  fullname: string
  kind: 'superadmin' | 'subadmin'
  isSuperAdmin: boolean
  permissions: string[]
  mfaEnabled?: boolean
  status?: string
  subAdminId?: string
  requiresContactSetup?: boolean
  contactSetupCompleted?: boolean
}

type AuthState = {
  isAuthenticated: boolean
  user: AdminUser | null
  token: string | null
  setSession: (user: AdminUser, token: string) => void
  updateUser: (partial: Partial<AdminUser>) => void
  clearSession: () => void
  hasPermission: (key: string, minLevel?: PermissionLevel) => boolean
  hasModuleAccess: (module: string) => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      token: null,
      setSession: (user, token) => set({ isAuthenticated: true, user, token }),
      // The stored profile is left as it is when none of the new values actually differ.
      updateUser: (partial) =>
        set((state) => {
          if (!state.user) return state

          const hasChanges = Object.entries(partial).some(([key, value]) => {
            const current = state.user?.[key as keyof AdminUser]
            if (Array.isArray(current) && Array.isArray(value)) {
              if (current.length !== value.length) return true
              return current.some((item, index) => item !== value[index])
            }
            return current !== value
          })

          if (!hasChanges) return state

          return {
            user: { ...state.user, ...partial },
          }
        }),
      clearSession: () => set({ isAuthenticated: false, user: null, token: null }),
      // A super admin is treated as having every permission.
      hasPermission: (key, minLevel = PERMISSION_LEVELS.FULL) => {
        const user = get().user
        if (!user) return false
        const grants = user.permissions.map((grant) => normalizePermissionGrant(grant))
        return hasPermissionGrant(grants, key, minLevel, user.isSuperAdmin)
      },
      // A super admin is treated as having every module.
      hasModuleAccess: (module) => {
        const user = get().user
        if (!user) return false
        const grants = user.permissions.map((grant) => normalizePermissionGrant(grant))
        return hasModulePermissionAccess(grants, module, user.isSuperAdmin)
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
