export type LeaderboardRankingMetric =
  | 'score'
  | 'revenue'
  | 'ordersCompleted'
  | 'rating'
  | 'clientSatisfaction'
  | 'profileHealth'
  | 'repeatClientRate'

export type LeaderboardDateRange =
  | 'today'
  | 'last7'
  | 'last30'
  | 'thisMonth'
  | 'quarter'
  | 'year'
  | 'custom'
  | 'all'

export type LeaderboardPodiumItem = {
  rank: number
  partnerId: string
  expertId: string
  name: string
  profession: string
  category: string
  city?: string | null
  profileImage?: string | null
  score: number
  rankingValue: number
  averageRating?: number | null
  eventsCompleted: number
  totalRevenue: number
  totalRevenueLabel: string
}

export type LeaderboardRow = {
  rank: number
  partnerId: string
  expertId: string
  name: string
  profileImage?: string | null
  category: string
  membershipType: string
  profession: string
  city?: string | null
  state?: string | null
  ordersCompleted: number
  eventsCompleted: number
  consultationsCompleted: number
  averageRating: number | null
  ratingsAvailable: boolean
  clientSatisfaction: number
  profileHealth: number
  totalRevenue: number
  totalRevenueLabel: string
  servicesListed: number
  consultationsListed: number
  repeatClientRate: number
  repeatClients: number
  orderCompletionRate: number
  lastActiveAt?: string | null
  score: number
  rankingValue: number
}

export type LeaderboardProfile = LeaderboardRow & {
  readOnly: boolean
  notice: string
}

export type ExpertLeaderboardData = {
  filters: {
    rankingMetric: LeaderboardRankingMetric
    dateRange: string
    from?: string | null
    to?: string | null
    search?: string
    category?: string
    membershipType?: string
    state?: string
    city?: string
    minRating?: number | null
    revenueMin?: number | null
    revenueMax?: number | null
    serviceType?: string
  }
  podium: LeaderboardPodiumItem[]
  list: LeaderboardRow[]
  pagination: {
    total: number
    page: number
    limit: number
    pages: number
    showingFrom: number
    showingTo: number
  }
  meta: {
    lastRefreshedAt: string
    rankingMetric: LeaderboardRankingMetric
    tieBreakers: string[]
  }
}

export type ExpertLeaderboardResponse = {
  success: boolean
  message: string
  data: ExpertLeaderboardData
}

export type ExpertLeaderboardProfileResponse = {
  success: boolean
  message: string
  data: LeaderboardProfile
}

export type ExpertLeaderboardQuery = {
  page?: number
  limit?: number
  search?: string
  rankingMetric?: LeaderboardRankingMetric
  dateRange?: LeaderboardDateRange
  from?: string
  to?: string
  category?: string
  membershipType?: string
  state?: string
  city?: string
  minRating?: number | string
  revenueMin?: number | string
  revenueMax?: number | string
  serviceType?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}
