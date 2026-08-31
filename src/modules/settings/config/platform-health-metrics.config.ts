export const PLATFORM_HEALTH_MODULE_KEY = 'platform-health'

export type PlatformHealthMetricCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultActive: boolean
}

export const PLATFORM_HEALTH_METRICS_CATALOG: PlatformHealthMetricCatalogItem[] = [
  {
    id: 'system-uptime',
    label: 'System Uptime',
    type: 'Percentage',
    description: 'Operational time ÷ total time',
    defaultActive: true,
  },
  {
    id: 'failed-transactions',
    label: 'Failed Transactions',
    type: 'Count',
    description: 'Failed payment or booking transactions in range',
    defaultActive: true,
  },
  {
    id: 'compliance-flags',
    label: 'Compliance Flags',
    type: 'Count',
    description: 'Open compliance and security flags',
    defaultActive: true,
  },
  {
    id: 'open-support-tickets',
    label: 'Open Support Tickets',
    type: 'Count',
    description: 'Active unresolved support tickets',
    defaultActive: true,
  },
  {
    id: 'admin-actions-mtd',
    label: 'Admin Actions (MTD)',
    type: 'Count',
    description: 'Admin actions logged this month',
    defaultActive: true,
  },
  {
    id: 'critical-actions-logged',
    label: 'Critical Actions Logged',
    type: 'Count',
    description: 'High-risk admin actions such as delete and role change',
    defaultActive: true,
  },
  {
    id: 'avg-approval-time',
    label: 'Avg. Approval Time',
    type: 'Average',
    description: 'Average escalation approval turnaround',
    defaultActive: true,
  },
  {
    id: 'impersonation-sessions',
    label: 'Impersonation Sessions',
    type: 'Count',
    description: 'Admin impersonation sessions',
    defaultActive: true,
  },
  {
    id: 'api-response-time',
    label: 'API Response Time',
    type: 'Average',
    description: 'Average backend health-probe latency',
    defaultActive: true,
  },
  {
    id: 'error-rate',
    label: 'Error Rate',
    type: 'Percentage',
    description: 'Failed probes ÷ total probes',
    defaultActive: true,
  },
  {
    id: 'database-query-time',
    label: 'Database Query Time',
    type: 'Average',
    description: 'Mongo ping latency',
    defaultActive: true,
  },
  {
    id: 'data-backup-success',
    label: 'Data Backup Success',
    type: 'Percentage',
    description: 'Successful backups ÷ backup attempts',
    defaultActive: true,
  },
  {
    id: 'avg-ticket-resolution-time',
    label: 'Avg. Ticket Resolution Time',
    type: 'Average',
    description: 'Average ticket resolution duration',
    defaultActive: true,
  },
  {
    id: 'first-response-time',
    label: 'First Response Time',
    type: 'Average',
    description: 'Average first response duration',
    defaultActive: true,
  },
  {
    id: 'customer-satisfaction-csat',
    label: 'Customer Satisfaction (CSAT)',
    type: 'Percentage',
    description: 'Positive support feedback percentage',
    defaultActive: true,
  },
]

export const PLATFORM_HEALTH_LEGACY_METRIC_ID_MAP: Record<string, string> = {
  'avg-api-response-time': 'api-response-time',
  'database-health-score': 'database-query-time',
  'active-incidents': 'open-support-tickets',
  'data-backup-success-rate': 'data-backup-success',
}

export const PLATFORM_HEALTH_METRIC_IDS = PLATFORM_HEALTH_METRICS_CATALOG.map((metric) => metric.id)

export const PLATFORM_HEALTH_METRIC_ID_SET = new Set(PLATFORM_HEALTH_METRIC_IDS)

export const DEFAULT_PLATFORM_HEALTH_METRIC_IDS = PLATFORM_HEALTH_METRICS_CATALOG.filter(
  (metric) => metric.defaultActive,
).map((metric) => metric.id)

export const PLATFORM_HEALTH_MAX_ACTIVE_METRICS = PLATFORM_HEALTH_METRICS_CATALOG.length
