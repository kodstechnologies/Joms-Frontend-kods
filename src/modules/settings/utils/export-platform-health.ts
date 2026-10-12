import type { PlatformHealthDashboard, PlatformHealthMetric } from '../types/platform-health'
import { exportSheetsToFile } from '@/shared/utils/export-utils'

export type PlatformHealthExportData = {
  rangeLabel: string
  serviceStatusFilter: string
  metrics: PlatformHealthMetric[]
  dashboard?: PlatformHealthDashboard | null
}

const rowsFromPairs = (rows: Array<{ label: string; value: string | number }>) =>
  rows.map((row) => [row.label, row.value])

export async function exportPlatformHealthToExcel(
  data: PlatformHealthExportData,
  format = 'excel',
) {
  const date = new Date().toISOString().slice(0, 10)
  const filePrefix = `platform_health_${date}`
  const charts = data.dashboard?.charts
  const summary = data.dashboard?.summary

  await exportSheetsToFile(
    [
      {
        name: 'Metrics',
        headers: ['Metric', 'Value'],
        rows: [
          ['Date Range', data.rangeLabel],
          ['Service Status Filter', data.serviceStatusFilter || 'All statuses'],
          ...data.metrics.map((metric) => [metric.label, metric.value]),
        ],
      },
      {
        name: 'Summary',
        headers: ['Field', 'Value'],
        rows: summary
          ? rowsFromPairs([
              { label: 'Health Score', value: summary.healthScore },
              { label: 'Uptime %', value: summary.uptimePct },
              { label: 'API Success Rate', value: summary.apiSuccessRate },
              { label: 'Error Rate', value: summary.errorRate },
              { label: 'Avg API (ms)', value: summary.avgApiMs },
              { label: 'DB Health', value: summary.dbHealth },
              { label: 'Backup Success Rate', value: summary.backupSuccessRate },
              { label: 'Last Successful Backup', value: summary.lastSuccessfulBackupAt || '—' },
              { label: 'Environment', value: summary.environment },
              { label: 'Region', value: summary.region },
              { label: 'Maintenance Active', value: summary.maintenanceActive ? 'Yes' : 'No' },
              { label: 'Generated At', value: summary.generatedAt },
            ])
          : [],
      },
      {
        name: 'Platform Trends',
        headers: ['Date', 'Transactions (K)', 'Support Tickets', 'Uptime %'],
        rows: (charts?.platformTrends || []).map((row) => [
          row.date,
          row.transactions,
          row.supportTickets,
          row.uptime,
        ]),
      },
      {
        name: 'System Performance 24h',
        headers: ['Time', 'Memory %', 'CPU %', 'Request/min', 'API Response (ms)', 'Error Rate %'],
        rows: (charts?.systemPerformance24h || []).map((row) => [
          row.time,
          row.memory,
          row.cpu,
          row.requestsPerMin,
          row.apiResponseMs,
          row.errorRate,
        ]),
      },
      {
        name: 'API Traffic',
        headers: ['Date', 'Requests'],
        rows: (charts?.apiTraffic || []).map((row) => [row.date, row.requests]),
      },
      {
        name: 'Error Distribution',
        headers: ['Category', 'Count'],
        rows: (charts?.errorDistribution || []).map((row) => [row.name, row.value]),
      },
      {
        name: 'Security Compliance',
        headers: ['Month', 'Compliance Flags', 'Issues Resolved', 'Security Incidents'],
        rows: (charts?.securityCompliance || []).map((row) => [
          row.month,
          row.compliance,
          row.issuesResolved,
          row.security,
        ]),
      },
      {
        name: 'Backup Trend',
        headers: ['Date', 'Success Rate %'],
        rows: (charts?.backupTrend || []).map((row) => [row.date, row.successRate]),
      },
      {
        name: 'Infrastructure Util',
        headers: ['Date', 'CPU %', 'Memory %', 'Storage %'],
        rows: (charts?.infrastructureUtilization || []).map((row) => [
          row.date,
          row.cpu,
          row.memory,
          row.storage,
        ]),
      },
      {
        name: 'Incidents',
        headers: ['ID', 'Module', 'Severity', 'Status', 'Reason', 'At', 'Resolved At'],
        rows: (charts?.incidentTimeline || []).map((row) => [
          row.id,
          row.module,
          row.severity,
          row.status,
          row.reason,
          row.at,
          row.resolvedAt || '—',
        ]),
      },
      {
        name: 'Infrastructure',
        headers: [
          'ID',
          'Name',
          'Service Type',
          'Status',
          'Uptime %',
          'CPU %',
          'Memory %',
          'Storage %',
          'Latency (ms)',
          'Avg Response (ms)',
          'Errors',
          'Last Health Check',
        ],
        rows: (data.dashboard?.infrastructure || []).map((row) => [
          row.id,
          row.name,
          row.serviceType,
          row.status,
          row.uptime,
          row.cpuUsage,
          row.memoryUsage,
          row.storageUsage,
          row.networkLatencyMs ?? '—',
          row.avgResponseTimeMs ?? '—',
          row.errorCount,
          row.lastHealthCheck || '—',
        ]),
      },
    ].filter((sheet) => sheet.rows.length > 0),
    filePrefix,
    format,
  )
}
