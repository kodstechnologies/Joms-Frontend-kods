import { create } from 'zustand'

type ReferralStore = {
  searchQuery: string
  setSearchQuery: (query: string) => void
  currentPage: number
  setCurrentPage: (page: number) => void
}

export const useReferralStore = create<ReferralStore>((set) => ({
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query, currentPage: 1 }),
  currentPage: 1,
  setCurrentPage: (page) => set({ currentPage: page }),
}))
