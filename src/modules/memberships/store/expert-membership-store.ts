import { create } from 'zustand'

import type { SubscriptionStatus } from '../types/membership-subscription'

type ExpertMembershipStore = {
  searchQuery: string
  setSearchQuery: (query: string) => void
  activeStatus: SubscriptionStatus | 'all'
  setActiveStatus: (status: SubscriptionStatus | 'all') => void
  currentPage: number
  setCurrentPage: (page: number) => void
}

export const useExpertMembershipStore = create<ExpertMembershipStore>((set) => ({
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query, currentPage: 1 }),
  activeStatus: 'all',
  setActiveStatus: (status) => set({ activeStatus: status, currentPage: 1 }),
  currentPage: 1,
  setCurrentPage: (page) => set({ currentPage: page }),
}))
