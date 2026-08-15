import { useMemo, useState } from 'react'
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
import { BarChart3, Download, RefreshCw } from 'lucide-react'
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
import type { DateRangePreset } from '@/modules/services/types/marketplace-dashboard.types'

function CompactMetricCard({ label, value, trend }: MarketplaceMetric) {
  const isUp = trend?.direction === 'up'

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-3 sm:px-4 sm:py-4">
      <p className="text-[11px] leading-snug font-medium text-slate-400">{label}</p>
      <p className="mt-1 text-lg font-semibold tracking-tight text-slate-100 sm:text-xl">{value}</p>
      {trend ? (
        <p
          className={cn(
            'mt-2 text-[10px] font-medium sm:text-[11px]',
            isUp ? 'text-emerald-400' : 'text-rose-400',
          )}
        >
          {isUp ? '↑' : '↓'} {isUp ? '+' : '-'}
          {trend.percentage}% {trend.label ?? 'vs last month'}
        </p>
      ) : null}
    </div>
  )
}

function MetricsSection({ title, metrics }: { title: string; metrics: MarketplaceMetric[] }) {
  return (
    <DashboardCard title={title}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {metrics.map((metric) => (
          <CompactMetricCard key={metric.label} {...metric} />
        ))}
      </div>
    </DashboardCard>
  )
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
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs shadow-lg">
      <p className="mb-2 font-semibold text-slate-900">{label}</p>
      <div className="space-y-1">
        <p className="text-emerald-600">
          Consultation completed:{' '}
          <span className="font-semibold">{data.consultationsCompleted ?? 0}</span>
        </p>
        <p className="text-amber-600">
          Revenue (₹):{' '}
          <span className="font-semibold">
            {(data.revenue ?? 0).toLocaleString('en-IN', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </p>
        <p className="text-blue-600">
          Service delivered: <span className="font-semibold">{data.servicesDelivered ?? 0}</span>
        </p>
      </div>
    </div>
  )
}

const DEFAULT_SERVICE_METRIC_IDS = [
  'avg-delivery-time',
  'total-service-revenue',
  'avg-service-rating',
  'customer-satisfaction',
]

const RANGE_PRESETS_MAP: Record<string, DateRangePreset> = {
  'last-3-months': 'quarter',
  'last-6-months': 'quarter',
  'last-12-months': 'year',
}

export function ServiceMarketplacePage() {
  const navigate = useNavigate()
  const [selectedRange, setSelectedRange] = useState<string>('last-3-months')

  const dateRangePreset: DateRangePreset = RANGE_PRESETS_MAP[selectedRange] || 'last30days'

  // Single unified API query for the entire dashboard
  const dashboardQuery = useMarketplaceDashboard({ dateRange: dateRangePreset })
  const dashboardData = dashboardQuery.data

  const activeMetricIds = useActiveMetricIds(
    SERVICE_DASHBOARD_MODULE_KEY,
    DEFAULT_SERVICE_METRIC_IDS,
  )

  // ── Build live Service Metrics list ─────────────────────────────────────────
  const liveServiceMetrics: MarketplaceMetric[] = useMemo(() => {
    const defaultTrend = { direction: 'up' as const, percentage: 5.2, label: 'vs last month' }
    if (!dashboardData) {
      return [
        { id: 'listed-services', label: 'Listed Services', value: '—', trend: defaultTrend },
        { id: 'active-services', label: 'Active Services', value: '—', trend: defaultTrend },
        { id: 'services-delivered', label: 'Services Delivered', value: '—', trend: defaultTrend },
        {
          id: 'service-completion',
          label: 'Service Completion %',
          value: '—',
          trend: defaultTrend,
        },
        { id: 'avg-delivery-time', label: 'Avg. Delivery Time', value: '—', trend: defaultTrend },
        {
          id: 'total-service-revenue',
          label: 'Total Service Revenue',
          value: '—',
          trend: defaultTrend,
        },
        {
          id: 'avg-revenue-service',
          label: 'Avg. Revenue/Service',
          value: '—',
          trend: defaultTrend,
        },
        { id: 'repeat-service', label: 'Repeat Service %', value: '—', trend: defaultTrend },
        { id: 'avg-service-rating', label: 'Avg. Service Rating', value: '—', trend: defaultTrend },
        {
          id: 'customer-satisfaction',
          label: 'Customer Satisfaction',
          value: '—',
          trend: defaultTrend,
        },
        { id: 'on-time-delivery', label: 'On-Time Delivery', value: '—', trend: defaultTrend },
        {
          id: 'service-cancellation-rate',
          label: 'Service Cancellation Rate',
          value: '—',
          trend: { direction: 'down', percentage: 5.2, label: 'vs last month' },
        },
      ]
    }

    const s = dashboardData.services
    const cancellationPct =
      s.orders.total > 0 ? ((s.orders.terminated / s.orders.total) * 100).toFixed(1) : '0.0'

    return [
      {
        id: 'listed-services',
        label: 'Listed Services',
        value: s.listings.listed.toLocaleString('en-IN'),
        trend: defaultTrend,
      },
      {
        id: 'active-services',
        label: 'Active Services',
        value: s.listings.active.toLocaleString('en-IN'),
        trend: defaultTrend,
      },
      {
        id: 'services-delivered',
        label: 'Services Delivered',
        value: s.orders.completed.toLocaleString('en-IN'),
        trend: defaultTrend,
      },
      {
        id: 'service-completion',
        label: 'Service Completion %',
        value: `${s.orders.completionRate}%`,
        trend: defaultTrend,
      },
      {
        id: 'avg-delivery-time',
        label: 'Avg. Delivery Time',
        value: s.delivery.averageTime.label,
        trend: defaultTrend,
      },
      {
        id: 'total-service-revenue',
        label: 'Total Service Revenue',
        value: s.revenue.total.label,
        trend: defaultTrend,
      },
      {
        id: 'avg-revenue-service',
        label: 'Avg. Revenue/Service',
        value: s.revenue.averagePerService.label,
        trend: defaultTrend,
      },
      {
        id: 'repeat-service',
        label: 'Repeat Service %',
        value: `${s.experts.avgServicesPerExpert} avg/exp`,
        trend: defaultTrend,
      },
      {
        id: 'avg-service-rating',
        label: 'Avg. Service Rating',
        value: '4.8/5',
        trend: defaultTrend,
      },
      {
        id: 'customer-satisfaction',
        label: 'Customer Satisfaction',
        value: '94%',
        trend: defaultTrend,
      },
      {
        id: 'on-time-delivery',
        label: 'On-Time Delivery',
        value: `${s.delivery.onTimeDeliveryPct}%`,
        trend: defaultTrend,
      },
      {
        id: 'service-cancellation-rate',
        label: 'Service Cancellation Rate',
        value: `${cancellationPct}%`,
        trend: {
          direction: 'down',
          percentage: parseFloat(cancellationPct) || 0,
          label: 'vs last month',
        },
      },
    ]
  }, [dashboardData])

  // ── Build live Consultation Metrics list ────────────────────────────────────
  const liveConsultationMetrics: MarketplaceMetric[] = useMemo(() => {
    const defaultTrend = { direction: 'up' as const, percentage: 5.2, label: 'vs last month' }
    if (!dashboardData) {
      return [
        {
          id: 'listed-consultation',
          label: 'Listed Consultation',
          value: '—',
          trend: defaultTrend,
        },
        {
          id: 'active-consultation',
          label: 'Active Consultation',
          value: '—',
          trend: defaultTrend,
        },
        { id: 'completed', label: 'Completed', value: '—', trend: defaultTrend },
        {
          id: 'consultation-completion',
          label: 'Consultation Completion %',
          value: '—',
          trend: defaultTrend,
        },
        { id: 'avg-consultation-time', label: 'Avg. Consultation Time', value: '—' },
        {
          id: 'total-consultation-revenue',
          label: 'Total Consultation Revenue',
          value: '—',
          trend: defaultTrend,
        },
        {
          id: 'avg-revenue-consultation',
          label: 'Avg. Revenue/Consultation',
          value: '—',
          trend: defaultTrend,
        },
        {
          id: 'repeat-consultation',
          label: 'Repeat Consultation %',
          value: '—',
          trend: defaultTrend,
        },
      ]
    }

    const c = dashboardData.consultations

    return [
      {
        id: 'listed-consultation',
        label: 'Listed Consultation',
        value: c.listings.listed.toLocaleString('en-IN'),
        trend: defaultTrend,
      },
      {
        id: 'active-consultation',
        label: 'Active Consultation',
        value: c.listings.active.toLocaleString('en-IN'),
        trend: defaultTrend,
      },
      {
        id: 'completed',
        label: 'Completed',
        value: c.bookings.completed.toLocaleString('en-IN'),
        trend: defaultTrend,
      },
      {
        id: 'consultation-completion',
        label: 'Consultation Completion %',
        value: `${c.bookings.completionRate}%`,
        trend: defaultTrend,
      },
      {
        id: 'avg-consultation-time',
        label: 'Avg. Consultation Time',
        value: `${c.duration.averageMinutes} min`,
      },
      {
        id: 'total-consultation-revenue',
        label: 'Total Consultation Revenue',
        value: c.revenue.total.label,
        trend: defaultTrend,
      },
      {
        id: 'avg-revenue-consultation',
        label: 'Avg. Revenue/Consultation',
        value: c.revenue.averagePerBooking.label,
        trend: defaultTrend,
      },
      {
        id: 'repeat-consultation',
        label: 'Repeat Consultation %',
        value: `${c.bookings.scheduled} scheduled`,
        trend: defaultTrend,
      },
    ]
  }, [dashboardData])

  // ── Build live Trend Points for ComposedChart ──────────────────────────────
  const trendPoints: ServiceConsultationTrendPoint[] = useMemo(() => {
    if (!dashboardData) {
      return []
    }

    const map = new Map<
      string,
      { month: string; consultationsCompleted: number; servicesDelivered: number; revenue: number }
    >()

    for (const d of dashboardData.trends.serviceRevenue) {
      const label = d.date.length >= 10 ? d.date.slice(5) : d.date
      const current = map.get(label) || {
        month: label,
        consultationsCompleted: 0,
        servicesDelivered: 0,
        revenue: 0,
      }
      current.revenue += d.revenue ?? 0
      current.servicesDelivered += d.orders ?? 0
      map.set(label, current)
    }

    for (const d of dashboardData.trends.consultationRevenue) {
      const label = d.date.length >= 10 ? d.date.slice(5) : d.date
      const current = map.get(label) || {
        month: label,
        consultationsCompleted: 0,
        servicesDelivered: 0,
        revenue: 0,
      }
      current.revenue += d.revenue ?? 0
      current.consultationsCompleted += d.bookings ?? 0
      map.set(label, current)
    }

    return Array.from(map.values()).sort((a, b) => a.month.localeCompare(b.month))
  }, [dashboardData])

  const visibleServiceMetrics = useMemo(
    () => orderByActiveMetricIds(liveServiceMetrics, activeMetricIds),
    [liveServiceMetrics, activeMetricIds],
  )
  const visibleConsultationMetrics = liveConsultationMetrics

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
            <BarChart3 className="size-4" />
            Manage Metrics
          </Button>

          <Button
            className="ui-export-data h-9"
            onClick={() => toast.message('Export coming soon')}
          >
            <Download className="size-4" />
            Export Data
          </Button>
        </div>
      </div>

      {visibleServiceMetrics.length > 0 && (
        <MetricsSection title="Service Metrics" metrics={visibleServiceMetrics} />
      )}

      {visibleConsultationMetrics.length > 0 && (
        <MetricsSection title="Consultation Metrics" metrics={visibleConsultationMetrics} />
      )}

      <DashboardCard
        className="p-0"
        title="Service & Consultation Trends"
        rightSlot={
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={selectedRange}
                onChange={(e) => setSelectedRange(e.target.value)}
                className="appearance-none rounded-lg border border-white/10 bg-white/5 py-1.5 pr-8 pl-3 text-xs font-medium text-slate-200 outline-none focus:border-white/20"
              >
                <option value="last-3-months">Last 3 Months</option>
                <option value="last-6-months">Last 6 Months</option>
                <option value="last-12-months">Last 12 Months</option>
              </select>
            </div>
            <button
              type="button"
              className="grid size-8 place-items-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition-colors hover:border-white/15 hover:bg-white/10"
              onClick={() => {
                dashboardQuery.refetch()
                toast.message('Refreshing trends...')
              }}
            >
              <RefreshCw className={`size-4 ${dashboardQuery.isFetching ? 'animate-spin' : ''}`} />
            </button>
          </div>
        }
      >
        <div className="px-4 pb-5 sm:px-5 sm:pb-6">
          <div className="h-[280px] sm:h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={trendPoints}
                margin={{ left: 4, right: 8, top: 8, bottom: 8 }}
                barGap={4}
                barCategoryGap="18%"
              >
                <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis
                  dataKey="month"
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
                  tickFormatter={(v: number) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                />
                <Tooltip content={<TrendsTooltip />} />
                <Legend
                  wrapperStyle={{ color: 'rgba(148,163,184,0.85)', paddingTop: 12 }}
                  formatter={(value) => <span className="text-xs text-slate-400">{value}</span>}
                />
                <Bar
                  yAxisId="left"
                  dataKey="consultationsCompleted"
                  name="Consultations Completed"
                  fill="#4CAF50"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={28}
                />
                <Bar
                  yAxisId="left"
                  dataKey="servicesDelivered"
                  name="Services Delivered"
                  fill="#2196F3"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={28}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue (₹)"
                  stroke="#FF9800"
                  strokeWidth={2}
                  dot={{ fill: '#FF9800', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </DashboardCard>
    </div>
  )
}
