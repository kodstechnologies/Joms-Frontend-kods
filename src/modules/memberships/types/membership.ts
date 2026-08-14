export type MembershipType = 'user' | 'expert'

export type MembershipStatus = 'active' | 'inactive' | 'paused' | 'cancelled' | 'deleted'

export type MembershipPricing = {
  billingCycleName: string
  price: number
  discount: number
  finalPrice?: number
}

export type MembershipFeatures = {
  accessToBasicNetworkingFeatures: boolean
  joinCommunities: {
    enabled: boolean
    count: number
  }
  platformHostedEvents: {
    enabled: boolean
    count: number
  }
  profileCustomization: boolean
  dedicatedAccountManager: boolean
  customFeatures?: string[]
}

export type SubscriptionStats = {
  total: number
  weekly: number
  threeMonths: number
  sixMonths: number
  byBillingCycle: Record<string, number>
}

export type MembershipPlan = {
  _id: string
  planId: string
  type: MembershipType
  planName: string
  icon: string | null
  pricing: MembershipPricing[]
  features: MembershipFeatures
  trialPeriodDays: number
  enableAutoRenew: boolean
  allowPlanUpgrades: boolean
  allowDowngradePlans: boolean
  status: MembershipStatus
  version: number
  validity?: {
    startDate?: string | null
    endDate?: string | null
  }
  pauseInfo?: {
    fromDate?: string | null
    toDate?: string | null
    reasons?: string[]
    adminNotes?: string | null
  }
  updatedBy?: string | null
  subscriptionStats?: SubscriptionStats
  createdAt?: string
  updatedAt?: string
}

export type MembershipListMeta = {
  page: number
  limit: number
  total: number
  totalPages: number
  counts: {
    active: number
    inactive: number
    paused: number
    cancelled: number
    deleted: number
    total: number
  }
}

export type MembershipListResponse = {
  success: boolean
  message: string
  data: {
    memberships: MembershipPlan[]
    meta: MembershipListMeta
  }
}

export type MembershipStatsResponse = {
  success: boolean
  message: string
  data: {
    totalPlans: number
    totalActivePlans: number
    expiredMemberships: number
    totalRevenue: number
    renewalRate: number
    mostSubscribedPlan: string | null
    counts: MembershipListMeta['counts']
    typeCounts: {
      user: number
      expert: number
    }
  }
}

export type MembershipDetailResponse = {
  success: boolean
  message: string
  data: MembershipPlan
}

export type CreateMembershipPayload = {
  type: MembershipType
  planName: string
  pricing: MembershipPricing[]
  features: MembershipFeatures
  trialPeriodDays?: number
  enableAutoRenew?: boolean
  allowPlanUpgrades?: boolean
  allowDowngradePlans?: boolean
  updatedBy?: string
  icon?: File | null
}

export type PauseMembershipPayload = {
  fromDate: string
  toDate: string
  reasons: string[]
  adminNotes?: string
  updatedBy?: string
}

export type ResumeMembershipPayload = {
  adminNotes?: string
  updatedBy?: string
}

export type DeleteMembershipPayload = {
  reasons: string[]
  adminNotes?: string
  updatedBy?: string
}

export type SetValidityPayload = {
  startDate: string
  endDate: string
  updatedBy?: string
}
