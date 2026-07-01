export type SubscriptionStatus = 'active' | 'expired'

export type MembershipSubscription = {
  _id: string
  subscriptionId: string
  partnerId: string
  partnerName: string
  membershipPlanId: string | {
    _id: string
    planId: string
    planName: string
    type: string
    pricing?: Array<{ billingCycleName: string; price: number; discount: number }>
  }
  planId: string
  planName: string
  billingCycleName: string
  purchasedPrice: number
  autoRenew: boolean
  status: SubscriptionStatus
  startedAt: string
  expiresAt: string
  nextBillingDate?: string | null
  sourceApp: string
  upgradedBy?: 'partner' | 'admin' | null
  previousMembership?: {
    planId?: string
    planName?: string
    membershipPlanId?: string
  }
  actionHistory?: Array<{
    action: string
    fromPlanName?: string
    toPlanName?: string
    billingCycleName?: string
    reasons?: string[]
    adminNotes?: string
    performedBy?: string
    performedAt?: string
  }>
  cancelInfo?: {
    reasons?: string[]
    adminNotes?: string
    cancelledAt?: string
    cancelledBy?: string
  }
  createdAt?: string
  updatedAt?: string
  updatedBy?: string | null
}

export type SubscriptionListResponse = {
  success: boolean
  message: string
  data: {
    subscriptions: MembershipSubscription[]
    meta: {
      page: number
      limit: number
      total: number
      totalPages: number
      counts: {
        active: number
        expired: number
        total: number
      }
    }
  }
}

export type SubscriptionDetailResponse = {
  success: boolean
  message: string
  data: MembershipSubscription
}

export type BuyMembershipPayload = {
  membershipPlanId: string
  billingCycleName: string
  autoRenew?: boolean
}

export type ChangePlanPayload = {
  newMembershipPlanId: string
  billingCycleName?: string
  reasons: string[]
  adminNotes?: string
  updatedBy?: string
}

export type ExtendSubscriptionPayload = {
  endDate: string
  reasons: string[]
  adminNotes?: string
  updatedBy?: string
}

export type CancelSubscriptionPayload = {
  reasons: string[]
  adminNotes?: string
  fromDate?: string
  toDate?: string
  updatedBy?: string
}
