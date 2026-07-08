import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

type RbacState = {
  activeTab: 'roles' | 'users'
  searchQuery: string
  currentPage: number
  roleFilterId: string | null
  setActiveTab: (tab: 'roles' | 'users') => void
  setSearchQuery: (query: string) => void
  setCurrentPage: (page: number) => void
  setRoleFilterId: (roleId: string | null) => void
}

export const useRbacStore = create<RbacState>()(
  persist(
    (set) => ({
      activeTab: 'roles',
      searchQuery: '',
      currentPage: 1,
      roleFilterId: null,
      setActiveTab: (activeTab) => set({ activeTab, currentPage: 1 }),
      setSearchQuery: (searchQuery) => set({ searchQuery, currentPage: 1 }),
      setCurrentPage: (currentPage) => set({ currentPage }),
      setRoleFilterId: (roleFilterId) => set({ roleFilterId, currentPage: 1 }),
    }),
    {
      name: 'rbac-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        activeTab: state.activeTab,
      }),
    },
  ),
)
