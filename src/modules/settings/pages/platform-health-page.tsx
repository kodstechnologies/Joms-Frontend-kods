import { useMemo, useState, type ReactNode } from 'react'
import { Check, RefreshCw, Settings2, Upload } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  Area,
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import {
  DEFAULT_PLATFORM_HEALTH_METRIC_IDS,
  PLATFORM_HEALTH_METRIC_IDS,
  PLATFORM_HEALTH_METRIC_ID_SET,
  PLATFORM_HEALTH_MODULE_KEY,
} from '../config/platform-health-metrics.config'
import { usePlatformHealthDashboard } from '../hooks/use-platform-health'
import type {
  PlatformHealthDateRange,
  PlatformHealthInfraRow,
  PlatformHealthMetric,
} from '../types/platform-health'
import { buildPlatformHealthMetricCards } from '../utils/platform-health-metrics'
import {
  orderByActiveMetricIds,
  useActiveMetricIds,
} from '@/modules/expert/hooks/use-active-metric-ids'
import { sortIdsByCatalogOrder } from '@/shared/lib/dedupe-ids'
import { cn } from '@/shared/lib/cn'
import { uiTokens } from '@/shared/lib/design-tokens'

const tooltipStyle = {
  background: '#ffffff',
  border: '1px solid rgba(0,0,0,0.08)',
  borderRadius: 10,
  padding: '10px 12px',
  color: '#111111',
  boxShadow: '0 12px 30px rgba(0,0,0,0.18)',
} as const

const RANGE_MAP: Record<string, PlatformHealthDateRange> = {
  'Last 3 Months': 'quarter',
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

const PIE_COLORS = ['#155dfc', '#d3191c', '#f6cb86', '#64748b']

function HealthMetricCard({ metric }: { metric: PlatformHealthMetric }) {
  return (
    <div className={cn(uiTokens.radiusCard, 'bg-brand-surface border border-white/10 p-4 sm:p-5')}>
      <p className="text-body-sm text-muted">{metric.label}</p>
      <p className="text-h2 text-brand-text sm:text-h2 mt-2 font-semibold tracking-tight">
        {metric.value}
      </p>
      <div className="mt-3 min-h-[28px]">
        {metric.trend ? (
          <span
            className={cn(
              'text-body-sm-semibold inline-flex rounded-full px-2.5 py-1',
              metric.trend.tone === 'positive'
                ? 'bg-brand-positive/15 text-brand-positive'
                : 'bg-brand-danger/15 text-brand-danger',
            )}
          >
            {metric.trend.text}
          </span>
        ) : null}
        {metric.hint ? <p className="text-body-sm-semibold text-muted">{metric.hint}</p> : null}
        {metric.status ? (
          <p className="text-body-sm-semibold text-muted inline-flex items-center gap-1.5">
            <Check className="text-brand-text size-3.5" />
            {metric.status}
          </p>
        ) : null}
      </div>
    </div>
  )
}

function MetricCardSkeleton() {
  return (
    <div className={cn(uiTokens.radiusCard, 'bg-brand-surface border border-white/10 p-4 sm:p-5')}>
      <div className="h-3 w-28 animate-pulse rounded bg-white/10" />
      <div className="mt-3 h-8 w-20 animate-pulse rounded bg-white/10" />
      <div className="mt-4 h-5 w-32 animate-pulse rounded bg-white/5" />
    </div>
  )
}

function ChartSkeleton() {
  return (
    <div className="flex h-[300px] w-full items-end gap-2 px-2 pb-4">
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
            className="radius-md bg-brand-bg text-body-sm text-brand-text/80 h-9 border border-white/10 px-3"
          >
            <option>Last 3 Months</option>
            <option>Last 30 Days</option>
            <option>Last 7 Days</option>
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
  const [selectedRange, setSelectedRange] = useState('Last 30 Days')
  const [serviceStatus, setServiceStatus] = useState('')

  const dateRange = RANGE_MAP[selectedRange] || 'last30days'
  const dashboardQuery = usePlatformHealthDashboard({
    dateRange,
    serviceStatus: serviceStatus || undefined,
  })
  const dashboardData = dashboardQuery.data
  const isLoading = dashboardQuery.isLoading

  const activeMetricIds = useActiveMetricIds(PLATFORM_HEALTH_MODULE_KEY, [
    ...DEFAULT_PLATFORM_HEALTH_METRIC_IDS,
  ])

  const filteredActiveMetricIds = useMemo(
    () =>
      sortIdsByCatalogOrder(
        activeMetricIds.filter((id) => PLATFORM_HEALTH_METRIC_ID_SET.has(id)),
        PLATFORM_HEALTH_METRIC_IDS,
      ),
    [activeMetricIds],
  )

  const visibleMetrics = useMemo(() => {
    const allMetrics = buildPlatformHealthMetricCards(dashboardData?.metrics)
    return orderByActiveMetricIds(allMetrics, filteredActiveMetricIds)
  }, [dashboardData?.metrics, filteredActiveMetricIds])

  const charts = dashboardData?.charts
  const infrastructure = dashboardData?.infrastructure || []
  const skeletonCount = filteredActiveMetricIds.length || DEFAULT_PLATFORM_HEALTH_METRIC_IDS.length

  const refresh = () => {
    dashboardQuery.refetch()
  }

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
            onClick={() => toast.message('Export coming soon')}
            className="ui-export-data ui-cta ui-cta-primary inline-flex items-center gap-2 px-4"
          >
            <Upload className="size-4" />
            Export Data
          </button>
          <button
            type="button"
            onClick={() => navigate('/metrics/platform-health')}
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
              <MetricCardSkeleton key={`health-metric-skel-${index}`} />
            ))
          : visibleMetrics.map((metric) => <HealthMetricCard key={metric.id} metric={metric} />)}
      </div>

      <ChartPanel
        title="Platform Health Trend"
        range={selectedRange}
        onRangeChange={setSelectedRange}
        onRefresh={refresh}
        isLoading={isLoading}
      >
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={charts?.healthTrend || []}
              margin={{ left: 4, right: 8, top: 8, bottom: 0 }}
            >
              <CartesianGrid stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" vertical />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'rgba(148,163,184,0.85)', fontSize: 12 }}
              />
              <YAxis
                domain={[0, 100]}
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'rgba(148,163,184,0.85)', fontSize: 12 }}
              />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend
                wrapperStyle={{ color: 'rgba(148,163,184,0.9)', fontSize: 12, paddingTop: 12 }}
              />
              <Line
                type="monotone"
                dataKey="healthScore"
                name="Health score"
                stroke="#155dfc"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="uptime"
                name="Uptime %"
                stroke="#00a63e"
                strokeWidth={2}
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </ChartPanel>

      <ChartPanel
        title="System Performance"
        range={selectedRange}
        onRangeChange={setSelectedRange}
        onRefresh={refresh}
        isLoading={isLoading}
      >
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={charts?.performance || []}
              margin={{ left: 4, right: 8, top: 8, bottom: 0 }}
            >
              <CartesianGrid stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" vertical />
              <XAxis
                dataKey="time"
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
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'rgba(148,163,184,0.85)', fontSize: 12 }}
              />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend
                wrapperStyle={{ color: 'rgba(148,163,184,0.9)', fontSize: 12, paddingTop: 12 }}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="apiResponseMs"
                name="API response (ms)"
                stroke="#155dfc"
                strokeWidth={2}
                dot={false}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="errorRate"
                name="Error rate %"
                stroke="#d3191c"
                strokeWidth={2}
                dot={false}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="queueSeconds"
                name="Queue time (s)"
                stroke="#f6cb86"
                strokeWidth={2}
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </ChartPanel>

      <div className="grid gap-6 xl:grid-cols-2">
        <ChartPanel
          title="API Traffic"
          range={selectedRange}
          onRangeChange={setSelectedRange}
          onRefresh={refresh}
          isLoading={isLoading}
        >
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={charts?.apiTraffic || []}
                margin={{ left: 4, right: 8, top: 8, bottom: 0 }}
              >
                <CartesianGrid stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
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
                <Line
                  type="monotone"
                  dataKey="requests"
                  name="Probes"
                  stroke="#00a63e"
                  strokeWidth={2}
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </ChartPanel>

        <ChartPanel
          title="Error Distribution"
          range={selectedRange}
          onRangeChange={setSelectedRange}
          onRefresh={refresh}
          isLoading={isLoading}
        >
          <div className="h-[300px] w-full">
            {(charts?.errorDistribution || []).length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts?.errorDistribution || []}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={70}
                    outerRadius={110}
                  >
                    {(charts?.errorDistribution || []).map((entry, index) => (
                      <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted flex h-full items-center justify-center text-sm">
                No failed probes in this range
              </p>
            )}
          </div>
        </ChartPanel>
      </div>

      <ChartPanel
        title="Security & Compliance Tracking"
        range={selectedRange}
        onRangeChange={setSelectedRange}
        onRefresh={refresh}
        isLoading={isLoading}
      >
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={charts?.securityCompliance || []}
              margin={{ left: 4, right: 8, top: 8, bottom: 0 }}
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
              <Legend
                wrapperStyle={{ color: 'rgba(148,163,184,0.9)', fontSize: 12, paddingTop: 12 }}
              />
              <Bar
                dataKey="compliance"
                name="Compliance flags"
                stackId="a"
                fill="#f6cb86"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="security"
                name="Security alerts"
                stackId="a"
                fill="#d3191c"
                radius={[6, 6, 0, 0]}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </ChartPanel>

      <div className="grid gap-6 xl:grid-cols-2">
        <ChartPanel
          title="Backup Success Trend"
          range={selectedRange}
          onRangeChange={setSelectedRange}
          onRefresh={refresh}
          isLoading={isLoading}
        >
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={charts?.backupTrend || []}
                margin={{ left: 4, right: 8, top: 8, bottom: 0 }}
              >
                <CartesianGrid stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: 'rgba(148,163,184,0.85)', fontSize: 12 }}
                />
                <YAxis
                  domain={[0, 100]}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: 'rgba(148,163,184,0.85)', fontSize: 12 }}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Line
                  type="monotone"
                  dataKey="successRate"
                  name="Backup success %"
                  stroke="#00a63e"
                  strokeWidth={2}
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </ChartPanel>

        <ChartPanel
          title="Infrastructure Utilization"
          range={selectedRange}
          onRangeChange={setSelectedRange}
          onRefresh={refresh}
          isLoading={isLoading}
        >
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={charts?.infrastructureUtilization || []}
                margin={{ left: 4, right: 8, top: 8, bottom: 0 }}
              >
                <CartesianGrid stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: 'rgba(148,163,184,0.85)', fontSize: 12 }}
                />
                <YAxis
                  domain={[0, 100]}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: 'rgba(148,163,184,0.85)', fontSize: 12 }}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="cpu"
                  name="CPU %"
                  stroke="#155dfc"
                  fill="#155dfc"
                  fillOpacity={0.2}
                />
                <Area
                  type="monotone"
                  dataKey="memory"
                  name="Memory %"
                  stroke="#f6cb86"
                  fill="#f6cb86"
                  fillOpacity={0.2}
                />
                <Area
                  type="monotone"
                  dataKey="storage"
                  name="Storage %"
                  stroke="#00a63e"
                  fill="#00a63e"
                  fillOpacity={0.2}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </ChartPanel>
      </div>

      <section
        className={cn(uiTokens.radiusCard, 'bg-brand-surface border border-white/10 p-4 sm:p-5')}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-body-md-semibold text-brand-text">Active Incident Timeline</h2>
          <button
            type="button"
            onClick={refresh}
            className="bg-brand-bg text-muted hover:text-brand-text grid size-9 place-items-center rounded-full border border-white/10"
            aria-label="Refresh incidents"
          >
            <RefreshCw className={cn('size-4', dashboardQuery.isFetching && 'animate-spin')} />
          </button>
        </div>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={`incident-skel-${index}`}
                className="h-12 animate-pulse rounded-lg bg-white/10"
              />
            ))}
          </div>
        ) : (charts?.incidentTimeline || []).length ? (
          <div className="space-y-3">
            {(charts?.incidentTimeline || []).map((incident) => (
              <div
                key={`${incident.id}-${incident.at}`}
                className="radius-lg bg-brand-bg border border-white/10 px-4 py-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-body-md-semibold text-brand-text">
                    {incident.id} · {incident.module}
                  </p>
                  <p className="text-body-sm text-muted">{incident.at}</p>
                </div>
                <p className="text-body-sm text-muted mt-1">
                  {incident.severity} · {incident.status}
                  {incident.reason ? ` · ${incident.reason}` : ''}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted text-sm">No incidents in this range</p>
        )}
      </section>

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
            : infrastructure.map((row) => (
                <div
                  key={row.id}
                  className="radius-lg bg-brand-bg grid gap-4 border border-white/10 px-4 py-4 lg:grid-cols-[minmax(0,1.5fr)_110px_90px_90px_90px_minmax(0,1fr)] lg:items-center"
                >
                  <div className="flex items-start gap-3">
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
                    <div>
                      <p className="text-body-md-semibold text-brand-text">{row.name}</p>
                      <p className={cn('text-body-sm', STATUS_STYLES[row.status])}>
                        {row.serviceType} · {row.status}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-body-sm-semibold text-muted tracking-wide uppercase">
                      Uptime
                    </p>
                    <p className="text-body-md-semibold text-brand-text mt-1">
                      {row.uptime.toFixed(2)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-body-sm-semibold text-muted tracking-wide uppercase">CPU</p>
                    <p className="text-body-md-semibold text-brand-text mt-1">{row.cpuUsage}%</p>
                  </div>
                  <div>
                    <p className="text-body-sm-semibold text-muted tracking-wide uppercase">
                      Latency
                    </p>
                    <p className="text-body-md-semibold text-brand-text mt-1">
                      {row.networkLatencyMs == null ? '—' : `${row.networkLatencyMs} ms`}
                    </p>
                  </div>
                  <div>
                    <p className="text-body-sm-semibold text-muted tracking-wide uppercase">
                      Errors
                    </p>
                    <p className="text-body-md-semibold text-brand-text mt-1">{row.errorCount}</p>
                  </div>
                  <LoadBar value={Math.max(row.cpuUsage, row.memoryUsage, row.storageUsage)} />
                </div>
              ))}
        </div>
      </section>
    </div>
  )
}
