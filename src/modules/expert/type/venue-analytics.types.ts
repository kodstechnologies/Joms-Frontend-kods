export interface MetricItem {
  label: string
  value: string
  trend?: {
    percent: number
    vsLastMonth?: string
  }
}

export interface SpaceRow {
  name: string
  category: string
  bookings: number
  rating: number
  utilization: number
  revenue: string
  status: 'Active' | 'Inactive'
}

export interface BookingRow {
  id: string
  space: string
  host: string
  date: string
  revenue: string
  status: string
}

export interface RevenueBreakdownItem {
  label: string
  value: number
  percent: number
  color: string
}

export interface TopRevenueSpaceItem {
  rank: number
  name: string
  share: string
  revenue: string
}

export interface RevenueTrendPoint {
  date: string
  events: number
  meetups: number
}

export interface BookingFunnelStage {
  stage: string
  value: number
  conversion: string
  dropOff?: string
}

export interface CategorySplitItem {
  name: string
  value: number
}

export interface BookingsTrendPoint {
  week: string
  events: number
  meetups: number
}

export interface VenueProfileAnalyticsResponse {
  overview: {
    basicInfo: { label: string; value: string }[]
    visibilityMetrics: MetricItem[]
    bookingSnapshot: MetricItem[]
    revenueSnapshot: MetricItem[]
  }
  spaces: {
    spaceAnalysis: {
      label: string
      value: string
      trend?: { percent: number; vsLastMonth?: string }
    }[]
    allSpaces: SpaceRow[]
  }
  bookings: {
    eventMetrics: MetricItem[]
    meetupMetrics: MetricItem[]
    eventBookings: BookingRow[]
  }
  revenue: {
    revenueKpis: MetricItem[]
    revenueBreakdown: RevenueBreakdownItem[]
    topRevenueSpaces: TopRevenueSpaceItem[]
    revenueTrend: RevenueTrendPoint[]
  }
  visual: {
    bookingFunnel: BookingFunnelStage[]
    bookingCategorySplit: CategorySplitItem[]
    bookingsTrend: BookingsTrendPoint[]
  }
  profileCards?: {
    eventsHosted: string
    totalAttendees: string
    repeatAttendees: string
    upcomingEvents: string
    eventCompletionRate: string
    avgResponseTime: string
    noOfEventsRejected: string
    noOfEventsSuspended: string
  }
}
