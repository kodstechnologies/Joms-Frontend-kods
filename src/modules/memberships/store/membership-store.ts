import { create } from 'zustand'

import type { MembershipStatus } from '../types/membership'

type MembershipStore = {
  searchQuery: string
  setSearchQuery: (query: string) => void
  activeStatus: MembershipStatus | 'all'
  setActiveStatus: (status: MembershipStatus | 'all') => void
  currentPage: number
  setCurrentPage: (page: number) => void
}

export const useMembershipStore = create<MembershipStore>((set) => ({
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query, currentPage: 1 }),
  activeStatus: 'all',
  setActiveStatus: (status) => set({ activeStatus: status, currentPage: 1 }),
  currentPage: 1,
  setCurrentPage: (page) => set({ currentPage: page }),
}))
