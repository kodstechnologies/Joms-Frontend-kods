import { useEffect, useMemo, useState, type ReactNode } from 'react'
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

const METRICS: Metric[] = [
  {
    id: 'total-experts',
    label: 'Total Expert',
    value: '12,845',
    change: '6.8%',
    changeType: 'up',
    changeNote: 'vs last month',
  },
  {
    id: 'active-experts',
    label: 'Active Experts',
    value: '10,234',
    change: '8.3%',
    changeType: 'up',
    changeNote: 'vs last month',
  },
  {
    id: 'inactive-experts',
    label: 'Inactive Experts',
    value: '2,611',
    change: '3.2%',
    changeType: 'up',
    changeNote: 'vs last month',
  },
  {
    id: 'new-experts-mtd',
    label: 'New Expert (MTD)',
    value: '342',
    change: '12.5%',
    changeType: 'up',
    changeNote: 'vs last month',
  },
  {
    id: 'total-revenue',
    label: 'Total Revenue',
    value: '₹487,250',
    change: '5.2%',
    changeType: 'up',
    changeNote: 'vs last month',
  },
  {
    id: 'avg-listings',
    label: 'Avg. Listings/Expert',
    value: '06',
    change: '2.8%',
    changeType: 'up',
    changeNote: 'vs last quarter',
  },
  {
    id: 'avg-revenue',
    label: 'Avg. Revenue/Expert',
    value: '₹4,250',
    change: '3.5%',
    changeType: 'up',
    changeNote: 'vs last quarter',
  },
  {
    id: 'avg-ratings',
    label: 'Avg. Ratings/Expert',
    value: '4.5/5',
    change: '12.5%',
    changeType: 'up',
    changeNote: 'vs last quarter',
  },
  {
    id: 'avg-consultation',
    label: 'Avg. Consultation/Experty',
    value: '₹487,250',
    change: '5.2%',
    changeType: 'up',
    changeNote: 'vs last month',
  },
  {
    id: 'avg-response-time',
    label: 'Avg. Response Time/Expert',
    value: '₹48',
    change: '5.2%',
    changeType: 'up',
    changeNote: 'vs last month',
  },
  {
    id: 'avg-client',
    label: 'Avg. Client/Expert',
    value: '₹2,847',
    change: '5.2%',
    changeType: 'up',
    changeNote: 'vs last month',
  },
  {
    id: 'category-coverage',
    label: 'Category coverage % expert',
    value: '₹2,847',
    change: '5.2%',
    changeType: 'up',
    changeNote: 'vs last quarter',
  },
  {
    id: 'total-orders',
    label: 'Total Order Completed',
    value: '₹487,250',
    change: '5.2%',
    changeType: 'up',
    changeNote: 'vs last month',
  },
  {
    id: 'avg-cancellation',
    label: 'Avg Cancellation/Expert',
    value: '₹487,250',
    change: '3.2%',
    changeType: 'down',
    changeNote: 'vs last month',
  },
]

const DEFAULT_METRIC_IDS = [
  'total-experts',
  'active-experts',
  'inactive-experts',
  'new-experts-mtd',
  'total-revenue',
  'avg-listings',
  'avg-revenue',
  'avg-ratings',
  'avg-consultation',
  'avg-response-time',
  'avg-client',
  'category-coverage',
  'total-orders',
  'avg-cancellation',
]

const EXPERTS_BY_CATEGORY = [
  { category: 'Finance', count: 280 },
  { category: 'Technology', count: 240 },
  { category: 'Fitness', count: 190 },
  { category: 'Legal', count: 160 },
  { category: 'Marketing', count: 130 },
]

const REVENUE_BY_CATEGORY = [
  { category: 'Finance', revenue: 78000, label: '78K' },
  { category: 'Technology', revenue: 65000, label: '65K' },
  { category: 'Fitness', revenue: 52000, label: '52K' },
  { category: 'Legal', revenue: 48000, label: '48K' },
  { category: 'Marketing', revenue: 42000, label: '42K' },
]

const REVENUE_GROWTH = [
  { month: 'Jan', revenue: 20000 },
  { month: 'Feb', revenue: 28000 },
  { month: 'Mar', revenue: 40000 },
  { month: 'Apr', revenue: 35000 },
  { month: 'May', revenue: 52000 },
  { month: 'Jun', revenue: 48000 },
  { month: 'July', revenue: 60000 },
]

type TopHost = {
  name: string
  category: string
  orders: number
  rating: number
  attendees: number
  revenue: string
}

const TOP_HOSTS: TopHost[] = [
  {
    name: 'Sarah Johnson',
    category: 'Marketing',
    orders: 21,
    rating: 4.9,
    attendees: 1240,
    revenue: '₹223,450',
  },
  {
    name: 'Michael Chen',
    category: 'Finance',
    orders: 21,
    rating: 4.8,
    attendees: 980,
    revenue: '₹198,320',
  },
  {
    name: 'Emily Davis',
    category: 'Legal',
    orders: 21,
    rating: 4.7,
    attendees: 860,
    revenue: '₹176,540',
  },
  {
    name: 'David Wilson',
    category: 'Technology',
    orders: 21,
    rating: 4.6,
    attendees: 720,
    revenue: '₹154,890',
  },
  {
    name: 'Jessica Brown',
    category: 'Fitness',
    orders: 21,
    rating: 4.5,
    attendees: 640,
    revenue: '₹142,760',
  },
]

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
    <div className="rounded-brand-lg bg-brand-surface border border-white/[0.06] p-4 transition-colors hover:border-white/10">
      <p className="text-body-sm text-muted font-medium">{metric.label}</p>
      <p className="text-h3 mt-2 font-bold tracking-tight text-white">{metric.value}</p>
      {metric.change ? (
        <div className="mt-2 flex items-center gap-2">
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold',
              metric.changeType === 'down'
                ? 'bg-brand-positive/15 text-brand-positive'
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
          {metric.changeNote && <span className="text-muted text-[10px]">{metric.changeNote}</span>}
        </div>
      ) : null}
    </div>
  )
}

function ChartCard({
  title,
  children,
  onRefresh,
}: {
  title: string
  children: ReactNode
  onRefresh?: () => void
}) {
  return (
    <div className="rounded-brand-lg bg-brand-surface border border-white/[0.06] px-5 py-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-body-md font-bold text-white">{title}</h2>
        {onRefresh ? (
          <button
            type="button"
            aria-label="Refresh chart"
            onClick={onRefresh}
            className="text-muted grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-black transition-colors hover:bg-white/5"
          >
            <RefreshCw className="size-3.5" />
          </button>
        ) : null}
      </div>
      {children}
    </div>
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
  const [metricsList, setMetricsList] = useState<Metric[]>(METRICS)
  const [expertsCatData, setExpertsCatData] = useState(EXPERTS_BY_CATEGORY)
  const [revCatData, setRevCatData] = useState(REVENUE_BY_CATEGORY)
  const [growthDataList, setGrowthDataList] = useState(REVENUE_GROWTH)
  const [topHostsList, setTopHostsList] = useState<TopHost[]>(TOP_HOSTS)

  const activeMetricIds = useActiveMetricIds(EXPERT_DASHBOARD_MODULE_KEY, DEFAULT_METRIC_IDS)
  const visibleMetrics = useMemo(
    () => orderByActiveMetricIds(metricsList, activeMetricIds),
    [metricsList, activeMetricIds],
  )

  useEffect(() => {
    let isMounted = true
    fetchExpertDashboardAnalytics()
      .then((res) => {
        if (!isMounted || !res?.data) return
        const d = res.data
        if (d.metrics?.length) setMetricsList(d.metrics)
        if (d.expertsByCategory?.length) setExpertsCatData(d.expertsByCategory)
        if (d.revenueByCategory?.length) setRevCatData(d.revenueByCategory)
        if (d.revenueGrowthOverTime?.length) setGrowthDataList(d.revenueGrowthOverTime)
        if (d.topPerformingHosts?.length) setTopHostsList(d.topPerformingHosts)
      })
      .catch((err) => {
        console.error('Failed to load expert dashboard analytics:', err)
      })
    return () => {
      isMounted = false
    }
  }, [])

  const growthData = useMemo(() => {
    if (growthRange === '6') return growthDataList.slice(0, 6)
    if (growthRange === '12') return growthDataList
    return growthDataList.slice(0, 5)
  }, [growthRange, growthDataList])

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
        {visibleMetrics.map((metric) => (
          <MetricCard key={metric.id} metric={metric} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <ChartCard title="Experts by Category" onRefresh={() => toast.message('Chart refreshed')}>
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={expertsCatData} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
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
                />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(21,93,252,0.08)' }} />
                <Bar dataKey="count" fill={CHART_BLUE} radius={[4, 4, 0, 0]} barSize={42} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Revenue by Category" onRefresh={() => toast.message('Chart refreshed')}>
          <div className="space-y-5 px-2 pt-2">
            {revCatData.map((item) => (
              <div key={item.category} className="flex items-center gap-3">
                <span className="text-body-sm text-muted w-20 shrink-0">{item.category}</span>
                <div className="relative h-7 flex-1 overflow-hidden rounded bg-white/5">
                  <div
                    className="bg-brand-action flex h-full min-w-[52px] items-center rounded px-2.5 text-[10px] font-bold text-white"
                    style={{ width: `${Math.max(28, Math.min(100, (item.revenue / 700) * 100))}%` }}
                  >
                    {item.label || item.revenue}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
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
              onClick={() => toast.message('Chart refreshed')}
              className="text-muted grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-black transition-colors hover:bg-white/5"
            >
              <RefreshCw className="size-3.5" />
            </button>
          </div>
        </div>

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
      </div>

      <div className="rounded-brand-lg bg-brand-surface border border-white/[0.06] px-5 py-6">
        <div className="mb-4">
          <h2 className="text-body-md font-bold text-white">Top Performing Hosts</h2>
        </div>

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
              {topHostsList.map((host) => (
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
                      <span className="font-semibold text-white">{host.rating}</span>
                    </span>
                  </td>
                  <td className="px-3 py-3">{host.attendees.toLocaleString('en-IN')}</td>
                  <td className="px-3 py-3 font-semibold text-white">{host.revenue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
