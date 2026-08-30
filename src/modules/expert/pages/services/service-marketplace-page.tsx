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
import { RefreshCw, Star, TrendingDown, TrendingUp } from 'lucide-react'
import { ExportDataIcon, ManageMetricsIcon } from '@/shared/components/icons/action-button-icons'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import type {
  MarketplaceMetric,
  ServiceConsultationTrendPoint,
} from '@/modules/expert/mock/service-marketplace.mock'
import { DashboardCard } from '@/shared/components/dashboard/dashboard-card'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'
import { SERVICE_DASHBOARD_MODULE_KEY } from '../../api/ui-preferences-api'
import { orderByActiveMetricIds, useActiveMetricIds } from '../../hooks/use-active-metric-ids'
import { useMarketplaceDashboard } from '@/modules/services/hooks/use-marketplace-dashboard'
import type {
  DateRangePreset,
  MetricTrend,
} from '@/modules/services/types/marketplace-dashboard.types'
import { exportServiceMarketplaceExcel } from './service-marketplace-export'

const ZERO_SERVICE_METRICS: MarketplaceMetric[] = [
  { id: 'listed-services', label: 'Listed Services', value: '0' },
  { id: 'active-services', label: 'Active Services', value: '0' },
  { id: 'services-delivered', label: 'Services Delivered', value: '0' },
  { id: 'service-completion', label: 'Service Completion %', value: '0%' },
  { id: 'avg-delivery-time', label: 'Avg. Delivery Time', value: '0d 0h' },
  { id: 'total-service-revenue', label: 'Total Service Revenue', value: '₹0.00' },
  { id: 'avg-revenue-service', label: 'Avg. Revenue/Service', value: '₹0.00' },
  { id: 'repeat-service', label: 'Repeat Service %', value: '0%' },
  { id: 'avg-service-rating', label: 'Avg. Service Rating', value: '0/5' },
  { id: 'customer-satisfaction', label: 'Customer Satisfaction', value: '0%' },
  { id: 'on-time-delivery', label: 'On-Time Delivery', value: '0%' },
  { id: 'service-cancellation-rate', label: 'Service Cancellation Rate', value: '0%' },
]

const ZERO_CONSULTATION_METRICS: MarketplaceMetric[] = [
  { id: 'listed-consultation', label: 'Listed Consultation', value: '0' },
  { id: 'active-consultation', label: 'Active Consultation', value: '0' },
  { id: 'completed', label: 'Completed', value: '0' },
  { id: 'consultation-completion', label: 'Consultation Completion %', value: '0%' },
  { id: 'avg-consultation-time', label: 'Avg. Consultation Time', value: '0 min' },
  { id: 'total-consultation-revenue', label: 'Total Consultation Revenue', value: '₹0.00' },
  { id: 'avg-revenue-consultation', label: 'Avg. Revenue/Consultation', value: '₹0.00' },
  { id: 'repeat-consultation', label: 'Repeat Consultation %', value: '0%' },
]

function CompactMetricCard({ label, value, trend }: MarketplaceMetric) {
  const isUp = trend?.direction === 'up'

  return (
    <div className="rounded-brand-lg bg-brand-surface flex min-h-[130px] flex-col border border-white/[0.06] p-4 transition-colors hover:border-white/10">
      <p className="text-body-sm text-muted font-medium">{label}</p>
      <p className="text-h3 mt-2 font-bold tracking-tight text-white">{value}</p>
      <div className="mt-auto flex items-center gap-2 pt-3">
        {trend ? (
          <>
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold',
                isUp
                  ? 'bg-brand-positive/15 text-brand-positive'
                  : 'bg-brand-danger/10 text-brand-danger',
              )}
            >
              {isUp ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
              {trend.percentage}%
            </span>
            <span className="text-muted text-[10px]">{trend.label ?? 'vs last month'}</span>
          </>
        ) : null}
      </div>
    </div>
  )
}

function MetricCardSkeleton() {
  return (
    <div className="rounded-brand-lg bg-brand-surface min-h-[130px] border border-white/[0.06] p-4">
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
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
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
  services: '#2196F3',
  consultations: '#4CAF50',
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

const DEFAULT_SERVICE_METRIC_IDS = ZERO_SERVICE_METRICS.map((metric) => metric.id)

const RANGE_PRESETS_MAP: Record<string, DateRangePreset> = {
  'last-3-months': 'quarter',
  'last-6-months': 'quarter',
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

    const s = dashboardData.services
    const cancellationPct = s.orders.cancellationRate ?? 0

    return [
      {
        id: 'listed-services',
        label: 'Listed Services',
        value: (s.listings.listed ?? 0).toLocaleString('en-IN'),
      },
      {
        id: 'active-services',
        label: 'Active Services',
        value: (s.listings.active ?? 0).toLocaleString('en-IN'),
      },
      {
        id: 'services-delivered',
        label: 'Services Delivered',
        value: (s.orders.completed ?? 0).toLocaleString('en-IN'),
      },
      {
        id: 'service-completion',
        label: 'Service Completion %',
        value: `${s.orders.completionRate ?? 0}%`,
      },
      {
        id: 'avg-delivery-time',
        label: 'Avg. Delivery Time',
        value: s.delivery.averageTime?.label || '0d 0h',
      },
      {
        id: 'total-service-revenue',
        label: 'Total Service Revenue',
        value: s.revenue.total?.label || '₹0.00',
      },
      {
        id: 'avg-revenue-service',
        label: 'Avg. Revenue/Service',
        value: s.revenue.averagePerService?.label || '₹0.00',
      },
      {
        id: 'repeat-service',
        label: 'Repeat Service %',
        value: `${s.repeatServicePct ?? 0}%`,
      },
      {
        id: 'avg-service-rating',
        label: 'Avg. Service Rating',
        value: `${Number(s.quality?.avgRating ?? 0).toFixed(1)}/5`,
      },
      {
        id: 'customer-satisfaction',
        label: 'Customer Satisfaction',
        value: `${s.quality?.customerSatisfactionPct ?? 0}%`,
      },
      {
        id: 'on-time-delivery',
        label: 'On-Time Delivery',
        value: `${s.delivery.onTimeDeliveryPct ?? 0}%`,
      },
      {
        id: 'service-cancellation-rate',
        label: 'Service Cancellation Rate',
        value: `${cancellationPct}%`,
      },
    ]
  }, [dashboardData])

  const liveConsultationMetrics: MarketplaceMetric[] = useMemo(() => {
    if (!dashboardData) return ZERO_CONSULTATION_METRICS

    const c = dashboardData.consultations

    return [
      {
        id: 'listed-consultation',
        label: 'Listed Consultation',
        value: (c.listings.listed ?? 0).toLocaleString('en-IN'),
      },
      {
        id: 'active-consultation',
        label: 'Active Consultation',
        value: (c.listings.active ?? 0).toLocaleString('en-IN'),
      },
      {
        id: 'completed',
        label: 'Completed',
        value: (c.bookings.completed ?? 0).toLocaleString('en-IN'),
      },
      {
        id: 'consultation-completion',
        label: 'Consultation Completion %',
        value: `${c.bookings.completionRate ?? 0}%`,
      },
      {
        id: 'avg-consultation-time',
        label: 'Avg. Consultation Time',
        value: `${c.duration.averageMinutes ?? 0} min`,
      },
      {
        id: 'total-consultation-revenue',
        label: 'Total Consultation Revenue',
        value: c.revenue.total?.label || '₹0.00',
      },
      {
        id: 'avg-revenue-consultation',
        label: 'Avg. Revenue/Consultation',
        value: c.revenue.averagePerBooking?.label || '₹0.00',
      },
      {
        id: 'repeat-consultation',
        label: 'Repeat Consultation %',
        value: `${c.bookings.repeatConsultationPct ?? 0}%`,
      },
    ]
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
    () => attachTrend(liveConsultationMetrics, dashboardData?.metricTrends?.consultations),
    [liveConsultationMetrics, dashboardData?.metricTrends?.consultations],
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
    } catch {
      toast.error('Failed to export data')
    }
  }, [isLoading, visibleServiceMetrics, visibleConsultationMetrics, trendPoints, selectedRange])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-100 sm:text-4xl">
            Service Marketplace
          </h1>
          <p className="text-sm leading-relaxed text-slate-300 sm:text-base">
            Service delivery analytics and marketplace performance metrics
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button
            className="ui-manage-metrics h-9"
            onClick={() => navigate('/services/dashboard/metrics')}
          >
            <ManageMetricsIcon className="size-4 shrink-0" />
            Manage Metrics
          </Button>

          <Button className="ui-export-data h-9" onClick={handleExportData}>
            <ExportDataIcon className="size-5" />
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
        className="border-white/[0.06] p-5"
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
              className="text-muted grid size-9 place-items-center rounded-lg border border-white/10 bg-black transition-colors hover:bg-white/5"
              onClick={() => {
                dashboardQuery.refetch()
              }}
            >
              <RefreshCw
                className={`size-3.5 ${dashboardQuery.isFetching ? 'animate-spin' : ''}`}
              />
            </button>
          </div>
        }
      >
        {isLoading ? (
          <div className="h-[340px] w-full animate-pulse rounded-lg bg-white/5 sm:h-[400px]" />
        ) : trendPoints.length === 0 ? (
          <div className="text-muted flex h-[340px] items-center justify-center text-sm sm:h-[400px]">
            No trend data available.
          </div>
        ) : (
          <div className="h-[340px] w-full sm:h-[400px]">
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
                  maxBarSize={32}
                />
                <Bar
                  yAxisId="left"
                  dataKey="consultationsCompleted"
                  name="Consultations Completed"
                  fill={CHART_COLORS.consultations}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={32}
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
