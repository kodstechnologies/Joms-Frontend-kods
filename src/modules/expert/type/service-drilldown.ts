export type ApiEnvelope<TData, TMeta = Record<string, unknown> | null> = {
  success: boolean
  message: string
  data: TData
  meta?: TMeta
}

export type PaginationMeta = {
  total: number
  page: number
  limit: number
  pages: number
}

export type ServiceExpertIdentity = {
  _id: string | null
  expertCode: string
  name: string | null
  email: string | null
  phone: string | null
  serviceType: string | null
  profession?: string | null
  avatarUrl?: string | null
}

export type ServicePricingTier = {
  name: string
  description: string
  price: number
  discountedPrice: number
  platformFee: number
  gstAmount: number
  estimatedEarnings: number
  timelineValue: number | null
  timelineUnit: string | null
  timelineLabel: string | null
}

export type ServicePricingBlock = {
  pricingType: 'fixed' | 'tiered' | 'custom' | null
  currency: string
  platformFeePercent?: number
  gstPercent?: number
  price?: number
  discountPercent?: number
  discountedPrice?: number
  platformFee?: number
  gstAmount?: number
  estimatedEarnings?: number
  timelineValue?: number
  timelineUnit?: string
  timelineLabel?: string | null
  durationType?: string
  durationLabel?: string
  startingFrom?: number
  minPrice?: number
  maxPrice?: number
  timelineFrom?: number
  timelineTo?: number
  tiers: ServicePricingTier[]
}

export type AdminServiceDetail = {
  _id: string
  partnerId: string
  serviceCode: string
  title: string
  description?: string
  deliverables?: string
  images: string[]
  category?: { _id: string; name: string }
  subCategory?: { _id: string; name: string }[]
  pricingType: 'fixed' | 'tiered' | 'custom' | null
  status: string
  displayStatus: string
  serviceStatus?: string
  isSuspend?: boolean
  isPaused?: boolean
  isFlagged?: boolean
  flagDetails?: {
    reason: string | null
    adminNotes: string | null
    flaggedAt: string | null
    flaggedByName: string | null
  }
  pauseDetails?: {
    selectedReasons: string[]
    reasonDetails: string | null
    adminNotes: string | null
    pausedAt: string | null
  }
  changeRequest?: {
    isOpen: boolean
    note: string | null
    selectedReasons: string[]
    requestedAt: string | null
    requestedByName: string | null
  }
  adminNote?: string | null
  submittedAt?: string | null
  approvedAt?: string | null
  createdAt: string
  updatedAt: string
  expert: ServiceExpertIdentity
  pricing: ServicePricingBlock
  suspension: {
    isSuspended: boolean
    selectedReasons?: string[]
    reasonDetails?: string | null
    adminNotes?: string | null
    startDate?: string | null
    endDate?: string | null
    suspendIndefinitely?: boolean
  }
  rejection: {
    isRejected: boolean
    rejectionReason?: string | null
    reasonFor?: string[]
    adminNote?: string | null
  }
}

export type ServiceRevision = {
  _id: string
  versionNumber: number
  action: string
  actionLabel: string
  outcome: 'approved' | 'rejected' | 'pending'
  statusBefore: string | null
  statusAfter: string | null
  raisedAt: string | null
  resolvedAt: string | null
  actorId: string | null
  actorName: string | null
  actorRole: string | null
  note: string | null
  reasonFor: string[]
  rejectionReason: string | null
  hasSnapshot: boolean
  createdAt: string
}

export type ServiceRevisionSnapshot = Omit<ServiceRevision, 'hasSnapshot' | 'outcome'> & {
  snapshot: Record<string, unknown> | null
}

export type ServiceMetric = {
  value: number | null
  notInstrumented: boolean
  reason?: string
  unit?: string
  basis?: string
  sampleSize?: number
}

export type ServiceKpi = {
  id: string
  label: string
  value: number | null
  deltaPercent: number | null
  format: 'number' | 'rating' | 'currency' | 'percent'
}

export type ServiceChart<TRow> = {
  notInstrumented: boolean
  reason?: string
  data: TRow[]
}

export type ServicePerformance = {
  service: {
    _id: string
    title: string
    pricingType: string | null
    status: string
    partnerId: string
    category: string | null
    createdAt: string
  }
  kpis: ServiceKpi[]
  metrics: Record<string, ServiceMetric>
  charts: {
    revenueTrend: ServiceChart<{ month: string; revenue: number; orders: number }>
    ordersTrend: ServiceChart<{
      month: string
      total: number
      completed: number
      terminated: number
    }>
    orderStatusDistribution: ServiceChart<{ status: string; count: number }>
    bookingConversionFunnel: ServiceChart<{ stage: string; count: number }>
    ratingsDistribution: ServiceChart<{ stars: number; count: number }>
    refundTrend: ServiceChart<{ month: string; amount: number; count: number }>
    sourceDistribution: ServiceChart<{ source: string; count: number }>
    topClientLocations: ServiceChart<{ location: string; count: number }>
  }
  reviews: {
    average: number | null
    count: number
    recent: {
      _id: string
      rating: number
      text: string
      userName: string
      createdAt: string
      engagementId: string
    }[]
  }
  generatedAt: string
}

export type ServiceOrderRow = {
  id: string
  engagementType: 'order' | 'proposal'
  orderId: string
  serviceId: string | null
  partnerId: string
  clientId: string
  clientName: string | null
  clientPhone: string | null
  clientSource: string | null
  clientLocation: string | null
  title: string
  packageName: string | null
  serviceImage: string | null
  pricingType: string
  pricingLabel: string
  orderStatus: string
  paymentStatus: string
  workStatus: string | null
  orderedAt: string
  startDate: string | null
  endDate: string | null
  completedAt: string | null
  deliveryDuration: string | null
  price: number
  currency: string
  paymentId: string | null
  paymentMethod: string | null
  transactionId: string | null
  paidAt: string | null
  totalPaid: number | null
  rating: number | null
  reviewText: string | null
  payoutStatus: string | null
  payoutStatusLabel: string | null
  payoutAmount: number | null
  disputed: boolean
  disputeId: string | null
  disputeStatus: string | null
  disputeRaisedAt: string | null
  disputeEndDate: string | null
  disputePeriodLapsed: boolean | null
  supportTicketId: string | null
  refundIssued: boolean
  refundAmount: number | null
  refundStatus: string | null
  refundedAt: string | null
  threadId: string | null
  quotationId: string | null
  proposalId: string | null
  hasMilestones: boolean
}

export type ServiceOrdersResponse = {
  service: {
    _id: string
    title: string
    pricingType: string | null
    partnerId: string
    category?: string | null
    image?: string | null
  }
  orders: ServiceOrderRow[]
  total: number
  page: number
  limit: number
  pages: number
  filterOptions: {
    orderStatus: string[]
    paymentMethod: string[]
    refundStatus: string[]
    clientSource: string[]
    clientLocation: string[]
  }
  notInstrumented: Record<string, string>
}

export type ServiceOrdersQuery = {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortDir?: 'asc' | 'desc'
  dateFrom?: string
  dateTo?: string
  orderStatus?: string
  paymentMethod?: string
  refundStatus?: string
  pricingType?: string
  disputeStatus?: string
  payoutStatus?: string
  clientSource?: string
  minRating?: string
  maxRating?: string
  minPrice?: string
  maxPrice?: string
}

export type OrderTimelineStep = {
  label: string
  at: string | null
  complete: boolean
  detail?: string | null
  icon?: string | null
  outcome?: string
}

export type OrderMilestone = {
  _id: string
  index: number
  title: string
  description?: string | null
  goal?: string | null
  price: number
  timeline: string | null
  status: string
  statusLabel: string
  targetDate: string | null
  completedAt?: string | null
  approvedAt?: string | null
  advanceAmount: number | null
  paymentRequestId?: string | null
  paymentStatus: string | null
  paidAt: string | null
}

export type AdminOrderDetail = {
  engagementType: 'order' | 'proposal'
  referenceType: string
  _id: string
  serviceId: string | null
  client: {
    userId: string
    name: string | null
    phone: string | null
    role?: string | null
    avatarUrl?: string | null
  }
  expert: ServiceExpertIdentity | null
  engagement: {
    title: string
    description: string | null
    inclusions: string | null
    exclusions?: string | null
    nextSteps?: string | null
    additionalNotes?: string | null
    category: string | null
    packageName: string | null
    serviceImage?: string | null
    pricingType: string
    pricingLabel: string
    price: number
    totalPrice?: number
    discountPercent?: number
    allottedFund: number
    currency: string
    timeline: string | null
    validTill?: string | null
    paymentStatus: string
    paymentStatusLabel: string
    workStatus: string | null
    workStatusLabel: string | null
    currentPhase?: string | null
    proposalStatus?: string
    startDate: string | null
    endDate: string | null
    orderedAt: string
  }
  milestones: OrderMilestone[]
  timeline: OrderTimelineStep[]
  disputes: {
    _id: string
    scope: string
    milestoneIndex?: number | null
    milestoneTitle?: string
    status: string
    reason: string
    raisedBy: { id: string; userType: string; name: string }
    createdAt: string
    resolvedAt: string | null
  }[]
  links: {
    threadId: string | null
    quotationId: string | null
    proposalId: string | null
    serviceTitle: string
  }
  paymentReference: { referenceType: string; referenceId: string }
  review: { rating: number; text: string; createdAt: string } | null
}

export type PaymentBreakdown = {
  servicePrice: number
  discountPercent: number | null
  discountAmount: number
  discountedPrice: number
  platformFee: number
  platformFeePercent: number | null
  taxAmount: number
  taxRatePercent: number | null
  taxType: string | null
  totalPaid: number
}

export type PaymentMilestoneCard = {
  id: string
  milestoneIndex: number
  title: string
  status: string
  clientPaid: number
  platformCommission: number
  taxAmount: number
  finalPayoutAmount: number
  startDate: string | null
  endDate: string | null
  paymentTimeline: {
    milestoneFunded: string | null
    milestoneApprovedByUser: string | null
    payoutReleasedToExpert: string | null
    milestoneCompleted: string | null
  }
}

export type ReferencePaymentDetail = {
  referenceType: string | null
  referenceId: string
  currency: string
  breakdown: PaymentBreakdown
  payments: {
    _id: string
    orderId: string
    status: string
    statusLabel: string | null
    amount: number
    paymentMethod: string | null
    transactionId: string | null
    pricingType: string | null
    createdAt: string
  }[]
  payouts: {
    payoutId: string
    status: string
    statusLabel: string | null
    netPayable: number
    paidAt: string | null
  }[]
  refunds: { refundId: string; status: string; amount: number; processedAt: string | null }[]
  invoice: { invoiceNumber: string; total: number; pdfUrl?: string | null } | null
  milestones: PaymentMilestoneCard[]
}

export type AdminOrderPayment = {
  service: {
    _id: string | null
    serviceCode: string | null
    title: string | null
    category: string | null
    pricingType: string | null
    image: string | null
  }
  order: {
    _id: string
    engagementType: 'order' | 'proposal'
    title: string
    pricingType: string
    pricingLabel: string
    price: number
    currency: string
    orderedAt: string
    paymentStatus: string
    workStatus: string | null
  }
  client: {
    userId: string
    name: string | null
    phone: string | null
    role?: string | null
    avatarUrl?: string | null
  }
  expert: ServiceExpertIdentity | null
  milestones: OrderMilestone[]
  payment: ReferencePaymentDetail | null
}

export type AdminQuotation = {
  _id: string
  itemType: string
  itemId: string
  serviceTitle: string
  title: string
  category: string
  requirements: string
  duration: string
  budget: { min: number; max: number; currency: string }
  status: string
  declinedAt: string | null
  declineReason: string | null
  requestedAt: string
  requester: {
    userId: string
    name: string | null
    phone: string | null
    role?: string | null
    avatarUrl?: string | null
  }
  expert: ServiceExpertIdentity | null
  links: { threadId: string | null; proposalId: string | null }
}

export type AdminProposal = {
  _id: string
  serviceId: string | null
  serviceTitle: string
  title: string
  category: string | null
  deliverables: string
  benefits: string[]
  exclusions: string | null
  nextSteps: string | null
  additionalNotes: string | null
  paymentType: 'one_time' | 'milestone'
  totalPrice: number
  discountPercent: number
  payableAmount: number
  currency: string
  timeline: string | null
  validTill: string
  status: string
  sentAt: string | null
  acceptedAt: string | null
  rejectedAt: string | null
  withdrawnAt: string | null
  workStatus: string | null
  projectEndStatus: string | null
  milestones: OrderMilestone[]
  client: {
    userId: string
    name: string | null
    phone: string | null
    role?: string | null
    avatarUrl?: string | null
  }
  expert: ServiceExpertIdentity | null
  links: { threadId: string | null; quotationId: string | null }
}

export type AdminChatFlag = {
  isFlagged: boolean
  flaggedByName: string | null
  flaggedAt: string | null
  reason: string | null
}

export type AdminChatThread = {
  _id: string
  participants: {
    partner: { id: string; name: string | null }
    user: { id: string; name: string | null }
  }
  lastMessage: { text: string; at: string | null; senderType: string | null }
  startedAt: string
  messageCount: number
  flaggedCount: number
  adminFlag: AdminChatFlag
  createdAt: string
  updatedAt: string
}

export type AdminChatMessage = {
  _id: string
  threadId: string
  senderId: string
  senderType: 'partner' | 'user'
  senderName: string | null
  text: string
  messageType: string
  fileUrl: string | null
  fileName: string | null
  mimeType: string | null
  isDeleted: boolean
  isEdited: boolean
  createdAt: string
  adminFlag: AdminChatFlag
}

export type AdminChatMessagesResponse = {
  messages: AdminChatMessage[]
  total: number
  page: number
  limit: number
  pages: number
}

export type AdminVaultFile = {
  _id: string
  fileName: string
  fileUrl: string
  mimeType: string | null
  messageType: string
  uploadedBy: 'client' | 'expert'
  uploaderId: string
  uploaderName: string | null
  uploadedAt: string
  isFlagged: boolean
}

export type AdminChatVault = {
  threadId: string
  clientFiles: AdminVaultFile[]
  expertFiles: AdminVaultFile[]
  total: number
}

export type ServiceSupportTicket = {
  _id: string
  ticketNumber: string
  subject: string
  description?: string
  status: string
  priority: string
  category?: string
  module?: string | null
  issueType?: string | null
  reporterName?: string
  reporterType?: string
  assignedToName?: string
  isEscalated: boolean
  createdAt: string
  updatedAt: string
  resolvedAt?: string | null
  closedAt?: string | null
  zohoWebUrl?: string | null
}
