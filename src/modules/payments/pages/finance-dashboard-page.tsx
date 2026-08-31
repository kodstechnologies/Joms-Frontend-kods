import { useMemo } from 'react'
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
import { RotateCcw, TrendingUp } from 'lucide-react'
import { ManageMetricsIcon } from '@/shared/components/icons/action-button-icons'
import { useNavigate } from 'react-router-dom'
import type { ComponentType, PropsWithChildren, ReactNode } from 'react'

import {
  escrowStatusMock,
  monthlyComparisonMock,
  revenueByCategoryMock,
  revenueFeeTrendsMock,
  weeklyPayoutScheduleMock,
  type RevenueCategoryPoint,
  type TrendMetric,
} from '@/modules/payments/mock/finance-dashboard.mock'
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
import { buildFinanceDashboardMetricCards } from '@/modules/payments/utils/finance-dashboard-metrics'
import {
  orderByActiveMetricIds,
  useActiveMetricIds,
} from '@/modules/expert/hooks/use-active-metric-ids'
import { sortIdsByCatalogOrder } from '@/shared/lib/dedupe-ids'
import { Button } from '@/shared/components/ui/button'
import { StatCardSkeleton, ChartSkeleton } from '@/shared/components/ui/skeleton'
import { cn } from '@/shared/lib/cn'

const BRAND_GREEN = 'var(--brand-green)'
const BRAND_ORANGE = 'var(--brand-orange)'
const BRAND_BLUE = 'var(--brand-blue)'
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

function TrendBadge({ change, changeNote }: Pick<TrendMetric, 'change' | 'changeNote'>) {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <span className="text-body-sm-semibold bg-brand-positive/15 text-brand-positive inline-flex items-center gap-1 rounded-md px-2 py-0.5">
        <TrendingUp className="size-3" />
        {change}
      </span>
      {changeNote ? <span className="text-body-sm text-muted">{changeNote}</span> : null}
    </div>
  )
}

function SummaryCard({ metric }: { metric: TrendMetric }) {
  return (
    <div className="radius-lg bg-brand-surface flex h-[130px] flex-col justify-center border border-white/[0.06] p-5">
      <p className="text-body-sm-medium text-muted">{metric.label}</p>
      <p className="text-h2 text-brand-text mt-2 tracking-tight">{metric.value}</p>
      <TrendBadge change={metric.change} changeNote={metric.changeNote} />
    </div>
  )
}

function MetricCard({ metric }: { metric: TrendMetric }) {
  return (
    <div className="radius-lg bg-brand-surface flex h-[130px] flex-col justify-center border border-white/[0.06] p-4">
      <p className="text-body-sm-medium text-muted">{metric.label}</p>
      <p className="text-h3 text-brand-text mt-2 tracking-tight">{metric.value}</p>
      <TrendBadge change={metric.change} changeNote={metric.changeNote} />
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
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#00D062]">
            <span>↑</span>
            <span>{metric.change}</span>
          </span>
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

  const platformFee = payload.find((p) => p.dataKey === 'platformFee')?.value
  const revenue = payload.find((p) => p.dataKey === 'revenue')?.value

  return (
    <div style={tooltipStyle}>
      <p className="text-body-sm-semibold text-brand-text-dark mb-2">{label}</p>
      <p className="text-body-sm" style={{ color: BRAND_BLUE }}>
        Platform fee:{' '}
        <span className="text-brand-text-dark font-semibold">
          ₹{platformFee?.toLocaleString('en-IN')}
        </span>
      </p>
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

  const mrr = payload.find((p) => p.name === 'MRR')?.value
  const netProfit = payload.find((p) => p.name === 'Net Profit')?.value
  const totalRevenue = payload.find((p) => p.name === 'Total Revenue')?.value

  return (
    <div style={tooltipStyle}>
      <p className="text-body-sm-semibold text-brand-text-dark mb-2">{label}</p>
      <p className="text-body-sm" style={{ color: BRAND_BLUE }}>
        MRR:{' '}
        <span className="text-brand-text-dark font-semibold">₹{mrr?.toLocaleString('en-IN')}</span>
      </p>
      <p className="text-body-sm" style={{ color: BRAND_ORANGE }}>
        Net Profit:{' '}
        <span className="text-brand-text-dark font-semibold">
          ₹{netProfit?.toLocaleString('en-IN')}
        </span>
      </p>
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

function formatCurrency(value: number) {
  return `₹${value.toLocaleString('en-IN')}`
}

export function FinanceDashboardPage() {
  const navigate = useNavigate()
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

  const keyFinancialMetrics = useMemo(
    () => [
      {
        label: 'GMV',
        value: summary?.gmv ? formatInr(summary.gmv) : '₹10,00,000',
        change: '18.4%',
        changeType: 'up' as const,
        icon: RupeeGlyphIcon,
      },
      {
        label: 'Platform Revenue',
        value: summary?.totalPlatformRevenue
          ? formatInr(summary.totalPlatformRevenue)
          : '₹1,16,986',
        change: '22.3%',
        changeType: 'up' as const,
        icon: RevenueChartIcon,
      },
      {
        label: 'In Escrow',
        value: summary?.totalInEscrow ? formatInr(summary.totalInEscrow) : '₹8,43,290',
        subtext: `${summary?.activeEscrows ?? 12} Holds`,
        icon: EscrowLockIcon,
      },
      {
        label: 'Pending Payouts',
        value: summary?.pendingPayouts ? formatInr(summary.pendingPayouts) : '₹2,14,500',
        subtext: `${summary?.pendingPayoutCount ?? 5} Pending`,
        icon: null,
      },
    ],
    [summary],
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-h1 text-brand-text tracking-tight">Finance Dashboard</h1>
          <p className="text-body-md text-muted mt-1">
            Track revenue, payouts, and financial performance
          </p>
        </div>
        <div>
          <Button
            className="ui-manage-metrics"
            onClick={() => navigate('/metrics/finance-dashboard')}
          >
            <ManageMetricsIcon className="size-4 shrink-0" />
            Manage Metrics
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
              title="Revenue & Fee Trends"
              className="h-[382px]"
              onRefresh={refetch}
              isRefreshing={isRefetching}
            >
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={revenueFeeTrendsMock}
                    margin={{ left: 0, right: 8, top: 8, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="revenueAreaFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={BRAND_GREEN} stopOpacity={0.35} />
                        <stop offset="100%" stopColor={BRAND_GREEN} stopOpacity={0.02} />
                      </linearGradient>
                      <linearGradient id="platformFeeAreaFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={BRAND_BLUE} stopOpacity={0.45} />
                        <stop offset="100%" stopColor={BRAND_BLUE} stopOpacity={0.02} />
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
                      domain={[0, 60000]}
                      ticks={[0, 20000, 40000, 60000]}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: BRAND_MUTED, fontSize: 11 }}
                      tickFormatter={(v) => v.toLocaleString('en-IN')}
                    />
                    <Tooltip content={<RevenueFeeTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke={BRAND_GREEN}
                      strokeWidth={2}
                      fill="url(#revenueAreaFill)"
                    />
                    <Area
                      type="monotone"
                      dataKey="platformFee"
                      stroke={BRAND_BLUE}
                      strokeWidth={2}
                      fill="url(#platformFeeAreaFill)"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            <ChartCard
              title="Revenue by category"
              className="xl:col-span-1"
              onRefresh={refetch}
              isRefreshing={isRefetching}
            >
              <div className="flex h-full min-h-[300px] flex-col items-center justify-center gap-6 xl:flex-row">
                <div className="h-[220px] w-[220px] shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={revenueByCategoryMock}
                        dataKey="amount"
                        nameKey="name"
                        innerRadius={60}
                        outerRadius={95}
                        stroke="rgba(255,255,255,0.06)"
                        strokeWidth={2}
                      >
                        {revenueByCategoryMock.map((item) => (
                          <Cell key={item.name} fill={item.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full flex-1">
                  <CategoryLegend items={revenueByCategoryMock} />
                </div>
              </div>
            </ChartCard>
          </div>

          <ChartCard title="Monthly Comparison" onRefresh={refetch} isRefreshing={isRefetching}>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyComparisonMock}
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
                    domain={[0, 100000]}
                    ticks={[0, 20000, 40000, 60000, 80000, 100000]}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: BRAND_MUTED, fontSize: 11 }}
                    tickFormatter={(v) => v.toLocaleString('en-IN')}
                  />
                  <Tooltip
                    content={<MonthlyComparisonTooltip />}
                    cursor={{ fill: 'transparent' }}
                  />
                  <Legend
                    wrapperStyle={{ color: BRAND_MUTED, fontSize: 12, paddingTop: 12 }}
                    formatter={(value) => <span className="text-body-sm text-muted">{value}</span>}
                  />
                  <Bar
                    dataKey="totalRevenue"
                    name="Total Revenue"
                    fill={BRAND_GREEN}
                    radius={[3, 3, 0, 0]}
                    maxBarSize={32}
                  />
                  <Bar
                    dataKey="mrr"
                    name="MRR"
                    fill={BRAND_BLUE}
                    radius={[3, 3, 0, 0]}
                    maxBarSize={32}
                  />
                  <Bar
                    dataKey="netProfit"
                    name="Net Profit"
                    fill={BRAND_ORANGE}
                    radius={[3, 3, 0, 0]}
                    maxBarSize={32}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <ChartCard
              title="Escrow Status Breakdown"
              onRefresh={refetch}
              isRefreshing={isRefetching}
            >
              <div className="space-y-5">
                {escrowStatusMock.map((item) => {
                  const widthPercent = Math.round((item.value / totalEscrowAmount) * 100)

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
              title="Weekly Payout Schedule"
              onRefresh={refetch}
              isRefreshing={isRefetching}
            >
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={weeklyPayoutScheduleMock}
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
                      domain={[0, 100000]}
                      ticks={[0, 20000, 40000, 60000, 80000, 100000]}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: BRAND_MUTED, fontSize: 11 }}
                      tickFormatter={(v) => v.toLocaleString('en-IN')}
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
            </ChartCard>
          </div>
        </>
      )}
    </div>
  )
}
