import {
  catalogFromMetricRows,
  deriveMetricExports,
  type MetricRowTuple,
} from '@/shared/lib/define-metrics-catalog'

export const CONSULTATION_PERFORMANCE_MODULE_KEY = 'consultation-performance'

export type ConsultationPerformanceMetricCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultActive: boolean
}

const CONSULTATION_METRIC_DEFS: MetricRowTuple[] = [
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

export const CONSULTATION_PERFORMANCE_METRICS_CATALOG = catalogFromMetricRows(
  CONSULTATION_METRIC_DEFS,
) as ConsultationPerformanceMetricCatalogItem[]

const derived = deriveMetricExports(CONSULTATION_PERFORMANCE_METRICS_CATALOG)
export const CONSULTATION_PERFORMANCE_METRIC_IDS = derived.ids
export const DEFAULT_CONSULTATION_PERFORMANCE_METRIC_IDS = derived.defaultIds
export const CONSULTATION_PERFORMANCE_MAX_ACTIVE_METRICS = derived.maxActive

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
