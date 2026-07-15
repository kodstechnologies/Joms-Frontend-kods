import { create } from 'zustand'

type ExpertStore = {
  searchQuery: string
  currentPage: number
  activeStatus: string

  setSearchQuery: (query: string) => void
  setCurrentPage: (page: number) => void
  setActiveStatus: (status: string) => void
}

export const useExpertStore = create<ExpertStore>((set) => ({
  searchQuery: '',
  currentPage: 1,
  activeStatus: 'all',

  setSearchQuery: (query) =>
    set({
      searchQuery: query,
      currentPage: 1,
    }),

  setCurrentPage: (page) =>
    set({
      currentPage: page,
    }),

  setActiveStatus: (status) =>
    set({
      activeStatus: status,
      currentPage: 1,
    }),
}))
