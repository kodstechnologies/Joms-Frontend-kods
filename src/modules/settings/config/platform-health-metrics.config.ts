import {
  catalogFromMetricRows,
  deriveMetricExports,
  type MetricRowTuple,
} from '@/shared/lib/define-metrics-catalog'

export const PLATFORM_HEALTH_MODULE_KEY = 'platform-health'

export type PlatformHealthMetricCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultActive: boolean
}

const METRIC_ROWS: MetricRowTuple[] = [
  ['system-uptime', 'System Uptime', 'Percentage', 'Operational time ÷ total time', true],
  ['compliance-flags', 'Compliance Flags', 'Count', 'Open compliance and security flags', true],
  ['admin-actions-mtd', 'Admin Actions (MTD)', 'Count', 'Admin actions logged this month', true],
  [
    'critical-actions-logged',
    'Critical Actions Logged',
    'Count',
    'High-risk admin actions such as delete and role change',
    true,
  ],
  [
    'avg-approval-time',
    'Avg. Approval Time',
    'Average',
    'Average escalation approval turnaround',
    true,
  ],
  [
    'impersonation-sessions',
    'Impersonation Sessions',
    'Count',
    'Admin impersonation sessions',
    true,
  ],
  [
    'api-response-time',
    'Average API Response Time',
    'Average',
    'Average backend health-probe latency',
    true,
  ],
  ['api-success-rate', 'API Success Rate', 'Percentage', 'Successful probes ÷ total probes'],
  ['error-rate', 'Error Rate', 'Percentage', 'Failed probes ÷ total probes', true],
  [
    'database-query-time',
    'Database Health Score',
    'Percentage',
    'Database availability and latency score',
    true,
  ],
  [
    'background-jobs-success-rate',
    'Background Jobs Success Rate',
    'Percentage',
    'Successful background jobs ÷ total jobs',
  ],
  [
    'queue-processing-time',
    'Queue Processing Time',
    'Average',
    'Average queue processing duration',
  ],
  [
    'data-backup-success',
    'Data Backup Success Rate',
    'Percentage',
    'Successful backups ÷ backup attempts',
    true,
  ],
  [
    'last-successful-backup',
    'Last Successful Backup',
    'Timestamp',
    'Most recent completed backup timestamp',
  ],
  ['open-support-tickets', 'Active Incidents', 'Count', 'Open platform incidents', true],
  ['security-alerts', 'Security Alerts', 'Count', 'Security-related alerts in range'],
  ['failed-login-attempts', 'Failed Login Attempts', 'Count', 'Failed admin login attempts'],
  ['storage-utilization', 'Storage Utilization', 'Percentage', 'Storage capacity used'],
  [
    'failed-transactions',
    'Failed Transactions',
    'Count',
    'Failed payment or booking transactions in range',
  ],
  [
    'avg-ticket-resolution-time',
    'Avg. Ticket Resolution Time',
    'Average',
    'Average ticket resolution duration',
  ],
  ['first-response-time', 'First Response Time', 'Average', 'Average first response duration'],
  [
    'customer-satisfaction-csat',
    'Customer Satisfaction (CSAT)',
    'Percentage',
    'Positive support feedback percentage',
  ],
]

export const PLATFORM_HEALTH_METRICS_CATALOG = catalogFromMetricRows(
  METRIC_ROWS,
) as PlatformHealthMetricCatalogItem[]

export const PLATFORM_HEALTH_LEGACY_METRIC_ID_MAP: Record<string, string> = {
  'avg-api-response-time': 'api-response-time',
  'database-health-score': 'database-query-time',
  'active-incidents': 'open-support-tickets',
  'data-backup-success-rate': 'data-backup-success',
}

const derived = deriveMetricExports(PLATFORM_HEALTH_METRICS_CATALOG)
export const PLATFORM_HEALTH_METRIC_IDS = derived.ids
export const PLATFORM_HEALTH_METRIC_ID_SET = derived.idSet
export const DEFAULT_PLATFORM_HEALTH_METRIC_IDS = derived.defaultIds
export const PLATFORM_HEALTH_MAX_ACTIVE_METRICS = derived.maxActive
