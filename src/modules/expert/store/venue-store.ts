import { create } from 'zustand'

interface VenueState {
  searchQuery: string
  setSearchQuery: (query: string) => void

  currentPage: number
  setCurrentPage: (page: number) => void

  activeStatus: string
  setActiveStatus: (status: string) => void
}

export const useVenueStore = create<VenueState>((set) => ({
  searchQuery: '',

  setSearchQuery: (query) =>
    set({
      searchQuery: query,
      currentPage: 1,
    }),

  currentPage: 1,

  setCurrentPage: (page) =>
    set({
      currentPage: page,
    }),

  activeStatus: 'all',

  setActiveStatus: (status) =>
    set({
      activeStatus: status,
      currentPage: 1,
    }),
}))