import type {
  PaginationMeta,
  PaymentBreakdown,
  ServiceExpertIdentity,
  ServiceKpi,
  ServiceMetric,
} from './service-drilldown'

export type ConsultationPricingOption = {
  durationMinutes: number
  pricingType: string
  price: number
}

export type AdminConsultationDetail = {
  _id: string
  partnerId: string
  title: string
  topics: { _id: string; name: string }[]
  sessionOutline: string
  sessionOutlineText: string
  benefitsText: string
  whoItsFor: string
  languages: string[]
  mode?: string | null
  hasPreSessionRequirement?: boolean
  preSessionRequirement?: string
  hasPostSessionMessage?: boolean
  postSessionMessage?: string
  hasFollowUp?: boolean
  followUpDays?: number | null
  pricingOptions: ConsultationPricingOption[]
  status: string
  displayStatus: string
  serviceStatus?: string
  isSuspend?: boolean
  isPaused?: boolean
  isFlagged?: boolean
  adminNote?: string | null
  category: string
  expert: ServiceExpertIdentity
  flagDetails?: { reason: string | null; adminNotes: string | null; flaggedByName?: string | null }
  changeRequest?: { isOpen: boolean; note: string | null }
  updatedAt?: string
}

export type ConsultationPerformance = {
  consultationId: string
  title: string
  kpis: ServiceKpi[]
  metrics: Record<string, ServiceMetric>
  generatedAt: string
}

export type ConsultationBookingRow = {
  id: string
  bookingId: string
  consultationId: string
  partnerId: string
  clientId: string | null
  clientCode: string | null
  clientName: string | null
  title: string
  status: string
  paymentStatus: string
  durationMinutes: number | null
  durationLabel: string | null
  startDate: string | null
  endDate: string | null
  bookedAt?: string | null
  lastUpdatedAt?: string | null
  clientSource?: string | null
  price: number
  currency: string
  threadId: string | null
  paymentId?: string | null
  paymentMethod?: string | null
  transactionId?: string | null
  refundIssued?: boolean
  refundRequested?: boolean
  refundId?: string | null
  refundAmount?: number | null
  refundStatus?: string | null
  refundedAt?: string | null
}

export type ConsultationBookingsResponse = {
  items: ConsultationBookingRow[]
  pagination: PaginationMeta
}

export type AdminConsultationBooking = {
  _id: string
  consultationId: string | null
  title: string
  category: string
  startAt: string
  endAt: string
  durationMinutes: number | null
  durationLabel: string | null
  status: string
  paymentStatus: string
  price: number
  currency: string
  notes: string | null
  overview: string | null
  highlights: string[]
  threadId: string | null
  client: {
    userId: string | null
    name: string | null
    phone: string | null
    email: string | null
    avatarUrl: string | null
    role: string
    clientCode: string | null
  }
  expert: ServiceExpertIdentity | null
  links: { threadId: string | null; serviceTitle: string }
}

export type AdminConsultationPayment = {
  consultation: { title: string; category: string }
  booking: {
    _id: string
    startAt: string
    durationLabel: string | null
    paymentStatus: string
    price: number
    currency: string
  }
  client: AdminConsultationBooking['client']
  expert: ServiceExpertIdentity | null
  payment: {
    currency?: string
    breakdown?: PaymentBreakdown
    payments?: {
      _id: string
      status: string
      paymentMethod: string | null
      transactionId: string | null
      amount: number
    }[]
  } | null
}
