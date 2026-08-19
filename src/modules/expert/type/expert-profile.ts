export type ExpertWorkExperience = {
  _id?: string
  jobTitle?: string
  companyName?: string
  employmentType?: string
  startDate?: string
  endDate?: string | null
  currentlyWorking?: boolean
  description?: string
}

export type ExpertBasicProfile = {
  coverImage?: string
  profileImage?: string
  fullname?: string
  location?: string
  bio?: string
  industry?: string
  experienceYears?: number
  experienceMonths?: number
  serviceType?: string
  serviceCategory?: string[]
  offerings?: string[]
  sampleWorkLink?: string
  sampleWorkFile?: string
  phoneNumber?: string
  email?: string
}

export type ExpertProfileDetail = {
  _id: string
  fullname?: string
  phone?: string
  email?: string
  phoneVerified?: boolean
  emailVerified?: boolean
  servicetype?: string
  expertType?: string
  kycStatus?: string
  isBlocked?: boolean
  isDeactivated?: boolean
  hasPassword?: boolean
  basicProfile?: ExpertBasicProfile
  identityVerification?: Record<string, unknown>
  workExperience?: ExpertWorkExperience[]
  gallery?: { images?: string[] }
  finalReview?: {
    internalNotes?: string
    isVerified?: boolean
    approvalStatus?: 'pending' | 'approved'
  }
  subCategory?: unknown[]
  customUrl?: string
  profileUrl?: string
  customUsername?: string
  deepLink?: string
  expertId?: string
  rating?: number
  ratings?: number
  reviewCount?: number | string
  totalReviews?: number | string
  nps?: number
  experience?: string | number
  totalEarnings?: number
  totalOrdersCompleted?: number
  completedOrders?: number
  analytics?: {
    rating?: number
    totalReviews?: number | string
    nps?: number
    totalEarnings?: number
    completedOrders?: number
  }
  createdAt?: string
  updatedAt?: string
}

export type ExpertProfileResponse = {
  success?: boolean
  message?: string
  data: ExpertProfileDetail
  meta?: unknown
}

export type ExpertConsultationTopic = {
  _id: string
  name: string
}

export type ExpertConsultationPricing = {
  durationMinutes: number
  pricingType: string
  price: number
}

export type ExpertConsultation = {
  _id: string
  partnerId?: string
  title?: string
  topics?: ExpertConsultationTopic[]
  sessionOutline?: string
  whoItsFor?: string
  languages?: string[]
  mode?: string
  hasPreSessionRequirement?: boolean
  preSessionRequirement?: string
  hasPostSessionMessage?: boolean
  postSessionMessage?: string
  hasFollowUp?: boolean
  followUpDays?: number
  pricingOptions?: ExpertConsultationPricing[]
  status?: string
  serviceStatus?: string
  isSuspend?: boolean
  createdAt?: string
  updatedAt?: string
}

export type ExpertConsultationsResponse = {
  success?: boolean
  data: ExpertConsultation[]
}

export type ExpertServiceCategory = {
  _id: string
  name: string
}

export type ExpertServiceSubCategory = {
  _id: string
  name: string
}

export type ExpertService = {
  _id: string
  title?: string
  category?: ExpertServiceCategory
  subCategory?: ExpertServiceSubCategory[]
  pricingType?: string
  status?: string
  isDeleted?: boolean
  isSuspend?: boolean
  submittedAt?: string
  priceStarts?: number
  images?: string[]
}

export type ExpertServicesResponse = {
  success?: boolean
  data: ExpertService[]
  pagination?: {
    total: number
    page: number
    limit: number
    pages: number
  }
}

export type ServiceAnalyticsMetric = {
  value?: number
  label?: string
  avgMs?: number | null
  sampleSize?: number
  available?: boolean
  note?: string
}

export type ExpertAnalyticsData = {
  partnerUserId?: string
  expertId?: string
  revenueGrowthRate?: number
  profileSummary?: {
    name?: string
    email?: string
    phone?: string
    expertType?: string
    kycStatus?: string
    accountStatus?: string
    lastActiveAt?: string
    customUrl?: string
    profession?: string
    experience?: string
    avatarUrl?: string | null
    role?: string
    badge?: string
  }
  serviceAnalytics?: {
    eventsHosted?: ServiceAnalyticsMetric
    totalAttendees?: ServiceAnalyticsMetric
    repeatAttendees?: ServiceAnalyticsMetric
    upcomingEvents?: ServiceAnalyticsMetric
    eventCompletionRate?: ServiceAnalyticsMetric
    avgResponseTime?: ServiceAnalyticsMetric
    avgCompletionSpeed?: ServiceAnalyticsMetric
    eventsRejected?: ServiceAnalyticsMetric
    eventsSuspended?: ServiceAnalyticsMetric
  }
  visibilityMetrics?: {
    timeRange?: string
    profileViews?: { count?: number; trendPercentage?: number; available?: boolean }
    totalClicks?: { count?: number; trendPercentage?: number; available?: boolean }
    repeatClientRate?: { percentage?: number; trendPercentage?: number; available?: boolean }
    orderCompletionRate?: { percentage?: number; trendPercentage?: number; available?: boolean }
  }
  marketplacePerformance?: {
    servicesListed?: number
    activeServices?: number
    proposalsCreated?: number
    ordersCompleted?: number
    ordersInProgress?: number
    terminatedOrders?: number
    conversionRate?: number
  }
  listingOverview?: {
    servicesListed?: number
    consultationsListed?: number
    ordersCompleted?: number
    ordersInProgress?: number
    terminatedOrders?: number
    proposalsCreated?: number
    totalOrders?: number
    totalEarnings?: number
  }
  ratingsSummary?: {
    average?: number
    count?: number
    available?: boolean
    star5?: number
    star4?: number
    star3?: number
    star2?: number
    star1?: number
    promoters?: number
    passives?: number
    detractors?: number
  }
  nps?: {
    score?: number | null
    available?: boolean
    promoters?: number
    passives?: number
    detractors?: number
  }
  charts?: {
    revenueTrend?: Array<{ date?: string; month?: string; revenue?: number }>
    conversionFunnel?: {
      profileViews?: number
      listingViews?: number
      ordersCount?: number
      dropOffProfileToListing?: number
      dropOffListingToOrder?: number
    }
    mostActiveTime?: Array<{ day?: string; hours?: number; count?: number }>
    topClientViewsByLocation?: Array<{ location?: string; views?: number }>
    topClientViewsByProfession?: Array<{ profession?: string; views?: number }>
    ordersByMembershipType?: Array<{ tier?: string; count?: number }>
    revenueByListings?: Array<{ listingName?: string; revenue?: number }>
    servicePerformance?: Array<{ serviceName?: string; ordersCount?: number }>
  }
}

export type ExpertAnalyticsResponse = {
  success?: boolean
  message?: string
  data: ExpertAnalyticsData
}

export type PartnerInsightReview = {
  id: string
  rating: number
  text: string
  userName: string
  userAvatarUrl?: string | null
  engagementType?: string
  engagementId?: string
  sessionId?: string
  title?: string
  createdAt?: string
  relativeLabel?: string | null
}

export type PartnerInsightsData = {
  partnerUserId?: string
  venueId?: string
  ratingsSummary: {
    average: number
    count: number
    available: boolean
  }
  reviews: PartnerInsightReview[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  metrics?: {
    nps?: { score: number | null; available: boolean }
  }
}

export type PartnerInsightsResponse = {
  success?: boolean
  message?: string
  data: PartnerInsightsData
}
