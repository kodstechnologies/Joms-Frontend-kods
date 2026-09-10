/** Service Marketplace (Dashboard) metrics — JOMS_KODS_Web_Admin_Panel Excel sheet */

export const SERVICE_DASHBOARD_MODULE_KEY = 'service-dashboard'

export type ServiceDashboardMetricCatalogItem = {
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
): ServiceDashboardMetricCatalogItem => ({
  id,
  label,
  type,
  description,
  defaultActive,
})

/** Service Metrics section from Excel */
export const SERVICE_DASHBOARD_SERVICE_METRICS_CATALOG: ServiceDashboardMetricCatalogItem[] = [
  metric('listed-services', 'Listed Services', 'Integer', 'Total services created', true),
  metric('active-services', 'Active Services', 'Integer', 'Live and bookable services', true),
  metric('paused-services', 'Paused Services', 'Integer', 'Temporarily unavailable services'),
  metric('archived-services', 'Archived Services', 'Integer', 'No longer available services'),
  metric('deleted-services', 'Deleted Services', 'Integer', 'Soft-deleted services'),
  metric(
    'most-opted-service-category',
    'Most Opted Service Category',
    'String',
    'Category with highest completed orders',
  ),
  metric(
    'most-opted-service-sub-category',
    'Most Opted Service Sub-Category',
    'String',
    'Sub-category with highest completed orders',
  ),
  metric('total-service-orders', 'Total Service Orders', 'Integer', 'Total service orders placed'),
  metric(
    'services-delivered',
    'Completed Service Orders',
    'Integer',
    'Successfully completed orders',
    true,
  ),
  metric('in-progress-service-orders', 'In Progress Service Orders', 'Integer', 'Active orders'),
  metric(
    'disputed-service-orders',
    'Disputed Service Orders',
    'Integer',
    'Orders with active disputes',
  ),
  metric(
    'service-completion',
    'Service Completion Rate',
    'Percentage',
    'Percentage of completed orders (exclude cancelled)',
    true,
  ),
  metric(
    'avg-delivery-time',
    'Average Delivery Time',
    'Duration',
    'Average delivery duration',
    true,
  ),
  metric(
    'total-service-revenue',
    'Total Service Revenue',
    'Currency',
    'Revenue from completed service orders',
    true,
  ),
  metric(
    'avg-revenue-service',
    'Average Revenue per Service',
    'Currency',
    'Average revenue per completed service',
  ),
  metric(
    'average-order-value',
    'Average Order Value (AOV)',
    'Currency',
    'Total service revenue ÷ completed service orders',
  ),
  metric(
    'avg-service-rating',
    'Average Service Rating',
    'Decimal',
    'Average customer rating',
    true,
  ),
  metric(
    'customer-satisfaction',
    'Customer Satisfaction',
    'Percentage',
    'Positive feedback percentage (ratings ≥ 4)',
    true,
  ),
  metric(
    'on-time-delivery',
    'On-Time Delivery %',
    'Percentage',
    'Orders delivered within promised SLA',
  ),
  metric(
    'avg-services-per-expert',
    'Average Services per Expert',
    'Decimal',
    'Listed services ÷ active experts',
  ),
  metric(
    'total-refund-amount',
    'Total Refund Amount',
    'Currency',
    'Total refunds issued for services',
  ),
  metric('refund-rate', 'Refund Rate', 'Percentage', 'Percentage of refunded service orders'),
  // Available extras already on the live dashboard (not in Excel core list)
  metric('repeat-service', 'Repeat Service %', 'Percentage', 'Returning client percentage'),
  metric(
    'service-cancellation-rate',
    'Service Cancellation Rate',
    'Percentage',
    'Percentage of cancelled/terminated service orders',
  ),
]

/** Consultation Metrics section from Excel */
export const SERVICE_DASHBOARD_CONSULTATION_METRICS_CATALOG: ServiceDashboardMetricCatalogItem[] = [
  metric(
    'listed-consultation',
    'Listed Consultations',
    'Integer',
    'Total consultation listings',
    true,
  ),
  metric('active-consultation', 'Active Consultations', 'Integer', 'Live consultations', true),
  metric('paused-consultations', 'Paused Consultations', 'Integer', 'Temporarily unavailable'),
  metric('archived-consultations', 'Archived Consultations', 'Integer', 'No longer offered'),
  metric('deleted-consultations', 'Deleted Consultations', 'Integer', 'Soft-deleted consultations'),
  metric('consultation-bookings', 'Consultation Bookings', 'Integer', 'Total bookings'),
  metric(
    'completed',
    'Completed Consultations',
    'Integer',
    'Successfully completed bookings',
    true,
  ),
  metric(
    'scheduled-consultations',
    'Scheduled Consultations',
    'Integer',
    'Upcoming confirmed consultations',
  ),
  metric('cancelled-consultations', 'Cancelled Consultations', 'Integer', 'Cancelled bookings'),
  metric(
    'consultation-completion',
    'Consultation Completion Rate',
    'Percentage',
    'Successful completion percentage',
    true,
  ),
  metric(
    'avg-consultation-time',
    'Average Consultation Duration',
    'Duration',
    'Average consultation length',
  ),
  metric(
    'total-consultation-revenue',
    'Total Consultation Revenue',
    'Currency',
    'Revenue from completed consultations',
    true,
  ),
  metric(
    'avg-revenue-consultation',
    'Average Revenue per Consultation',
    'Currency',
    'Total revenue ÷ completed consultations',
  ),
  metric(
    'average-booking-value',
    'Average Booking Value',
    'Currency',
    'Average consultation booking value',
  ),
  metric(
    'most-opted-consultation-category',
    'Most Opted Consultation Category',
    'String',
    'Most booked consultation category',
  ),
  metric(
    'avg-consultation-rating',
    'Average Consultation Rating',
    'Decimal',
    'Average consultation rating',
  ),
  metric(
    'consultation-satisfaction',
    'Consultation Satisfaction',
    'Percentage',
    'Positive consultation feedback (ratings ≥ 4)',
  ),
  metric(
    'repeat-consultation',
    'Repeat Consultation %',
    'Percentage',
    'Returning consultation client percentage',
  ),
]

export const SERVICE_DASHBOARD_METRICS_CATALOG: ServiceDashboardMetricCatalogItem[] = [
  ...SERVICE_DASHBOARD_SERVICE_METRICS_CATALOG,
  ...SERVICE_DASHBOARD_CONSULTATION_METRICS_CATALOG,
]

export const SERVICE_DASHBOARD_METRIC_IDS = SERVICE_DASHBOARD_METRICS_CATALOG.map((item) => item.id)

export const DEFAULT_SERVICE_DASHBOARD_METRIC_IDS = SERVICE_DASHBOARD_METRICS_CATALOG.filter(
  (item) => item.defaultActive,
).map((item) => item.id)

export const SERVICE_DASHBOARD_MAX_ACTIVE_METRICS = SERVICE_DASHBOARD_METRICS_CATALOG.length
