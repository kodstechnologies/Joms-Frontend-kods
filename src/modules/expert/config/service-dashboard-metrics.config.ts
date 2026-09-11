import {
  catalogFromMetricRows,
  deriveMetricExports,
  type MetricRowTuple,
} from '@/shared/lib/define-metrics-catalog'

export const SERVICE_DASHBOARD_MODULE_KEY = 'service-dashboard'

export type ServiceDashboardMetricCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultActive: boolean
}

const SERVICE_METRIC_DEFS: MetricRowTuple[] = [
  ['listed-services', 'Listed Services', 'Integer', 'Total services created', true],
  ['active-services', 'Active Services', 'Integer', 'Live and bookable services', true],
  ['paused-services', 'Paused Services', 'Integer', 'Temporarily unavailable services'],
  ['archived-services', 'Archived Services', 'Integer', 'No longer available services'],
  ['deleted-services', 'Deleted Services', 'Integer', 'Soft-deleted services'],
  [
    'most-opted-service-category',
    'Most Opted Service Category',
    'String',
    'Category with highest completed orders',
  ],
  [
    'most-opted-service-sub-category',
    'Most Opted Service Sub-Category',
    'String',
    'Sub-category with highest completed orders',
  ],
  ['total-service-orders', 'Total Service Orders', 'Integer', 'Total service orders placed'],
  [
    'services-delivered',
    'Completed Service Orders',
    'Integer',
    'Successfully completed orders',
    true,
  ],
  ['in-progress-service-orders', 'In Progress Service Orders', 'Integer', 'Active orders'],
  ['disputed-service-orders', 'Disputed Service Orders', 'Integer', 'Orders with active disputes'],
  [
    'service-completion',
    'Service Completion Rate',
    'Percentage',
    'Percentage of completed orders (exclude cancelled)',
    true,
  ],
  ['avg-delivery-time', 'Average Delivery Time', 'Duration', 'Average delivery duration', true],
  [
    'total-service-revenue',
    'Total Service Revenue',
    'Currency',
    'Revenue from completed service orders',
    true,
  ],
  [
    'avg-revenue-service',
    'Average Revenue per Service',
    'Currency',
    'Average revenue per completed service',
  ],
  [
    'average-order-value',
    'Average Order Value (AOV)',
    'Currency',
    'Total service revenue ÷ completed service orders',
  ],
  ['avg-service-rating', 'Average Service Rating', 'Decimal', 'Average customer rating', true],
  [
    'customer-satisfaction',
    'Customer Satisfaction',
    'Percentage',
    'Positive feedback percentage (ratings ≥ 4)',
    true,
  ],
  ['on-time-delivery', 'On-Time Delivery %', 'Percentage', 'Orders delivered within promised SLA'],
  [
    'avg-services-per-expert',
    'Average Services per Expert',
    'Decimal',
    'Listed services ÷ active experts',
  ],
  ['total-refund-amount', 'Total Refund Amount', 'Currency', 'Total refunds issued for services'],
  ['refund-rate', 'Refund Rate', 'Percentage', 'Percentage of refunded service orders'],
  ['repeat-service', 'Repeat Service %', 'Percentage', 'Returning client percentage'],
  [
    'service-cancellation-rate',
    'Service Cancellation Rate',
    'Percentage',
    'Percentage of cancelled/terminated service orders',
  ],
]

const CONSULTATION_METRIC_DEFS: MetricRowTuple[] = [
  ['listed-consultation', 'Listed Consultations', 'Integer', 'Total consultation listings', true],
  ['active-consultation', 'Active Consultations', 'Integer', 'Live consultations', true],
  ['paused-consultations', 'Paused Consultations', 'Integer', 'Temporarily unavailable'],
  ['archived-consultations', 'Archived Consultations', 'Integer', 'No longer offered'],
  ['deleted-consultations', 'Deleted Consultations', 'Integer', 'Soft-deleted consultations'],
  ['consultation-bookings', 'Consultation Bookings', 'Integer', 'Total bookings'],
  ['completed', 'Completed Consultations', 'Integer', 'Successfully completed bookings', true],
  [
    'scheduled-consultations',
    'Scheduled Consultations',
    'Integer',
    'Upcoming confirmed consultations',
  ],
  ['cancelled-consultations', 'Cancelled Consultations', 'Integer', 'Cancelled bookings'],
  [
    'consultation-completion',
    'Consultation Completion Rate',
    'Percentage',
    'Successful completion percentage',
    true,
  ],
  [
    'avg-consultation-time',
    'Average Consultation Duration',
    'Duration',
    'Average consultation length',
  ],
  [
    'total-consultation-revenue',
    'Total Consultation Revenue',
    'Currency',
    'Revenue from completed consultations',
    true,
  ],
  [
    'avg-revenue-consultation',
    'Average Revenue per Consultation',
    'Currency',
    'Total revenue ÷ completed consultations',
  ],
  [
    'average-booking-value',
    'Average Booking Value',
    'Currency',
    'Average consultation booking value',
  ],
  [
    'most-opted-consultation-category',
    'Most Opted Consultation Category',
    'String',
    'Most booked consultation category',
  ],
  [
    'avg-consultation-rating',
    'Average Consultation Rating',
    'Decimal',
    'Average consultation rating',
  ],
  [
    'consultation-satisfaction',
    'Consultation Satisfaction',
    'Percentage',
    'Positive consultation feedback (ratings ≥ 4)',
  ],
  [
    'repeat-consultation',
    'Repeat Consultation %',
    'Percentage',
    'Returning consultation client percentage',
  ],
]

export const SERVICE_DASHBOARD_SERVICE_METRICS_CATALOG = catalogFromMetricRows(
  SERVICE_METRIC_DEFS,
) as ServiceDashboardMetricCatalogItem[]

export const SERVICE_DASHBOARD_CONSULTATION_METRICS_CATALOG = catalogFromMetricRows(
  CONSULTATION_METRIC_DEFS,
) as ServiceDashboardMetricCatalogItem[]

export const SERVICE_DASHBOARD_METRICS_CATALOG: ServiceDashboardMetricCatalogItem[] = [
  ...SERVICE_DASHBOARD_SERVICE_METRICS_CATALOG,
  ...SERVICE_DASHBOARD_CONSULTATION_METRICS_CATALOG,
]

const derived = deriveMetricExports(SERVICE_DASHBOARD_METRICS_CATALOG)
export const SERVICE_DASHBOARD_METRIC_IDS = derived.ids
export const DEFAULT_SERVICE_DASHBOARD_METRIC_IDS = derived.defaultIds
export const SERVICE_DASHBOARD_MAX_ACTIVE_METRICS = derived.maxActive
