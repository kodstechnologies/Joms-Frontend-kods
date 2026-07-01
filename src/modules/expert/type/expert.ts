export interface Expert {
  id: string
  expertId: string
  name: string
  email: string
  serviceType: string | null
  status: string
  createdAt: string
  lastActive: string | null
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