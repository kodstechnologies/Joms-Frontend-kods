import type { PropsWithChildren, ReactNode } from 'react'
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
import { RefreshCw, SlidersHorizontal, TrendingUp } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import {
  escrowStatusMock,
  keyFinancialMetricsMock,
  monthlyComparisonMock,
  payoutsCashFlowCardsMock,
  revenueByCategoryMock,
  revenueFeeTrendsMock,
  revenueProfitCardsMock,
  topSummaryCardsMock,
  totalEscrowAmount,
  weeklyPayoutScheduleMock,
  type KeyMetric,
  type RevenueCategoryPoint,
  type TrendMetric,
} from '@/modules/payments/mock/finance-dashboard.mock'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'

const BRAND_POSITIVE = '#00a63e'
const BRAND_ACCENT = '#f6cb86'
const BRAND_ACTION = '#155dfc'
const BRAND_MUTED = 'rgba(255,255,255,0.5)'

const tooltipStyle = {
  background: 'rgba(5,5,5,0.95)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 10,
  padding: '10px 12px',
  color: 'rgba(226,232,240,0.95)',
  boxShadow: '0 16px 40px rgba(0,0,0,0.45)',
}

function ChartCard({
  title,
  children,
  className,
}: PropsWithChildren<{ title: string; className?: string }>) {
  return (
    <div className={cn('radius-lg bg-brand-surface border border-white/[0.06] p-5', className)}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-body-md-semibold text-brand-text">{title}</h2>
        <button
          type="button"
          aria-label="Refresh"
          className="text-muted hover:text-brand-text grid size-8 place-items-center rounded-lg border border-white/10 bg-black/40 transition-colors hover:bg-white/5"
        >
          <RefreshCw className="size-3.5" />
        </button>
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
    <div className="radius-lg bg-brand-surface border border-white/[0.06] p-5">
      <p className="text-body-sm-medium text-muted">{metric.label}</p>
      <p className="text-h2 text-brand-text mt-2 tracking-tight">{metric.value}</p>
      <TrendBadge change={metric.change} changeNote={metric.changeNote} />
    </div>
  )
}

function MetricCard({ metric }: { metric: TrendMetric }) {
  return (
    <div className="radius-lg bg-brand-surface border border-white/[0.06] p-4">
      <p className="text-body-sm-medium text-muted">{metric.label}</p>
      <p className="text-h3 text-brand-text mt-2 tracking-tight">{metric.value}</p>
      <TrendBadge change={metric.change} changeNote={metric.changeNote} />
    </div>
  )
}

function KeyMetricCard({ metric }: { metric: KeyMetric }) {
  const Icon = metric.icon

  return (
    <div className="radius-lg bg-brand-surface flex items-center justify-between gap-3 border border-white/[0.06] p-4">
      <div className="min-w-0">
        <p className="text-body-sm-medium text-muted">{metric.label}</p>
        <p className="text-h4 text-brand-text mt-1.5 tracking-tight">{metric.value}</p>
        {metric.subtext ? (
          <p className="text-body-sm-medium text-muted mt-1.5">{metric.subtext}</p>
        ) : (
          <div className="mt-2">
            <span className="text-body-sm-semibold text-brand-positive inline-flex items-center gap-1">
              <TrendingUp className="size-3" />
              {metric.change}
            </span>
          </div>
        )}
      </div>
      <div className="text-muted grid size-10 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/5">
        <Icon className="size-4" />
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
      <p className="text-body-sm-semibold text-brand-text mb-2">{label}</p>
      <p className="text-body-sm text-brand-action">
        Platform fee:{' '}
        <span className="text-brand-text font-semibold">
          ₹{platformFee?.toLocaleString('en-IN')}
        </span>
      </p>
      <p className="text-body-sm text-brand-progress">
        Revenue:{' '}
        <span className="text-brand-text font-semibold">₹{revenue?.toLocaleString('en-IN')}</span>
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
      <p className="text-body-sm-semibold text-brand-text mb-2">{label}</p>
      <p className="text-body-sm text-brand-action">
        MRR: <span className="text-brand-text font-semibold">₹{mrr?.toLocaleString('en-IN')}</span>
      </p>
      <p className="text-body-sm text-brand-accent">
        Net Profit:{' '}
        <span className="text-brand-text font-semibold">₹{netProfit?.toLocaleString('en-IN')}</span>
      </p>
      <p className="text-body-sm text-brand-progress">
        Total Revenue:{' '}
        <span className="text-brand-text font-semibold">
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
      <p className="text-body-sm-semibold text-brand-text mb-1">{label}</p>
      <p className="text-body-sm text-muted">
        Amount:{' '}
        <span className="text-brand-text font-semibold">
          ₹{payload[0]?.value?.toLocaleString('en-IN')}
        </span>
      </p>
    </div>
  )
}

function CategoryLegend({ items }: { items: RevenueCategoryPoint[] }) {
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.name} className="text-body-sm flex items-center gap-3">
          <span className="size-3 shrink-0 rounded-sm" style={{ backgroundColor: item.color }} />
          <span className="text-muted min-w-[90px]">{item.name}</span>
          <span className="text-brand-text w-10 font-medium">
            {item.percent.toString().padStart(2, '0')}%
          </span>
          <span className="text-brand-text ml-auto font-semibold">
            ₹{item.amount.toLocaleString('en-IN')}
          </span>
        </div>
      ))}
    </div>
  )
}

function formatInr(value: number) {
  return `₹${value.toLocaleString('en-IN')}`
}

export function FinanceDashboardPage() {
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-h1 text-brand-text tracking-tight">Finance Dashboard</h1>
          <p className="text-body-md text-muted mt-1">
            Track revenue, payouts, and financial performance
          </p>
        </div>
        <Button
          className="ui-manage-metrics"
          onClick={() => navigate('/metrics/finance-dashboard')}
        >
          <SlidersHorizontal className="size-4" />
          Manage Metrics
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {topSummaryCardsMock.map((metric) => (
          <SummaryCard key={metric.label} metric={metric} />
        ))}
      </div>

      <div>
        <SectionTitle>Revenue &amp; Profit</SectionTitle>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {revenueProfitCardsMock.map((metric) => (
            <MetricCard key={metric.label} metric={metric} />
          ))}
        </div>
      </div>

      <div>
        <SectionTitle>Payouts &amp; Cash Flow</SectionTitle>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {payoutsCashFlowCardsMock.map((metric) => (
            <MetricCard key={metric.label} metric={metric} />
          ))}
        </div>
      </div>

      <div>
        <SectionTitle>Key Financial Metrics</SectionTitle>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {keyFinancialMetricsMock.map((metric) => (
            <KeyMetricCard key={metric.label} metric={metric} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ChartCard title="Revenue & Fee Trends">
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={revenueFeeTrendsMock}
                margin={{ left: 0, right: 8, top: 8, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="revenueAreaFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={BRAND_POSITIVE} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={BRAND_POSITIVE} stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="platformFeeAreaFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={BRAND_ACTION} stopOpacity={0.45} />
                    <stop offset="100%" stopColor={BRAND_ACTION} stopOpacity={0.02} />
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
                  stroke={BRAND_POSITIVE}
                  strokeWidth={2}
                  fill="url(#revenueAreaFill)"
                />
                <Area
                  type="monotone"
                  dataKey="platformFee"
                  stroke={BRAND_ACTION}
                  strokeWidth={2}
                  fill="url(#platformFeeAreaFill)"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Revenue by category">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
            <div className="h-[220px] w-full sm:w-[48%]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={revenueByCategoryMock}
                    dataKey="amount"
                    nameKey="name"
                    innerRadius={58}
                    outerRadius={92}
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
            <div className="w-full sm:w-[52%]">
              <CategoryLegend items={revenueByCategoryMock} />
            </div>
          </div>
        </ChartCard>
      </div>

      <ChartCard title="Monthly Comparison">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={monthlyComparisonMock}
              margin={{ left: 0, right: 8, top: 8, bottom: 0 }}
              barGap={2}
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
              <Tooltip content={<MonthlyComparisonTooltip />} />
              <Legend
                wrapperStyle={{ color: BRAND_MUTED, fontSize: 12, paddingTop: 12 }}
                formatter={(value) => <span className="text-body-sm text-muted">{value}</span>}
              />
              <Bar
                dataKey="mrr"
                name="MRR"
                fill={BRAND_ACTION}
                radius={[3, 3, 0, 0]}
                maxBarSize={18}
              />
              <Bar
                dataKey="netProfit"
                name="Net Profit"
                fill={BRAND_ACCENT}
                radius={[3, 3, 0, 0]}
                maxBarSize={18}
              />
              <Bar
                dataKey="totalRevenue"
                name="Total Revenue"
                fill={BRAND_POSITIVE}
                radius={[3, 3, 0, 0]}
                maxBarSize={18}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ChartCard title="Escrow Status Breakdown">
          <div className="space-y-5">
            {escrowStatusMock.map((item) => {
              const widthPercent = Math.round((item.value / totalEscrowAmount) * 100)

              return (
                <div key={item.label} className="space-y-2">
                  <div className="text-body-sm flex items-center justify-between gap-3">
                    <span className="text-muted">{item.label}</span>
                    <span className="text-brand-text font-semibold">{formatInr(item.value)}</span>
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
              <span className="text-body-md-semibold text-brand-text">Total in Escrow</span>
              <span className="text-body-md-semibold text-brand-text">
                {formatInr(totalEscrowAmount)}
              </span>
            </div>
          </div>
        </ChartCard>

        <ChartCard title="Weekly Payout Schedule">
          <div className="h-[260px] w-full">
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
                <Tooltip content={<WeeklyPayoutTooltip />} />
                <Bar
                  dataKey="amount"
                  name="Amount"
                  fill={BRAND_ACCENT}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>
    </div>
  )
}
