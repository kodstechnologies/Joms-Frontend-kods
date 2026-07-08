import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

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
  hasPermission: (key: string) => boolean
  hasModuleAccess: (module: 'venues' | 'services') => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      token: null,
      setSession: (user, token) => set({ isAuthenticated: true, user, token }),
      updateUser: (partial) =>
        set((state) => {
          if (!state.user) return state

          const hasChanges = Object.entries(partial).some(
            ([key, value]) => state.user?.[key as keyof AdminUser] !== value,
          )

          if (!hasChanges) return state

          return {
            user: { ...state.user, ...partial },
          }
        }),
      clearSession: () => set({ isAuthenticated: false, user: null, token: null }),
      hasPermission: (key) => {
        const user = get().user
        if (!user) return false
        if (user.isSuperAdmin) return true
        return user.permissions.includes(key)
      },
      hasModuleAccess: (module: 'venues' | 'services') => {
        const user = get().user
        if (!user) return false
        if (user.isSuperAdmin) return true
        const permissions = user.permissions.map((key) => {
          const legacyMap: Record<string, string> = {
            'events.view': 'venues.view',
            'events.create': 'venues.create',
            'events.update': 'venues.update',
            'events.delete': 'venues.delete',
            'events.approve': 'venues.approve',
          }
          return legacyMap[key] || key
        })
        return permissions.some((p) => p.startsWith(`${module}.`))
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
