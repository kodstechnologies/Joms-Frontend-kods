export type SpaceAnalyticsOverviewCard = {
  label: string
  value: string
  note: string
}

export type SpaceCashFlowPoint = {
  month: string
  in: number
  out: number
  net: number
}

export type SpaceTimeSlotRow = {
  slot: string
  bookings: number
  revenue: string
  revenueRaw?: number
}

export type SpaceRatingBucket = {
  stars: number
  reviews: number
  percent: number
}

export type SpaceAnalyticsResponse = {
  spaceId: string
  venueId: string | null
  spaceName: string
  overview: SpaceAnalyticsOverviewCard[]
  cashFlow: SpaceCashFlowPoint[]
  timeSlots: SpaceTimeSlotRow[]
  timeSlotInsight: string
  cancellations: {
    total: number
    revenueLost: string
  }
  ratingDistribution: SpaceRatingBucket[]
}
