export type ReferralStatus = 'pending' | 'accepted' | 'active' | 'expired'

export type ExpertInvite = {
  _id: string
  inviteId: string
  invitedExpertName: string
  email?: string | null
  phone?: string | null
  status: ReferralStatus
  invitedThrough: string
  inviteStatus: 'individual' | 'bulk'
  inviteLink: string
  invitedBy: string
  message: string
  createdAt: string
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
  counts: {
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
  invitedBy?: string
  invitedThrough?: string
}

export type BulkExpertInvitePayload = {
  message: string
  recipients: Array<{ name: string; email?: string; phone?: string }>
  invitedBy?: string
}

export type UpdateRecipientPayload = {
  name?: string
  email?: string
  phone?: string
  message?: string
}
