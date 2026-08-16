import { venueApiClient } from '@/shared/lib/axios'
import type { VenueDashboardFilters, VenueDashboardResponse } from '../type/venue-dashboard.types'

export type VenueManagementMetric = {
  id: string
  label: string
  value: string
  change?: string
  changeType?: 'up' | 'down'
  changeNote?: string
  note?: string
}

export type VenueManagementMetricsResponse = {
  metrics: VenueManagementMetric[]
  summary?: {
    totalVenues: number
    activeVenues: number
    totalBookings: number
    completedBookings: number
    cancelledBookings: number
    cancellationPct: number
    totalRevenue: number
    avgRating: number
    avgBookingValue: number
    reviewsCount: number
  }
  generatedAt?: string
}

/**
 * Fetch complete Venue Dashboard in one single API call.
 * GET /venues/dashboard
 */
export const fetchVenueDashboard = async (
  filters: VenueDashboardFilters = {},
): Promise<VenueDashboardResponse> => {
  const res = await venueApiClient.get<{ success: boolean; data: VenueDashboardResponse }>(
    '/venues/dashboard',
    { params: filters },
  )
  return res.data.data
}

/**
 * Fetch Venue Management metric cards.
 * GET /venues/management/metrics
 */
export const fetchVenueManagementMetrics = async (): Promise<VenueManagementMetricsResponse> => {
  const res = await venueApiClient.get<{
    success: boolean
    data: VenueManagementMetricsResponse
  }>('/venues/management/metrics')
  return res.data.data
}
