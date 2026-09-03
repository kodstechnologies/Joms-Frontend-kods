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
    id: 'compliance-flags',
    label: 'Compliance Flags',
    type: 'Count',
    description: 'Open compliance and security flags',
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
    label: 'Average API Response Time',
    type: 'Average',
    description: 'Average backend health-probe latency',
    defaultActive: true,
  },
  {
    id: 'api-success-rate',
    label: 'API Success Rate',
    type: 'Percentage',
    description: 'Successful probes ÷ total probes',
    defaultActive: false,
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
    label: 'Database Health Score',
    type: 'Percentage',
    description: 'Database availability and latency score',
    defaultActive: true,
  },
  {
    id: 'background-jobs-success-rate',
    label: 'Background Jobs Success Rate',
    type: 'Percentage',
    description: 'Successful background jobs ÷ total jobs',
    defaultActive: false,
  },
  {
    id: 'queue-processing-time',
    label: 'Queue Processing Time',
    type: 'Average',
    description: 'Average queue processing duration',
    defaultActive: false,
  },
  {
    id: 'data-backup-success',
    label: 'Data Backup Success Rate',
    type: 'Percentage',
    description: 'Successful backups ÷ backup attempts',
    defaultActive: true,
  },
  {
    id: 'last-successful-backup',
    label: 'Last Successful Backup',
    type: 'Timestamp',
    description: 'Most recent completed backup timestamp',
    defaultActive: false,
  },
  {
    id: 'open-support-tickets',
    label: 'Active Incidents',
    type: 'Count',
    description: 'Open platform incidents',
    defaultActive: true,
  },
  {
    id: 'security-alerts',
    label: 'Security Alerts',
    type: 'Count',
    description: 'Security-related alerts in range',
    defaultActive: false,
  },
  {
    id: 'failed-login-attempts',
    label: 'Failed Login Attempts',
    type: 'Count',
    description: 'Failed admin login attempts',
    defaultActive: false,
  },
  {
    id: 'storage-utilization',
    label: 'Storage Utilization',
    type: 'Percentage',
    description: 'Storage capacity used',
    defaultActive: false,
  },
  {
    id: 'failed-transactions',
    label: 'Failed Transactions',
    type: 'Count',
    description: 'Failed payment or booking transactions in range',
    defaultActive: false,
  },
  {
    id: 'avg-ticket-resolution-time',
    label: 'Avg. Ticket Resolution Time',
    type: 'Average',
    description: 'Average ticket resolution duration',
    defaultActive: false,
  },
  {
    id: 'first-response-time',
    label: 'First Response Time',
    type: 'Average',
    description: 'Average first response duration',
    defaultActive: false,
  },
  {
    id: 'customer-satisfaction-csat',
    label: 'Customer Satisfaction (CSAT)',
    type: 'Percentage',
    description: 'Positive support feedback percentage',
    defaultActive: false,
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
