import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { RefreshCw, Settings2, Upload } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import {
  PlatformHealthMetricCard,
  PlatformHealthMetricCardSkeleton,
} from '../components/platform-health-metric-card'
import {
  DEFAULT_PLATFORM_HEALTH_METRIC_IDS,
  PLATFORM_HEALTH_LEGACY_METRIC_ID_MAP,
  PLATFORM_HEALTH_METRIC_IDS,
  PLATFORM_HEALTH_METRIC_ID_SET,
  PLATFORM_HEALTH_MODULE_KEY,
} from '../config/platform-health-metrics.config'
import {
  DEFAULT_PLATFORM_HEALTH_VISIBLE_COLUMN_IDS,
  PLATFORM_HEALTH_LEGACY_COLUMN_ID_MAP,
  PLATFORM_HEALTH_TABLE_COLUMNS_CATALOG,
} from '../config/platform-health-table-columns.config'
import { usePlatformHealthDashboard } from '../hooks/use-platform-health'
import type { PlatformHealthDateRange, PlatformHealthInfraRow } from '../types/platform-health'
import { buildPlatformHealthMetricCards } from '../utils/platform-health-metrics'
import { exportPlatformHealthToExcel } from '../utils/export-platform-health'
import {
  orderByActiveMetricIds,
  useActiveMetricIds,
} from '@/modules/expert/hooks/use-active-metric-ids'
import { useTableColumnPreferences } from '@/modules/expert/hooks/use-ui-preferences'
import { sortIdsByCatalogOrder } from '@/shared/lib/dedupe-ids'
import { cn } from '@/shared/lib/cn'
import { uiTokens } from '@/shared/lib/design-tokens'

const tooltipStyle = {
  background: '#ffffff',
  border: '1px solid #155dfc',
  borderRadius: 8,
  padding: '10px 12px',
  color: '#111111',
  boxShadow: '0 12px 30px rgba(0,0,0,0.18)',
} as const

const RANGE_OPTIONS = ['Last 3 Months', 'Last Month', 'Last 30 Days', 'Last 7 Days'] as const

const RANGE_MAP: Record<string, PlatformHealthDateRange> = {
  'Last 3 Months': 'quarter',
  'Last Month': 'lastMonth',
  'Last 30 Days': 'last30days',
  'Last 7 Days': 'last7days',
}

const STATUS_STYLES: Record<PlatformHealthInfraRow['status'], string> = {
  Healthy: 'text-brand-positive',
  Warning: 'text-amber-400',
  Critical: 'text-brand-danger',
  Maintenance: 'text-brand-action',
  Offline: 'text-muted',
}

const CHART_COLORS = {
  transactions: '#155dfc',
  supportTickets: '#f6cb86',
  uptime: '#00a63e',
  memory: '#f6cb86',
  cpu: '#155dfc',
  requests: '#00a63e',
  compliance: '#f6cb86',
  resolved: '#00a63e',
  security: '#d3191c',
}

function ChartLegend({ payload }: { payload?: Array<{ value?: string; color?: string }> }) {
  if (!payload?.length) return null
  return (
    <div className="flex flex-wrap items-center justify-center gap-5 pt-4">
      {payload.map((entry) => (
        <div key={entry.value} className="flex items-center gap-2">
          <span
            className="inline-block size-2.5 rotate-45 rounded-[1px]"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-body-sm text-muted">{entry.value}</span>
        </div>
      ))}
    </div>
  )
}

function ChartSkeleton() {
  return (
    <div className="flex h-[420px] w-full items-end gap-2 px-2 pb-4">
      {Array.from({ length: 12 }).map((_, index) => (
        <div
          key={`chart-skel-${index}`}
          className="flex-1 animate-pulse rounded-t bg-white/10"
          style={{ height: `${30 + ((index * 17) % 60)}%` }}
        />
      ))}
    </div>
  )
}

function TableRowSkeleton() {
  return (
    <div className="radius-lg bg-brand-bg grid gap-4 border border-white/10 px-4 py-4 lg:grid-cols-6 lg:items-center">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={`infra-skel-${index}`} className="h-4 animate-pulse rounded bg-white/10" />
      ))}
    </div>
  )
}

function ChartPanel({
  title,
  children,
  range,
  onRangeChange,
  onRefresh,
  isLoading,
}: {
  title: string
  children: ReactNode
  range: string
  onRangeChange: (value: string) => void
  onRefresh?: () => void
  isLoading?: boolean
}) {
  return (
    <section
      className={cn(uiTokens.radiusCard, 'bg-brand-surface border border-white/10 p-4 sm:p-5')}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-body-md-semibold text-brand-text">{title}</h2>
        <div className="flex items-center gap-2">
          <select
            value={range}
            onChange={(event) => onRangeChange(event.target.value)}
            className="radius-md bg-brand-bg text-body-sm text-brand-text/80 h-9 min-w-[140px] border border-white/10 px-3"
          >
            {RANGE_OPTIONS.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={onRefresh}
            className="bg-brand-bg text-muted hover:text-brand-text grid size-9 place-items-center rounded-full border border-white/10"
            aria-label="Refresh chart"
          >
            <RefreshCw className={cn('size-4', isLoading && 'animate-spin')} />
          </button>
        </div>
      </div>
      {isLoading ? <ChartSkeleton /> : children}
    </section>
  )
}

function LoadBar({ value }: { value: number }) {
  const tone =
    value >= 90 ? 'bg-brand-danger' : value >= 70 ? 'bg-brand-accent' : 'bg-brand-positive'
  return (
    <div className="h-2 w-full max-w-[180px] overflow-hidden rounded-full bg-white/10">
      <div
        className={cn('h-full rounded-full', tone)}
        style={{ width: `${Math.min(100, value)}%` }}
      />
    </div>
  )
}

export function PlatformHealthPage() {
  const navigate = useNavigate()
  const [selectedRange, setSelectedRange] = useState<string>('Last 3 Months')
  const [serviceStatus, setServiceStatus] = useState('')

  const dateRange = RANGE_MAP[selectedRange] || 'quarter'
  const dashboardQuery = usePlatformHealthDashboard({
    dateRange,
    serviceStatus: serviceStatus || undefined,
  })
  const dashboardData = dashboardQuery.data
  const isLoading = dashboardQuery.isLoading

  const tableColumnPreferencesQuery = useTableColumnPreferences(PLATFORM_HEALTH_MODULE_KEY)
  const activeMetricIds = useActiveMetricIds(PLATFORM_HEALTH_MODULE_KEY, [
    ...DEFAULT_PLATFORM_HEALTH_METRIC_IDS,
  ])

  const filteredActiveMetricIds = useMemo(
    () =>
      sortIdsByCatalogOrder(
        activeMetricIds
          .map((id) => PLATFORM_HEALTH_LEGACY_METRIC_ID_MAP[id] ?? id)
          .filter((id) => PLATFORM_HEALTH_METRIC_ID_SET.has(id)),
        PLATFORM_HEALTH_METRIC_IDS,
      ),
    [activeMetricIds],
  )

  const visibleMetrics = useMemo(() => {
    const allMetrics = buildPlatformHealthMetricCards(dashboardData?.metrics)
    return orderByActiveMetricIds(allMetrics, filteredActiveMetricIds)
  }, [dashboardData?.metrics, filteredActiveMetricIds])

  const visibleInfraColumnIds = useMemo(() => {
    const catalogIds = PLATFORM_HEALTH_TABLE_COLUMNS_CATALOG.map((column) => column.id)
    const rawVisibleIds = tableColumnPreferencesQuery.data?.visibleColumnIds?.length
      ? tableColumnPreferencesQuery.data.visibleColumnIds
      : DEFAULT_PLATFORM_HEALTH_VISIBLE_COLUMN_IDS
    const normalized = [
      ...new Set(rawVisibleIds.map((id) => PLATFORM_HEALTH_LEGACY_COLUMN_ID_MAP[id] ?? id)),
    ]
    return sortIdsByCatalogOrder(
      normalized.filter((id) => catalogIds.includes(id)),
      catalogIds,
    )
  }, [tableColumnPreferencesQuery.data])

  const infraColumnVisible = useMemo(() => new Set(visibleInfraColumnIds), [visibleInfraColumnIds])

  const charts = dashboardData?.charts
  const infrastructure = dashboardData?.infrastructure || []
  const skeletonCount = filteredActiveMetricIds.length || DEFAULT_PLATFORM_HEALTH_METRIC_IDS.length

  const refresh = () => {
    dashboardQuery.refetch()
  }

  const handleExportData = useCallback(async () => {
    if (isLoading) {
      toast.message('Please wait for data to load')
      return
    }

    if (!visibleMetrics.length && !dashboardData) {
      toast.error('No data available to export')
      return
    }

    try {
      await exportPlatformHealthToExcel({
        rangeLabel: selectedRange,
        serviceStatusFilter: serviceStatus || 'All statuses',
        metrics: visibleMetrics,
        dashboard: dashboardData,
      })
      toast.success('Exported as Excel')
    } catch {
      toast.error('Failed to export platform health data')
    }
  }, [dashboardData, isLoading, selectedRange, serviceStatus, visibleMetrics])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-h1 text-brand-text sm:text-h1 font-semibold tracking-tight">
            Platform Health & Operations
          </h1>
          <p className="text-body-md text-muted sm:text-body-lg mt-1">
            System performance, security metrics, and operational analytics
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleExportData}
            className="ui-export-data ui-cta ui-cta-primary inline-flex items-center gap-2 px-4"
          >
            <Upload className="size-4" />
            Export Data
          </button>
          <button
            type="button"
            onClick={() => navigate('/metrics/platform-health?section=table')}
            className="ui-manage-metrics ui-cta ui-cta-primary inline-flex items-center gap-2 px-4"
          >
            <Settings2 className="size-4" />
            Manage Metrics
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {isLoading
          ? Array.from({ length: skeletonCount }).map((_, index) => (
              <PlatformHealthMetricCardSkeleton key={`health-metric-skel-${index}`} />
            ))
          : visibleMetrics.map((metric) => (
              <PlatformHealthMetricCard key={metric.id} metric={metric} />
            ))}
      </div>

      <ChartPanel
        title="Platform Health Trends"
        range={selectedRange}
        onRangeChange={setSelectedRange}
        onRefresh={refresh}
        isLoading={isLoading}
      >
        <div className="h-[420px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={charts?.platformTrends || []}
              margin={{ left: 4, right: 12, top: 8, bottom: 0 }}
              barGap={2}
              barCategoryGap="18%"
            >
              <CartesianGrid
                stroke="rgba(255,255,255,0.06)"
                strokeDasharray="3 3"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'rgba(148,163,184,0.85)', fontSize: 12 }}
              />
              <YAxis
                yAxisId="left"
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'rgba(148,163,184,0.85)', fontSize: 12 }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[99, 100]}
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'rgba(148,163,184,0.85)', fontSize: 12 }}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value, name) => {
                  if (name === 'Uptime %') return [`${value}%`, name]
                  return [value, name]
                }}
              />
              <Legend content={<ChartLegend />} />
              <Bar
                yAxisId="left"
                dataKey="supportTickets"
                name="Support tickets"
                fill={CHART_COLORS.supportTickets}
                radius={[4, 4, 0, 0]}
                maxBarSize={28}
              />
              <Bar
                yAxisId="left"
                dataKey="transactions"
                name="Transactions (K)"
                fill={CHART_COLORS.transactions}
                radius={[4, 4, 0, 0]}
                maxBarSize={36}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="uptime"
                name="Uptime %"
                stroke={CHART_COLORS.uptime}
                strokeWidth={2}
                dot={{ r: 4, fill: CHART_COLORS.uptime }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </ChartPanel>

      <ChartPanel
        title="System Performance (24h)"
        range={selectedRange}
        onRangeChange={setSelectedRange}
        onRefresh={refresh}
        isLoading={isLoading}
      >
        <div className="h-[420px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={charts?.systemPerformance24h || []}
              margin={{ left: 4, right: 12, top: 8, bottom: 0 }}
            >
              <CartesianGrid
                stroke="rgba(255,255,255,0.06)"
                strokeDasharray="3 3"
                vertical={false}
              />
              <XAxis
                dataKey="time"
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'rgba(148,163,184,0.85)', fontSize: 12 }}
              />
              <YAxis
                yAxisId="left"
                domain={[0, 100]}
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'rgba(148,163,184,0.85)', fontSize: 12 }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'rgba(148,163,184,0.85)', fontSize: 12 }}
              />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend content={<ChartLegend />} />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="memoryUsage"
                name="Memory usage"
                stroke={CHART_COLORS.memory}
                fill={CHART_COLORS.memory}
                fillOpacity={0.2}
                strokeWidth={2}
              />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="cpuUsage"
                name="CPU Usage"
                stroke={CHART_COLORS.cpu}
                fill={CHART_COLORS.cpu}
                fillOpacity={0.2}
                strokeWidth={2}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="requestsPerMin"
                name="Request/min"
                stroke={CHART_COLORS.requests}
                strokeWidth={2}
                dot={{ r: 4, fill: CHART_COLORS.requests }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </ChartPanel>

      <ChartPanel
        title="Security & Compliance Tracking"
        range={selectedRange}
        onRangeChange={setSelectedRange}
        onRefresh={refresh}
        isLoading={isLoading}
      >
        <div className="h-[420px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={charts?.securityCompliance || []}
              margin={{ left: 4, right: 8, top: 8, bottom: 0 }}
              barGap={4}
              barCategoryGap="24%"
            >
              <CartesianGrid
                stroke="rgba(255,255,255,0.06)"
                strokeDasharray="3 3"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'rgba(148,163,184,0.85)', fontSize: 12 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'rgba(148,163,184,0.85)', fontSize: 12 }}
              />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend content={<ChartLegend />} />
              <Bar
                dataKey="compliance"
                name="Compliance Flags"
                fill={CHART_COLORS.compliance}
                radius={[4, 4, 0, 0]}
                maxBarSize={28}
              />
              <Bar
                dataKey="issuesResolved"
                name="Issues Resolved"
                fill={CHART_COLORS.resolved}
                radius={[4, 4, 0, 0]}
                maxBarSize={28}
              />
              <Bar
                dataKey="security"
                name="Security Incidents"
                fill={CHART_COLORS.security}
                radius={[4, 4, 0, 0]}
                maxBarSize={28}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </ChartPanel>

      <section
        className={cn(uiTokens.radiusCard, 'bg-brand-surface border border-white/10 p-4 sm:p-5')}
      >
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-body-md-semibold text-brand-text">Infrastructure Health</h2>
          <div className="flex items-center gap-2">
            <select
              value={serviceStatus}
              onChange={(event) => setServiceStatus(event.target.value)}
              className="radius-md bg-brand-bg text-body-sm text-brand-text/80 h-9 border border-white/10 px-3"
            >
              <option value="">All statuses</option>
              <option value="Healthy">Healthy</option>
              <option value="Warning">Warning</option>
              <option value="Critical">Critical</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Offline">Offline</option>
            </select>
            <button
              type="button"
              onClick={refresh}
              className="bg-brand-bg text-muted hover:text-brand-text grid size-9 place-items-center rounded-full border border-white/10"
              aria-label="Refresh infrastructure"
            >
              <RefreshCw className={cn('size-4', dashboardQuery.isFetching && 'animate-spin')} />
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {isLoading
            ? Array.from({ length: 6 }).map((_, index) => (
                <TableRowSkeleton key={`infra-row-${index}`} />
              ))
            : infrastructure.map((row) => {
                const showName = infraColumnVisible.has('infrastructure-name')
                const showId = infraColumnVisible.has('infrastructure-id')
                const showServiceType = infraColumnVisible.has('service-type')
                const showStatus = infraColumnVisible.has('status')
                const showUptime = infraColumnVisible.has('uptime')
                const showCpu = infraColumnVisible.has('cpu-usage')
                const showMemory = infraColumnVisible.has('memory-usage')
                const showStorage = infraColumnVisible.has('storage-usage')
                const showLatency = infraColumnVisible.has('network-latency')
                const showAvgResponse = infraColumnVisible.has('average-response-time')
                const showErrors = infraColumnVisible.has('error-count')
                const showLastCheck = infraColumnVisible.has('last-health-check')
                const showLoadBar = showCpu || showMemory || showStorage

                return (
                  <div
                    key={row.id}
                    className="radius-lg bg-brand-bg grid gap-4 border border-white/10 px-4 py-4 lg:grid-cols-[minmax(0,1.5fr)_repeat(auto-fit,minmax(90px,1fr))] lg:items-center"
                  >
                    {(showName || showId || showServiceType || showStatus) && (
                      <div className="flex items-start gap-3">
                        {showStatus ? (
                          <span
                            className={cn(
                              'mt-1.5 inline-block size-2 rounded-full',
                              row.status === 'Healthy'
                                ? 'bg-brand-positive'
                                : row.status === 'Warning'
                                  ? 'bg-amber-400'
                                  : row.status === 'Offline'
                                    ? 'bg-white/30'
                                    : 'bg-brand-danger',
                            )}
                          />
                        ) : null}
                        <div>
                          {showName ? (
                            <p className="text-body-md-semibold text-brand-text">{row.name}</p>
                          ) : null}
                          {showId ? (
                            <p className="text-body-sm text-muted font-mono">{row.id}</p>
                          ) : null}
                          {(showServiceType || showStatus) && (
                            <p
                              className={cn(
                                'text-body-sm',
                                showStatus && STATUS_STYLES[row.status],
                              )}
                            >
                              {[
                                showServiceType ? row.serviceType : null,
                                showStatus ? row.status : null,
                              ]
                                .filter(Boolean)
                                .join(' · ')}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                    {showUptime ? (
                      <div>
                        <p className="text-body-sm-semibold text-muted tracking-wide uppercase">
                          Uptime
                        </p>
                        <p className="text-body-md-semibold text-brand-text mt-1">
                          {row.uptime.toFixed(2)}%
                        </p>
                      </div>
                    ) : null}
                    {showCpu ? (
                      <div>
                        <p className="text-body-sm-semibold text-muted tracking-wide uppercase">
                          CPU
                        </p>
                        <p className="text-body-md-semibold text-brand-text mt-1">
                          {row.cpuUsage}%
                        </p>
                      </div>
                    ) : null}
                    {showMemory ? (
                      <div>
                        <p className="text-body-sm-semibold text-muted tracking-wide uppercase">
                          Memory
                        </p>
                        <p className="text-body-md-semibold text-brand-text mt-1">
                          {row.memoryUsage}%
                        </p>
                      </div>
                    ) : null}
                    {showStorage ? (
                      <div>
                        <p className="text-body-sm-semibold text-muted tracking-wide uppercase">
                          Storage
                        </p>
                        <p className="text-body-md-semibold text-brand-text mt-1">
                          {row.storageUsage}%
                        </p>
                      </div>
                    ) : null}
                    {showLatency ? (
                      <div>
                        <p className="text-body-sm-semibold text-muted tracking-wide uppercase">
                          Latency
                        </p>
                        <p className="text-body-md-semibold text-brand-text mt-1">
                          {row.networkLatencyMs == null ? '—' : `${row.networkLatencyMs} ms`}
                        </p>
                      </div>
                    ) : null}
                    {showAvgResponse ? (
                      <div>
                        <p className="text-body-sm-semibold text-muted tracking-wide uppercase">
                          Avg Response
                        </p>
                        <p className="text-body-md-semibold text-brand-text mt-1">
                          {row.avgResponseTimeMs == null ? '—' : `${row.avgResponseTimeMs} ms`}
                        </p>
                      </div>
                    ) : null}
                    {showErrors ? (
                      <div>
                        <p className="text-body-sm-semibold text-muted tracking-wide uppercase">
                          Errors
                        </p>
                        <p className="text-body-md-semibold text-brand-text mt-1">
                          {row.errorCount}
                        </p>
                      </div>
                    ) : null}
                    {showLastCheck ? (
                      <div>
                        <p className="text-body-sm-semibold text-muted tracking-wide uppercase">
                          Last Check
                        </p>
                        <p className="text-body-md-semibold text-brand-text mt-1">
                          {row.lastHealthCheck || '—'}
                        </p>
                      </div>
                    ) : null}
                    {showLoadBar ? (
                      <LoadBar value={Math.max(row.cpuUsage, row.memoryUsage, row.storageUsage)} />
                    ) : null}
                  </div>
                )
              })}
        </div>
      </section>
    </div>
  )
}
