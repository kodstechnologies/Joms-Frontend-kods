import {
  catalogFromMetricRows,
  deriveMetricExports,
  type MetricRowTuple,
} from '@/shared/lib/define-metrics-catalog'

export const EXPERT_PROFILE_ANALYTICS_MODULE_KEY = 'expert-profile-analytics'

export type ExpertProfileAnalyticsMetricCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultActive: boolean
}

const EXPERT_PROFILE_METRIC_DEFS: MetricRowTuple[] = [
  ['account-status', 'Account Status', 'Status', 'Lifecycle', true],
  ['last-active', 'Last Active', 'Date', 'Last activity', true],
  ['membership-type', 'Membership Type', 'Text', 'Subscription', true],
  ['expert-category', 'Expert Category', 'Text', 'Category', true],
  ['overall-rating', 'Overall Rating', 'Average', 'Avg rating', true],
  ['profile-views', 'Profile Views', 'Count', 'Profile visits', true],
  ['services-listed', 'Services Listed', 'Count', 'Services created', true],
  ['active-services', 'Active Services', 'Count', 'Live services'],
  ['paused-services', 'Paused Services', 'Count', 'Paused'],
  ['closed-services', 'Closed Services', 'Count', 'Closed'],
  ['deleted-services', 'Deleted Services', 'Count', 'Soft-deleted'],
  ['consultations-listed', 'Consultations Listed', 'Count', 'Consultations'],
  ['quotations-received', 'Quotations Received', 'Count', 'Quotations'],
  ['proposals-created', 'Proposals Created', 'Count', 'Proposals'],
  ['orders-completed', 'Orders Completed', 'Count', 'Completed orders'],
  ['orders-in-progress', 'Orders In Progress', 'Count', 'Active orders'],
  ['terminated-orders', 'Terminated Orders', 'Count', 'Terminated'],
  ['consultations-completed', 'Consultations Completed', 'Count', 'Completed bookings'],
  ['scheduled-consultations', 'Scheduled Consultations', 'Count', 'Upcoming'],
  ['terminated-consultations', 'Terminated Consultations', 'Count', 'Cancelled bookings'],
  ['conversion-rate', 'Conversion Rate', 'Percentage', 'Profile → order'],
  ['total-revenue', 'Total Revenue', 'Currency', 'Lifetime revenue', true],
  ['revenue-growth-rate', 'Revenue Growth Rate', 'Percentage', 'Period growth'],
  ['highest-demand-service', 'Highest Demand Service', 'Text', 'Most ordered'],
  ['highest-revenue-service', 'Highest Revenue Service', 'Text', 'Top earner'],
  ['average-order-value', 'Average Order Value', 'Currency', 'Avg booking'],
  ['custom-orders-created', 'Custom Orders Created', 'Count', 'Custom created'],
  ['custom-orders-accepted', 'Custom Orders Accepted', 'Count', 'Accepted'],
  ['custom-orders-completed', 'Custom Orders Completed', 'Count', 'Completed'],
  ['custom-orders-rejected', 'Custom Orders Rejected', 'Count', 'Rejected'],
  ['client-satisfaction-score', 'Client Satisfaction Score', 'Percentage', 'Positive feedback'],
  ['repeat-client-rate', 'Repeat Client Rate', 'Percentage', 'Returning clients'],
  ['orders-by-membership', 'Orders by Membership', 'Text', 'By membership'],
  ['net-promoter-score', 'Net Promoter Score', 'Count', 'NPS'],
  ['last-service-request-received', 'Last Service Request Received', 'Date', 'Latest request'],
  ['last-service-completed', 'Last Service Completed', 'Date', 'Latest completion'],
  ['order-completion-rate', 'Order Completion Rate', 'Percentage', 'Completion %'],
  ['average-first-response-time', 'Average First Response Time', 'Duration', 'First response'],
]

export const EXPERT_PROFILE_ANALYTICS_METRICS_CATALOG = catalogFromMetricRows(
  EXPERT_PROFILE_METRIC_DEFS,
) as ExpertProfileAnalyticsMetricCatalogItem[]

const derived = deriveMetricExports(EXPERT_PROFILE_ANALYTICS_METRICS_CATALOG)
export const EXPERT_PROFILE_ANALYTICS_METRIC_IDS = derived.ids
export const EXPERT_PROFILE_ANALYTICS_METRIC_ID_SET = derived.idSet
export const DEFAULT_EXPERT_PROFILE_ANALYTICS_METRIC_IDS = derived.defaultIds
export const EXPERT_PROFILE_ANALYTICS_MAX_ACTIVE_METRICS = derived.maxActive

export const EXPERT_PROFILE_ANALYTICS_LEGACY_METRIC_ID_MAP: Record<string, string> = {
  'events-hosted': 'orders-completed',
  'total-attendees': 'profile-views',
  'repeat-attendees': 'repeat-client-rate',
  'upcoming-events': 'scheduled-consultations',
  'event-completion-rate': 'order-completion-rate',
  'avg-response-time': 'average-first-response-time',
  'events-rejected': 'terminated-orders',
  'events-suspended': 'paused-services',
}
