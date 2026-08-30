import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { BarChart3, RefreshCw, Star, TrendingDown, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'

import { fetchExpertDashboardAnalytics } from '../../api/expert-api'
import { EXPERT_DASHBOARD_MODULE_KEY } from '../../api/ui-preferences-api'
import { orderByActiveMetricIds, useActiveMetricIds } from '../../hooks/use-active-metric-ids'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'
import createIcon from '@/assets/JOMS_ICONS-2/icons8-create.svg'

type Metric = {
  id: string
  label: string
  value: string
  change?: string
  changeType?: 'up' | 'down'
  changeNote?: string
}

type ExpertsByCategory = { category: string; count: number }
type RevenueByCategory = { category: string; revenue: number; label?: string }
type RevenueGrowthPoint = { month: string; revenue: number }
type TopHost = {
  name: string
  category: string
  orders: number
  rating: number
  attendees: number
  revenue: string
}

const ZERO_METRICS: Metric[] = [
  { id: 'total-experts', label: 'Total Expert', value: '0' },
  { id: 'active-experts', label: 'Active Experts', value: '0' },
  { id: 'inactive-experts', label: 'Inactive Experts', value: '0' },
  { id: 'new-experts-mtd', label: 'New Expert (MTD)', value: '0' },
  { id: 'total-revenue', label: 'Total Revenue', value: '₹0' },
  { id: 'avg-listings', label: 'Avg. Listings/Expert', value: '0' },
  { id: 'avg-revenue', label: 'Avg. Revenue/Expert', value: '₹0' },
  { id: 'avg-ratings', label: 'Avg. Ratings/Expert', value: '0/5' },
  { id: 'avg-consultation', label: 'Avg. Consultation/Expert', value: '0' },
  { id: 'avg-response-time', label: 'Avg. Response Time/Expert', value: '0 mins' },
  { id: 'avg-client', label: 'Avg. Client/Expert', value: '0' },
  { id: 'category-coverage', label: 'Category coverage % expert', value: '0%' },
  { id: 'total-orders', label: 'Total Order Completed', value: '0' },
  { id: 'avg-cancellation', label: 'Avg Cancellation/Expert', value: '0' },
]

const DEFAULT_METRIC_IDS = ZERO_METRICS.map((metric) => metric.id)

const EMPTY_REV_BY_CATEGORY: RevenueByCategory[] = []
const EMPTY_REVENUE_GROWTH: RevenueGrowthPoint[] = []

const CHART_BLUE = 'var(--brand-action)'

const tooltipStyle = {
  background: '#ffffff',
  border: '1px solid rgba(0,0,0,0.08)',
  borderRadius: 8,
  padding: '8px 12px',
  color: '#111827',
  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
}

function MetricCard({ metric }: { metric: Metric }) {
  return (
    <div className="rounded-brand-lg bg-brand-surface flex min-h-[130px] flex-col border border-white/[0.06] p-4 transition-colors hover:border-white/10">
      <p className="text-body-sm text-muted font-medium">{metric.label}</p>
      <p className="text-h3 mt-2 font-bold tracking-tight text-white">{metric.value}</p>
      <div className="mt-auto flex items-center gap-2 pt-3">
        {metric.change ? (
          <>
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold',
                metric.changeType === 'down'
                  ? 'bg-brand-danger/10 text-brand-danger'
                  : 'bg-brand-positive/15 text-brand-positive',
              )}
            >
              {metric.changeType === 'down' ? (
                <TrendingDown className="size-3" />
              ) : (
                <TrendingUp className="size-3" />
              )}
              {metric.change}
            </span>
            {metric.changeNote && (
              <span className="text-muted text-[10px]">{metric.changeNote}</span>
            )}
          </>
        ) : null}
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
      <div className="mt-auto pt-6">
        <div className="h-5 w-32 animate-pulse rounded bg-white/5" />
      </div>
    </div>
  )
}

function ChartCardSkeleton({ title }: { title: string }) {
  return (
    <div className="rounded-brand-lg bg-brand-surface border border-white/[0.06] px-5 py-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-body-md font-bold text-white">{title}</h2>
      </div>
      <div className="h-[260px] w-full animate-pulse rounded-lg bg-white/5" />
    </div>
  )
}

function ChartCard({
  title,
  onRefresh,
  isLoading,
  children,
}: {
  title: string
  onRefresh?: () => void
  isLoading?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="rounded-brand-lg bg-brand-surface border border-white/[0.06] px-5 py-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-body-md font-bold text-white">{title}</h2>
        {onRefresh ? (
          <button
            type="button"
            aria-label={`Refresh ${title}`}
            onClick={onRefresh}
            disabled={isLoading}
            className="text-muted grid h-8 w-8 cursor-pointer place-items-center rounded-lg border border-white/10 bg-black transition-colors hover:bg-white/5 hover:text-white disabled:opacity-50"
          >
            <RefreshCw
              className={cn('size-3.5 transition-transform', isLoading && 'animate-spin')}
            />
          </button>
        ) : null}
      </div>
      {children}
    </div>
  )
}

function EmptyChartState({ message }: { message: string }) {
  return (
    <div className="text-muted flex h-[260px] items-center justify-center text-sm">{message}</div>
  )
}

function RevenueGrowthTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ value?: number }>
  label?: string
}) {
  if (!active || !payload?.length) return null

  const value = payload[0]?.value ?? 0

  return (
    <div style={tooltipStyle}>
      <p className="text-body-sm font-semibold text-slate-900">
        {label} - Revenue: ₹{value.toLocaleString('en-IN')}
      </p>
    </div>
  )
}

export const ExpertDashboardPage = () => {
  const navigate = useNavigate()
  const [growthRange, setGrowthRange] = useState('3')

  const {
    data: res,
    isLoading,
    refetch,
    isError,
  } = useQuery({
    queryKey: ['expert-dashboard-analytics'],
    queryFn: () => fetchExpertDashboardAnalytics(),
  })

  useEffect(() => {
    if (!isError) return
    toast.error('Unable to load expert dashboard analytics.')
  }, [isError])

  const d = res?.data
  const metricsList: Metric[] = d?.metrics?.length ? d.metrics : ZERO_METRICS
  const expertsCatData: ExpertsByCategory[] = Array.isArray(d?.expertsByCategory)
    ? d.expertsByCategory
    : []
  const revCatData: RevenueByCategory[] = Array.isArray(d?.revenueByCategory)
    ? d.revenueByCategory
    : EMPTY_REV_BY_CATEGORY
  const growthDataList: RevenueGrowthPoint[] = Array.isArray(d?.revenueGrowthOverTime)
    ? d.revenueGrowthOverTime
    : EMPTY_REVENUE_GROWTH
  const topHostsList: TopHost[] = Array.isArray(d?.topPerformingHosts) ? d.topPerformingHosts : []

  const loadDashboard = () => {
    void refetch()
  }

  const activeMetricIds = useActiveMetricIds(EXPERT_DASHBOARD_MODULE_KEY, DEFAULT_METRIC_IDS)
  const visibleMetrics = useMemo(
    () => orderByActiveMetricIds(metricsList, activeMetricIds),
    [metricsList, activeMetricIds],
  )
  const skeletonCount = activeMetricIds?.length || DEFAULT_METRIC_IDS.length

  const growthData = useMemo(() => {
    if (!growthDataList.length) return []
    const months = Number(growthRange)
    if (!Number.isFinite(months) || months <= 0) return growthDataList
    return growthDataList.slice(-months)
  }, [growthRange, growthDataList])

  const maxRevenue = useMemo(
    () => Math.max(1, ...revCatData.map((item) => Number(item.revenue) || 0)),
    [revCatData],
  )

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
            Expert Management
          </h1>
          <p className="text-body-md text-muted md:text-body-lg mt-1">
            Comprehensive member analytics and engagement metrics
          </p>
        </div>
        <div className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center">
          <Button
            type="button"
            className="ui-manage-metrics h-11 rounded-xl px-6 text-sm font-semibold sm:w-auto"
            onClick={() => navigate('/experts/dashboard/metrics')}
          >
            <BarChart3 className="size-4" />
            Manage Metrics
          </Button>

          <Button
            type="button"
            className="h-11 rounded-xl px-6 text-sm font-semibold sm:w-auto"
            onClick={() => navigate('/experts/management/create')}
          >
            <img src={createIcon} alt="create" className="size-4" />
            Create Expert Account
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
        {isLoading
          ? Array.from({ length: skeletonCount }).map((_, index) => (
              <MetricCardSkeleton key={`metric-skeleton-${index}`} />
            ))
          : visibleMetrics.map((metric) => <MetricCard key={metric.id} metric={metric} />)}
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        {isLoading ? (
          <>
            <ChartCardSkeleton title="Experts by Category" />
            <ChartCardSkeleton title="Revenue by Category" />
          </>
        ) : (
          <>
            <ChartCard title="Experts by Category" onRefresh={loadDashboard}>
              {expertsCatData.length === 0 ? (
                <EmptyChartState message="No category data available." />
              ) : (
                <div className="h-[260px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={expertsCatData}
                      margin={{ left: 0, right: 8, top: 8, bottom: 0 }}
                    >
                      <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis
                        dataKey="category"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: 'rgba(148,163,184,0.85)', fontSize: 11 }}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: 'rgba(148,163,184,0.85)', fontSize: 11 }}
                        allowDecimals={false}
                      />
                      <Tooltip
                        contentStyle={tooltipStyle}
                        cursor={{ fill: 'rgba(21,93,252,0.08)' }}
                      />
                      <Bar dataKey="count" fill={CHART_BLUE} radius={[4, 4, 0, 0]} barSize={42} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </ChartCard>

            <ChartCard title="Revenue by Category" onRefresh={loadDashboard}>
              {revCatData.length === 0 ? (
                <EmptyChartState message="No revenue data available." />
              ) : (
                <div className="space-y-5 px-2 pt-2">
                  {revCatData.map((item) => (
                    <div key={item.category} className="flex items-center gap-3">
                      <span className="text-body-sm text-muted w-20 shrink-0">{item.category}</span>
                      <div className="relative h-7 flex-1 overflow-hidden rounded bg-white/5">
                        <div
                          className="bg-brand-action flex h-full min-w-[52px] items-center rounded px-2.5 text-[10px] font-bold text-white"
                          style={{
                            width: `${Math.max(
                              28,
                              Math.min(100, ((Number(item.revenue) || 0) / maxRevenue) * 100),
                            )}%`,
                          }}
                        >
                          {item.label || item.revenue}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ChartCard>
          </>
        )}
      </div>

      <div className="rounded-brand-lg bg-brand-surface border border-white/[0.06] px-5 py-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-body-md font-bold text-white">Revenue Growth Over Time</h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={growthRange}
                onChange={(event) => setGrowthRange(event.target.value)}
                className="ui-input focus:border-brand-accent/50 text-body-sm h-9 cursor-pointer appearance-none pr-8 font-medium outline-none"
              >
                <option value="3">Last 3 Months</option>
                <option value="6">Last 6 Months</option>
                <option value="12">Last 12 Months</option>
              </select>
            </div>
            <button
              type="button"
              aria-label="Refresh revenue chart"
              onClick={loadDashboard}
              className="text-muted grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-black transition-colors hover:bg-white/5"
            >
              <RefreshCw className="size-3.5" />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="h-[330px] w-full animate-pulse rounded-lg bg-white/5" />
        ) : growthData.length === 0 ? (
          <EmptyChartState message="No revenue growth data available." />
        ) : (
          <div className="h-[330px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={growthData} margin={{ left: 20, right: 20, top: 20, bottom: 20 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: 'rgba(148,163,184,0.85)', fontSize: 12 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value / 1000}K`}
                  tick={{ fill: 'rgba(148,163,184,0.85)', fontSize: 12 }}
                />
                <Tooltip content={<RevenueGrowthTooltip />} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--brand-accent)"
                  strokeWidth={2}
                  dot={{ r: 4, fill: 'var(--brand-accent)', strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: 'var(--brand-accent)' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="rounded-brand-lg bg-brand-surface border border-white/[0.06] px-5 py-6">
        <div className="mb-4">
          <h2 className="text-body-md font-bold text-white">Top Performing Hosts</h2>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={`host-skeleton-${index}`}
                className="h-10 animate-pulse rounded bg-white/5"
              />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left">
              <thead>
                <tr className="text-muted text-[10px] font-semibold tracking-wide uppercase">
                  <th className="px-3 py-2.5">Expert Name</th>
                  <th className="px-3 py-2.5">Category</th>
                  <th className="px-3 py-2.5">No. Of Order</th>
                  <th className="px-3 py-2.5">Ratings</th>
                  <th className="px-3 py-2.5">Total Attendees</th>
                  <th className="px-3 py-2.5">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topHostsList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-muted px-3 py-8 text-center text-sm">
                      No top performing hosts yet.
                    </td>
                  </tr>
                ) : (
                  topHostsList.map((host) => (
                    <tr
                      key={host.name}
                      className="text-body-sm text-brand-text border-b border-white/5 transition-colors hover:bg-white/[0.02]"
                    >
                      <td className="px-3 py-3 font-semibold text-white">{host.name}</td>
                      <td className="text-muted px-3 py-3">{host.category}</td>
                      <td className="px-3 py-3">{host.orders}</td>
                      <td className="px-3 py-3">
                        <span className="inline-flex items-center gap-1">
                          <Star className="fill-brand-accent text-brand-accent size-3.5" />
                          <span className="font-semibold text-white">{host.rating || 0}</span>
                        </span>
                      </td>
                      <td className="px-3 py-3">{(host.attendees || 0).toLocaleString('en-IN')}</td>
                      <td className="px-3 py-3 font-semibold text-white">{host.revenue || '₹0'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
