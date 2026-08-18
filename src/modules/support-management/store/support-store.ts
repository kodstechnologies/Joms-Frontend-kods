import { create } from 'zustand'

import type { TicketTab, WorkspaceTab } from '../types/support'

type SupportState = {
  searchQuery: string
  currentPage: number
  activeTab: TicketTab
  workspaceTab: WorkspaceTab
  selectedTicketId: string
  showFilters: boolean
  setSearchQuery: (q: string) => void
  setCurrentPage: (p: number) => void
  setActiveTab: (tab: TicketTab) => void
  setWorkspaceTab: (tab: WorkspaceTab) => void
  setSelectedTicketId: (id: string) => void
  setShowFilters: (show: boolean) => void
}

export const useSupportStore = create<SupportState>((set) => ({
  searchQuery: '',
  currentPage: 1,
  activeTab: 'my_tickets',
  workspaceTab: 'intelligence',
  selectedTicketId: '',
  showFilters: false,
  setSearchQuery: (searchQuery) => set({ searchQuery, currentPage: 1 }),
  setCurrentPage: (currentPage) => set({ currentPage }),
  setActiveTab: (activeTab) => set({ activeTab, currentPage: 1 }),
  setWorkspaceTab: (workspaceTab) => set({ workspaceTab }),
  setSelectedTicketId: (selectedTicketId) => set({ selectedTicketId }),
  setShowFilters: (showFilters) => set({ showFilters }),
}))
