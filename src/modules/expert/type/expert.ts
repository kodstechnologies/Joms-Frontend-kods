export interface Expert {
  id: string
  expertId: string
  name: string
  email: string
  profession?: string | null
  serviceType: string | null
  venueKycId?: string | null
  venueKycStatus?: string | null
  venueBankingStatus?: string | null
  status: string
  reason?: string | null
  createdAt: string
  lastActive: string | null
  reportedAt?: string | null
  deletedAt?: string | null
}
export interface ExpertResponse {
  data: Expert[]
  meta?: {
     counts: {
    approvalsPending: number
    reportedExperts: number
    suspendedExperts: number
    deletedExperts: number
  }
    pagination: {
      page: number
      limit: number
      total: number
      pages: number
    }
  }
}