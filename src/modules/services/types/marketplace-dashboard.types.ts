// ─── Filter params ────────────────────────────────────────────────────────────

export type DateRangePreset =
  | 'today'
  | 'last7days'
  | 'last30days'
  | 'thisMonth'
  | 'quarter'
  | 'year'
  | 'custom'

export interface DashboardFilters {
  dateRange?: DateRangePreset
  startDate?: string
  endDate?: string
  category?: string
  subCategory?: string
  expertMembership?: 'free' | 'pro' | 'premium' | 'enterprise'
  expertCategory?: string
  orderStatus?:
    | 'payment_pending'
    | 'awaiting_first_message'
    | 'ongoing'
    | 'review_pending'
    | 'approved'
    | 'disputed'
    | 'terminated'
  bookingStatus?: 'scheduled' | 'completed' | 'cancelled'
  country?: string
  state?: string
  city?: string
  limit?: number
}

// ─── Shared ───────────────────────────────────────────────────────────────────

export interface MoneyValue {
  amount: number
  currency: string
  label: string
}

export interface DeliveryTime {
  days: number
  hours: number
  label: string
}

export interface OptedCategory {
  name: string
  count: number
}

// ─── Service KPIs ─────────────────────────────────────────────────────────────

export interface ServiceListingCounts {
  listed: number
  active: number
  paused: number
  archived: number
  deleted: number
  inReview: number
}

export interface ServiceOrderCounts {
  total: number
  completed: number
  inProgress: number
  disputed: number
  terminated: number
  completionRate: number
}

export interface ServiceRevenue {
  total: MoneyValue
  averagePerService: MoneyValue
  averageOrderValue: MoneyValue
}

export interface ServiceDelivery {
  averageTime: DeliveryTime
  onTimeDeliveryPct: number
}

export interface ServiceExpertStats {
  totalExperts: number
  avgServicesPerExpert: number
}

export interface ServiceKpis {
  listings: ServiceListingCounts
  orders: ServiceOrderCounts
  revenue: ServiceRevenue
  delivery: ServiceDelivery
  experts: ServiceExpertStats
  mostOptedCategory: OptedCategory | null
}

// ─── Consultation KPIs ────────────────────────────────────────────────────────

export interface ConsultationListingCounts {
  listed: number
  active: number
  paused: number
  archived: number
  deleted: number
}

export interface ConsultationBookingCounts {
  total: number
  completed: number
  scheduled: number
  cancelled: number
  completionRate: number
}

export interface ConsultationRevenue {
  total: MoneyValue
  averagePerBooking: MoneyValue
}

export interface ConsultationDuration {
  averageMinutes: number
  label: string
}

export interface ConsultationKpis {
  listings: ConsultationListingCounts
  bookings: ConsultationBookingCounts
  revenue: ConsultationRevenue
  duration: ConsultationDuration
  mostOptedCategory: OptedCategory | null
}

// ─── Summary ──────────────────────────────────────────────────────────────────

export interface DashboardSummary {
  totalListings: number
  totalServiceListings: number
  totalConsultationListings: number
  totalOrders: number
  totalBookings: number
  totalRevenue: MoneyValue
  overallCompletionRate: number
}

export interface DashboardFiltersApplied {
  dateRange: DateRangePreset
  startDate: string | null
  endDate: string | null
}

// ─── Chart Data ───────────────────────────────────────────────────────────────

export interface TrendPoint {
  date: string
  revenue?: number
  count?: number
  orders?: number
  bookings?: number
}

export interface CategoryPoint {
  name: string
  count: number
}

export interface StatusPoint {
  status: string
  count: number
}

export interface TopServicePoint {
  serviceId: string | null
  name: string
  category: string
  totalRevenue: number
  orderCount: number
}

export interface TopConsultationPoint {
  consultationId: string | null
  name: string
  category: string
  totalRevenue: number
  bookingCount: number
}

export interface RevenueSplit {
  services: number
  consultations: number
  total: number
  servicesLabel: string
  consultationsLabel: string
  servicesPct: number
  consultationsPct: number
}

export interface DashboardChartTrends {
  serviceRevenue: TrendPoint[]
  consultationRevenue: TrendPoint[]
  servicesListed: TrendPoint[]
  consultationsListed: TrendPoint[]
}

// ─── Single Unified Dashboard Response ────────────────────────────────────────

export interface MarketplaceDashboardData {
  summary: DashboardSummary
  services: ServiceKpis
  consultations: ConsultationKpis
  trends: DashboardChartTrends
  distribution: {
    servicesByCategory: CategoryPoint[]
    consultationsByCategory: CategoryPoint[]
  }
  statusBreakdown: {
    serviceOrders: StatusPoint[]
    consultationBookings: StatusPoint[]
  }
  topPerformers: {
    services: TopServicePoint[]
    consultations: TopConsultationPoint[]
  }
  revenueSplit: RevenueSplit
  generatedAt: string
  filters: DashboardFiltersApplied
}
