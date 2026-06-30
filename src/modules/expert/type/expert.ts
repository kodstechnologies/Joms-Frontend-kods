export interface Expert {
  id: string
  expertId: string
  name: string
  email: string
  profession: string
  serviceType: string
  reason:string
  status: string
  createdAt: string
  lastActive: string
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