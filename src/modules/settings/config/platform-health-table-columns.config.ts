export type PlatformHealthTableColumnCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultVisible: boolean
}

const col = (
  id: string,
  label: string,
  type: string,
  description: string,
  defaultVisible = false,
): PlatformHealthTableColumnCatalogItem => ({
  id,
  label,
  type,
  description,
  defaultVisible,
})

export const PLATFORM_HEALTH_TABLE_COLUMNS_CATALOG: PlatformHealthTableColumnCatalogItem[] = [
  col('infrastructure-id', 'Infrastructure ID', 'Text', 'Unique infrastructure identifier', true),
  col('infrastructure-name', 'Infrastructure Name', 'Text', 'Service or component name', true),
  col('service-type', 'Service Type', 'Text', 'Infrastructure service type', true),
  col('status', 'Status', 'Status', 'Current health status', true),
  col('uptime', 'Uptime', 'Percentage', 'Service uptime percentage', true),
  col('cpu-usage', 'CPU Usage', 'Percentage', 'Current CPU utilization', true),
  col('memory-usage', 'Memory Usage', 'Percentage', 'Current memory utilization', true),
  col('storage-usage', 'Storage Usage', 'Percentage', 'Current storage utilization', true),
  col('network-latency', 'Network Latency', 'Average', 'Network latency in milliseconds', true),
  col(
    'average-response-time',
    'Average Response Time',
    'Average',
    'Average response time in milliseconds',
    true,
  ),
  col('error-count', 'Error Count', 'Count', 'Recent probe or health-check errors', true),
  col('last-health-check', 'Last Health Check', 'Date', 'Timestamp of last health check', true),
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
