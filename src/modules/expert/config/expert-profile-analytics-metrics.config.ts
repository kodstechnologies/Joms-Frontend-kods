/**
 * Expert Profile Analytics — KPI catalog.
 * Source: JOMS_KODS_Web_Admin_Panel_full_data → Expert Analytics.
 * Metrics only (Excel has no table-columns section for this sheet).
 */

export const EXPERT_PROFILE_ANALYTICS_MODULE_KEY = 'expert-profile-analytics'

export type ExpertProfileAnalyticsMetricCatalogItem = {
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
): ExpertProfileAnalyticsMetricCatalogItem => ({
  id,
  label,
  type,
  description,
  defaultActive,
})

export const EXPERT_PROFILE_ANALYTICS_METRICS_CATALOG: ExpertProfileAnalyticsMetricCatalogItem[] = [
  // Experts Overview
  metric('account-status', 'Account Status', 'Status', 'Current account lifecycle', true),
  metric('last-active', 'Last Active', 'Date', 'Last login/activity timestamp', true),
  metric('membership-type', 'Membership Type', 'Text', 'Current subscription', true),
  metric('expert-category', 'Expert Category', 'Text', 'Marketplace category', true),
  metric('overall-rating', 'Overall Rating', 'Average', 'Average customer rating', true),
  metric('profile-views', 'Profile Views', 'Count', 'Total public profile visits', true),
  // Marketplace Performance
  metric('services-listed', 'Services Listed', 'Count', 'Total services created', true),
  metric('active-services', 'Active Services', 'Count', 'Live services'),
  metric('paused-services', 'Paused Services', 'Count', 'Temporarily unavailable'),
  metric('closed-services', 'Closed Services', 'Count', 'Closed/Retired services'),
  metric('deleted-services', 'Deleted Services', 'Count', 'Soft deleted services'),
  metric('consultations-listed', 'Consultations Listed', 'Count', 'Total consultations'),
  metric('quotations-received', 'Quotations Received', 'Count', 'Total quotations received'),
  metric('proposals-created', 'Proposals Created', 'Count', 'Total proposals submitted'),
  metric('orders-completed', 'Orders Completed', 'Count', 'Completed service orders'),
  metric('orders-in-progress', 'Orders In Progress', 'Count', 'Active service orders'),
  metric('terminated-orders', 'Terminated Orders', 'Count', 'Cancelled/terminated service orders'),
  metric(
    'consultations-completed',
    'Consultations Completed',
    'Count',
    'Completed consultation bookings',
  ),
  metric('scheduled-consultations', 'Scheduled Consultations', 'Count', 'Upcoming consultations'),
  metric(
    'terminated-consultations',
    'Terminated Consultations',
    'Count',
    'Cancelled consultation bookings',
  ),
  metric('conversion-rate', 'Conversion Rate', 'Percentage', 'Profile to order conversion'),
  // Revenue & Business Performance
  metric('total-revenue', 'Total Revenue', 'Currency', 'Lifetime revenue generated', true),
  metric('revenue-growth-rate', 'Revenue Growth Rate', 'Percentage', 'Growth over previous period'),
  metric('highest-demand-service', 'Highest Demand Service', 'Text', 'Most ordered service'),
  metric('highest-revenue-service', 'Highest Revenue Service', 'Text', 'Highest earning service'),
  metric('average-order-value', 'Average Order Value', 'Currency', 'Average booking value'),
  metric('custom-orders-created', 'Custom Orders Created', 'Count', 'Total custom orders'),
  metric('custom-orders-accepted', 'Custom Orders Accepted', 'Count', 'Accepted by clients'),
  metric('custom-orders-completed', 'Custom Orders Completed', 'Count', 'Successfully completed'),
  metric('custom-orders-rejected', 'Custom Orders Rejected', 'Count', 'Rejected by clients'),
  // Customer Analytics
  metric(
    'client-satisfaction-score',
    'Client Satisfaction Score',
    'Percentage',
    'Positive feedback percentage',
  ),
  metric('repeat-client-rate', 'Repeat Client Rate', 'Percentage', 'Returning client percentage'),
  metric(
    'orders-by-membership',
    'Orders by Membership',
    'Text',
    'Distribution of clients by membership',
  ),
  metric('net-promoter-score', 'Net Promoter Score', 'Count', 'Customer loyalty score'),
  metric(
    'last-service-request-received',
    'Last Service Request Received',
    'Date',
    'Latest incoming request',
  ),
  metric('last-service-completed', 'Last Service Completed', 'Date', 'Latest completed order'),
  // Operational Performance
  metric(
    'order-completion-rate',
    'Order Completion Rate',
    'Percentage',
    'Successful completion percentage',
  ),
  metric(
    'average-first-response-time',
    'Average First Response Time',
    'Duration',
    'Average first client response time',
  ),
]

export const EXPERT_PROFILE_ANALYTICS_METRIC_IDS = EXPERT_PROFILE_ANALYTICS_METRICS_CATALOG.map(
  (item) => item.id,
)

export const EXPERT_PROFILE_ANALYTICS_METRIC_ID_SET = new Set(EXPERT_PROFILE_ANALYTICS_METRIC_IDS)

export const DEFAULT_EXPERT_PROFILE_ANALYTICS_METRIC_IDS =
  EXPERT_PROFILE_ANALYTICS_METRICS_CATALOG.filter((item) => item.defaultActive).map(
    (item) => item.id,
  )

/** Profile analytics tab shows up to this many active KPI cards. */
export const EXPERT_PROFILE_ANALYTICS_MAX_ACTIVE_METRICS = 8

/** Maps legacy event-style preference ids → Excel catalog ids. */
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
