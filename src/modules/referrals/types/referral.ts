export type ReferralStatus = 'pending' | 'accepted' | 'rejected' | 'expired'

export type ExpertInvite = {
  _id: string
  referralId: string
  referrerId?: string | null
  referrerName: string
  referrerUserId?: string | null
  referrerType?: string | null
  referredExpertName: string
  referredUserName?: string | null
  referredUserId?: string | null
  referredEntityType?: string | null
  referredExpertEmail?: string | null
  referredExpertPhone?: string | null
  sourceType: string
  sourceTypeRaw?: string | null
  status: ReferralStatus
  statusLabel?: string | null
  goalProgress: {
    signedUpCount: number
    maxReferrals: number
  }
  goalProgressPercent?: number | null
  rewardStatus?: string | null
  rewardType?: string | null
  rewardValue?: number | null
  referredAt?: string | null
  signupDate?: string | null
  goalCompletedAt?: string | null
  referralExpiryDate?: string | null
  lastActivity?: string | null
  message: string
  referralType: 'manual' | 'bulk'
  inviteLink?: string | null
  referralCode?: string | null
  createdAt: string
  expiresAt?: string | null
  acceptedAt?: string | null
  updatedAt?: string | null
  delivery?: {
    emailSent: boolean
    smsSent: boolean
    note?: string
    lastAttemptAt?: string
  }
}

export type ReferralMetrics = {
  totalReferralsGenerated: number
  userToUserReferrals: number
  platformReferredUsers: number
  platformReferredExperts: number
  successfulReferrals: number
  referralAcceptanceRate: number
  platformReferralSuccessRate: number
  referralRetentionRate: number
  referralExpiryRate: number
  topReferralSource: string
  totalReferralGoalsCompleted: number
  membershipsUnlocked: number | null
  averageReferralsPerUser: number
  averageDaysToReachGoal: number | null
  signupsViaReferralCode: number
  pendingRewards: number | null
  rewardsDistributed: number | null
  rewardDistributionRate: number | null
  // Legacy optional fields
  userToUserShareRate?: number
  adminSendSuccessRate?: number
  onboardingRate?: number
  conversionRate?: number
  topSourcePerformance?: string
  totalGoalsCompleted?: number
  vsLastMonthPercent?: number
  trends?: Record<string, { direction: 'up' | 'down'; percentage: number; label?: string }>
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
