import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { RotateCw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ExportDataIcon, ManageMetricsIcon } from '@/shared/components/icons/action-button-icons'
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  Rectangle,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { getApiErrorMessage } from '@/shared/lib/api-error'

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
import {
  fetchPlatformHealthDashboard,
  fetchPlatformHealthInfrastructure,
  fetchPlatformHealthMetrics,
  fetchPlatformHealthOperations,
  fetchPlatformHealthPlatformTrends,
  fetchPlatformHealthSecurityCompliance,
  fetchPlatformHealthSystemPerformance,
} from '../api/platform-health.api'
import { usePlatformHealthSections } from '../hooks/use-platform-health'
import type {
  PlatformHealthDashboard,
  PlatformHealthDateRange,
  PlatformHealthInfraRow,
} from '../types/platform-health'
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
  transactions: '#155DFC',
  supportTickets: '#E0A263',
  uptime: '#00A63E',
  memory: '#E0A263',
  cpu: '#155DFC',
  requests: '#00A63E',
  compliance: '#E0A263',
  resolved: '#00A63E',
  security: '#D3191C',
}

const PLATFORM_TREND_LEFT_MAX = 1600
const PLATFORM_TREND_LEFT_TICKS = [0, 400, 800, 1200, 1600]
const PLATFORM_TREND_UPTIME_TICKS = [99, 99.25, 99.5, 99.75, 100]
const SYSTEM_PERF_LEFT_TICKS = [0, 25, 50, 75, 100]
const SYSTEM_PERF_RIGHT_MAX = 3200
const SYSTEM_PERF_RIGHT_TICKS = [0, 800, 1600, 2400, 3200]
const SECURITY_TICKS = [0, 2, 4, 6, 8]

const PLATFORM_TREND_BAR_SIZE = 70
const PLATFORM_TREND_BAR_GAP = 4
const PLATFORM_TREND_CATEGORY_PAD = 48
const PLATFORM_TREND_CATEGORY_WIDTH =
  PLATFORM_TREND_BAR_SIZE * 2 + PLATFORM_TREND_BAR_GAP + PLATFORM_TREND_CATEGORY_PAD
const PLATFORM_TREND_AXIS_TICK = {
  fill: '#FFFFFF',
  fontSize: 16,
  fontWeight: 600 as const,
  fontFamily: 'Figtree, ui-sans-serif, system-ui, sans-serif',
  fontStyle: 'normal' as const,
  letterSpacing: '0',
}
const PLATFORM_TREND_TEXT_CLASS =
  "font-['Figtree',ui-sans-serif,system-ui,sans-serif] text-[16px] leading-5 font-semibold tracking-normal"

type PlatformTrendAxisTickProps = {
  x?: number | string
  y?: number | string
  payload?: { value?: string | number }
  textAnchor?: 'start' | 'middle' | 'end' | 'inherit'
  fill?: string
  formatValue?: (value: string | number) => string
}

function PlatformTrendAxisTick({
  x = 0,
  y = 0,
  payload,
  textAnchor = 'middle',
  formatValue,
}: PlatformTrendAxisTickProps) {
  const raw = payload?.value ?? ''
  const label = formatValue ? formatValue(raw) : String(raw)

  return (
    <text
      x={x}
      y={y}
      dy="0.355em"
      textAnchor={textAnchor}
      fill={PLATFORM_TREND_AXIS_TICK.fill}
      fontFamily={PLATFORM_TREND_AXIS_TICK.fontFamily}
      fontSize={PLATFORM_TREND_AXIS_TICK.fontSize}
      fontWeight={PLATFORM_TREND_AXIS_TICK.fontWeight}
      fontStyle={PLATFORM_TREND_AXIS_TICK.fontStyle}
      letterSpacing={PLATFORM_TREND_AXIS_TICK.letterSpacing}
      className="platform-health-trends-axis-tick"
      style={{
        fill: PLATFORM_TREND_AXIS_TICK.fill,
        fontFamily: PLATFORM_TREND_AXIS_TICK.fontFamily,
        fontSize: '16px',
        fontWeight: 600,
        fontStyle: 'normal',
        lineHeight: '20px',
        letterSpacing: '0px',
      }}
    >
      {label}
    </text>
  )
}

function renderPlatformTrendAxisTick(props: PlatformTrendAxisTickProps) {
  return <PlatformTrendAxisTick {...props} />
}

function renderSystemPerfRightAxisTick(props: PlatformTrendAxisTickProps) {
  return (
    <PlatformTrendAxisTick
      {...props}
      formatValue={(value) => (Number(value) === 0 ? '00' : String(value))}
    />
  )
}
const SECURITY_BAR_SIZE = 40
const SECURITY_BAR_GAP = 6
const SECURITY_CATEGORY_GAP = '22%'

type PlatformTrendBarShapeProps = {
  x?: number
  y?: number
  width?: number
  height?: number
  fill?: string
}

function PlatformTrendBarShape({
  x = 0,
  y = 0,
  width = 0,
  height = 0,
  fill,
}: PlatformTrendBarShapeProps) {
  if (height <= 0) return null
  const barWidth = PLATFORM_TREND_BAR_SIZE
  const centeredX = x + (width - barWidth) / 2
  return (
    <Rectangle
      x={centeredX}
      y={y}
      width={barWidth}
      height={height}
      fill={fill}
      radius={[2, 2, 0, 0]}
    />
  )
}

function roundAxisTick(value: number) {
  return Math.round(value * 100) / 100
}

function resolvePlatformTrendLeftAxis(
  data: Array<{ supportTickets?: number; transactions?: number }>,
) {
  const peak = data.reduce(
    (max, row) => Math.max(max, row.supportTickets || 0, row.transactions || 0),
    0,
  )
  if (peak === 0) {
    return {
      domain: [0, PLATFORM_TREND_LEFT_MAX] as [number, number],
      ticks: PLATFORM_TREND_LEFT_TICKS,
    }
  }
  if (peak <= 80) {
    const max = Math.max(20, Math.ceil(peak / 5) * 5)
    const ticks = Array.from({ length: 5 }, (_, index) => Math.round((max / 4) * index))
    return { domain: [0, max] as [number, number], ticks }
  }
  if (peak <= PLATFORM_TREND_LEFT_MAX) {
    return {
      domain: [0, PLATFORM_TREND_LEFT_MAX] as [number, number],
      ticks: PLATFORM_TREND_LEFT_TICKS,
    }
  }
  const roundedMax = Math.ceil(peak / 400) * 400
  const ticks = Array.from({ length: 5 }, (_, index) => Math.round((roundedMax / 4) * index))
  return { domain: [0, roundedMax] as [number, number], ticks }
}

function resolvePlatformTrendUptimeAxis(data: Array<{ uptime?: number }>) {
  const values = data.map((row) => row.uptime ?? 0).filter((value) => value > 0)
  if (!values.length) {
    return { domain: [99, 100] as [number, number], ticks: PLATFORM_TREND_UPTIME_TICKS }
  }

  const min = Math.min(...values)
  const max = Math.max(...values)

  if (min >= 98 && max <= 100) {
    return { domain: [99, 100] as [number, number], ticks: PLATFORM_TREND_UPTIME_TICKS }
  }

  const floor = Math.max(0, Math.floor(min / 5) * 5 - (min % 5 === 0 ? 0 : 5))
  const ceil = Math.min(100, Math.ceil(max / 5) * 5 + (max % 5 === 0 ? 0 : 5))
  const span = Math.max(5, ceil - floor)
  const step = span / 4
  const ticks = Array.from({ length: 5 }, (_, index) => roundAxisTick(floor + step * index))

  return { domain: [floor, ceil] as [number, number], ticks }
}

function resolveSystemPerfRightAxis(data: Array<{ requestsPerMin?: number }>) {
  const peak = data.reduce((max, row) => Math.max(max, row.requestsPerMin || 0), 0)
  if (peak <= 0) {
    return {
      domain: [0, SYSTEM_PERF_RIGHT_MAX] as [number, number],
      ticks: SYSTEM_PERF_RIGHT_TICKS,
    }
  }
  if (peak <= SYSTEM_PERF_RIGHT_MAX) {
    return {
      domain: [0, SYSTEM_PERF_RIGHT_MAX] as [number, number],
      ticks: SYSTEM_PERF_RIGHT_TICKS,
    }
  }
  const roundedMax = Math.ceil(peak / 800) * 800
  const ticks = Array.from({ length: 5 }, (_, index) => Math.round((roundedMax / 4) * index))
  return { domain: [0, roundedMax] as [number, number], ticks }
}

function resolveSecurityAxis(
  data: Array<{ compliance?: number; issuesResolved?: number; security?: number }>,
) {
  const peak = data.reduce(
    (max, row) => Math.max(max, row.compliance || 0, row.issuesResolved || 0, row.security || 0),
    0,
  )
  if (peak <= 8) {
    return { domain: [0, 8] as [number, number], ticks: SECURITY_TICKS }
  }
  const max = Math.ceil(peak / 2) * 2
  const ticks = Array.from({ length: 5 }, (_, index) => Math.round((max / 4) * index))
  return { domain: [0, max] as [number, number], ticks }
}

function formatPlatformTrendTooltip(value: number | string, name: string) {
  if (name === 'Uptime %') return [`${Number(value).toFixed(2)}%`, name]
  if (name === 'Transactions (K)') return [value, 'Transaction(K)']
  return [value, name]
}

const PLATFORM_TREND_LEGEND_ORDER = ['Support tickets', 'Transactions (K)', 'Uptime %'] as const
const PLATFORM_TREND_LEGEND_COLORS: Record<string, string> = {
  'Support tickets': '#E0A263',
  'Transactions (K)': '#155DFC',
  'Uptime %': '#00A63E',
}
const SYSTEM_PERF_LEGEND_ORDER = ['Memory usage', 'CPU Usage', 'Request/min'] as const
const SYSTEM_PERF_LEGEND_COLORS: Record<string, string> = {
  'Memory usage': '#E0A263',
  'CPU Usage': '#155DFC',
  'Request/min': '#00A63E',
}
const SECURITY_LEGEND_ORDER = ['Compliance Flags', 'Issues Resolved', 'Security Incidents'] as const
const SECURITY_LEGEND_COLORS: Record<string, string> = {
  'Compliance Flags': '#E0A263',
  'Issues Resolved': '#00A63E',
  'Security Incidents': '#D3191C',
}
const PLATFORM_TREND_LEGEND_TEXT_CLASS =
  "font-['Figtree',ui-sans-serif,system-ui,sans-serif] text-[12px] leading-[14px] font-semibold tracking-normal"

function PlatformTrendLegendSparkle({ color }: { color: string }) {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <path
        d="M5 0C5 2.76 7.24 5 10 5C7.24 5 5 7.24 5 10C5 7.24 2.76 5 0 5C2.76 5 5 2.76 5 0Z"
        fill={color}
      />
    </svg>
  )
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

function ColoredSparkleLegend({
  payload,
  order,
  colors,
}: {
  payload?: Array<{ value?: string; color?: string }>
  order: readonly string[]
  colors: Record<string, string>
}) {
  if (!payload?.length) return null

  const ordered = [...payload].sort((a, b) => {
    const aIndex = order.indexOf(String(a.value))
    const bIndex = order.indexOf(String(b.value))
    if (aIndex === -1 && bIndex === -1) return 0
    if (aIndex === -1) return 1
    if (bIndex === -1) return -1
    return aIndex - bIndex
  })

  return (
    <div className="flex flex-wrap items-center justify-center gap-8 pt-4">
      {ordered.map((entry) => {
        const label = String(entry.value)
        const color = colors[label] ?? entry.color ?? '#FFFFFF'
        return (
          <div key={label} className="flex items-center gap-1.5">
            <PlatformTrendLegendSparkle color={color} />
            <span className={PLATFORM_TREND_LEGEND_TEXT_CLASS} style={{ color }}>
              {label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function PlatformTrendChartLegend(props: { payload?: Array<{ value?: string; color?: string }> }) {
  return (
    <ColoredSparkleLegend
      {...props}
      order={PLATFORM_TREND_LEGEND_ORDER}
      colors={PLATFORM_TREND_LEGEND_COLORS}
    />
  )
}

function SystemPerfChartLegend(props: { payload?: Array<{ value?: string; color?: string }> }) {
  return (
    <ColoredSparkleLegend
      {...props}
      order={SYSTEM_PERF_LEGEND_ORDER}
      colors={SYSTEM_PERF_LEGEND_COLORS}
    />
  )
}

function SecurityComplianceChartLegend(props: {
  payload?: Array<{ value?: string; color?: string }>
}) {
  return (
    <ColoredSparkleLegend
      {...props}
      order={SECURITY_LEGEND_ORDER}
      colors={SECURITY_LEGEND_COLORS}
    />
  )
}

function formatSecurityMonthLabel(value: string | number) {
  const raw = String(value)
  // Accept YYYY-MM, YYYY-MM-DD, or already-short labels like "Jan"
  const match = raw.match(/^(\d{4})-(\d{2})/)
  if (match) {
    const monthIndex = Number(match[2]) - 1
    const labels = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ]
    return labels[monthIndex] ?? raw
  }
  return raw
}

function renderSecurityAxisTick(props: PlatformTrendAxisTickProps) {
  return (
    <PlatformTrendAxisTick
      {...props}
      formatValue={(value) => {
        const num = Number(value)
        if (!Number.isNaN(num) && String(value).trim() !== '' && !String(value).includes('-')) {
          return num === 0 ? '00' : String(num)
        }
        return formatSecurityMonthLabel(value)
      }}
    />
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
    <div className="radius-lg bg-brand-bg box-border grid h-[90px] w-full max-w-[1151px] gap-4 border-0 px-4 lg:grid-cols-6 lg:items-center">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={`infra-skel-${index}`} className="h-4 animate-pulse rounded bg-white/10" />
      ))}
    </div>
  )
}

const REFRESH_BUTTON_CLASS =
  'grid size-8 place-items-center rounded-lg p-2 text-white transition-colors hover:bg-white/5'

function ChartPanel({
  title,
  children,
  range,
  onRangeChange,
  onRefresh,
  isLoading,
  trendTypography = false,
}: {
  title: string
  children: ReactNode
  range: string
  onRangeChange: (value: string) => void
  onRefresh?: () => void
  isLoading?: boolean
  trendTypography?: boolean
}) {
  return (
    <section
      className={cn(uiTokens.radiusCard, 'bg-brand-surface border border-white/10 p-4 sm:p-5')}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2
          className={cn(
            trendTypography
              ? cn(PLATFORM_TREND_TEXT_CLASS, 'text-brand-text')
              : 'text-body-md-semibold text-brand-text',
          )}
        >
          {title}
        </h2>
        <div className="flex items-center gap-2">
          <select
            value={range}
            onChange={(event) => onRangeChange(event.target.value)}
            className={cn(
              'radius-md bg-brand-bg text-brand-text/80 h-9 min-w-[140px] border border-white/10 px-3',
              trendTypography ? PLATFORM_TREND_TEXT_CLASS : 'text-body-sm',
            )}
          >
            {RANGE_OPTIONS.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={onRefresh}
            className={REFRESH_BUTTON_CLASS}
            aria-label="Refresh chart"
          >
            <RotateCw className={cn('size-4', isLoading && 'animate-spin')} />
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
  const sharedFilters = useMemo(() => ({ dateRange }), [dateRange])
  const infrastructureFilters = useMemo(
    () => ({
      dateRange,
      serviceStatus: serviceStatus || undefined,
    }),
    [dateRange, serviceStatus],
  )

  const {
    metricsQuery,
    platformTrendsQuery,
    systemPerformanceQuery,
    securityComplianceQuery,
    infrastructureQuery,
    operationsQuery,
    refetchAll,
  } = usePlatformHealthSections(sharedFilters, infrastructureFilters)

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
    const allMetrics = buildPlatformHealthMetricCards(metricsQuery.data?.metrics)
    return orderByActiveMetricIds(allMetrics, filteredActiveMetricIds)
  }, [metricsQuery.data?.metrics, filteredActiveMetricIds])

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

  const platformTrendData = platformTrendsQuery.data?.platformTrends || []
  const systemPerformanceData = systemPerformanceQuery.data?.systemPerformance24h || []
  const securityComplianceData = securityComplianceQuery.data?.securityCompliance || []

  const infrastructure = useMemo(
    () =>
      (infrastructureQuery.data?.infrastructure || []).filter(
        (row) => row.id !== 'cache' && row.id !== 'cdn',
      ),
    [infrastructureQuery.data?.infrastructure],
  )
  const skeletonCount = filteredActiveMetricIds.length || DEFAULT_PLATFORM_HEALTH_METRIC_IDS.length

  const platformTrendAxis = useMemo(
    () => resolvePlatformTrendLeftAxis(platformTrendData),
    [platformTrendData],
  )

  const platformTrendUptimeAxis = useMemo(
    () => resolvePlatformTrendUptimeAxis(platformTrendData),
    [platformTrendData],
  )

  const systemPerfRightAxis = useMemo(
    () => resolveSystemPerfRightAxis(systemPerformanceData),
    [systemPerformanceData],
  )

  const securityAxis = useMemo(
    () => resolveSecurityAxis(securityComplianceData),
    [securityComplianceData],
  )

  const platformTrendChartMinWidth = Math.max(
    720,
    platformTrendData.length * PLATFORM_TREND_CATEGORY_WIDTH + 80,
  )

  const refresh = () => {
    refetchAll()
  }

  const handleExportData = useCallback(async () => {
    const sectionsLoading =
      metricsQuery.isLoading ||
      platformTrendsQuery.isLoading ||
      systemPerformanceQuery.isLoading ||
      securityComplianceQuery.isLoading ||
      infrastructureQuery.isLoading ||
      operationsQuery.isLoading

    if (sectionsLoading) {
      toast.message('Please wait for data to load')
      return
    }

    try {
      let dashboard: PlatformHealthDashboard | null = null

      try {
        dashboard = await fetchPlatformHealthDashboard(infrastructureFilters)
      } catch {
        const [metrics, trends, performance, security, infrastructureSection, operations] =
          await Promise.all([
            fetchPlatformHealthMetrics(sharedFilters),
            fetchPlatformHealthPlatformTrends(sharedFilters),
            fetchPlatformHealthSystemPerformance(sharedFilters),
            fetchPlatformHealthSecurityCompliance(sharedFilters),
            fetchPlatformHealthInfrastructure(infrastructureFilters),
            fetchPlatformHealthOperations(sharedFilters),
          ])

        dashboard = {
          metrics: metrics.metrics,
          summary: metrics.summary,
          filters: metrics.filters,
          infrastructure: infrastructureSection.infrastructure,
          charts: {
            platformTrends: trends.platformTrends,
            systemPerformance24h: performance.systemPerformance24h,
            healthTrend: trends.healthTrend,
            performance: performance.performance,
            apiTraffic: trends.apiTraffic,
            errorDistribution: operations.errorDistribution,
            securityCompliance: security.securityCompliance,
            backupTrend: operations.backupTrend,
            infrastructureUtilization: operations.infrastructureUtilization,
            incidentTimeline: operations.incidentTimeline,
          },
        }
      }

      const exportMetrics =
        visibleMetrics.length > 0
          ? visibleMetrics
          : buildPlatformHealthMetricCards(dashboard.metrics)

      if (!exportMetrics.length && !dashboard) {
        toast.error('No data available to export')
        return
      }

      await exportPlatformHealthToExcel({
        rangeLabel: selectedRange,
        serviceStatusFilter: serviceStatus || 'All statuses',
        metrics: exportMetrics,
        dashboard,
      })
      toast.success('Exported as Excel')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to export platform health data'))
    }
  }, [
    infrastructureFilters,
    infrastructureQuery.isLoading,
    metricsQuery.isLoading,
    operationsQuery.isLoading,
    platformTrendsQuery.isLoading,
    securityComplianceQuery.isLoading,
    selectedRange,
    serviceStatus,
    sharedFilters,
    systemPerformanceQuery.isLoading,
    visibleMetrics,
  ])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-h1 text-brand-text sm:text-h1 font-semibold tracking-tight">
            Platform Health & Operations
          </h1>
          <p className="ui-page-subtitle mt-1 text-[16px] leading-5 font-medium tracking-normal text-[#FFFFFF80]">
            System performance, security metrics, and operational analytics
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleExportData}
            className="ui-export-data ui-cta ui-cta-primary"
          >
            <ExportDataIcon />
            Export Data
          </button>
          <button
            type="button"
            onClick={() => navigate('/metrics/platform-health?section=table')}
            className="ui-manage-metrics ui-cta ui-cta-primary"
          >
            <ManageMetricsIcon />
            Manage Metrics
          </button>
        </div>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] justify-items-start gap-3">
        {metricsQuery.isLoading
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
        isLoading={platformTrendsQuery.isLoading}
        trendTypography
      >
        <div className="platform-health-trends-chart w-full overflow-x-auto">
          <div className="h-[420px]" style={{ minWidth: platformTrendChartMinWidth }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={platformTrendData}
                margin={{ left: 12, right: 28, top: 8, bottom: 4 }}
                barGap={PLATFORM_TREND_BAR_GAP}
                barCategoryGap={PLATFORM_TREND_CATEGORY_PAD}
              >
                <CartesianGrid
                  stroke="rgba(255,255,255,0.08)"
                  strokeDasharray="3 3"
                  horizontal
                  vertical
                />
                <XAxis
                  dataKey="date"
                  interval="preserveStartEnd"
                  minTickGap={28}
                  tickLine={false}
                  axisLine={false}
                  tick={renderPlatformTrendAxisTick}
                  height={32}
                />
                <YAxis
                  yAxisId="left"
                  domain={platformTrendAxis.domain}
                  ticks={platformTrendAxis.ticks}
                  tickLine={false}
                  axisLine={false}
                  tick={renderPlatformTrendAxisTick}
                  width={48}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  domain={platformTrendUptimeAxis.domain}
                  ticks={platformTrendUptimeAxis.ticks}
                  tickLine={false}
                  axisLine={false}
                  tick={renderPlatformTrendAxisTick}
                  width={52}
                />
                <Tooltip
                  contentStyle={{
                    ...tooltipStyle,
                    fontFamily: 'Figtree, ui-sans-serif, system-ui, sans-serif',
                    fontSize: 16,
                    fontWeight: 600,
                    lineHeight: '20px',
                  }}
                  labelStyle={{
                    fontFamily: 'Figtree, ui-sans-serif, system-ui, sans-serif',
                    fontSize: 16,
                    fontWeight: 600,
                    lineHeight: '20px',
                  }}
                  itemStyle={{
                    fontFamily: 'Figtree, ui-sans-serif, system-ui, sans-serif',
                    fontSize: 16,
                    fontWeight: 600,
                    lineHeight: '20px',
                  }}
                  formatter={(value, name) =>
                    formatPlatformTrendTooltip(value as number | string, String(name))
                  }
                />
                <Legend content={<PlatformTrendChartLegend />} />
                <Bar
                  yAxisId="left"
                  dataKey="transactions"
                  name="Transactions (K)"
                  fill={CHART_COLORS.transactions}
                  barSize={PLATFORM_TREND_BAR_SIZE}
                  shape={PlatformTrendBarShape}
                  isAnimationActive={false}
                />
                <Bar
                  yAxisId="left"
                  dataKey="supportTickets"
                  name="Support tickets"
                  fill={CHART_COLORS.supportTickets}
                  barSize={PLATFORM_TREND_BAR_SIZE}
                  shape={PlatformTrendBarShape}
                  isAnimationActive={false}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="uptime"
                  name="Uptime %"
                  stroke={CHART_COLORS.uptime}
                  strokeWidth={2}
                  dot={{
                    r: 4,
                    fill: CHART_COLORS.uptime,
                    stroke: '#ffffff',
                    strokeWidth: 2,
                  }}
                  activeDot={{
                    r: 5,
                    fill: CHART_COLORS.uptime,
                    stroke: '#ffffff',
                    strokeWidth: 2,
                  }}
                  isAnimationActive={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </ChartPanel>

      <ChartPanel
        title="System Performance (24h)"
        range={selectedRange}
        onRangeChange={setSelectedRange}
        onRefresh={refresh}
        isLoading={systemPerformanceQuery.isLoading}
        trendTypography
      >
        <div className="platform-health-trends-chart h-[420px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={systemPerformanceData}
              margin={{ left: 12, right: 28, top: 8, bottom: 4 }}
            >
              <defs>
                <linearGradient id="sysPerfMemoryFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CHART_COLORS.memory} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={CHART_COLORS.memory} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="sysPerfCpuFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CHART_COLORS.cpu} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={CHART_COLORS.cpu} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="sysPerfRequestsFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CHART_COLORS.requests} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={CHART_COLORS.requests} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                stroke="rgba(255,255,255,0.08)"
                strokeDasharray="3 3"
                horizontal
                vertical
              />
              <XAxis
                dataKey="time"
                interval="preserveStartEnd"
                minTickGap={36}
                tickLine={false}
                axisLine={false}
                tick={renderPlatformTrendAxisTick}
                height={32}
              />
              <YAxis
                yAxisId="left"
                domain={[0, 100]}
                ticks={SYSTEM_PERF_LEFT_TICKS}
                tickLine={false}
                axisLine={false}
                tick={renderPlatformTrendAxisTick}
                width={40}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={systemPerfRightAxis.domain}
                ticks={systemPerfRightAxis.ticks}
                tickLine={false}
                axisLine={false}
                tick={renderSystemPerfRightAxisTick}
                width={52}
              />
              <Tooltip
                contentStyle={{
                  ...tooltipStyle,
                  fontFamily: 'Figtree, ui-sans-serif, system-ui, sans-serif',
                  fontSize: 16,
                  fontWeight: 600,
                  lineHeight: '20px',
                }}
                labelStyle={{
                  fontFamily: 'Figtree, ui-sans-serif, system-ui, sans-serif',
                  fontSize: 16,
                  fontWeight: 600,
                  lineHeight: '20px',
                }}
                itemStyle={{
                  fontFamily: 'Figtree, ui-sans-serif, system-ui, sans-serif',
                  fontSize: 16,
                  fontWeight: 600,
                  lineHeight: '20px',
                }}
              />
              <Legend content={<SystemPerfChartLegend />} />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="memory"
                name="Memory usage"
                stroke={CHART_COLORS.memory}
                fill="url(#sysPerfMemoryFill)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: CHART_COLORS.memory, stroke: '#ffffff', strokeWidth: 2 }}
                isAnimationActive={false}
              />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="cpu"
                name="CPU Usage"
                stroke={CHART_COLORS.cpu}
                fill="url(#sysPerfCpuFill)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: CHART_COLORS.cpu, stroke: '#ffffff', strokeWidth: 2 }}
                isAnimationActive={false}
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="requestsPerMin"
                name="Request/min"
                stroke={CHART_COLORS.requests}
                fill="url(#sysPerfRequestsFill)"
                strokeWidth={2}
                dot={{
                  r: 4,
                  fill: CHART_COLORS.requests,
                  stroke: '#ffffff',
                  strokeWidth: 2,
                }}
                activeDot={{
                  r: 5,
                  fill: CHART_COLORS.requests,
                  stroke: '#ffffff',
                  strokeWidth: 2,
                }}
                isAnimationActive={false}
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
        isLoading={securityComplianceQuery.isLoading}
        trendTypography
      >
        <div className="platform-health-trends-chart h-[420px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={securityComplianceData}
              margin={{ left: 12, right: 12, top: 8, bottom: 4 }}
              barGap={SECURITY_BAR_GAP}
              barCategoryGap={SECURITY_CATEGORY_GAP}
              maxBarSize={SECURITY_BAR_SIZE}
            >
              <CartesianGrid
                stroke="rgba(255,255,255,0.08)"
                strokeDasharray="3 3"
                horizontal
                vertical
              />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tick={renderSecurityAxisTick}
                height={32}
              />
              <YAxis
                domain={securityAxis.domain}
                ticks={securityAxis.ticks}
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                tick={renderSecurityAxisTick}
                width={40}
              />
              <Tooltip
                contentStyle={{
                  ...tooltipStyle,
                  fontFamily: 'Figtree, ui-sans-serif, system-ui, sans-serif',
                  fontSize: 16,
                  fontWeight: 600,
                  lineHeight: '20px',
                }}
                labelStyle={{
                  fontFamily: 'Figtree, ui-sans-serif, system-ui, sans-serif',
                  fontSize: 16,
                  fontWeight: 600,
                  lineHeight: '20px',
                }}
                itemStyle={{
                  fontFamily: 'Figtree, ui-sans-serif, system-ui, sans-serif',
                  fontSize: 16,
                  fontWeight: 600,
                  lineHeight: '20px',
                }}
                labelFormatter={(label) => formatSecurityMonthLabel(String(label))}
              />
              <Legend content={<SecurityComplianceChartLegend />} />
              <Bar
                dataKey="compliance"
                name="Compliance Flags"
                fill={CHART_COLORS.compliance}
                radius={[0, 0, 0, 0]}
                barSize={SECURITY_BAR_SIZE}
                isAnimationActive={false}
              />
              <Bar
                dataKey="issuesResolved"
                name="Issues Resolved"
                fill={CHART_COLORS.resolved}
                radius={[0, 0, 0, 0]}
                barSize={SECURITY_BAR_SIZE}
                isAnimationActive={false}
              />
              <Bar
                dataKey="security"
                name="Security Incidents"
                fill={CHART_COLORS.security}
                radius={[0, 0, 0, 0]}
                barSize={SECURITY_BAR_SIZE}
                isAnimationActive={false}
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
              className={REFRESH_BUTTON_CLASS}
              aria-label="Refresh infrastructure"
            >
              <RotateCw
                className={cn('size-4', infrastructureQuery.isFetching && 'animate-spin')}
              />
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center space-y-3">
          {infrastructureQuery.isLoading
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
                    className="radius-lg bg-brand-bg box-border grid h-[90px] w-full max-w-[1151px] gap-4 border-0 px-4 lg:grid-cols-[minmax(0,1.5fr)_repeat(auto-fit,minmax(90px,1fr))] lg:items-center"
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
