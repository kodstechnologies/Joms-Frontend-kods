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
import { BarChart3, ChevronDown, Download, RefreshCw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import {
  consultationMetricsMock,
  serviceConsultationTrendsMock,
  serviceMetricsMock,
  type MarketplaceMetric,
  type ServiceConsultationTrendPoint,
} from '@/modules/expert/mock/service-marketplace.mock'
import { DashboardCard } from '@/shared/components/dashboard/dashboard-card'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'

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
          <span className="font-semibold">{data.consultationsCompleted}</span>
        </p>
        <p className="text-amber-600">
          Revenue (₹):{' '}
          <span className="font-semibold">
            {data.revenue?.toLocaleString('en-IN', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </p>
        <p className="text-blue-600">
          Service delivered: <span className="font-semibold">{data.servicesDelivered}</span>
        </p>
      </div>
    </div>
  )
}

export function ServiceMarketplacePage() {
  const navigate = useNavigate()

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

      <MetricsSection title="Service Metrics" metrics={serviceMetricsMock} />

      <MetricsSection title="Consultation Metrics" metrics={consultationMetricsMock} />

      <DashboardCard
        className="p-0"
        title="Service & Consultation Trends"
        rightSlot={
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                defaultValue="last-3-months"
                className="appearance-none rounded-lg border border-white/10 bg-white/5 py-1.5 pr-8 pl-3 text-xs font-medium text-slate-200 outline-none focus:border-white/20"
              >
                <option value="last-3-months">Last 3 Months</option>
                <option value="last-6-months">Last 6 Months</option>
                <option value="last-12-months">Last 12 Months</option>
              </select>
              <ChevronDown className="pointer-events-none absolute top-1/2 right-2 size-3.5 -translate-y-1/2 text-slate-400" />
            </div>
            <button
              type="button"
              className="grid size-8 place-items-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition-colors hover:border-white/15 hover:bg-white/10"
              onClick={() => toast.message('Refreshing trends...')}
            >
              <RefreshCw className="size-4" />
            </button>
          </div>
        }
      >
        <div className="px-4 pb-5 sm:px-5 sm:pb-6">
          <div className="h-[280px] sm:h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={serviceConsultationTrendsMock}
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
                  domain={[0, 800]}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: 'rgba(148,163,184,0.85)', fontSize: 12 }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  domain={[0, 8000]}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: 'rgba(148,163,184,0.85)', fontSize: 12 }}
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
