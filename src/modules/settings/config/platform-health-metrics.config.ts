export const PLATFORM_HEALTH_MODULE_KEY = 'platform-health'

export type PlatformHealthMetricCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultActive: boolean
}

/** Spec: Settings → Platform Health dashboard metrics. */
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
    id: 'avg-api-response-time',
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
    id: 'database-health-score',
    label: 'Database Health Score',
    type: 'Percentage',
    description: 'Derived from Mongo ping latency',
    defaultActive: true,
  },
  {
    id: 'background-jobs-success-rate',
    label: 'Background Jobs Success Rate',
    type: 'Percentage',
    description: 'Successful backups and scheduled jobs ÷ attempts',
    defaultActive: true,
  },
  {
    id: 'queue-processing-time',
    label: 'Queue Processing Time',
    type: 'Average',
    description: 'Average completed job duration',
    defaultActive: true,
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
    type: 'DateTime',
    description: 'Timestamp of the latest completed backup',
    defaultActive: true,
  },
  {
    id: 'active-incidents',
    label: 'Active Incidents',
    type: 'Count',
    description: 'Open and investigating production incidents',
    defaultActive: true,
  },
  {
    id: 'security-alerts',
    label: 'Security Alerts',
    type: 'Count',
    description: 'Failed logins, locked accounts, impersonation, critical incidents',
    defaultActive: true,
  },
  {
    id: 'failed-login-attempts',
    label: 'Failed Login Attempts',
    type: 'Count',
    description: 'Failed admin login attempts in the selected range',
    defaultActive: true,
  },
  {
    id: 'storage-utilization',
    label: 'Storage Utilization',
    type: 'Percentage',
    description: 'Used Mongo storage ÷ allocated storage',
    defaultActive: true,
  },
  {
    id: 'cache-hit-rate',
    label: 'Cache Hit Rate',
    type: 'Percentage',
    description: 'Cache hits ÷ cache requests',
    defaultActive: true,
  },
]

export const PLATFORM_HEALTH_METRIC_IDS = PLATFORM_HEALTH_METRICS_CATALOG.map((metric) => metric.id)

export const PLATFORM_HEALTH_METRIC_ID_SET = new Set(PLATFORM_HEALTH_METRIC_IDS)

export const DEFAULT_PLATFORM_HEALTH_METRIC_IDS = PLATFORM_HEALTH_METRICS_CATALOG.filter(
  (metric) => metric.defaultActive,
).map((metric) => metric.id)

export const PLATFORM_HEALTH_MAX_ACTIVE_METRICS = PLATFORM_HEALTH_METRICS_CATALOG.length
