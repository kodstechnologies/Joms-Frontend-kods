import { useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchMarketplaceDashboard } from '../api/marketplace-dashboard.api'
import type { DashboardFilters } from '../types/marketplace-dashboard.types'

export const marketplaceQueryKeys = {
  all: ['marketplace-dashboard'] as const,
  overview: (filters: DashboardFilters) => ['marketplace-dashboard', 'overview', filters] as const,
}

/**
 * Fetch complete marketplace dashboard (KPIs + Charts + Trends + Summary) in ONE query.
 */
export const useMarketplaceDashboard = (filters: DashboardFilters = {}) => {
  return useQuery({
    queryKey: marketplaceQueryKeys.overview(filters),
    queryFn: () => fetchMarketplaceDashboard(filters),
    staleTime: 60_000,
    retry: 2,
  })
}

/**
 * Filter state manager
 */
export const useMarketplaceDashboardFilters = (
  initialFilters: DashboardFilters = { dateRange: 'last30days' },
) => {
  const [filters, setFilters] = useState<DashboardFilters>(initialFilters)

  const setDateRange = useCallback(
    (dateRange: DashboardFilters['dateRange']) =>
      setFilters((f) => ({ ...f, dateRange, startDate: undefined, endDate: undefined })),
    [],
  )

  const setCustomRange = useCallback(
    (startDate: string, endDate: string) =>
      setFilters((f) => ({ ...f, dateRange: 'custom', startDate, endDate })),
    [],
  )

  const setCategory = useCallback(
    (category: string | undefined) =>
      setFilters((f) => ({ ...f, category, subCategory: undefined })),
    [],
  )

  const setSubCategory = useCallback(
    (subCategory: string | undefined) => setFilters((f) => ({ ...f, subCategory })),
    [],
  )

  const setOrderStatus = useCallback(
    (orderStatus: DashboardFilters['orderStatus']) => setFilters((f) => ({ ...f, orderStatus })),
    [],
  )

  const setBookingStatus = useCallback(
    (bookingStatus: DashboardFilters['bookingStatus']) =>
      setFilters((f) => ({ ...f, bookingStatus })),
    [],
  )

  const resetFilters = useCallback(() => setFilters(initialFilters), [initialFilters])

  return {
    filters,
    setFilters,
    setDateRange,
    setCustomRange,
    setCategory,
    setSubCategory,
    setOrderStatus,
    setBookingStatus,
    resetFilters,
  }
}
