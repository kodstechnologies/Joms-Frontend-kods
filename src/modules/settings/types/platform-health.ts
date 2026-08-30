export type PlatformHealthDateRange =
  | 'today'
  | 'last7days'
  | 'last30days'
  | 'thisMonth'
  | 'lastMonth'
  | 'quarter'
  | 'year'
  | 'custom'

export type PlatformHealthMetricTrend = {
  value: string
  tone: 'positive' | 'negative'
  direction?: 'up' | 'down'
  label?: string
  variant?: 'percent' | 'absolute'
}

export type PlatformHealthMetric = {
  id: string
  label: string
  value: string
  hint?: string
  status?: string
  trend?: PlatformHealthMetricTrend | null
}

export type PlatformHealthInfraRow = {
  id: string
  name: string
  serviceType: string
  status: 'Healthy' | 'Warning' | 'Critical' | 'Maintenance' | 'Offline'
  uptime: number
  cpuUsage: number
  memoryUsage: number
  storageUsage: number
  networkLatencyMs: number | null
  avgResponseTimeMs: number | null
  errorCount: number
  lastHealthCheck: string
}

export type PlatformHealthDashboard = {
  metrics: PlatformHealthMetric[]
  summary: {
    healthScore: number
    uptimePct: number
    apiSuccessRate: number
    errorRate: number
    avgApiMs: number
    dbHealth: number
    backupSuccessRate: number
    lastSuccessfulBackupAt: string | null
    generatedAt: string
    environment: string
    region: string
    maintenanceActive: boolean
  }
  charts: {
    platformTrends: Array<{
      date: string
      transactions: number
      supportTickets: number
      uptime: number
    }>
    systemPerformance24h: Array<{
      time: string
      memoryUsage: number
      cpuUsage: number
      requestsPerMin: number
    }>
    healthTrend: Array<{ date: string; healthScore: number; uptime: number; errorRate: number }>
    performance: Array<{
      time: string
      apiResponseMs: number
      errorRate: number
      queueSeconds: number
    }>
    apiTraffic: Array<{ date: string; requests: number }>
    errorDistribution: Array<{ name: string; value: number }>
    securityCompliance: Array<{
      month: string
      compliance: number
      issuesResolved: number
      security: number
    }>
    backupTrend: Array<{ date: string; successRate: number }>
    infrastructureUtilization: Array<{
      date: string
      cpu: number
      memory: number
      storage: number
    }>
    incidentTimeline: Array<{
      id: string
      severity: string
      module: string
      status: string
      reason: string
      at: string
      resolvedAt: string | null
    }>
  }
  infrastructure: PlatformHealthInfraRow[]
  filters: {
    dateRange: PlatformHealthDateRange
    startDate: string | null
    endDate: string | null
    environment: string | null
    infrastructureType: string | null
    serviceStatus: string | null
    region: string | null
    severity: string | null
    incidentStatus: string | null
  }
}

export type PlatformHealthFilters = {
  dateRange?: PlatformHealthDateRange
  startDate?: string
  endDate?: string
  environment?: string
  infrastructureType?: string
  serviceStatus?: string
  region?: string
  severity?: string
  incidentStatus?: string
}
