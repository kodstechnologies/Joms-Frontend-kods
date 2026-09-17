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
import { RotateCw, Star } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/shared/lib/api-error'

import {
  VENUE_DASHBOARD_MODULE_KEY,
  DEFAULT_VENUE_DASHBOARD_ACTIVE_METRIC_IDS,
} from '@/modules/expert/config/venue-management-table-columns.config'
import { orderByActiveMetricIds, useActiveMetricIds } from '../../hooks/use-active-metric-ids'
import { useVenueDashboard } from '../../hooks/use-venue-dashboard'
import { exportVenueDashboardToExcel } from '../../utils/export-venue-dashboard'
import { useDefaultExportFormat } from '@/modules/settings/hooks/use-default-export-format'
import { ensureTrendChangeSign, TrendBadge } from '@/shared/components/dashboard/trend-badge'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'
import { ExportDataIcon, ManageMetricsIcon } from '@/shared/components/icons/action-button-icons'

type Metric = {
  id: string
  label: string
  value: string
  change?: string
  changeType?: 'up' | 'down'
  changeNote?: string
  note?: string
}

type TrendPoint = {
  month: string
  revenue: number
  avgRevenue: number
  utilization: number
}

type VenueRow = {
  name: string
  city: string
  totalVisits: number
  eventAttendance: number
  bookings: number
  repeatVisitors: number
  utilization: number
  revenue: string
  rating: number
  status: 'High Demand' | 'Good' | 'Available' | 'High Performing' | 'Stable' | 'Needs Attention'
}

const ZERO_METRICS: Metric[] = [
  { id: 'total-venues', label: 'Total Venues', value: '0' },
  { id: 'active-venues', label: 'Active Venues', value: '0' },
  { id: 'suspended-venues', label: 'Suspended Venues', value: '0' },
  { id: 'reported-venues', label: 'Reported Venues', value: '0' },
  { id: 'deleted-venues', label: 'Deleted Venues', value: '0' },
  { id: 'total-spaces', label: 'Total Spaces', value: '0' },
  { id: 'active-spaces', label: 'Active Spaces', value: '0' },
  { id: 'suspended-spaces', label: 'Suspended Spaces', value: '0' },
  { id: 'reported-spaces', label: 'Reported Spaces', value: '0' },
  { id: 'deleted-spaces', label: 'Deleted Spaces', value: '0' },
  { id: 'total-event-bookings', label: 'Total Event Bookings', value: '0' },
  { id: 'total-meetup-bookings', label: 'Total Meetup Bookings', value: '0' },
  { id: 'events-per-venue', label: 'Average Events per Venue', value: '0' },
  { id: 'avg-meetups-per-venue', label: 'Average Meetups per Venue', value: '0' },
  { id: 'total-venue-revenue', label: 'Total Venue Revenue', value: '₹0' },
  { id: 'avg-revenue-per-venue', label: 'Average Revenue per Venue', value: '₹0' },
  { id: 'avg-revenue-per-space', label: 'Average Revenue per Space', value: '₹0' },
  { id: 'avg-booking-value', label: 'Average Booking Value', value: '₹0' },
  { id: 'space-utilization-rate', label: 'Space Utilization Rate', value: '0%' },
  { id: 'space-cancellation-rate', label: 'Space Cancellation Rate', value: '0%' },
  { id: 'avg-venue-rating', label: 'Average Venue Rating', value: '0/5' },
  { id: 'venue-satisfaction-score', label: 'Venue Satisfaction Score', value: '0%' },
  { id: 'repeat-booking-rate', label: 'Repeat Booking Rate', value: '0%' },
  { id: 'peak-utilization-hours', label: 'Peak Utilization Hours', value: '—' },
  { id: 'total-refund-amount', label: 'Total Refund Amount', value: '₹0' },
  { id: 'refund-rate', label: 'Refund Rate', value: '0%' },
  { id: 'host-cancellation-rate', label: 'Host Cancellation Rate', value: '0%' },
  { id: 'host-initiated-cancellations', label: 'Host Initiated Cancellations', value: '0' },
]

const DEFAULT_METRIC_IDS = DEFAULT_VENUE_DASHBOARD_ACTIVE_METRIC_IDS

const STATUS_BADGE_BASE =
  'inline-flex h-5 w-max max-w-full shrink-0 items-center justify-center rounded-[10px] px-2.5 text-center text-[10px] leading-[14px] font-semibold tracking-normal whitespace-nowrap'

const STATUS_STYLES: Record<string, string> = {
  'high demand': 'bg-[#00A63E33] text-[#00A63E]',
  'high performing': 'bg-[#00A63E33] text-[#00A63E]',
  good: 'bg-[#155DFC33] text-[#155DFC]',
  stable: 'bg-[#155DFC33] text-[#155DFC]',
  available: 'bg-[#E0A26333] text-[#E0A263]',
  'needs attention': 'bg-[#E0A26333] text-[#E0A263]',
}

const STATUS_LABELS: Record<string, string> = {
  'high demand': 'High Demand',
  'high performing': 'High Demand',
  good: 'Good',
  stable: 'Good',
  available: 'Available',
  'needs attention': 'Available',
}

const normalizeVenueStatus = (status?: string | null) =>
  (status || '').toLowerCase().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim()

const getVenueStatusDisplay = (status?: string | null) => {
  const key = normalizeVenueStatus(status)
  return {
    key,
    label: STATUS_LABELS[key] || status || 'Available',
    className: cn(STATUS_BADGE_BASE, STATUS_STYLES[key] || STATUS_STYLES.available),
    barClassName:
      key === 'high demand' || key === 'high performing'
        ? 'bg-[#00A63E]'
        : key === 'good' || key === 'stable'
          ? 'bg-[#155DFC]'
          : 'bg-[#E0A263]',
  }
}

const VENUE_TREND_COLORS = {
  avgRevenue: '#E0A263',
  revenue: '#155DFC',
  utilization: '#00A63E',
} as const

const AXIS_TICK = {
  fill: '#FFFFFF',
  fontSize: 16,
  fontWeight: 600,
  fontFamily: 'Figtree, sans-serif',
} as const

const formatRevenueAxisTick = (value: number) => {
  const n = Number(value) || 0
  const abs = Math.abs(n)
  if (abs >= 10_000_000) {
    const cr = n / 10_000_000
    return `${Number.isInteger(cr) ? cr : Number(cr.toFixed(1))}Cr`
  }
  if (abs >= 100_000) {
    const lakhs = n / 100_000
    return `${Number.isInteger(lakhs) ? lakhs : Number(lakhs.toFixed(1))}L`
  }
  if (abs >= 1000) {
    const thousands = n / 1000
    return `${Number.isInteger(thousands) ? thousands : Number(thousands.toFixed(1))}K`
  }
  return String(Math.round(n))
}

const formatUtilizationAxisTick = (value: number) => {
  const n = Number(value) || 0
  return Number.isInteger(n) ? String(n) : n.toFixed(1)
}

type AxisTickProps = {
  x?: number | string
  y?: number | string
  payload?: { value?: number }
  textAnchor?: 'start' | 'middle' | 'end'
  formatter: (value: number) => string
}

function ChartAxisTick({ x = 0, y = 0, payload, textAnchor = 'end', formatter }: AxisTickProps) {
  const label = formatter(Number(payload?.value ?? 0))
  return (
    <text
      x={Number(x)}
      y={Number(y)}
      dy={5}
      textAnchor={textAnchor}
      fill={AXIS_TICK.fill}
      fontSize={AXIS_TICK.fontSize}
      fontWeight={AXIS_TICK.fontWeight}
      fontFamily={AXIS_TICK.fontFamily}
    >
      {label}
    </text>
  )
}

type VenueTrendsTooltipProps = {
  active?: boolean
  label?: string
  payload?: Array<{ dataKey?: string; value?: number; name?: string }>
}

function VenueTrendsTooltip({ active, payload, label }: VenueTrendsTooltipProps) {
  if (!active || !payload?.length) return null

  const values = payload.reduce<Record<string, number>>((acc, entry) => {
    if (entry.dataKey && typeof entry.value === 'number') {
      acc[entry.dataKey] = entry.value
    }
    return acc
  }, {})

  const rows = [
    {
      key: 'avgRevenue',
      label: 'Avg Revenue/Venue',
      color: VENUE_TREND_COLORS.avgRevenue,
      value: values.avgRevenue,
    },
    {
      key: 'revenue',
      label: 'Revenue',
      color: VENUE_TREND_COLORS.revenue,
      value: values.revenue,
    },
    {
      key: 'utilization',
      label: 'Utilization %',
      color: VENUE_TREND_COLORS.utilization,
      value: values.utilization,
    },
  ].filter((row) => row.value != null)

  return (
    <div className="box-border min-h-[96px] w-[159px] rounded-lg bg-white px-[9px] py-[6px]">
      <p className="text-[12px] leading-[14px] font-medium tracking-normal text-black">{label}</p>
      <div className="mt-[5px] space-y-[5px]">
        {rows.map((row) => (
          <p
            key={row.key}
            className="text-[12px] leading-[14px] font-semibold tracking-normal"
            style={{ color: row.color }}
          >
            {row.label}: {row.value}
          </p>
        ))}
      </div>
    </div>
  )
}

function MetricCard({ metric }: { metric: Metric }) {
  return (
    <div className="rounded-brand-lg bg-brand-surface flex min-h-[130px] flex-col border border-white/[0.06] p-4 transition-colors hover:border-white/10">
      <p className="text-body-sm text-muted font-medium">{metric.label}</p>
      <p className="text-h3 mt-2 font-bold tracking-tight text-white">{metric.value}</p>
      <div className="mt-auto flex items-center gap-2 pt-3">
        {metric.change ? (
          <>
            <TrendBadge direction={metric.changeType === 'down' ? 'down' : 'up'}>
              {ensureTrendChangeSign(metric.change, metric.changeType === 'down' ? 'down' : 'up')}
            </TrendBadge>
            {metric.changeNote && (
              <span className="text-muted text-[10px]">{metric.changeNote}</span>
            )}
          </>
        ) : (
          metric.note && <span className="text-muted text-[10px]">{metric.note}</span>
        )}
      </div>
    </div>
  )
}

function MetricCardSkeleton() {
  return (
    <div className="rounded-brand-lg bg-brand-surface min-h-[130px] border border-white/[0.06] p-4">
      <div className="h-3 w-28 animate-pulse rounded bg-white/10" />
      <div className="mt-3 h-7 w-20 animate-pulse rounded bg-white/10" />
      <div className="mt-auto pt-6">
        <div className="h-5 w-32 animate-pulse rounded bg-white/5" />
      </div>
    </div>
  )
}

const attachMetricTrends = (
  metrics: Metric[],
  trends?: Record<string, { change: string; changeType: 'up' | 'down'; changeNote: string } | null>,
): Metric[] =>
  metrics.map((metric) => {
    const trend = trends?.[metric.id]
    if (!trend) return metric
    return {
      ...metric,
      change: trend.change,
      changeType: trend.changeType,
      changeNote: trend.changeNote,
    }
  })

export const VenueDashboardPage = () => {
  const navigate = useNavigate()
  const { fileFormat, option: exportFormat } = useDefaultExportFormat()
  const [selectedRange, setSelectedRange] = useState<string>('3')

  const dashboardQuery = useVenueDashboard({
    dateRange: selectedRange === '3' ? 'quarter' : selectedRange === '6' ? 'quarter' : 'year',
  })
  const dashboardData = dashboardQuery.data
  const isLoading = dashboardQuery.isLoading

  const activeMetricIds = useActiveMetricIds(VENUE_DASHBOARD_MODULE_KEY, DEFAULT_METRIC_IDS)
  const skeletonCount = activeMetricIds?.length || DEFAULT_METRIC_IDS.length

  const liveMetrics: Metric[] = useMemo(() => {
    if (!dashboardData) return ZERO_METRICS

    const m = dashboardData.metrics || {}

    return [
      {
        id: 'total-venues',
        label: 'Total Venues',
        value: String(m.totalVenues ?? 0),
      },
      {
        id: 'active-venues',
        label: 'Active Venues',
        value: String(m.activeVenues ?? 0),
      },
      {
        id: 'suspended-venues',
        label: 'Suspended Venues',
        value: String(m.suspendedVenues ?? 0),
      },
      {
        id: 'reported-venues',
        label: 'Reported Venues',
        value: String(m.reportedVenues ?? 0),
      },
      {
        id: 'deleted-venues',
        label: 'Deleted Venues',
        value: String(m.deletedVenues ?? 0),
      },
      { id: 'total-spaces', label: 'Total Spaces', value: String(m.totalSpaces ?? 0) },
      { id: 'active-spaces', label: 'Active Spaces', value: String(m.activeSpaces ?? 0) },
      { id: 'suspended-spaces', label: 'Suspended Spaces', value: String(m.suspendedSpaces ?? 0) },
      { id: 'reported-spaces', label: 'Reported Spaces', value: String(m.reportedSpaces ?? 0) },
      { id: 'deleted-spaces', label: 'Deleted Spaces', value: String(m.deletedSpaces ?? 0) },
      {
        id: 'total-event-bookings',
        label: 'Total Event Bookings',
        value: String(m.totalEventBookings ?? 0),
      },
      {
        id: 'total-meetup-bookings',
        label: 'Total Meetup Bookings',
        value: String(m.totalMeetupBookings ?? 0),
      },
      {
        id: 'events-per-venue',
        label: 'Average Events per Venue',
        value: String(m.avgEventsPerVenue ?? m.eventsPerVenue ?? 0),
      },
      {
        id: 'avg-meetups-per-venue',
        label: 'Average Meetups per Venue',
        value: String(m.avgMeetupsPerVenue ?? 0),
      },
      {
        id: 'total-venue-revenue',
        label: 'Total Venue Revenue',
        value:
          typeof m.totalVenueRevenue === 'object'
            ? m.totalVenueRevenue?.label || '₹0'
            : `₹${Number(m.totalVenueRevenue || 0).toLocaleString('en-IN')}`,
      },
      {
        id: 'avg-revenue-per-venue',
        label: 'Average Revenue per Venue',
        value:
          typeof m.avgRevenuePerVenue === 'object'
            ? m.avgRevenuePerVenue?.label || '₹0'
            : `₹${Number(m.avgRevenuePerVenue || 0).toLocaleString('en-IN')}`,
      },
      {
        id: 'avg-revenue-per-space',
        label: 'Average Revenue per Space',
        value:
          typeof m.avgRevenuePerSpace === 'object'
            ? m.avgRevenuePerSpace?.label || '₹0'
            : `₹${Number(m.avgRevenuePerSpace || 0).toLocaleString('en-IN')}`,
      },
      {
        id: 'avg-booking-value',
        label: 'Average Booking Value',
        value:
          typeof m.avgBookingValue === 'object'
            ? m.avgBookingValue?.label || '₹0'
            : `₹${Number(m.avgBookingValue || 0).toLocaleString('en-IN')}`,
      },
      {
        id: 'space-utilization-rate',
        label: 'Space Utilization Rate',
        value: `${m.spaceUtilizationRate ?? m.avgUtilization ?? 0}%`,
      },
      {
        id: 'space-cancellation-rate',
        label: 'Space Cancellation Rate',
        value: `${m.spaceCancellationRate ?? 0}%`,
      },
      {
        id: 'avg-venue-rating',
        label: 'Average Venue Rating',
        value: `${m.avgVenueRating ?? 0}/5`,
      },
      {
        id: 'venue-satisfaction-score',
        label: 'Venue Satisfaction Score',
        value: `${m.venueSatisfactionScore ?? m.satisfaction ?? 0}%`,
      },
      {
        id: 'repeat-booking-rate',
        label: 'Repeat Booking Rate',
        value: `${m.repeatBookingRate ?? 0}%`,
      },
      {
        id: 'peak-utilization-hours',
        label: 'Peak Utilization Hours',
        value: m.peakUtilizationHours || '—',
      },
      {
        id: 'total-refund-amount',
        label: 'Total Refund Amount',
        value:
          typeof m.totalRefundAmount === 'object'
            ? m.totalRefundAmount?.label || '₹0'
            : `₹${Number(m.totalRefundAmount || 0).toLocaleString('en-IN')}`,
      },
      {
        id: 'refund-rate',
        label: 'Refund Rate',
        value: `${m.refundRate ?? 0}%`,
      },
      {
        id: 'host-cancellation-rate',
        label: 'Host Cancellation Rate',
        value: `${m.hostCancellationRate ?? m.cancellationRate ?? 0}%`,
      },
      {
        id: 'host-initiated-cancellations',
        label: 'Host Initiated Cancellations',
        value: String(m.hostInitiatedCancellations ?? 0),
      },
    ]
  }, [dashboardData])

  const visibleMetrics = useMemo(
    () =>
      orderByActiveMetricIds(
        attachMetricTrends(liveMetrics, dashboardData?.metricTrends),
        activeMetricIds,
      ),
    [liveMetrics, activeMetricIds, dashboardData?.metricTrends],
  )

  const trendData: TrendPoint[] = useMemo(
    () => (dashboardData?.trends?.length ? dashboardData.trends : []),
    [dashboardData],
  )

  const topVenues: VenueRow[] = useMemo(
    () => (dashboardData?.topVenues?.length ? dashboardData.topVenues : []),
    [dashboardData],
  )

  const handleExportData = useCallback(async () => {
    if (isLoading) {
      toast.message('Please wait for data to load')
      return
    }

    if (visibleMetrics.length === 0 && trendData.length === 0 && topVenues.length === 0) {
      toast.error('No data available to export')
      return
    }

    const rangeLabel =
      selectedRange === '3'
        ? 'Last 3 Months'
        : selectedRange === '6'
          ? 'Last 6 Months'
          : 'Last 12 Months'

    try {
      await exportVenueDashboardToExcel(
        {
          rangeLabel,
          metrics: visibleMetrics,
          trendPoints: trendData,
          topVenues,
        },
        fileFormat,
      )
      toast.success(`Exported as ${exportFormat}`)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to export venue dashboard'))
    }
  }, [exportFormat, fileFormat, isLoading, selectedRange, topVenues, trendData, visibleMetrics])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Venues</h1>
          <p className="ui-page-subtitle mt-1 text-[16px] leading-5 font-medium tracking-normal text-[#FFFFFF80]">
            Venue performance, utilization analytics, and revenue metrics
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            className="ui-manage-metrics h-9"
            onClick={() => navigate('/venues/dashboard/metrics')}
          >
            <ManageMetricsIcon />
            Manage Metrics
          </Button>

          <Button className="ui-export-data h-9" onClick={handleExportData}>
            <ExportDataIcon className="size-5 shrink-0" />
            Export Data
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4 @min-[1100px]/main:grid-cols-4">
        {isLoading
          ? Array.from({ length: skeletonCount }).map((_, index) => (
              <MetricCardSkeleton key={`venue-metric-skeleton-${index}`} />
            ))
          : visibleMetrics.map((metric) => <MetricCard key={metric.id} metric={metric} />)}
      </div>

      <div className="rounded-brand-lg bg-brand-surface border border-white/[0.06] p-5">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-[16px] leading-5 font-semibold tracking-normal text-white">
              Venue Utilization &amp; Revenue Trends
            </h2>
            <p className="text-body-sm text-muted mt-0.5">
              Monthly utilization and revenue performance
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={selectedRange}
                onChange={(e) => setSelectedRange(e.target.value)}
                className="ui-input focus:border-brand-accent/50 text-body-sm h-9 cursor-pointer appearance-none pr-8 font-medium outline-none"
              >
                <option value="3">Last 3 Months</option>
                <option value="6">Last 6 Months</option>
                <option value="12">Last 12 Months</option>
              </select>
            </div>
            <button
              type="button"
              aria-label="Refresh"
              className="rounded-lg p-2 text-white transition-colors hover:bg-white/5"
              onClick={() => {
                dashboardQuery.refetch()
              }}
            >
              <RotateCw className={`size-4 ${dashboardQuery.isFetching ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="h-[300px] w-full animate-pulse rounded-lg bg-white/5" />
        ) : trendData.length === 0 ? (
          <div className="text-muted flex h-[300px] items-center justify-center text-sm">
            No trend data available.
          </div>
        ) : (
          <div className="h-[300px] w-full overflow-visible">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={trendData} margin={{ left: 8, right: 8, top: 12, bottom: 8 }}>
                <defs>
                  <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={VENUE_TREND_COLORS.revenue} stopOpacity={0.45} />
                    <stop offset="100%" stopColor={VENUE_TREND_COLORS.revenue} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tick={AXIS_TICK}
                  interval="preserveStartEnd"
                  minTickGap={16}
                />
                <YAxis
                  yAxisId="left"
                  tickLine={false}
                  axisLine={false}
                  width={56}
                  tickCount={5}
                  allowDecimals={false}
                  tick={(props) => (
                    <ChartAxisTick {...props} textAnchor="end" formatter={formatRevenueAxisTick} />
                  )}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tickLine={false}
                  axisLine={false}
                  width={40}
                  tickCount={5}
                  domain={[0, 'auto']}
                  tick={(props) => (
                    <ChartAxisTick
                      {...props}
                      textAnchor="start"
                      formatter={formatUtilizationAxisTick}
                    />
                  )}
                />
                <Tooltip
                  content={<VenueTrendsTooltip />}
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                />
                <Legend wrapperStyle={{ color: 'rgba(148,163,184,0.85)', fontSize: 12 }} />
                <Bar
                  yAxisId="right"
                  name="Utilization %"
                  dataKey="utilization"
                  fill={VENUE_TREND_COLORS.utilization}
                  radius={[4, 4, 0, 0]}
                  barSize={Math.min(
                    135,
                    Math.max(28, Math.floor(700 / Math.max(trendData.length, 1))),
                  )}
                  maxBarSize={135}
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  name="Revenue"
                  dataKey="revenue"
                  stroke={VENUE_TREND_COLORS.revenue}
                  strokeWidth={2}
                  fill="url(#revenueFill)"
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  name="Avg Revenue/Venue"
                  dataKey="avgRevenue"
                  stroke={VENUE_TREND_COLORS.avgRevenue}
                  strokeWidth={2}
                  dot={{ r: 3, fill: VENUE_TREND_COLORS.avgRevenue }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="rounded-brand-lg bg-brand-surface border border-white/[0.06] p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-body-md font-bold text-white">Top Performing Venues</h2>
            <p className="text-body-sm text-muted mt-0.5">
              Ranked by utilization and revenue contribution
            </p>
          </div>
          <button
            type="button"
            aria-label="Refresh"
            className="rounded-lg p-2 text-white transition-colors hover:bg-white/5"
            onClick={() => {
              dashboardQuery.refetch()
            }}
          >
            <RotateCw className={`size-4 ${dashboardQuery.isFetching ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={`venue-host-skeleton-${index}`}
                className="h-10 animate-pulse rounded bg-white/5"
              />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-left">
              <thead>
                <tr>
                  <th className="px-3 py-3 text-center text-[16px] leading-5 font-semibold tracking-normal text-white">
                    Venue Name
                  </th>
                  <th className="px-3 py-3 text-center text-[16px] leading-5 font-semibold tracking-normal text-white">
                    City
                  </th>
                  <th className="px-3 py-3 text-center text-[16px] leading-5 font-semibold tracking-normal text-white">
                    Total Visits
                  </th>
                  <th className="px-3 py-3 text-center text-[16px] leading-5 font-semibold tracking-normal text-white">
                    Event Attendance
                  </th>
                  <th className="px-3 py-3 text-center text-[16px] leading-5 font-semibold tracking-normal text-white">
                    Bookings
                  </th>
                  <th className="px-3 py-3 text-center text-[16px] leading-5 font-semibold tracking-normal text-white">
                    Repeat Visitors %
                  </th>
                  <th className="px-3 py-3 text-center text-[16px] leading-5 font-semibold tracking-normal text-white">
                    Utilization %
                  </th>
                  <th className="px-3 py-3 text-center text-[16px] leading-5 font-semibold tracking-normal text-white">
                    Revenue
                  </th>
                  <th className="px-3 py-3 text-center text-[16px] leading-5 font-semibold tracking-normal text-white">
                    Rating
                  </th>
                  <th className="px-3 py-3 text-center text-[16px] leading-5 font-semibold tracking-normal text-white">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {topVenues.length > 0 ? (
                  topVenues.map((venue) => (
                    <tr
                      key={venue.name}
                      className="text-body-sm text-brand-text border-b border-white/5 transition-colors hover:bg-white/[0.02]"
                    >
                      <td className="px-3 py-3 text-[14px] leading-5 font-semibold tracking-normal text-white">
                        {venue.name}
                      </td>
                      <td className="px-3 py-3 text-center text-[14px] leading-5 font-semibold tracking-normal text-white">
                        {venue.city}
                      </td>
                      <td className="px-3 py-3 text-center text-[14px] leading-5 font-semibold tracking-normal text-white">
                        {venue.totalVisits || 0}
                      </td>
                      <td className="px-3 py-3 text-center text-[14px] leading-5 font-semibold tracking-normal text-white">
                        {venue.eventAttendance || 0}
                      </td>
                      <td className="px-3 py-3 text-center text-[14px] leading-5 font-semibold tracking-normal text-white">
                        {venue.bookings || 0}
                      </td>
                      <td className="px-3 py-3 text-center text-[14px] leading-5 font-semibold tracking-normal text-white">
                        {venue.repeatVisitors || 0}%
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <div className="h-[5px] w-[100px] overflow-hidden rounded-[10px] bg-[#FFFFFF4D]">
                            <div
                              className={cn(
                                'h-full rounded-[10px]',
                                getVenueStatusDisplay(venue.status).barClassName,
                              )}
                              style={{
                                width: `${Math.min(100, Math.max(0, venue.utilization || 0))}%`,
                              }}
                            />
                          </div>
                          <span className="text-center text-[14px] leading-5 font-semibold tracking-normal text-white">
                            {venue.utilization || 0}%
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-[14px] leading-5 font-semibold tracking-normal text-white">
                        {venue.revenue || '₹0'}
                      </td>
                      <td className="px-3 py-3">
                        <span className="inline-flex items-center gap-1">
                          <Star className="fill-brand-accent text-brand-accent size-3.5" />
                          <span className="text-[14px] leading-5 font-semibold tracking-normal text-white">
                            {venue.rating || 0}
                          </span>
                        </span>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <span className={getVenueStatusDisplay(venue.status).className}>
                          {getVenueStatusDisplay(venue.status).label}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={10} className="text-muted py-6 text-center text-sm">
                      No venues found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
