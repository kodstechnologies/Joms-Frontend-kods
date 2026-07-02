import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

type RbacState = {
  activeTab: 'roles' | 'users'
  searchQuery: string
  currentPage: number
  setActiveTab: (tab: 'roles' | 'users') => void
  setSearchQuery: (query: string) => void
  setCurrentPage: (page: number) => void
}

export const useRbacStore = create<RbacState>()(
  persist(
    (set) => ({
      activeTab: 'roles',
      searchQuery: '',
      currentPage: 1,
      setActiveTab: (activeTab) => set({ activeTab, currentPage: 1 }),
      setSearchQuery: (searchQuery) => set({ searchQuery, currentPage: 1 }),
      setCurrentPage: (currentPage) => set({ currentPage }),
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
