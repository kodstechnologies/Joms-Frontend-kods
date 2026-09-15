import { useCallback, useMemo, useState } from 'react'
import {
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
import { ExportDataIcon } from '@/shared/components/icons/action-button-icons'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/shared/lib/api-error'

import type {
  MarketplaceMetric,
  ServiceConsultationTrendPoint,
} from '@/modules/expert/config/service-marketplace.config'
import { DashboardCard } from '@/shared/components/dashboard/dashboard-card'
import { formatTrendPercent, TrendBadge } from '@/shared/components/dashboard/trend-badge'
import { Button } from '@/shared/components/ui/button'
import { SERVICE_DASHBOARD_MODULE_KEY } from '../../api/ui-preferences-api'
import {
  DEFAULT_SERVICE_DASHBOARD_METRIC_IDS,
  SERVICE_DASHBOARD_CONSULTATION_METRICS_CATALOG,
  SERVICE_DASHBOARD_SERVICE_METRICS_CATALOG,
} from '../../config/service-dashboard-metrics.config'
import { orderByActiveMetricIds, useActiveMetricIds } from '../../hooks/use-active-metric-ids'
import { useMarketplaceDashboard } from '@/modules/services/hooks/use-marketplace-dashboard'
import type {
  DateRangePreset,
  MarketplaceDashboardData,
  MetricTrend,
} from '@/modules/services/types/marketplace-dashboard.types'
import { exportServiceMarketplaceExcel } from './service-marketplace-export'

const formatCount = (value?: number | null) => (value ?? 0).toLocaleString('en-IN')
const formatPct = (value?: number | null) => `${value ?? 0}%`
const formatRating = (value?: number | null) =>
  value == null || Number.isNaN(Number(value)) ? '—' : `${Number(value).toFixed(1)}/5`
const formatText = (value?: string | null) => (value && String(value).trim() ? String(value) : '—')
const formatMoneyLabel = (value?: { label?: string } | null) => value?.label || '₹0.00'

const ZERO_SERVICE_METRICS: MarketplaceMetric[] = SERVICE_DASHBOARD_SERVICE_METRICS_CATALOG.map(
  (item) => ({
    id: item.id,
    label: item.label,
    value:
      item.type === 'Currency'
        ? '₹0.00'
        : item.type === 'Percentage'
          ? '0%'
          : item.type === 'Duration'
            ? '0d 0h'
            : item.type === 'Decimal'
              ? '0'
              : item.type === 'String'
                ? '—'
                : '0',
  }),
)

const ZERO_CONSULTATION_METRICS: MarketplaceMetric[] =
  SERVICE_DASHBOARD_CONSULTATION_METRICS_CATALOG.map((item) => ({
    id: item.id,
    label: item.label,
    value:
      item.type === 'Currency'
        ? '₹0.00'
        : item.type === 'Percentage'
          ? '0%'
          : item.type === 'Duration'
            ? '00:00'
            : item.type === 'Decimal'
              ? '0'
              : item.type === 'String'
                ? '—'
                : '0',
  }))

function CompactMetricCard({ label, value, trend }: MarketplaceMetric) {
  const isUp = trend?.direction === 'up'

  return (
    <div className="flex h-[130px] w-full max-w-[220px] min-w-0 flex-col rounded-[10px] bg-[#050505] p-4">
      <p className="text-body-sm text-muted font-medium">{label}</p>
      <p className="text-h3 mt-2 font-bold tracking-tight text-white">{value}</p>
      <div className="mt-auto flex items-center gap-2 pt-3">
        {trend ? (
          <>
            <TrendBadge direction={isUp ? 'up' : 'down'}>
              {formatTrendPercent(trend.percentage, isUp ? 'up' : 'down')}
            </TrendBadge>
            <span className="text-muted text-[10px]">{trend.label ?? 'vs last month'}</span>
          </>
        ) : (
          <span className="text-muted text-[10px]">vs last month —</span>
        )}
      </div>
    </div>
  )
}

function MetricCardSkeleton() {
  return (
    <div className="flex h-[130px] w-full max-w-[220px] min-w-0 flex-col rounded-[10px] bg-[#050505] p-4">
      <div className="h-3 w-24 animate-pulse rounded bg-white/10" />
      <div className="mt-3 h-7 w-20 animate-pulse rounded bg-white/10" />
      <div className="mt-auto pt-6">
        <div className="h-5 w-32 animate-pulse rounded bg-white/5" />
      </div>
    </div>
  )
}

function MetricsSection({
  title,
  metrics,
  isLoading,
}: {
  title: string
  metrics: MarketplaceMetric[]
  isLoading?: boolean
}) {
  return (
    <div className="rounded-brand-lg bg-brand-surface border border-white/[0.06] p-5">
      <h2 className="text-body-md mb-5 font-bold text-white">{title}</h2>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] justify-items-start gap-3">
        {isLoading
          ? Array.from({ length: Math.max(metrics.length, 8) }).map((_, index) => (
              <MetricCardSkeleton key={`${title}-skeleton-${index}`} />
            ))
          : metrics.map((metric) => (
              <CompactMetricCard key={metric.id || metric.label} {...metric} />
            ))}
      </div>
    </div>
  )
}

const CHART_COLORS = {
  services: '#155DFC',
  consultations: '#00A63E',
  revenue: '#FF9800',
} as const

const trendsTooltipStyle = {
  background: '#ffffff',
  border: '1px solid #3B82F6',
  borderRadius: 8,
  padding: '12px 14px',
  boxShadow: '0 12px 32px rgba(0,0,0,0.18)',
}

type TrendsTooltipProps = {
  active?: boolean
  label?: string
  payload?: Array<{ dataKey?: string; value?: number }>
}

function TrendsTooltip({ active, payload, label }: TrendsTooltipProps) {
  if (!active || !payload?.length) return null

  const data = payload.reduce<Partial<ServiceConsultationTrendPoint>>((acc, entry) => {
    if (entry.dataKey && typeof entry.value === 'number') {
      acc[entry.dataKey as keyof ServiceConsultationTrendPoint] = entry.value as never
    }
    return acc
  }, {})

  return (
    <div style={trendsTooltipStyle}>
      <p className="mb-2 text-sm font-semibold text-slate-900">{label}</p>
      <div className="space-y-1 text-xs">
        <p style={{ color: CHART_COLORS.consultations }}>
          Consultation completed:{' '}
          <span className="font-semibold">{data.consultationsCompleted ?? 0}</span>
        </p>
        <p style={{ color: CHART_COLORS.revenue }}>
          Revenue(₹):{' '}
          <span className="font-semibold">
            {(data.revenue ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </span>
        </p>
        <p style={{ color: CHART_COLORS.services }}>
          Service delivered: <span className="font-semibold">{data.servicesDelivered ?? 0}</span>
        </p>
      </div>
    </div>
  )
}

function TrendsLegend() {
  const items = [
    { label: 'Consultations Completed', color: CHART_COLORS.consultations },
    { label: 'Revenue (₹)', color: CHART_COLORS.revenue },
    { label: 'Services Delivered', color: CHART_COLORS.services },
  ]

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-4">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <Star className="size-3.5" style={{ color: item.color, fill: item.color }} />
          <span className="text-xs text-slate-400">{item.label}</span>
        </div>
      ))}
    </div>
  )
}

const niceAxisMax = (value: number) => {
  if (value <= 0) return 100
  const magnitude = 10 ** Math.floor(Math.log10(value))
  const normalized = value / magnitude
  const nice = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10
  return nice * magnitude
}

const attachTrend = (
  metrics: MarketplaceMetric[],
  trends?: Record<string, MetricTrend>,
): MarketplaceMetric[] =>
  metrics.map((metric) => ({
    ...metric,
    trend: trends?.[metric.id],
  }))

const DEFAULT_SERVICE_METRIC_IDS = DEFAULT_SERVICE_DASHBOARD_METRIC_IDS

function buildServiceMetrics(dashboardData: MarketplaceDashboardData): MarketplaceMetric[] {
  const s = dashboardData.services
  const refundAmount = s.refunds
  const mostOptedSub = s.mostOptedSubCategory?.name ?? null

  return [
    { id: 'listed-services', label: 'Listed Services', value: formatCount(s.listings.listed) },
    { id: 'active-services', label: 'Active Services', value: formatCount(s.listings.active) },
    { id: 'paused-services', label: 'Paused Services', value: formatCount(s.listings.paused) },
    {
      id: 'archived-services',
      label: 'Archived Services',
      value: formatCount(s.listings.archived),
    },
    { id: 'deleted-services', label: 'Deleted Services', value: formatCount(s.listings.deleted) },
    {
      id: 'most-opted-service-category',
      label: 'Most Opted Service Category',
      value: formatText(s.mostOptedCategory?.name),
    },
    {
      id: 'most-opted-service-sub-category',
      label: 'Most Opted Service Sub-Category',
      value: formatText(mostOptedSub),
    },
    {
      id: 'total-service-orders',
      label: 'Total Service Orders',
      value: formatCount(s.orders.total),
    },
    {
      id: 'services-delivered',
      label: 'Completed Service Orders',
      value: formatCount(s.orders.completed),
    },
    {
      id: 'in-progress-service-orders',
      label: 'In Progress Service Orders',
      value: formatCount(s.orders.inProgress),
    },
    {
      id: 'disputed-service-orders',
      label: 'Disputed Service Orders',
      value: formatCount(s.orders.disputed),
    },
    {
      id: 'service-completion',
      label: 'Service Completion Rate',
      value: formatPct(s.orders.completionRate),
    },
    {
      id: 'avg-delivery-time',
      label: 'Average Delivery Time',
      value: s.delivery.averageTime?.label || '0d 0h',
    },
    {
      id: 'total-service-revenue',
      label: 'Total Service Revenue',
      value: formatMoneyLabel(s.revenue.total),
    },
    {
      id: 'avg-revenue-service',
      label: 'Average Revenue per Service',
      value: formatMoneyLabel(s.revenue.averagePerService),
    },
    {
      id: 'average-order-value',
      label: 'Average Order Value (AOV)',
      value: formatMoneyLabel(s.revenue.averageOrderValue),
    },
    {
      id: 'avg-service-rating',
      label: 'Average Service Rating',
      value: formatRating(s.quality?.avgRating),
    },
    {
      id: 'customer-satisfaction',
      label: 'Customer Satisfaction',
      value: formatPct(s.quality?.customerSatisfactionPct),
    },
    {
      id: 'on-time-delivery',
      label: 'On-Time Delivery %',
      value: formatPct(s.delivery.onTimeDeliveryPct),
    },
    {
      id: 'avg-services-per-expert',
      label: 'Average Services per Expert',
      value: Number(s.experts?.avgServicesPerExpert ?? 0).toFixed(1),
    },
    {
      id: 'total-refund-amount',
      label: 'Total Refund Amount',
      value: formatMoneyLabel(refundAmount?.total) || '₹0.00',
    },
    {
      id: 'refund-rate',
      label: 'Refund Rate',
      value: formatPct(refundAmount?.rate ?? 0),
    },
    {
      id: 'repeat-service',
      label: 'Repeat Service %',
      value: formatPct(s.repeatServicePct),
    },
    {
      id: 'service-cancellation-rate',
      label: 'Service Cancellation Rate',
      value: formatPct(s.orders.cancellationRate),
    },
  ]
}

function buildConsultationMetrics(dashboardData: MarketplaceDashboardData): MarketplaceMetric[] {
  const c = dashboardData.consultations
  const quality = c.quality

  return [
    {
      id: 'listed-consultation',
      label: 'Listed Consultations',
      value: formatCount(c.listings.listed),
    },
    {
      id: 'active-consultation',
      label: 'Active Consultations',
      value: formatCount(c.listings.active),
    },
    {
      id: 'paused-consultations',
      label: 'Paused Consultations',
      value: formatCount(c.listings.paused),
    },
    {
      id: 'archived-consultations',
      label: 'Archived Consultations',
      value: formatCount(c.listings.archived),
    },
    {
      id: 'deleted-consultations',
      label: 'Deleted Consultations',
      value: formatCount(c.listings.deleted),
    },
    {
      id: 'consultation-bookings',
      label: 'Consultation Bookings',
      value: formatCount(c.bookings.total),
    },
    {
      id: 'completed',
      label: 'Completed Consultations',
      value: formatCount(c.bookings.completed),
    },
    {
      id: 'scheduled-consultations',
      label: 'Scheduled Consultations',
      value: formatCount(c.bookings.scheduled),
    },
    {
      id: 'cancelled-consultations',
      label: 'Cancelled Consultations',
      value: formatCount(c.bookings.cancelled),
    },
    {
      id: 'consultation-completion',
      label: 'Consultation Completion Rate',
      value: formatPct(c.bookings.completionRate),
    },
    {
      id: 'avg-consultation-time',
      label: 'Average Consultation Duration',
      value: c.duration.label || `${c.duration.averageMinutes ?? 0} min`,
    },
    {
      id: 'total-consultation-revenue',
      label: 'Total Consultation Revenue',
      value: formatMoneyLabel(c.revenue.total),
    },
    {
      id: 'avg-revenue-consultation',
      label: 'Average Revenue per Consultation',
      value: formatMoneyLabel(c.revenue.averagePerBooking),
    },
    {
      id: 'average-booking-value',
      label: 'Average Booking Value',
      value: formatMoneyLabel(c.revenue.averagePerBooking),
    },
    {
      id: 'most-opted-consultation-category',
      label: 'Most Opted Consultation Category',
      value: formatText(c.mostOptedCategory?.name),
    },
    {
      id: 'avg-consultation-rating',
      label: 'Average Consultation Rating',
      value: formatRating(quality?.avgRating),
    },
    {
      id: 'consultation-satisfaction',
      label: 'Consultation Satisfaction',
      value:
        quality?.customerSatisfactionPct != null ? formatPct(quality.customerSatisfactionPct) : '—',
    },
    {
      id: 'repeat-consultation',
      label: 'Repeat Consultation %',
      value: formatPct(c.bookings.repeatConsultationPct),
    },
  ]
}

const RANGE_PRESETS_MAP: Record<string, DateRangePreset> = {
  'last-3-months': 'quarter',
  'last-6-months': 'last6months',
  'last-12-months': 'year',
}

const RANGE_LABELS: Record<string, string> = {
  'last-3-months': 'Last 3 Months',
  'last-6-months': 'Last 6 Months',
  'last-12-months': 'Last 12 Months',
}

const MONTH_LABELS = [
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
] as const

const buildTrendBucket = (date: string, aggregateByMonth: boolean) => {
  if (aggregateByMonth && date.length >= 7) {
    const year = date.slice(0, 4)
    const month = date.slice(5, 7)
    const monthIndex = Number.parseInt(month, 10) - 1
    return {
      sortKey: `${year}-${month}`,
      label: MONTH_LABELS[monthIndex] ?? `${year}-${month}`,
    }
  }

  const shortDate = date.length >= 10 ? date.slice(5) : date
  return { sortKey: date, label: shortDate }
}

export function ServiceMarketplacePage() {
  const navigate = useNavigate()
  const [selectedRange, setSelectedRange] = useState<string>('last-3-months')

  const dateRangePreset: DateRangePreset = RANGE_PRESETS_MAP[selectedRange] || 'last30days'

  const dashboardQuery = useMarketplaceDashboard({ dateRange: dateRangePreset })
  const dashboardData = dashboardQuery.data
  const isLoading = dashboardQuery.isLoading

  const activeMetricIds = useActiveMetricIds(
    SERVICE_DASHBOARD_MODULE_KEY,
    DEFAULT_SERVICE_METRIC_IDS,
  )

  const liveServiceMetrics: MarketplaceMetric[] = useMemo(() => {
    if (!dashboardData) return ZERO_SERVICE_METRICS
    return buildServiceMetrics(dashboardData)
  }, [dashboardData])

  const liveConsultationMetrics: MarketplaceMetric[] = useMemo(() => {
    if (!dashboardData) return ZERO_CONSULTATION_METRICS
    return buildConsultationMetrics(dashboardData)
  }, [dashboardData])

  const trendPoints: ServiceConsultationTrendPoint[] = useMemo(() => {
    if (!dashboardData) return []

    const aggregateByMonth = true
    const map = new Map<
      string,
      {
        sortKey: string
        month: string
        consultationsCompleted: number
        servicesDelivered: number
        revenue: number
      }
    >()

    for (const d of dashboardData.trends.serviceRevenue || []) {
      const { sortKey, label } = buildTrendBucket(d.date, aggregateByMonth)
      const current = map.get(sortKey) || {
        sortKey,
        month: label,
        consultationsCompleted: 0,
        servicesDelivered: 0,
        revenue: 0,
      }
      current.revenue += d.revenue ?? 0
      current.servicesDelivered += d.orders ?? 0
      map.set(sortKey, current)
    }

    for (const d of dashboardData.trends.consultationRevenue || []) {
      const { sortKey, label } = buildTrendBucket(d.date, aggregateByMonth)
      const current = map.get(sortKey) || {
        sortKey,
        month: label,
        consultationsCompleted: 0,
        servicesDelivered: 0,
        revenue: 0,
      }
      current.revenue += d.revenue ?? 0
      current.consultationsCompleted += d.bookings ?? d.count ?? 0
      map.set(sortKey, current)
    }

    return Array.from(map.values())
      .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
      .map(({ month, consultationsCompleted, servicesDelivered, revenue }) => ({
        month,
        consultationsCompleted,
        servicesDelivered,
        revenue,
      }))
  }, [dashboardData])

  const visibleServiceMetrics = useMemo(
    () =>
      orderByActiveMetricIds(
        attachTrend(liveServiceMetrics, dashboardData?.metricTrends?.services),
        activeMetricIds,
      ),
    [liveServiceMetrics, activeMetricIds, dashboardData?.metricTrends?.services],
  )
  const visibleConsultationMetrics = useMemo(
    () =>
      orderByActiveMetricIds(
        attachTrend(liveConsultationMetrics, dashboardData?.metricTrends?.consultations),
        activeMetricIds,
      ),
    [liveConsultationMetrics, activeMetricIds, dashboardData?.metricTrends?.consultations],
  )

  const chartAxisDomains = useMemo(() => {
    const maxCount = trendPoints.reduce(
      (max, point) =>
        Math.max(max, point.consultationsCompleted ?? 0, point.servicesDelivered ?? 0),
      0,
    )
    const maxRevenue = trendPoints.reduce((max, point) => Math.max(max, point.revenue ?? 0), 0)

    return {
      left: [0, niceAxisMax(maxCount)] as [number, number],
      right: [0, niceAxisMax(maxRevenue)] as [number, number],
    }
  }, [trendPoints])

  const handleExportData = useCallback(() => {
    if (isLoading) {
      toast.message('Please wait for data to load')
      return
    }

    if (visibleServiceMetrics.length === 0 && visibleConsultationMetrics.length === 0) {
      toast.error('No data available to export')
      return
    }

    try {
      exportServiceMarketplaceExcel({
        serviceMetrics: visibleServiceMetrics,
        consultationMetrics: visibleConsultationMetrics,
        trendPoints,
        rangeLabel: RANGE_LABELS[selectedRange] ?? selectedRange,
      })
      toast.success('Exported as Excel')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to export data'))
    }
  }, [isLoading, visibleServiceMetrics, visibleConsultationMetrics, trendPoints, selectedRange])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-100 sm:text-4xl">
            Service Marketplace
          </h1>
          <p className="ui-page-subtitle mt-1 text-[16px] leading-5 font-medium tracking-normal text-[#FFFFFF80]">
            Service delivery analytics and marketplace performance metrics
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button
            className="ui-manage-metrics"
            onClick={() => navigate('/services/dashboard/metrics')}
          >
            <ExportDataIcon className="ui-export-data-icon shrink-0" />
            Manage Metrics
          </Button>

          <Button className="ui-cta ui-cta-primary ui-export-data" onClick={handleExportData}>
            <ExportDataIcon className="ui-export-data-icon shrink-0" />
            Export Data
          </Button>
        </div>
      </div>

      <MetricsSection
        title="Service Metrics"
        metrics={visibleServiceMetrics}
        isLoading={isLoading}
      />

      <MetricsSection
        title="Consultation Metrics"
        metrics={visibleConsultationMetrics}
        isLoading={isLoading}
      />

      <DashboardCard
        className="box-border flex h-[635px] w-full max-w-[1201px] flex-col border-0 !p-5"
        title="Service & Consultation Trends"
        rightSlot={
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={selectedRange}
                onChange={(e) => setSelectedRange(e.target.value)}
                className="ui-input focus:border-brand-accent/50 text-body-sm h-9 cursor-pointer appearance-none pr-8 font-medium outline-none"
              >
                <option value="last-3-months">Last 3 Months</option>
                <option value="last-6-months">Last 6 Months</option>
                <option value="last-12-months">Last 12 Months</option>
              </select>
            </div>
            <button
              type="button"
              aria-label="Refresh trends"
              className="rounded-lg p-2 text-white transition-colors hover:bg-white/5"
              onClick={() => {
                dashboardQuery.refetch()
              }}
            >
              <RotateCw className={`size-4 ${dashboardQuery.isFetching ? 'animate-spin' : ''}`} />
            </button>
          </div>
        }
      >
        {isLoading ? (
          <div className="min-h-0 w-full flex-1 animate-pulse rounded-lg bg-white/5" />
        ) : trendPoints.length === 0 ? (
          <div className="text-muted flex min-h-0 flex-1 items-center justify-center text-sm">
            No trend data available.
          </div>
        ) : (
          <div className="min-h-0 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={trendPoints}
                margin={{ left: 4, right: 12, top: 12, bottom: 4 }}
                barGap={2}
                barCategoryGap="24%"
              >
                <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: 'rgba(148,163,184,0.85)', fontSize: 12 }}
                  dy={8}
                />
                <YAxis
                  yAxisId="left"
                  domain={chartAxisDomains.left}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: 'rgba(148,163,184,0.85)', fontSize: 12 }}
                  tickCount={5}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  domain={chartAxisDomains.right}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: 'rgba(148,163,184,0.85)', fontSize: 12 }}
                  tickCount={5}
                  tickFormatter={(v: number) =>
                    v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)
                  }
                />
                <Tooltip content={<TrendsTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Legend content={<TrendsLegend />} />
                <Bar
                  yAxisId="left"
                  dataKey="servicesDelivered"
                  name="Services Delivered"
                  fill={CHART_COLORS.services}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={44}
                  barSize={44}
                />
                <Bar
                  yAxisId="left"
                  dataKey="consultationsCompleted"
                  name="Consultations Completed"
                  fill={CHART_COLORS.consultations}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={44}
                  barSize={44}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue (₹)"
                  stroke={CHART_COLORS.revenue}
                  strokeWidth={2}
                  dot={{ fill: CHART_COLORS.revenue, r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: CHART_COLORS.revenue }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
      </DashboardCard>
    </div>
  )
}
