export interface MoneyValue {
  amount: number
  currency: string
  label: string
}

export interface VenueMetrics {
  totalVenues: number
  activeVenues: number
  suspendedVenues: number
  deletedVenues: number
  reportedVenues: number

  totalSpaces: number
  activeSpaces: number
  suspendedSpaces: number
  deletedSpaces: number
  reportedSpaces: number

  totalEventBookings: number
  totalMeetupBookings: number
  totalBookings: number
  completedBookings: number

  avgEventsPerVenue: number
  avgMeetupsPerVenue: number

  totalVenueRevenue: MoneyValue
  avgRevenuePerVenue: MoneyValue
  avgRevenuePerSpace: MoneyValue
  avgBookingValue: MoneyValue

  spaceUtilizationRate: number
  spaceCancellationRate: number
  avgVenueRating: number
  venueSatisfactionScore: number
  repeatBookingRate: number

  peakUtilizationHours: string
  avgBookingLeadTime: string
  venueTurnoverRate: string
  offPeakPotential: string
}

export interface VenueTrendPoint {
  month: string
  revenue: number
  avgRevenue: number
  utilization: number
}

export interface VenueRowData {
  name: string
  city: string
  totalVisits: number
  eventAttendance: number
  bookings: number
  repeatVisitors: number
  utilization: number
  revenue: string
  rating: number
  status: 'High Performing' | 'Stable' | 'Needs Attention'
}

export interface VenueDashboardResponse {
  metrics: VenueMetrics
  trends: VenueTrendPoint[]
  topVenues: VenueRowData[]
  generatedAt: string
}

export interface VenueDashboardFilters {
  dateRange?: string
  startDate?: string
  endDate?: string
  limit?: number
}
