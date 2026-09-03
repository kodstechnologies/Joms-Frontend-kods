export const SERVICE_PERFORMANCE_MODULE_KEY = 'service-performance'

export type ServicePerformanceMetricCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultActive: boolean
}

type MetricRow = [id: string, label: string, type: string, description: string, active?: boolean]

const METRIC_ROWS: MetricRow[] = [
  ['totalOrders', 'Total Orders', 'Count', 'Orders received'],
  ['completedOrders', 'Completed Orders', 'Count', 'Completed', true],
  ['inProgressOrders', 'Orders In Progress', 'Count', 'Active'],
  ['terminatedOrders', 'Terminated Orders', 'Count', 'Terminated', true],
  ['averageRating', 'Average Service Rating', 'Average', 'Avg rating', true],
  ['customerSatisfaction', 'Customer Satisfaction Score', 'Percentage', 'Positive feedback'],
  ['servicePageViews', 'Service Page Views', 'Count', 'Listing views'],
  ['bookingConversionRate', 'Booking Conversion Rate', 'Percentage', 'Views → bookings'],
  ['totalRevenue', 'Total Revenue', 'Currency', 'Revenue'],
  ['averageOrderValue', 'Average Order Value', 'Currency', 'Avg order'],
  ['totalTickets', 'Total Tickets', 'Count', 'Disputes/support'],
  ['ticketsByExpert', 'Tickets Raised by Expert', 'Count', 'Expert-raised'],
  ['ticketsByClient', 'Tickets Raised by Client', 'Count', 'Client-raised'],
  ['refundsIssued', 'Total Refunds Issued', 'Count', 'Refunded orders'],
  ['refundAmount', 'Total Refund Amount', 'Currency', 'Refund value'],
  ['orderTerminationRate', 'Order Termination Rate', 'Percentage', 'Cancelled %'],
  ['repeatBookingRate', 'Repeat Booking Rate', 'Percentage', 'Returning clients'],
  ['refundRate', 'Refund Rate', 'Percentage', 'Refunded share'],
  ['ordersFromUserApp', 'Orders from User App', 'Count', 'App origin'],
  ['ordersFromMicrosite', 'Orders from Microsite', 'Count', 'Microsite origin'],
  ['customOrdersCreated', 'Custom Orders Created', 'Count', 'Custom created'],
  ['customOrdersCompleted', 'Custom Orders Completed', 'Count', 'Custom completed'],
  ['customOrdersInProgress', 'Custom Orders In Progress', 'Count', 'Custom active'],
  ['customOrdersTerminated', 'Terminated Custom Orders', 'Count', 'Custom cancelled'],
  ['averageDeliveryTime', 'Average Delivery Time', 'Average', 'Completion time'],
  ['onTimeDeliveryPercent', 'On-Time Delivery %', 'Percentage', 'Within SLA'],
  ['activeClients', 'Active Clients', 'Count', 'In-progress clients', true],
  ['disputedOrders', 'Disputed Orders', 'Count', 'Disputed'],
  ['npsScore', 'Net Promoter Score', 'Count', 'NPS'],
  ['grossRevenue', 'Gross Revenue', 'Currency', 'Before refunds'],
  ['platformCommission', 'Platform Commission', 'Currency', 'Platform share'],
  ['distinctClients', 'Unique Clients', 'Count', 'Distinct clients'],
]

export const SERVICE_PERFORMANCE_METRICS_CATALOG: ServicePerformanceMetricCatalogItem[] =
  METRIC_ROWS.map(([id, label, type, description, defaultActive = false]) => ({
    id,
    label,
    type,
    description,
    defaultActive,
  }))

export const SERVICE_PERFORMANCE_METRIC_IDS = SERVICE_PERFORMANCE_METRICS_CATALOG.map(
  (item) => item.id,
)

export const DEFAULT_SERVICE_PERFORMANCE_METRIC_IDS = SERVICE_PERFORMANCE_METRICS_CATALOG.filter(
  (item) => item.defaultActive,
).map((item) => item.id)

export const SERVICE_PERFORMANCE_MAX_ACTIVE_METRICS = SERVICE_PERFORMANCE_METRICS_CATALOG.length
