export const PLATFORM_HEALTH_MODULE_KEY = 'platform-health'

export type PlatformHealthMetricCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultActive: boolean
}

/** Exactly 15 platform health dashboard metrics — matches the dashboard cards. */
export const PLATFORM_HEALTH_METRICS_CATALOG: PlatformHealthMetricCatalogItem[] = [
  {
    id: 'system-uptime',
    label: 'System Uptime',
    type: 'Percentage',
    description: 'Overall platform uptime percentage',
    defaultActive: true,
  },
  {
    id: 'failed-transactions',
    label: 'Failed Transactions',
    type: 'Count',
    description: 'Number of failed transactions',
    defaultActive: true,
  },
  {
    id: 'compliance-flags',
    label: 'Compliance Flags',
    type: 'Count',
    description: 'Active compliance flags requiring review',
    defaultActive: true,
  },
  {
    id: 'open-support-tickets',
    label: 'Open Support Tickets',
    type: 'Count',
    description: 'Currently open support tickets',
    defaultActive: true,
  },
  {
    id: 'admin-actions-mtd',
    label: 'Admin Actions (MTD)',
    type: 'Count',
    description: 'Admin actions logged month to date',
    defaultActive: true,
  },
  {
    id: 'critical-actions-logged',
    label: 'Critical Actions Logged',
    type: 'Count',
    description: 'Critical admin actions logged',
    defaultActive: true,
  },
  {
    id: 'avg-approval-time',
    label: 'Avg. Approval Time',
    type: 'Average',
    description: 'Average approval turnaround time',
    defaultActive: true,
  },
  {
    id: 'impersonation-sessions',
    label: 'Impersonation Sessions',
    type: 'Count',
    description: 'Active impersonation sessions for user support',
    defaultActive: true,
  },
  {
    id: 'api-response-time',
    label: 'API Response Time',
    type: 'Average',
    description: 'Average API response time',
    defaultActive: true,
  },
  {
    id: 'error-rate',
    label: 'Error Rate',
    type: 'Percentage',
    description: 'Platform error rate',
    defaultActive: true,
  },
  {
    id: 'database-query-time',
    label: 'Database Query Time',
    type: 'Average',
    description: 'Average database query execution time',
    defaultActive: true,
  },
  {
    id: 'data-backup-success',
    label: 'Data Backup Success',
    type: 'Percentage',
    description: 'Successful backup completion rate',
    defaultActive: true,
  },
  {
    id: 'avg-ticket-resolution-time',
    label: 'Avg. Ticket Resolution Time',
    type: 'Average',
    description: 'Average support ticket resolution time',
    defaultActive: true,
  },
  {
    id: 'first-response-time',
    label: 'First Response Time',
    type: 'Average',
    description: 'Average first response time for support tickets',
    defaultActive: true,
  },
  {
    id: 'customer-satisfaction-csat',
    label: 'Customer Satisfaction (CSAT)',
    type: 'Percentage',
    description: 'Customer satisfaction score',
    defaultActive: true,
  },
]

export const PLATFORM_HEALTH_METRIC_IDS = PLATFORM_HEALTH_METRICS_CATALOG.map((metric) => metric.id)

export const PLATFORM_HEALTH_METRIC_ID_SET = new Set(PLATFORM_HEALTH_METRIC_IDS)

export const DEFAULT_PLATFORM_HEALTH_METRIC_IDS = PLATFORM_HEALTH_METRICS_CATALOG.filter(
  (metric) => metric.defaultActive,
).map((metric) => metric.id)

export const PLATFORM_HEALTH_MAX_ACTIVE_METRICS = PLATFORM_HEALTH_METRICS_CATALOG.length
