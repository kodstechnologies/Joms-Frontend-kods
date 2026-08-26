export interface Expert {
  id: string
  expertId: string
  name: string
  email: string | null
  phone?: string | null
  profession?: string | null
  category?: string | null
  serviceType: string | null
  venueKycId?: string | null
  venueKycStatus?: string | null
  venueBankingStatus?: string | null
  status: string
  membershipType?: string | null
  createdBy?: string | null
  designation?: string | null
  city?: string | null
  state?: string | null
  yearsOfExperience?: number | null
  digilockerVerification?: string | null
  digilockerStatus?: string | null
  kycStatus?: string | null
  phoneVerification?: string | null
  emailVerification?: string | null
  complianceStatus?: string | null
  averageRating?: number | null
  totalClientsServed?: number | null
  totalEarnings?: number | null
  totalServicesListed?: number | null
  totalConsultationsListed?: number | null
  consultationListed?: string | null
  microWebsiteUrl?: string | null
  totalOrdersCompletedServices?: number | null
  ongoingServiceOrders?: number | null
  completedConsultationBookings?: number | null
  scheduledConsultationBookings?: number | null
  totalTicketsDisputes?: number | null
  openTicketsDisputes?: number | null
  resolvedTickets?: number | null
  repeatClients?: number | null
  repeatClientPercent?: number | null
  quotationsReceived?: number | null
  proposalsCreated?: number | null
  proposalsAccepted?: number | null
  proposalsDeclined?: number | null
  customOrdersCreated?: number | null
  completedCustomOrders?: number | null
  clientSatisfactionScore?: number | null
  netPromoterScore?: number | null
  reason?: string | null
  adminNotes?: string | null
  deactivationType?: string | null
  deletedBy?: string | null
  blockedUntil?: string | null
  blockedReason?: string | null
  blockedAt?: string | null
  createdAt: string
  lastActive: string | null
  lastUpdatedAt?: string | null
  submittedAt?: string | null
  approvalStage?: string | null
  approvalStatus?: string | null
  gstStatus?: string | null
  undertakingStatus?: string | null
  missingDocuments?: string | null
  assignedReviewer?: string | null
  slaDaysPending?: number | null
  priority?: string | null
  escalationStatus?: string | null
  suspensionStatus?: string | null
  suspensionType?: string | null
  suspensionReason?: string | null
  suspendedBy?: string | null
  suspendedAt?: string | null
  suspensionUntil?: string | null
  suspensionDuration?: string | null
  linkedReportCases?: number | null
  activeOrdersImpacted?: number | null
  scheduledConsultations?: number | null
  micrositeStatus?: string | null
  lastCommunication?: string | null
  reinstatementEligible?: string | null
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
      activeExperts: number
      totalExperts: number
    }
    pagination: {
      page: number
      limit: number
      total: number
      pages: number
    }
  }
}
