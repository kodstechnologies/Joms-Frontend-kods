export type ReferralStatus = 'pending' | 'accepted' | 'rejected' | 'expired'

export type ExpertInvite = {
  _id: string
  referralId: string
  referrerId?: string | null
  referrerName: string
  referredExpertName: string
  referredExpertEmail?: string | null
  referredExpertPhone?: string | null
  sourceType: 'Expert Referral' | 'Platform Referral'
  status: ReferralStatus
  goalProgress: {
    signedUpCount: number
    maxReferrals: number
  }
  message: string
  referralType: 'manual' | 'bulk'
  inviteLink?: string | null
  referralCode?: string | null
  createdAt: string
  expiresAt?: string | null
  delivery?: {
    emailSent: boolean
    smsSent: boolean
    note?: string
    lastAttemptAt?: string
  }
}

export type ReferralMetrics = {
  totalReferralsGenerated: number
  userToUserShareRate: number
  adminSendSuccessRate: number
  referralAcceptanceRate: number
  onboardingRate: number
  conversionRate: number
  referralExpiryRate: number
  topSourcePerformance: string
  totalGoalsCompleted: number
  membershipsUnlocked: number
  averageReferralsPerUser: number
  averageDaysToReachGoal: number
  counts?: {
    expertInvites: number
    pendingExpertInvites: number
    activeExpertInvites: number
  }
}

export type ExpertInvitePayload = {
  name: string
  email?: string
  phone?: string
  message: string
  referrerId?: string
  referrerName?: string
}

export type BulkExpertInvitePayload = {
  message: string
  recipients: Array<{ name: string; email?: string; phone?: string }>
  fileName?: string
  referrerId?: string
  referrerName?: string
}
