/** Ids stay camelCase to match consultation performance metrics payload. */

export const CONSULTATION_PERFORMANCE_MODULE_KEY = 'consultation-performance'

export type ConsultationPerformanceMetricCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultActive: boolean
}

const metric = (
  id: string,
  label: string,
  type: string,
  description: string,
  defaultActive = false,
): ConsultationPerformanceMetricCatalogItem => ({
  id,
  label,
  type,
  description,
  defaultActive,
})

export const CONSULTATION_PERFORMANCE_METRICS_CATALOG: ConsultationPerformanceMetricCatalogItem[] =
  [
    metric(
      'totalConsultationsBooked',
      'Total Consultations Booked',
      'Count',
      'Total consultation bookings',
    ),
    metric(
      'completedConsultations',
      'Completed Consultations',
      'Count',
      'Successfully completed consultations',
      true,
    ),
    metric(
      'scheduledConsultations',
      'Scheduled Consultations',
      'Count',
      'Upcoming confirmed consultations',
    ),
    metric(
      'cancelledConsultations',
      'Cancelled / Terminated Consultations',
      'Count',
      'Cancelled or terminated bookings',
      true,
    ),
    metric(
      'averageConsultationRating',
      'Average Consultation Rating',
      'Average',
      'Overall consultation rating',
      true,
    ),
    metric(
      'consultationPageViews',
      'Consultation Page Views',
      'Count',
      'Total consultation listing views',
    ),
    metric(
      'bookingConversionRate',
      'Booking Conversion Rate',
      'Percentage',
      'Conversion from page views to bookings',
    ),
    metric('totalRevenue', 'Total Revenue', 'Currency', 'Revenue generated'),
    metric(
      'averageBookingValue',
      'Average Booking Value',
      'Currency',
      'Average revenue per completed consultation',
    ),
    metric('totalTickets', 'Total Tickets', 'Count', 'Total support/dispute tickets'),
    metric('ticketsByExpert', 'Tickets Raised by Expert', 'Count', 'Tickets initiated by expert'),
    metric('ticketsByClient', 'Tickets Raised by Client', 'Count', 'Tickets initiated by client'),
    metric('refundsIssued', 'Total Refunds Issued', 'Count', 'Refunded consultation bookings'),
    metric('refundAmount', 'Total Refund Amount', 'Currency', 'Total refunded amount'),
    metric(
      'cancellationRate',
      'Cancellation Rate',
      'Percentage',
      'Cancelled consultation percentage',
    ),
    metric('repeatBookingRate', 'Repeat Booking Rate', 'Percentage', 'Returning client percentage'),
    metric(
      'refundRate',
      'Refund Rate',
      'Percentage',
      'Percentage of completed consultations refunded',
    ),
    metric(
      'bookingsFromUserApp',
      'Bookings from User App',
      'Count',
      'Bookings originating from User App',
    ),
    metric(
      'bookingsFromMicrosite',
      'Bookings from Microsite',
      'Count',
      'Bookings originating from Microsite',
    ),
    metric(
      'averageConsultationDuration',
      'Average Consultation Duration',
      'Average',
      'Average session duration',
    ),
    metric(
      'followUpCompletionRate',
      'Follow-up Completion Rate',
      'Percentage',
      'Percentage of completed follow-ups',
    ),
    metric('noShowRate', 'No-show Rate', 'Percentage', 'Percentage of unattended consultations'),
    metric(
      'activeClients',
      'Active Clients',
      'Count',
      'Clients with upcoming or in-progress consultations',
      true,
    ),
  ]

export const CONSULTATION_PERFORMANCE_METRIC_IDS = CONSULTATION_PERFORMANCE_METRICS_CATALOG.map(
  (item) => item.id,
)

export const DEFAULT_CONSULTATION_PERFORMANCE_METRIC_IDS =
  CONSULTATION_PERFORMANCE_METRICS_CATALOG.filter((item) => item.defaultActive).map(
    (item) => item.id,
  )

export const CONSULTATION_PERFORMANCE_MAX_ACTIVE_METRICS =
  CONSULTATION_PERFORMANCE_METRICS_CATALOG.length

/**
 * Catalog id → alternate API metric / KPI keys (legacy service-shaped payload).
 */
export const CONSULTATION_PERFORMANCE_METRIC_API_ALIASES: Record<string, string[]> = {
  totalConsultationsBooked: ['totalOrders', 'totalConsultationsBooked'],
  completedConsultations: ['completedOrders', 'completedConsultations'],
  cancelledConsultations: ['terminatedOrders', 'cancelledConsultations'],
  averageConsultationRating: ['averageRating', 'averageConsultationRating'],
  scheduledConsultations: ['scheduledConsultations', 'inProgressOrders'],
}

/** Maps saved preference ids → current catalog ids. */
export const CONSULTATION_PERFORMANCE_LEGACY_METRIC_ID_MAP: Record<string, string> = {
  completedOrders: 'completedConsultations',
  terminatedOrders: 'cancelledConsultations',
  averageRating: 'averageConsultationRating',
  totalOrders: 'totalConsultationsBooked',
}
