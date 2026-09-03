export type PlatformHealthTableColumnCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultVisible: boolean
}

export const PLATFORM_HEALTH_TABLE_COLUMNS_CATALOG: PlatformHealthTableColumnCatalogItem[] = [
  {
    id: 'infrastructure-id',
    label: 'Infrastructure ID',
    type: 'Text',
    description: 'Unique infrastructure identifier',
    defaultVisible: true,
  },
  {
    id: 'infrastructure-name',
    label: 'Infrastructure Name',
    type: 'Text',
    description: 'Service or component name',
    defaultVisible: true,
  },
  {
    id: 'service-type',
    label: 'Service Type',
    type: 'Text',
    description: 'Infrastructure service type',
    defaultVisible: true,
  },
  {
    id: 'status',
    label: 'Status',
    type: 'Status',
    description: 'Current health status',
    defaultVisible: true,
  },
  {
    id: 'uptime',
    label: 'Uptime',
    type: 'Percentage',
    description: 'Service uptime percentage',
    defaultVisible: true,
  },
  {
    id: 'cpu-usage',
    label: 'CPU Usage',
    type: 'Percentage',
    description: 'Current CPU utilization',
    defaultVisible: true,
  },
  {
    id: 'memory-usage',
    label: 'Memory Usage',
    type: 'Percentage',
    description: 'Current memory utilization',
    defaultVisible: true,
  },
  {
    id: 'storage-usage',
    label: 'Storage Usage',
    type: 'Percentage',
    description: 'Current storage utilization',
    defaultVisible: true,
  },
  {
    id: 'network-latency',
    label: 'Network Latency',
    type: 'Average',
    description: 'Network latency in milliseconds',
    defaultVisible: true,
  },
  {
    id: 'average-response-time',
    label: 'Average Response Time',
    type: 'Average',
    description: 'Average response time in milliseconds',
    defaultVisible: true,
  },
  {
    id: 'error-count',
    label: 'Error Count',
    type: 'Count',
    description: 'Recent probe or health-check errors',
    defaultVisible: true,
  },
  {
    id: 'last-health-check',
    label: 'Last Health Check',
    type: 'Date',
    description: 'Timestamp of last health check',
    defaultVisible: true,
  },
]

export const DEFAULT_PLATFORM_HEALTH_VISIBLE_COLUMN_IDS =
  PLATFORM_HEALTH_TABLE_COLUMNS_CATALOG.filter((column) => column.defaultVisible).map(
    (column) => column.id,
  )

export const PLATFORM_HEALTH_LEGACY_COLUMN_ID_MAP: Record<string, string> = {
  id: 'infrastructure-id',
  infrastructureId: 'infrastructure-id',
  name: 'infrastructure-name',
  infrastructureName: 'infrastructure-name',
  serviceType: 'service-type',
  cpuUsage: 'cpu-usage',
  memoryUsage: 'memory-usage',
  storageUsage: 'storage-usage',
  networkLatencyMs: 'network-latency',
  networkLatency: 'network-latency',
  avgResponseTimeMs: 'average-response-time',
  averageResponseTime: 'average-response-time',
  errorCount: 'error-count',
  lastHealthCheck: 'last-health-check',
}
