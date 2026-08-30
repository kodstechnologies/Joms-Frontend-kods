export type SubscriptionStatus = 'active' | 'paused' | 'cancelled' | 'expired' | 'suspended'

export type MembershipSubscription = {
  _id: string
  subscriptionId: string
  partnerId: string
  partnerName: string
  userId?: string | null
  username?: string | null
  membershipPlanId:
    | string
    | {
        _id: string
        planId: string
        planName: string
        type: string
        icon?: string | null
        pricing?: Array<{ billingCycleName: string; price: number; discount: number }>
        features?: import('./membership').MembershipFeatures
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
  source?: string | null
  upgradedBy?: 'partner' | 'admin' | null
  previousMembership?: {
    planId?: string
    planName?: string
    membershipPlanId?: string
  }
  previousPlanName?: string | null
  paymentStatus?: string | null
  paymentMethod?: string | null
  transactionId?: string | null
  couponCode?: string | null
  discountAmount?: number | null
  lastRenewedAt?: string | null
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
  pauseInfo?: {
    fromDate?: string
    toDate?: string | null
    reasons?: string[]
    adminNotes?: string
    pausedAt?: string
    pausedBy?: string
  }
  paymentInfo?: {
    paymentId?: string
    orderId?: string
    razorpayOrderId?: string
    razorpayPaymentId?: string
    paymentMethod?: string
    lastPaymentAt?: string
    amount?: number
  }
  createdAt?: string
  updatedAt?: string
  updatedBy?: string | null
  isExpired?: boolean
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
        paused: number
        cancelled: number
        expired: number
        suspended: number
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

export type PauseSubscriptionPayload = CancelSubscriptionPayload

export type ExtendMembershipSuspensionPayload = {
  startDate: string
  endDate: string
  adminNotes?: string
  updatedBy?: string
}
