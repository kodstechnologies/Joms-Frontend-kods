export const SERVICE_PERFORMANCE_MODULE_KEY = 'service-performance'

export type ServicePerformanceMetricCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultActive: boolean
}

/** Service Performance metrics — mirrors SERVICE_PERFORMANCE_DASHBOARD_METRICS in admin-service. */
export const SERVICE_PERFORMANCE_METRICS_CATALOG: ServicePerformanceMetricCatalogItem[] = [
  {
    id: 'activeClients',
    label: 'Active Clients',
    type: 'Count',
    description: 'Clients with work currently in progress',
    defaultActive: true,
  },
  {
    id: 'completedOrders',
    label: 'Completed',
    type: 'Count',
    description: 'Orders completed for this service',
    defaultActive: true,
  },
  {
    id: 'averageRating',
    label: 'Avg. Rating',
    type: 'Average',
    description: 'Average client rating for this service',
    defaultActive: true,
  },
  {
    id: 'terminatedOrders',
    label: 'Terminated',
    type: 'Count',
    description: 'Orders terminated for this service',
    defaultActive: true,
  },
  {
    id: 'totalOrders',
    label: 'Total Orders',
    type: 'Count',
    description: 'All orders placed for this service',
    defaultActive: false,
  },
  {
    id: 'inProgressOrders',
    label: 'In-Progress Orders',
    type: 'Count',
    description: 'Orders currently being delivered',
    defaultActive: false,
  },
  {
    id: 'disputedOrders',
    label: 'Disputed Orders',
    type: 'Count',
    description: 'Orders with an open or resolved dispute',
    defaultActive: false,
  },
  {
    id: 'customerSatisfaction',
    label: 'Customer Satisfaction',
    type: 'Percentage',
    description: 'Share of 4 and 5 star ratings',
    defaultActive: false,
  },
  {
    id: 'npsScore',
    label: 'Net Promoter Score',
    type: 'Count',
    description: 'NPS derived from service ratings',
    defaultActive: false,
  },
  {
    id: 'servicePageViews',
    label: 'Service Page Views',
    type: 'Count',
    description: 'Listing views (requires view tracking)',
    defaultActive: false,
  },
  {
    id: 'bookingConversionRate',
    label: 'Booking Conversion Rate',
    type: 'Percentage',
    description: 'Paid engagements over quote requests',
    defaultActive: false,
  },
  {
    id: 'totalRevenue',
    label: 'Total Revenue',
    type: 'Currency',
    description: 'Net revenue from successful, non-refunded payments',
    defaultActive: false,
  },
  {
    id: 'grossRevenue',
    label: 'Gross Revenue',
    type: 'Currency',
    description: 'Revenue before refund adjustments',
    defaultActive: false,
  },
  {
    id: 'platformCommission',
    label: 'Platform Commission',
    type: 'Currency',
    description: 'Commission retained by the platform',
    defaultActive: false,
  },
  {
    id: 'averageOrderValue',
    label: 'Average Order Value',
    type: 'Currency',
    description: 'Net revenue per successful payment',
    defaultActive: false,
  },
  {
    id: 'totalTickets',
    label: 'Total Tickets',
    type: 'Count',
    description: 'Disputes raised on this service',
    defaultActive: false,
  },
  {
    id: 'ticketsByExpert',
    label: 'Tickets by Expert',
    type: 'Count',
    description: 'Disputes raised by the expert',
    defaultActive: false,
  },
  {
    id: 'ticketsByClient',
    label: 'Tickets by Client',
    type: 'Count',
    description: 'Disputes raised by clients',
    defaultActive: false,
  },
  {
    id: 'refundsIssued',
    label: 'Refunds Issued',
    type: 'Count',
    description: 'Number of processed refunds',
    defaultActive: false,
  },
  {
    id: 'refundAmount',
    label: 'Refund Amount',
    type: 'Currency',
    description: 'Total value refunded',
    defaultActive: false,
  },
  {
    id: 'refundRate',
    label: 'Refund Rate',
    type: 'Percentage',
    description: 'Refunds over successful payments',
    defaultActive: false,
  },
  {
    id: 'orderTerminationRate',
    label: 'Order Termination Rate',
    type: 'Percentage',
    description: 'Terminated orders over total orders',
    defaultActive: false,
  },
  {
    id: 'repeatBookingRate',
    label: 'Repeat Booking Rate',
    type: 'Percentage',
    description: 'Clients who ordered more than once',
    defaultActive: false,
  },
  {
    id: 'distinctClients',
    label: 'Unique Clients',
    type: 'Count',
    description: 'Distinct clients who ordered this service',
    defaultActive: false,
  },
  {
    id: 'ordersFromUserApp',
    label: 'Orders from User App',
    type: 'Count',
    description: 'Orders placed in the user app (requires source tracking)',
    defaultActive: false,
  },
  {
    id: 'ordersFromMicrosite',
    label: 'Orders from Microsite',
    type: 'Count',
    description: 'Orders placed via the microsite (requires source tracking)',
    defaultActive: false,
  },
  {
    id: 'customOrdersCreated',
    label: 'Custom Orders Created',
    type: 'Count',
    description: 'Custom projects created from quote requests',
    defaultActive: false,
  },
  {
    id: 'customOrdersCompleted',
    label: 'Custom Orders Completed',
    type: 'Count',
    description: 'Custom projects completed',
    defaultActive: false,
  },
  {
    id: 'customOrdersInProgress',
    label: 'Custom Orders In Progress',
    type: 'Count',
    description: 'Custom projects being delivered',
    defaultActive: false,
  },
  {
    id: 'customOrdersTerminated',
    label: 'Terminated Custom Orders',
    type: 'Count',
    description: 'Custom projects terminated',
    defaultActive: false,
  },
  {
    id: 'averageDeliveryTime',
    label: 'Average Delivery Time',
    type: 'Average',
    description: 'Average days from start to completion',
    defaultActive: false,
  },
  {
    id: 'onTimeDeliveryPercent',
    label: 'On-Time Delivery %',
    type: 'Percentage',
    description: 'Completions inside the committed timeline',
    defaultActive: false,
  },
]

export const SERVICE_PERFORMANCE_METRIC_IDS = SERVICE_PERFORMANCE_METRICS_CATALOG.map(
  (metric) => metric.id,
)

export const DEFAULT_SERVICE_PERFORMANCE_METRIC_IDS = SERVICE_PERFORMANCE_METRICS_CATALOG.filter(
  (metric) => metric.defaultActive,
).map((metric) => metric.id)

export const SERVICE_PERFORMANCE_MAX_ACTIVE_METRICS = 4
