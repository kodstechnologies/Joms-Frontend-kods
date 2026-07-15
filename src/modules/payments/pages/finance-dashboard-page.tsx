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
import { toast } from 'sonner'

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

const tooltipStyle = {
  background: 'rgba(15,15,15,0.95)',
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
    <div className={cn('rounded-xl border border-white/[0.06] bg-[#1A1A1A] p-5', className)}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-[14px] font-bold text-white">{title}</h2>
        <button
          type="button"
          aria-label="Refresh"
          className="grid size-8 place-items-center rounded-lg border border-white/10 bg-black/40 text-[#888888] transition-colors hover:bg-white/5 hover:text-white"
        >
          <RefreshCw className="size-3.5" />
        </button>
      </div>
      {children}
    </div>
  )
}

function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 className="mb-3 text-[14px] font-bold text-white">{children}</h2>
}

function TrendBadge({ change, changeNote }: Pick<TrendMetric, 'change' | 'changeNote'>) {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
        <TrendingUp className="size-3" />
        {change}
      </span>
      {changeNote ? <span className="text-[10px] text-[#666666]">{changeNote}</span> : null}
    </div>
  )
}

function SummaryCard({ metric }: { metric: TrendMetric }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#1A1A1A] p-5">
      <p className="text-[11px] font-medium text-[#888888]">{metric.label}</p>
      <p className="mt-2 text-[26px] font-bold tracking-tight text-white">{metric.value}</p>
      <TrendBadge change={metric.change} changeNote={metric.changeNote} />
    </div>
  )
}

function MetricCard({ metric }: { metric: TrendMetric }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#1A1A1A] p-4">
      <p className="text-[11px] font-medium text-[#888888]">{metric.label}</p>
      <p className="mt-2 text-[20px] font-bold tracking-tight text-white">{metric.value}</p>
      <TrendBadge change={metric.change} changeNote={metric.changeNote} />
    </div>
  )
}

function KeyMetricCard({ metric }: { metric: KeyMetric }) {
  const Icon = metric.icon

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-[#1A1A1A] p-4">
      <div className="min-w-0">
        <p className="text-[11px] font-medium text-[#888888]">{metric.label}</p>
        <p className="mt-1.5 text-[18px] font-bold tracking-tight text-white">{metric.value}</p>
        {metric.subtext ? (
          <p className="mt-1.5 text-[11px] font-medium text-[#888888]">{metric.subtext}</p>
        ) : (
          <div className="mt-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
              <TrendingUp className="size-3" />
              {metric.change}
            </span>
          </div>
        )}
      </div>
      <div className="grid size-10 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/5 text-[#888888]">
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
      <p className="mb-2 text-xs font-semibold text-white">{label}</p>
      <p className="text-[11px] text-blue-300">
        Platform fee:{' '}
        <span className="font-semibold text-white">₹{platformFee?.toLocaleString('en-IN')}</span>
      </p>
      <p className="text-[11px] text-emerald-300">
        Revenue:{' '}
        <span className="font-semibold text-white">₹{revenue?.toLocaleString('en-IN')}</span>
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
      <p className="mb-2 text-xs font-semibold text-white">{label}</p>
      <p className="text-[11px] text-blue-300">
        MRR: <span className="font-semibold text-white">₹{mrr?.toLocaleString('en-IN')}</span>
      </p>
      <p className="text-[11px] text-orange-300">
        Net Profit:{' '}
        <span className="font-semibold text-white">₹{netProfit?.toLocaleString('en-IN')}</span>
      </p>
      <p className="text-[11px] text-emerald-300">
        Total Revenue:{' '}
        <span className="font-semibold text-white">₹{totalRevenue?.toLocaleString('en-IN')}</span>
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
      <p className="mb-1 text-xs font-semibold text-white">{label}</p>
      <p className="text-[11px] text-slate-300">
        Amount:{' '}
        <span className="font-semibold text-white">
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
        <div key={item.name} className="flex items-center gap-3 text-[12px]">
          <span className="size-3 shrink-0 rounded-sm" style={{ backgroundColor: item.color }} />
          <span className="min-w-[90px] text-[#999999]">{item.name}</span>
          <span className="w-10 font-medium text-white">
            {item.percent.toString().padStart(2, '0')}%
          </span>
          <span className="ml-auto font-semibold text-white">
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
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-white">Finance Dashboard</h1>
          <p className="mt-1 text-[13px] text-[#888888]">
            Track revenue, payouts, and financial performance
          </p>
        </div>
        <Button onClick={() => toast.message('Metrics configuration coming soon')}>
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
                    <stop offset="0%" stopColor="#22C55E" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#22C55E" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="platformFeeAreaFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#666666', fontSize: 11 }}
                />
                <YAxis
                  domain={[0, 60000]}
                  ticks={[0, 20000, 40000, 60000]}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#666666', fontSize: 11 }}
                  tickFormatter={(v) => v.toLocaleString('en-IN')}
                />
                <Tooltip content={<RevenueFeeTooltip />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#22C55E"
                  strokeWidth={2}
                  fill="url(#revenueAreaFill)"
                />
                <Area
                  type="monotone"
                  dataKey="platformFee"
                  stroke="#3B82F6"
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
                tick={{ fill: '#666666', fontSize: 11 }}
              />
              <YAxis
                domain={[0, 100000]}
                ticks={[0, 20000, 40000, 60000, 80000, 100000]}
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#666666', fontSize: 11 }}
                tickFormatter={(v) => v.toLocaleString('en-IN')}
              />
              <Tooltip content={<MonthlyComparisonTooltip />} />
              <Legend
                wrapperStyle={{ color: '#888888', fontSize: 12, paddingTop: 12 }}
                formatter={(value) => <span className="text-[11px] text-[#888888]">{value}</span>}
              />
              <Bar dataKey="mrr" name="MRR" fill="#3B82F6" radius={[3, 3, 0, 0]} maxBarSize={18} />
              <Bar
                dataKey="netProfit"
                name="Net Profit"
                fill="#F97316"
                radius={[3, 3, 0, 0]}
                maxBarSize={18}
              />
              <Bar
                dataKey="totalRevenue"
                name="Total Revenue"
                fill="#22C55E"
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
                  <div className="flex items-center justify-between gap-3 text-[12px]">
                    <span className="text-[#999999]">{item.label}</span>
                    <span className="font-semibold text-white">{formatInr(item.value)}</span>
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
              <span className="text-[13px] font-semibold text-white">Total in Escrow</span>
              <span className="text-[14px] font-bold text-white">
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
                  tick={{ fill: '#666666', fontSize: 11 }}
                />
                <YAxis
                  domain={[0, 100000]}
                  ticks={[0, 20000, 40000, 60000, 80000, 100000]}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#666666', fontSize: 11 }}
                  tickFormatter={(v) => v.toLocaleString('en-IN')}
                />
                <Tooltip content={<WeeklyPayoutTooltip />} />
                <Bar
                  dataKey="amount"
                  name="Amount"
                  fill="#F0C27B"
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
