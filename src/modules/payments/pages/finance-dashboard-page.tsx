import { useCallback, useMemo } from 'react'
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { RotateCcw } from 'lucide-react'
import { toast } from 'sonner'
import { ExportDataIcon, ManageMetricsIcon } from '@/shared/components/icons/action-button-icons'
import { getApiErrorMessage } from '@/shared/lib/api-error'
import {
  ensureTrendChangeSign,
  TrendBadge as MetricTrendBadge,
} from '@/shared/components/dashboard/trend-badge'
import { useNavigate } from 'react-router-dom'
import type { ComponentType, PropsWithChildren, ReactNode } from 'react'

import {
  FINANCE_CATEGORY_COLORS,
  FINANCE_MODULE_LABELS,
  type EscrowStatusItem,
  type MonthlyRevenuePoint,
  type RevenueCategoryPoint,
  type RevenueTrendPoint,
  type TrendMetric,
  type WeeklyPayoutPoint,
} from '@/modules/payments/config/finance-dashboard.config'
import type { FinanceDashboardCharts } from '@/modules/payments/types/finance-api'
import {
  DEFAULT_FINANCE_DASHBOARD_METRIC_IDS,
  FINANCE_DASHBOARD_LEGACY_METRIC_ID_MAP,
  FINANCE_DASHBOARD_METRIC_IDS,
  FINANCE_DASHBOARD_METRIC_ID_SET,
  FINANCE_DASHBOARD_MODULE_KEY,
  FINANCE_DASHBOARD_SECTIONS,
} from '@/modules/payments/config/finance-dashboard-metrics.config'
import { useFinanceDashboard } from '@/modules/payments/hooks/use-finance'
import { formatInr } from '@/modules/payments/utils/finance-mappers'
import {
  buildFinanceDashboardMetricCards,
  NO_DATA_VALUE,
} from '@/modules/payments/utils/finance-dashboard-metrics'
import {
  orderByActiveMetricIds,
  useActiveMetricIds,
} from '@/modules/expert/hooks/use-active-metric-ids'
import { sortIdsByCatalogOrder } from '@/shared/lib/dedupe-ids'
import { Button } from '@/shared/components/ui/button'
import { useDefaultExportFormat } from '@/modules/settings/hooks/use-default-export-format'
import { exportFinanceDashboardToFile } from '@/modules/payments/utils/export-finance-dashboard'
import { StatCardSkeleton, ChartSkeleton } from '@/shared/components/ui/skeleton'
import { cn } from '@/shared/lib/cn'

const BRAND_GREEN = 'var(--brand-green)'
const BRAND_MUTED = 'var(--brand-muted)'

const tooltipStyle = {
  background: 'var(--brand-card)',
  border: 'none',
  borderRadius: 'var(--brand-radius-lg, 10px)',
  padding: '10px 12px',
  color: 'var(--brand-text-dark)',
  boxShadow: '0 16px 40px rgba(0,0,0,0.1)',
}

function ChartCard({
  title,
  children,
  className,
  onRefresh,
  isRefreshing,
}: PropsWithChildren<{
  title: string
  className?: string
  onRefresh?: () => void
  isRefreshing?: boolean
}>) {
  return (
    <div className={cn('radius-lg bg-brand-surface border border-white/[0.06] p-5', className)}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-body-md-semibold text-brand-text">{title}</h2>
        {onRefresh ? (
          <button
            type="button"
            aria-label={`Refresh ${title}`}
            onClick={onRefresh}
            className="cursor-pointer rounded p-1 text-white/60 transition-colors hover:bg-white/5 hover:text-white active:scale-95"
          >
            <RotateCcw
              className={cn('size-4 transition-transform', isRefreshing && 'animate-spin')}
            />
          </button>
        ) : null}
      </div>
      {children}
    </div>
  )
}

function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 className="text-body-md-semibold text-brand-text mb-3">{children}</h2>
}

function TrendBadge({
  change,
  changeNote,
  changeType,
}: Pick<TrendMetric, 'change' | 'changeNote' | 'changeType'>) {
  if (!change) return null
  const isDown = changeType === 'down' || change.trim().startsWith('-')
  const direction = isDown ? 'down' : 'up'
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <MetricTrendBadge direction={direction}>
        {ensureTrendChangeSign(change, direction)}
      </MetricTrendBadge>
      {changeNote ? <span className="text-body-sm text-muted">{changeNote}</span> : null}
    </div>
  )
}

function SummaryCard({ metric }: { metric: TrendMetric }) {
  return (
    <div className="radius-lg bg-brand-surface flex h-[130px] flex-col justify-center border border-white/[0.06] p-5">
      <p className="text-body-sm-medium text-muted">{metric.label}</p>
      <p className="text-h2 text-brand-text mt-2 tracking-tight">{metric.value}</p>
      <TrendBadge
        change={metric.change}
        changeNote={metric.changeNote}
        changeType={metric.changeType}
      />
    </div>
  )
}

function MetricCard({ metric }: { metric: TrendMetric }) {
  return (
    <div className="radius-lg bg-brand-surface flex h-[130px] flex-col justify-center border border-white/[0.06] p-4">
      <p className="text-body-sm-medium text-muted">{metric.label}</p>
      <p className="text-h3 text-brand-text mt-2 tracking-tight">{metric.value}</p>
      <TrendBadge
        change={metric.change}
        changeNote={metric.changeNote}
        changeType={metric.changeType}
      />
    </div>
  )
}

type KeyMetric = {
  label: string
  value: string
  change?: string
  changeType?: 'up' | 'down'
  subtext?: string
  icon?: ComponentType<{ className?: string }> | null
}

function RupeeGlyphIcon({ className }: { className?: string }) {
  return (
    <span className={cn('text-sm leading-none font-semibold text-white/50', className)}>₹</span>
  )
}

function RevenueChartIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('size-4 shrink-0 text-white/40', className)}
    >
      <path d="m3 11 6-5 5 4 6-6" />
      <path d="M16 4h4v4" />
      <line x1="6" y1="20" x2="6" y2="14" />
      <line x1="12" y1="20" x2="12" y2="10" />
      <line x1="18" y1="20" x2="18" y2="6" />
    </svg>
  )
}

function EscrowLockIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('size-4 shrink-0 text-white/40', className)}
    >
      <rect x="4" y="11" width="16" height="10" rx="3" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  )
}

function KeyMetricCard({ metric }: { metric: KeyMetric }) {
  const Icon = metric.icon

  return (
    <div className="bg-brand-surface flex h-[116px] flex-col justify-between rounded-xl border border-white/[0.04] p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-neutral-400">{metric.label}</p>
        {Icon ? <Icon className="size-4 text-white/40" /> : null}
      </div>
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-xl font-bold tracking-tight text-white">{metric.value}</p>
        {metric.subtext ? (
          <p className="text-xs font-medium text-neutral-400">{metric.subtext}</p>
        ) : metric.change ? (
          <MetricTrendBadge
            direction={
              metric.changeType === 'down' || metric.change.trim().startsWith('-') ? 'down' : 'up'
            }
          >
            {ensureTrendChangeSign(
              metric.change,
              metric.changeType === 'down' || metric.change.trim().startsWith('-') ? 'down' : 'up',
            )}
          </MetricTrendBadge>
        ) : null}
      </div>
    </div>
  )
}

function RevenueFeeTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ value?: number; dataKey?: string }>
  label?: string
}) {
  if (!active || !payload?.length) return null

  const revenue = payload.find((p) => p.dataKey === 'revenue')?.value

  return (
    <div style={tooltipStyle}>
      <p className="text-body-sm-semibold text-brand-text-dark mb-2">{label}</p>
      <p className="text-body-sm" style={{ color: BRAND_GREEN }}>
        Revenue:{' '}
        <span className="text-brand-text-dark font-semibold">
          ₹{revenue?.toLocaleString('en-IN')}
        </span>
      </p>
    </div>
  )
}

function MonthlyComparisonTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ value?: number; name?: string }>
  label?: string
}) {
  if (!active || !payload?.length) return null

  const totalRevenue = payload.find((p) => p.name === 'Total Revenue')?.value

  return (
    <div style={tooltipStyle}>
      <p className="text-body-sm-semibold text-brand-text-dark mb-2">{label}</p>
      <p className="text-body-sm" style={{ color: BRAND_GREEN }}>
        Total Revenue:{' '}
        <span className="text-brand-text-dark font-semibold">
          ₹{totalRevenue?.toLocaleString('en-IN')}
        </span>
      </p>
    </div>
  )
}

function WeeklyPayoutTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ value?: number }>
  label?: string
}) {
  if (!active || !payload?.length) return null

  return (
    <div style={tooltipStyle}>
      <p className="text-body-sm-semibold text-brand-text-dark mb-1">{label}</p>
      <p className="text-body-sm text-muted">
        Amount:{' '}
        <span className="text-brand-text-dark font-semibold">
          ₹{payload[0]?.value?.toLocaleString('en-IN')}
        </span>
      </p>
    </div>
  )
}

function CategoryLegend({ items }: { items: RevenueCategoryPoint[] }) {
  return (
    <div className="flex flex-col gap-5">
      {items.map((item) => (
        <div key={item.name} className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-2">
            <span
              className="mt-[3px] inline-block size-3 shrink-0 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <div>
              <p className="text-body-sm-medium text-brand-text">{item.name}</p>
              <p className="text-body-sm text-muted">₹{item.amount.toLocaleString('en-IN')}</p>
            </div>
          </div>
          <span className="text-body-sm-semibold shrink-0" style={{ color: item.color }}>
            {item.percent.toString().padStart(2, '0')}%
          </span>
        </div>
      ))}
    </div>
  )
}

function ChartEmptyState({ height }: { height: string }) {
  return (
    <div
      className="text-body-sm text-muted flex w-full items-center justify-center"
      style={{ height }}
    >
      No data recorded for this period yet.
    </div>
  )
}

const moduleLabel = (module: string) => FINANCE_MODULE_LABELS[module] ?? module

const shortDay = (isoDate: string) =>
  new Date(`${isoDate}T00:00:00Z`).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  })

type DashboardChartSeries = {
  revenueTrend: RevenueTrendPoint[]
  revenueByCategory: RevenueCategoryPoint[]
  monthlyRevenue: MonthlyRevenuePoint[]
  escrowBreakdown: EscrowStatusItem[]
  weeklyPayouts: WeeklyPayoutPoint[]
}

function buildChartSeries(charts?: FinanceDashboardCharts): DashboardChartSeries {
  const revenueTotal = (charts?.revenueByModule ?? []).reduce((sum, row) => sum + row.amount, 0)
  return {
    revenueTrend: (charts?.dailyRevenue ?? []).map((row) => ({
      date: shortDay(row.date),
      revenue: row.revenue,
    })),
    revenueByCategory: (charts?.revenueByModule ?? []).map((row, index) => ({
      name: moduleLabel(row.module),
      amount: row.amount,
      percent: revenueTotal > 0 ? Math.round((row.amount / revenueTotal) * 100) : 0,
      color: FINANCE_CATEGORY_COLORS[index % FINANCE_CATEGORY_COLORS.length],
    })),
    monthlyRevenue: (charts?.monthlyRevenue ?? []).map((row) => ({
      month: new Date(`${row.month}-01T00:00:00Z`).toLocaleDateString('en-IN', {
        month: 'short',
        timeZone: 'UTC',
      }),
      totalRevenue: row.revenue,
    })),
    escrowBreakdown: (charts?.escrowByModule ?? []).map((row, index) => ({
      label: moduleLabel(row.module),
      value: row.amount,
      color: FINANCE_CATEGORY_COLORS[index % FINANCE_CATEGORY_COLORS.length],
    })),
    weeklyPayouts: (charts?.upcomingPayouts ?? []).map((row) => ({
      day: new Date(`${row.date}T00:00:00Z`).toLocaleDateString('en-IN', {
        weekday: 'short',
        timeZone: 'UTC',
      }),
      amount: row.amount,
    })),
  }
}

const hasValues = (rows: Array<Record<string, unknown>>, key: string) =>
  rows.some((row) => Number(row[key]) > 0)

function formatCurrency(value: number) {
  return `₹${value.toLocaleString('en-IN')}`
}

export function FinanceDashboardPage() {
  const navigate = useNavigate()
  const { fileFormat, option: exportFormat } = useDefaultExportFormat()
  const { data, isLoading, isError, refetch, isRefetching } = useFinanceDashboard()
  const summary = data?.data
  const totalEscrowAmount = summary?.totalInEscrow ?? 0
  const activeMetricIds = useActiveMetricIds(FINANCE_DASHBOARD_MODULE_KEY, [
    ...DEFAULT_FINANCE_DASHBOARD_METRIC_IDS,
  ])

  const filteredActiveMetricIds = useMemo(() => {
    const normalized = [
      ...new Set(activeMetricIds.map((id) => FINANCE_DASHBOARD_LEGACY_METRIC_ID_MAP[id] ?? id)),
    ].filter((id) => FINANCE_DASHBOARD_METRIC_ID_SET.has(id))
    return sortIdsByCatalogOrder(normalized, FINANCE_DASHBOARD_METRIC_IDS)
  }, [activeMetricIds])

  const visibleMetricCards = useMemo(() => {
    const allCards = buildFinanceDashboardMetricCards(summary)
    return orderByActiveMetricIds(allCards, filteredActiveMetricIds)
  }, [filteredActiveMetricIds, summary])

  const visibleMetricIds = useMemo(
    () => new Set(visibleMetricCards.map((metric) => metric.id)),
    [visibleMetricCards],
  )

  const keyFinancialMetrics = useMemo<KeyMetric[]>(
    () => [
      {
        label: 'GMV',
        value: summary?.gmv != null ? formatInr(summary.gmv) : NO_DATA_VALUE,
        icon: RupeeGlyphIcon,
      },
      {
        label: 'Platform Revenue',
        value: summary ? formatInr(summary.totalPlatformRevenue) : NO_DATA_VALUE,
        icon: RevenueChartIcon,
      },
      {
        label: 'In Escrow',
        value: summary ? formatInr(summary.totalInEscrow) : NO_DATA_VALUE,
        subtext: summary ? `${summary.activeEscrows} Holds` : undefined,
        icon: EscrowLockIcon,
      },
      {
        label: 'Pending Payouts',
        value: summary ? formatInr(summary.pendingPayouts) : NO_DATA_VALUE,
        subtext: summary ? `${summary.pendingPayoutCount} Pending` : undefined,
        icon: null,
      },
    ],
    [summary],
  )

  const chartSeries = useMemo(() => buildChartSeries(summary?.charts), [summary])

  const handleExportData = useCallback(async () => {
    if (isLoading) {
      toast.message('Please wait for data to load')
      return
    }

    if (visibleMetricCards.length === 0 && keyFinancialMetrics.length === 0) {
      toast.error('No data available to export')
      return
    }

    try {
      await exportFinanceDashboardToFile(
        {
          metrics: visibleMetricCards,
          keyFinancialMetrics,
          revenueTrend: chartSeries.revenueTrend,
          revenueByCategory: chartSeries.revenueByCategory,
          monthlyRevenue: chartSeries.monthlyRevenue,
          escrowStatus: chartSeries.escrowBreakdown,
          weeklyPayouts: chartSeries.weeklyPayouts,
        },
        fileFormat,
      )
      toast.success(`Exported as ${exportFormat}`)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to export finance dashboard'))
    }
  }, [chartSeries, exportFormat, fileFormat, isLoading, keyFinancialMetrics, visibleMetricCards])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-h1 text-brand-text tracking-tight">Finance Dashboard</h1>
          <p className="ui-page-subtitle mt-1 text-[16px] leading-5 font-medium tracking-normal text-[#FFFFFF80]">
            Track revenue, payouts, and financial performance
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            className="ui-manage-metrics"
            onClick={() => navigate('/metrics/finance-dashboard')}
          >
            <ManageMetricsIcon />
            Manage Metrics
          </Button>
          <Button className="ui-export-data" onClick={() => void handleExportData()}>
            <ExportDataIcon className="size-5 shrink-0" />
            Export Data
          </Button>
        </div>
      </div>

      {isError ? (
        <p className="text-body-sm text-brand-danger">Failed to load finance dashboard summary.</p>
      ) : null}

      {FINANCE_DASHBOARD_SECTIONS.map((section) => {
        const sectionMetrics = section.metricIds
          .filter((id) => visibleMetricIds.has(id))
          .map((id) => visibleMetricCards.find((metric) => metric.id === id))
          .filter(Boolean) as typeof visibleMetricCards

        const activeCount = section.metricIds.filter((id) => visibleMetricIds.has(id)).length
        if (!activeCount && !sectionMetrics.length) return null

        const cards = sectionMetrics

        return (
          <div key={section.key}>
            {section.title ? <SectionTitle>{section.title}</SectionTitle> : null}
            <div className={section.gridClassName}>
              {isLoading
                ? Array.from({ length: activeCount || 3 }).map((_, idx) => (
                    <StatCardSkeleton key={`sec-skel-${section.key}-${idx}`} />
                  ))
                : cards.map((metric) =>
                    section.key === 'escrow' ? (
                      <SummaryCard key={metric.id ?? metric.label} metric={metric} />
                    ) : (
                      <MetricCard key={metric.id ?? metric.label} metric={metric} />
                    ),
                  )}
            </div>
          </div>
        )
      })}

      <div>
        <SectionTitle>Key Financial Metrics</SectionTitle>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading
            ? Array.from({ length: 4 }).map((_, idx) => (
                <StatCardSkeleton key={`key-metric-skel-${idx}`} />
              ))
            : keyFinancialMetrics.map((metric) => (
                <KeyMetricCard key={metric.label} metric={metric} />
              ))}
        </div>
      </div>

      {isLoading ? (
        <>
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[652fr_584fr]">
            <ChartSkeleton title="Revenue & Fee Trends" height="300px" />
            <ChartSkeleton title="Revenue by category" height="300px" />
          </div>
          <ChartSkeleton title="Monthly Comparison" height="300px" />
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <ChartSkeleton title="Escrow Status Breakdown" height="280px" />
            <ChartSkeleton title="Weekly Payout Schedule" height="280px" />
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[652fr_584fr]">
            <ChartCard
              title="Revenue Trend (last 14 days)"
              className="h-[382px]"
              onRefresh={refetch}
              isRefreshing={isRefetching}
            >
              {hasValues(chartSeries.revenueTrend, 'revenue') ? (
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                      data={chartSeries.revenueTrend}
                      margin={{ left: 0, right: 8, top: 8, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="revenueAreaFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={BRAND_GREEN} stopOpacity={0.35} />
                          <stop offset="100%" stopColor={BRAND_GREEN} stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                      <XAxis
                        dataKey="date"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: BRAND_MUTED, fontSize: 11 }}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: BRAND_MUTED, fontSize: 11 }}
                        tickFormatter={(v) => Number(v).toLocaleString('en-IN')}
                      />
                      <Tooltip content={<RevenueFeeTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke={BRAND_GREEN}
                        strokeWidth={2}
                        fill="url(#revenueAreaFill)"
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <ChartEmptyState height="300px" />
              )}
            </ChartCard>

            <ChartCard
              title="Revenue by category"
              className="xl:col-span-1"
              onRefresh={refetch}
              isRefreshing={isRefetching}
            >
              {chartSeries.revenueByCategory.length ? (
                <div className="flex h-full min-h-[300px] flex-col items-center justify-center gap-6 xl:flex-row">
                  <div className="h-[220px] w-[220px] shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartSeries.revenueByCategory}
                          dataKey="amount"
                          nameKey="name"
                          innerRadius={60}
                          outerRadius={95}
                          stroke="rgba(255,255,255,0.06)"
                          strokeWidth={2}
                        >
                          {chartSeries.revenueByCategory.map((item) => (
                            <Cell key={item.name} fill={item.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="w-full flex-1">
                    <CategoryLegend items={chartSeries.revenueByCategory} />
                  </div>
                </div>
              ) : (
                <ChartEmptyState height="300px" />
              )}
            </ChartCard>
          </div>

          <ChartCard title="Monthly Revenue" onRefresh={refetch} isRefreshing={isRefetching}>
            {hasValues(chartSeries.monthlyRevenue, 'totalRevenue') ? (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartSeries.monthlyRevenue}
                    margin={{ left: 0, right: 8, top: 8, bottom: 0 }}
                    barGap={6}
                  >
                    <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis
                      dataKey="month"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: BRAND_MUTED, fontSize: 11 }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: BRAND_MUTED, fontSize: 11 }}
                      tickFormatter={(v) => Number(v).toLocaleString('en-IN')}
                    />
                    <Tooltip
                      content={<MonthlyComparisonTooltip />}
                      cursor={{ fill: 'transparent' }}
                    />
                    <Legend
                      wrapperStyle={{ color: BRAND_MUTED, fontSize: 12, paddingTop: 12 }}
                      formatter={(value) => (
                        <span className="text-body-sm text-muted">{value}</span>
                      )}
                    />
                    <Bar
                      dataKey="totalRevenue"
                      name="Total Revenue"
                      fill={BRAND_GREEN}
                      radius={[3, 3, 0, 0]}
                      maxBarSize={32}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <ChartEmptyState height="300px" />
            )}
          </ChartCard>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <ChartCard
              title="Escrow Breakdown by Module"
              onRefresh={refetch}
              isRefreshing={isRefetching}
            >
              <div className="space-y-5">
                {chartSeries.escrowBreakdown.length ? null : (
                  <p className="text-body-sm text-muted">No funds are currently held in escrow.</p>
                )}
                {chartSeries.escrowBreakdown.map((item) => {
                  const widthPercent =
                    totalEscrowAmount > 0 ? Math.round((item.value / totalEscrowAmount) * 100) : 0

                  return (
                    <div key={item.label} className="space-y-2">
                      <div className="text-body-sm flex items-center justify-between gap-3">
                        <span className="text-muted">{item.label}</span>
                        <span className="text-brand-text font-semibold">
                          {formatCurrency(item.value)}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${widthPercent}%`, backgroundColor: item.color }}
                        />
                      </div>
                    </div>
                  )
                })}
                <div className="flex items-center justify-between border-t border-white/10 pt-4">
                  <span className="text-body-md-semibold text-brand-text">Total In Escrow</span>
                  <span className="text-body-md-semibold text-brand-text">
                    {formatInr(totalEscrowAmount)}
                  </span>
                </div>
              </div>
            </ChartCard>

            <ChartCard
              title="Payouts Due (next 7 days)"
              onRefresh={refetch}
              isRefreshing={isRefetching}
            >
              {hasValues(chartSeries.weeklyPayouts, 'amount') ? (
                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartSeries.weeklyPayouts}
                      margin={{ left: 0, right: 8, top: 8, bottom: 0 }}
                    >
                      <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                      <XAxis
                        dataKey="day"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: BRAND_MUTED, fontSize: 11 }}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: BRAND_MUTED, fontSize: 11 }}
                        tickFormatter={(v) => Number(v).toLocaleString('en-IN')}
                      />
                      <Tooltip content={<WeeklyPayoutTooltip />} cursor={{ fill: 'transparent' }} />
                      <Bar
                        dataKey="amount"
                        name="Amount"
                        fill="var(--brand-accent)"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={48}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <ChartEmptyState height="280px" />
              )}
            </ChartCard>
          </div>
        </>
      )}
    </div>
  )
}
