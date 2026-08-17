export interface PayoutTimeline {
  milestoneFunded?: string
  milestoneApprovedByUser?: string
  payoutReleasedToExpert?: string
  milestoneCompleted?: string
}

export interface PayoutMilestone {
  id: string
  title: string
  clientPaid: number
  platformCommission: number
  taxAmount: number
  finalPayoutAmount: number
  startDate: string
  endDate: string
  paymentTimeline: PayoutTimeline
}

export interface PayoutItem {
  id: string
  payoutId: string
  bookingId: string
  serviceTitle: string
  serviceType: 'Consultation' | 'Fixed' | 'Custom' | 'Tiered' | string
  status: string
  itemId?: string
  consultationId?: string | null
  serviceId?: string | null
  milestoneId?: string | null
  consultationDate?: string | null
  serviceStartDate?: string | null
  serviceEndDate?: string | null
  milestoneStartDate?: string | null
  milestoneEndDate?: string | null
  milestoneCompleted?: string | null
  payoutToExpert: number
  payoutDate: string
  creditedOn?: string
  clientName: string
  clientId: string
  expertName: string
  expertId: string
  serviceCategory: string
  consultationFee?: number
  totalMilestoneFee?: number | null
  platformFee?: number
  platformFeePercent?: number | null
  taxAmount?: number
  finalPayoutAmount: number
  paymentMethod: string
  transactionId: string
  paymentStatus: string
  payoutStatus: string
  payoutIdFull?: string
  creditedOnFull?: string
  settlementPath?: string | null
  financeStatus?: string | null
  milestones?: PayoutMilestone[]
}

export interface PayoutHistoryResponse {
  success?: boolean
  partnerId?: string
  expertName?: string
  expertId?: string
  summary?: {
    totalPayoutsCount: number
    totalPaidOutAmount: number
  }
  items?: PayoutItem[]
  data?: {
    partnerId?: string
    expertName?: string
    expertId?: string
    summary?: {
      totalPayoutsCount: number
      totalPaidOutAmount: number
    }
    items?: PayoutItem[]
  }
}
