import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ArrowLeft, RefreshCw, Star } from 'lucide-react'
import { ExportDataIcon, ManageMetricsIcon } from '@/shared/components/icons/action-button-icons'

import { navigateBackOrFallback } from '@/shared/lib/navigation'
import { PageBreadcrumb } from '@/shared/components/navigation/page-breadcrumb'
import { Button } from '@/shared/components/ui/button'
import { useSpaceAnalytics } from '../../hooks/use-venue-analytics'
import {
  DEFAULT_VENUE_VIEW_ANALYTICS_METRIC_IDS,
  VENUE_VIEW_ANALYTICS_METRIC_ID_SET,
  VENUE_VIEW_ANALYTICS_METRIC_IDS,
  VENUE_VIEW_ANALYTICS_MODULE_KEY,
} from '../../config/venue-view-analytics-metrics.config'
import { orderByActiveMetricIds, useActiveMetricIds } from '../../hooks/use-active-metric-ids'
import { buildVenueViewAnalyticsMetricCards } from '../../utils/venue-view-analytics-metrics'
import { sortIdsByCatalogOrder } from '@/shared/lib/dedupe-ids'
import { cn } from '@/shared/lib/cn'

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <section
      className={cn('rounded-brand-lg bg-brand-surface border border-white/5 p-5', className)}
    >
      {children}
    </section>
  )
}

const formatLakhTick = (value: number) => {
  const lakhs = Number(value || 0) / 100000
  return `₹${lakhs.toFixed(2)}L`
}

export function SpaceAnalyticsPage() {
  const navigate = useNavigate()
  const { venueId, spaceId } = useParams<{ venueId: string; spaceId: string }>()
  const { data, isLoading, isError, isFetching, refetch } = useSpaceAnalytics(spaceId)

  const activeMetricIds = useActiveMetricIds(VENUE_VIEW_ANALYTICS_MODULE_KEY, [
    ...DEFAULT_VENUE_VIEW_ANALYTICS_METRIC_IDS,
  ])

  const filteredActiveMetricIds = useMemo(
    () =>
      sortIdsByCatalogOrder(
        activeMetricIds.filter((metricId) => VENUE_VIEW_ANALYTICS_METRIC_ID_SET.has(metricId)),
        VENUE_VIEW_ANALYTICS_METRIC_IDS,
      ),
    [activeMetricIds],
  )

  const overviewCards = useMemo(() => {
    const allCards = buildVenueViewAnalyticsMetricCards(data?.overview ?? [])
    return orderByActiveMetricIds(allCards, filteredActiveMetricIds)
  }, [data?.overview, filteredActiveMetricIds])

  const manageMetricsPath =
    venueId && spaceId
      ? `/metrics/venue-view-analytics?returnTo=${encodeURIComponent(`/venues/management/profile/${venueId}/space/${spaceId}/analytics`)}`
      : '/metrics/venue-view-analytics'

  const cashFlow = data?.cashFlow ?? []
  const timeSlots = data?.timeSlots ?? []
  const ratings = data?.ratingDistribution ?? []
  const cancellations = data?.cancellations ?? { total: 0, revenueLost: '₹0' }

  const backHref = `/venues/management/profile/${venueId}/space/${spaceId}`

  return (
    <div className="mx-auto flex max-w-[1210px] flex-col gap-5 pb-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <button
            type="button"
            onClick={() => navigateBackOrFallback(navigate, backHref)}
            className="group font-heading hover:text-brand-accent text-h3 flex w-fit items-center gap-2 font-bold tracking-tight text-white transition-colors"
          >
            <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-1" />
            <span>View Analytics</span>
          </button>
          <div className="mt-2 pl-7">
            <PageBreadcrumb
              items={[
                { label: 'Venue Management', to: '/venues/management' },
                {
                  label: 'Venue Details',
                  to: venueId ? `/venues/management/profile/${venueId}` : undefined,
                },
                { label: 'View Analytics', isActive: true },
              ]}
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button className="ui-manage-metrics h-9" onClick={() => navigate(manageMetricsPath)}>
            <ManageMetricsIcon className="size-4 shrink-0" />
            Manage Metrics
          </Button>
          <Button
            className="ui-export-data h-9"
            onClick={() => {
              if (!data) return
              const blob = new Blob([JSON.stringify(data, null, 2)], {
                type: 'application/json',
              })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = `space-analytics-${spaceId || 'export'}.json`
              a.click()
              URL.revokeObjectURL(url)
            }}
          >
            <ExportDataIcon className="size-5 shrink-0" />
            Export Data
          </Button>
        </div>
      </header>

      <div>
        <h2 className="text-body-md mb-3 font-bold text-white">Overview</h2>
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: filteredActiveMetricIds.length || 6 }).map((_, i) => (
              <Card key={`ov-sk-${i}`}>
                <div className="h-3 w-24 animate-pulse rounded bg-white/10" />
                <div className="mt-3 h-7 w-20 animate-pulse rounded bg-white/10" />
                <div className="mt-3 h-3 w-28 animate-pulse rounded bg-white/5" />
              </Card>
            ))}
          </div>
        ) : isError ? (
          <Card>
            <p className="text-muted text-sm">Failed to load overview metrics.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {overviewCards.map((item) => (
              <Card key={item.id}>
                <p className="text-[12px] text-[#999]">{item.label}</p>
                <p className="mt-2 text-xl font-bold text-white">{item.value}</p>
                <p className="mt-3 text-[11px] text-[#777]">{item.note || '—'}</p>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Card>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-body-md font-bold text-white">Cash Flow Analysis</h2>
          <button
            type="button"
            onClick={() => void refetch()}
            className="text-white/80 hover:text-white"
            aria-label="Refresh cash flow"
          >
            <RefreshCw className={cn('size-4', isFetching && 'animate-spin')} />
          </button>
        </div>
        <div className="h-72">
          {cashFlow.length === 0 && !isLoading ? (
            <div className="text-muted flex h-full items-center justify-center text-sm">
              No cash flow data yet for this space.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={cashFlow} barGap={6}>
                <CartesianGrid stroke="#2a2a2a" strokeDasharray="4 4" vertical />
                <XAxis
                  dataKey="month"
                  tick={{ fill: '#777', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={formatLakhTick}
                  tick={{ fill: '#777', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={64}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                  contentStyle={{
                    background: '#fff',
                    border: 0,
                    borderRadius: 6,
                    color: '#111',
                    fontSize: 12,
                  }}
                  formatter={(value, name) => [
                    `₹${Number(value ?? 0).toLocaleString('en-IN')}`,
                    name === 'in' ? 'Revenue' : name === 'out' ? 'Bookings lost' : 'Net Cash Flow',
                  ]}
                />
                <Bar dataKey="in" fill="#22c55e" radius={[2, 2, 0, 0]} name="in" />
                <Bar dataKey="out" fill="#ef4444" radius={[2, 2, 0, 0]} name="out" />
                <Line
                  type="monotone"
                  dataKey="net"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#3b82f6' }}
                  name="net"
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="mt-4 flex flex-wrap justify-center gap-6 text-[12px]">
          <span className="text-emerald-400">+ Cash Inflow</span>
          <span className="text-red-400">+ Cash Outflow</span>
          <span className="text-blue-400">+ Net Cash flow</span>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="flex flex-col gap-5">
          <Card>
            <h2 className="text-body-md mb-4 font-bold text-white">Time Slot Performance</h2>
            <div className="space-y-1">
              <div className="grid grid-cols-3 border-b border-white/10 pb-3 text-[12px] font-semibold text-white">
                <span>Time Slot</span>
                <span>Bookings</span>
                <span>Revenue</span>
              </div>
              {timeSlots.length === 0 && !isLoading ? (
                <p className="text-muted py-4 text-sm">No slot bookings yet.</p>
              ) : (
                timeSlots.map((row) => (
                  <div
                    key={row.slot}
                    className="grid grid-cols-3 border-b border-white/10 py-3 text-[13px] text-white last:border-0"
                  >
                    <span>{row.slot}</span>
                    <span className="text-[#999]">{row.bookings}</span>
                    <span className="text-[#999]">{row.revenue}</span>
                  </div>
                ))
              )}
            </div>
            <div className="mt-4 rounded-md bg-black px-3 py-2 text-[12px] font-semibold text-white">
              {data?.timeSlotInsight || '—'}
            </div>
          </Card>

          <Card>
            <h2 className="text-body-md mb-4 font-bold text-white">Cancellation Analytics</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-md bg-black px-3 py-3 text-[13px]">
                <span className="text-[#999]">Total Cancellations</span>
                <span className="font-bold text-white">{cancellations.total}</span>
              </div>
              <div className="flex items-center justify-between rounded-md bg-black px-3 py-3 text-[13px]">
                <span className="text-[#999]">Revenue Lost</span>
                <span className="font-bold text-white">{cancellations.revenueLost}</span>
              </div>
            </div>
          </Card>
        </div>

        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-body-md font-bold text-white">Rating Distribution</h2>
            <button
              type="button"
              onClick={() => void refetch()}
              className="text-white/80 hover:text-white"
              aria-label="Refresh ratings"
            >
              <RefreshCw className={cn('size-4', isFetching && 'animate-spin')} />
            </button>
          </div>
          <div className="space-y-4">
            {ratings.every((r) => r.reviews === 0) && !isLoading ? (
              <p className="text-muted text-sm">No ratings for this space yet.</p>
            ) : (
              ratings.map((rating) => (
                <div
                  key={rating.stars}
                  className="grid grid-cols-[40px_1fr_auto] items-center gap-3 text-[13px] text-white"
                >
                  <span className="inline-flex items-center gap-1">
                    {rating.stars}
                    <Star className="size-3 fill-[#E0A263] text-[#E0A263]" />
                  </span>
                  <div className="h-3 overflow-hidden rounded-full bg-black">
                    <div
                      className="h-full rounded-full bg-[#E0A263]"
                      style={{ width: `${rating.percent}%` }}
                    />
                  </div>
                  <span className="min-w-[88px] text-right text-[11px] text-[#999]">
                    {rating.reviews} Reviews ({rating.percent}%)
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
