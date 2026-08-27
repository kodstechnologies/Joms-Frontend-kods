/**
 * Service Performance — KPI catalog.
 * Source: JOMS_KODS_Web_Admin_Panel_full_data → Service Performance Metrics.
 * Ids stay camelCase to match serviceListing-service performance metrics payload.
 */

export const SERVICE_PERFORMANCE_MODULE_KEY = 'service-performance'

export type ServicePerformanceMetricCatalogItem = {
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
): ServicePerformanceMetricCatalogItem => ({
  id,
  label,
  type,
  description,
  defaultActive,
})

export const SERVICE_PERFORMANCE_METRICS_CATALOG: ServicePerformanceMetricCatalogItem[] = [
  metric('totalOrders', 'Total Orders', 'Count', 'Total orders received'),
  metric('completedOrders', 'Completed Orders', 'Count', 'Successfully completed orders', true),
  metric('inProgressOrders', 'Orders In Progress', 'Count', 'Active service orders'),
  metric('terminatedOrders', 'Terminated Orders', 'Count', 'Cancelled/terminated orders', true),
  metric('averageRating', 'Average Service Rating', 'Average', 'Overall service rating', true),
  metric(
    'customerSatisfaction',
    'Customer Satisfaction Score',
    'Percentage',
    'Positive feedback percentage',
  ),
  metric('servicePageViews', 'Service Page Views', 'Count', 'Total listing views'),
  metric(
    'bookingConversionRate',
    'Booking Conversion Rate',
    'Percentage',
    'Conversion from page views to bookings',
  ),
  metric('totalRevenue', 'Total Revenue', 'Currency', 'Revenue generated'),
  metric('averageOrderValue', 'Average Order Value', 'Currency', 'Average completed order value'),
  metric('totalTickets', 'Total Tickets', 'Count', 'Total disputes/support tickets'),
  metric('ticketsByExpert', 'Tickets Raised by Expert', 'Count', 'Tickets initiated by expert'),
  metric('ticketsByClient', 'Tickets Raised by Client', 'Count', 'Tickets initiated by client'),
  metric('refundsIssued', 'Total Refunds Issued', 'Count', 'Orders refunded'),
  metric('refundAmount', 'Total Refund Amount', 'Currency', 'Total refund value'),
  metric(
    'orderTerminationRate',
    'Order Termination Rate',
    'Percentage',
    'Cancelled order percentage',
  ),
  metric('repeatBookingRate', 'Repeat Booking Rate', 'Percentage', 'Returning client percentage'),
  metric('refundRate', 'Refund Rate', 'Percentage', 'Percentage of completed orders refunded'),
  metric(
    'ordersFromUserApp',
    'Orders from User App',
    'Count',
    'Orders originating from mobile/web app',
  ),
  metric(
    'ordersFromMicrosite',
    'Orders from Microsite',
    'Count',
    'Orders originating from expert microsite',
  ),
  metric('customOrdersCreated', 'Custom Orders Created', 'Count', 'Total custom orders'),
  metric('customOrdersCompleted', 'Custom Orders Completed', 'Count', 'Completed custom orders'),
  metric('customOrdersInProgress', 'Custom Orders In Progress', 'Count', 'Active custom orders'),
  metric('customOrdersTerminated', 'Terminated Custom Orders', 'Count', 'Cancelled custom orders'),
  metric(
    'averageDeliveryTime',
    'Average Delivery Time',
    'Average',
    'Average service completion time',
  ),
  metric(
    'onTimeDeliveryPercent',
    'On-Time Delivery %',
    'Percentage',
    'Orders completed within SLA',
  ),
  // Product extras already returned by the API (not in Excel sheet)
  metric(
    'activeClients',
    'Active Clients',
    'Count',
    'Clients with work currently in progress',
    true,
  ),
  metric('disputedOrders', 'Disputed Orders', 'Count', 'Orders with an open or resolved dispute'),
  metric('npsScore', 'Net Promoter Score', 'Count', 'NPS derived from service ratings'),
  metric('grossRevenue', 'Gross Revenue', 'Currency', 'Revenue before refund adjustments'),
  metric(
    'platformCommission',
    'Platform Commission',
    'Currency',
    'Commission retained by the platform',
  ),
  metric('distinctClients', 'Unique Clients', 'Count', 'Distinct clients who ordered this service'),
]

export const SERVICE_PERFORMANCE_METRIC_IDS = SERVICE_PERFORMANCE_METRICS_CATALOG.map(
  (item) => item.id,
)

export const DEFAULT_SERVICE_PERFORMANCE_METRIC_IDS = SERVICE_PERFORMANCE_METRICS_CATALOG.filter(
  (item) => item.defaultActive,
).map((item) => item.id)

/** The performance header shows four KPI cards at a time. */
export const SERVICE_PERFORMANCE_MAX_ACTIVE_METRICS = 4
