export const CONSULTATION_PERFORMANCE_MODULE_KEY = 'consultation-performance'

export type ConsultationPerformanceMetricCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultActive: boolean
}

type MetricRow = [id: string, label: string, type: string, description: string, active?: boolean]

const METRIC_ROWS: MetricRow[] = [
  ['totalConsultationsBooked', 'Total Consultations Booked', 'Count', 'Bookings'],
  ['completedConsultations', 'Completed Consultations', 'Count', 'Completed', true],
  ['scheduledConsultations', 'Scheduled Consultations', 'Count', 'Upcoming'],
  ['cancelledConsultations', 'Cancelled / Terminated Consultations', 'Count', 'Cancelled', true],
  ['averageConsultationRating', 'Average Consultation Rating', 'Average', 'Avg rating', true],
  ['consultationPageViews', 'Consultation Page Views', 'Count', 'Listing views'],
  ['bookingConversionRate', 'Booking Conversion Rate', 'Percentage', 'Views → bookings'],
  ['totalRevenue', 'Total Revenue', 'Currency', 'Revenue'],
  ['averageBookingValue', 'Average Booking Value', 'Currency', 'Avg completed'],
  ['totalTickets', 'Total Tickets', 'Count', 'Support/disputes'],
  ['ticketsByExpert', 'Tickets Raised by Expert', 'Count', 'Expert-raised'],
  ['ticketsByClient', 'Tickets Raised by Client', 'Count', 'Client-raised'],
  ['refundsIssued', 'Total Refunds Issued', 'Count', 'Refunded'],
  ['refundAmount', 'Total Refund Amount', 'Currency', 'Refund value'],
  ['cancellationRate', 'Cancellation Rate', 'Percentage', 'Cancelled %'],
  ['repeatBookingRate', 'Repeat Booking Rate', 'Percentage', 'Returning clients'],
  ['refundRate', 'Refund Rate', 'Percentage', 'Refunded share'],
  ['bookingsFromUserApp', 'Bookings from User App', 'Count', 'App origin'],
  ['bookingsFromMicrosite', 'Bookings from Microsite', 'Count', 'Microsite origin'],
  ['averageConsultationDuration', 'Average Consultation Duration', 'Average', 'Session length'],
  ['followUpCompletionRate', 'Follow-up Completion Rate', 'Percentage', 'Follow-ups done'],
  ['noShowRate', 'No-show Rate', 'Percentage', 'Unattended'],
  ['activeClients', 'Active Clients', 'Count', 'Upcoming/in-progress', true],
]

export const CONSULTATION_PERFORMANCE_METRICS_CATALOG: ConsultationPerformanceMetricCatalogItem[] =
  METRIC_ROWS.map(([id, label, type, description, defaultActive = false]) => ({
    id,
    label,
    type,
    description,
    defaultActive,
  }))

export const CONSULTATION_PERFORMANCE_METRIC_IDS = CONSULTATION_PERFORMANCE_METRICS_CATALOG.map(
  (item) => item.id,
)

export const DEFAULT_CONSULTATION_PERFORMANCE_METRIC_IDS =
  CONSULTATION_PERFORMANCE_METRICS_CATALOG.filter((item) => item.defaultActive).map(
    (item) => item.id,
  )

export const CONSULTATION_PERFORMANCE_MAX_ACTIVE_METRICS =
  CONSULTATION_PERFORMANCE_METRICS_CATALOG.length

export const CONSULTATION_PERFORMANCE_METRIC_API_ALIASES: Record<string, string[]> = {
  totalConsultationsBooked: ['totalOrders', 'totalConsultationsBooked'],
  completedConsultations: ['completedOrders', 'completedConsultations'],
  cancelledConsultations: ['terminatedOrders', 'cancelledConsultations'],
  averageConsultationRating: ['averageRating', 'averageConsultationRating'],
  scheduledConsultations: ['scheduledConsultations', 'inProgressOrders'],
}

export const CONSULTATION_PERFORMANCE_LEGACY_METRIC_ID_MAP: Record<string, string> = {
  completedOrders: 'completedConsultations',
  terminatedOrders: 'cancelledConsultations',
  averageRating: 'averageConsultationRating',
  totalOrders: 'totalConsultationsBooked',
}
