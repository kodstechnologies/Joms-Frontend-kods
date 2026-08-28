import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { navigateBackOrFallback } from '@/shared/lib/navigation'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ArrowLeft, SlidersHorizontal, Star, Upload, User } from 'lucide-react'

import { useExpertAnalytics, useExpertProfile } from '../../hooks/use-expert-profile'
import {
  DEFAULT_EXPERT_PROFILE_ANALYTICS_METRIC_IDS,
  EXPERT_PROFILE_ANALYTICS_LEGACY_METRIC_ID_MAP,
  EXPERT_PROFILE_ANALYTICS_METRIC_ID_SET,
  EXPERT_PROFILE_ANALYTICS_METRIC_IDS,
  EXPERT_PROFILE_ANALYTICS_MODULE_KEY,
} from '../../config/expert-profile-analytics-metrics.config'
import { orderByActiveMetricIds, useActiveMetricIds } from '../../hooks/use-active-metric-ids'
import { buildExpertProfileAnalyticsMetricCards } from '../../utils/expert-profile-analytics-metrics'
import { sortIdsByCatalogOrder } from '@/shared/lib/dedupe-ids'
import {
  AnalyticsCard,
  MetricCard,
  PeriodSelect,
  SectionTitle,
  VenueAnalyticsMetricIcon,
} from '../../components/venue-analytics/analytics-ui'
import { CHART_TOOLTIP } from '../../components/venue-analytics/analytics-constants'
import { Button } from '@/shared/components/ui/button'

const FUNNEL_COLORS = [
  'var(--brand-action)',
  'color-mix(in srgb, var(--brand-action) 85%, white)',
  'color-mix(in srgb, var(--brand-action) 70%, white)',
  'color-mix(in srgb, var(--brand-action) 55%, white)',
  'color-mix(in srgb, var(--brand-action) 40%, white)',
]

const EMPTY_CHART = (
  <div className="text-muted flex h-56 items-center justify-center text-sm">No data available.</div>
)

function formatCompactCount(value: number) {
  if (value >= 1000) return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}k`
  return String(value)
}

export function ExpertProfileAnalyticsPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { data } = useExpertProfile(id ?? '')
  const expert = data?.data

  const [visibilityPeriod, setVisibilityPeriod] = useState('Last 7 Days')
  const [revenuePeriod, setRevenuePeriod] = useState('Last 3 Months')

  const timeRangeCode = useMemo(() => {
    if (visibilityPeriod === 'Last 30 Days') return '30d'
    if (visibilityPeriod === 'Last 90 Days') return '90d'
    return '7d'
  }, [visibilityPeriod])

  const { data: analyticsRes } = useExpertAnalytics(id ?? '', timeRangeCode)
  const analyticsData = analyticsRes?.data
  const activeMetricIds = useActiveMetricIds(EXPERT_PROFILE_ANALYTICS_MODULE_KEY, [
    ...DEFAULT_EXPERT_PROFILE_ANALYTICS_METRIC_IDS,
  ])

  const filteredActiveMetricIds = useMemo(
    () =>
      sortIdsByCatalogOrder(
        [
          ...new Set(
            activeMetricIds
              .map(
                (metricId) => EXPERT_PROFILE_ANALYTICS_LEGACY_METRIC_ID_MAP[metricId] ?? metricId,
              )
              .filter((metricId) => EXPERT_PROFILE_ANALYTICS_METRIC_ID_SET.has(metricId)),
          ),
        ],
        EXPERT_PROFILE_ANALYTICS_METRIC_IDS,
      ).slice(0, 8),
    [activeMetricIds],
  )

  const serviceAnalyticsCards = useMemo(() => {
    const allCards = buildExpertProfileAnalyticsMetricCards(analyticsData)
    return orderByActiveMetricIds(allCards, filteredActiveMetricIds)
  }, [analyticsData, filteredActiveMetricIds])

  const manageMetricsPath = id
    ? `/metrics/expert-profile-analytics?returnTo=${encodeURIComponent(`/experts/management/profile/${id}/analytics`)}`
    : '/metrics/expert-profile-analytics'

  const profile = useMemo(() => {
    const name = expert?.fullname || analyticsData?.profileSummary?.name || 'Expert'
    const profession =
      expert?.basicProfile?.industry ||
      expert?.basicProfile?.serviceCategory?.[0] ||
      analyticsData?.profileSummary?.profession ||
      'Service Expert'
    const avatarUrl =
      expert?.basicProfile?.profileImage || analyticsData?.profileSummary?.avatarUrl || null

    const accountStatus = expert?.isDeactivated
      ? 'Inactive'
      : expert?.isBlocked
        ? 'Blocked'
        : analyticsData?.profileSummary?.accountStatus || 'Active'

    const rating = analyticsData?.ratingsSummary?.available
      ? `${analyticsData.ratingsSummary.average}`
      : 'No ratings'

    const servicesListed = String(analyticsData?.listingOverview?.servicesListed ?? 0)
    const consultationsListed = String(analyticsData?.listingOverview?.consultationsListed ?? 0)
    const ordersCompleted = String(analyticsData?.listingOverview?.ordersCompleted ?? 0)
    const revenue = `₹${Number(analyticsData?.listingOverview?.totalEarnings ?? 0).toLocaleString('en-IN')}`

    const role =
      analyticsData?.profileSummary?.role ||
      (expert?.expertType === 'Venue' ? 'Venue Owner' : 'Service Expert')
    const badge =
      analyticsData?.profileSummary?.badge ||
      (expert?.kycStatus === 'APPROVED' ? 'VERIFIED EXPERT' : 'EXPERT')
    const lastActive = expert?.updatedAt
      ? new Date(expert.updatedAt).toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        })
      : analyticsData?.profileSummary?.lastActiveAt
        ? new Date(analyticsData.profileSummary.lastActiveAt).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
          })
        : '—'

    return {
      name,
      profession,
      avatarUrl,
      role,
      rating,
      badge,
      accountStatus,
      lastActive,
      servicesListed,
      consultationsListed,
      ordersCompleted,
      revenue,
    }
  }, [expert, analyticsData])

  const visibilityMetrics = useMemo(() => {
    const vm = analyticsData?.visibilityMetrics
    return [
      {
        label: 'Profile Views',
        value: vm?.profileViews?.available ? String(vm.profileViews.count ?? 0) : '--',
        trend: vm?.profileViews?.available ? (vm.profileViews.trendPercentage ?? 0) : undefined,
      },
      {
        label: 'Total Clicks',
        value: vm?.totalClicks?.available ? String(vm.totalClicks.count ?? 0) : '--',
        trend: vm?.totalClicks?.available ? (vm.totalClicks.trendPercentage ?? 0) : undefined,
      },
      {
        label: 'Repeat Client Rate',
        value: `${vm?.repeatClientRate?.percentage ?? 0}%`,
        trend: undefined,
      },
      {
        label: 'Order Completion Rate',
        value: `${vm?.orderCompletionRate?.percentage ?? 0}%`,
        trend: undefined,
      },
    ]
  }, [analyticsData])

  const expertListingsMetrics = useMemo(() => {
    const sa = analyticsData?.serviceAnalytics
    const mp = analyticsData?.marketplacePerformance
    const lo = analyticsData?.listingOverview
    return [
      {
        label: 'Average first response time',
        value: sa?.avgResponseTime?.label || '--',
      },
      {
        label: 'Active Services',
        value: String(mp?.activeServices ?? lo?.servicesListed ?? 0),
      },
      {
        label: 'Quotations Prepared',
        value: String(mp?.proposalsCreated ?? lo?.proposalsCreated ?? 0),
      },
      {
        label: 'Proposals created',
        value: String(mp?.proposalsCreated ?? lo?.proposalsCreated ?? 0),
      },
      {
        label: 'Orders in progress',
        value: String(mp?.ordersInProgress ?? lo?.ordersInProgress ?? 0),
      },
      {
        label: 'Terminated Orders',
        value: String(mp?.terminatedOrders ?? lo?.terminatedOrders ?? 0),
      },
    ]
  }, [analyticsData])

  const ticketingInsights = useMemo(() => {
    const rs = analyticsData?.ratingsSummary
    const mp = analyticsData?.marketplacePerformance
    return [
      {
        label: 'Conversion Rate',
        value: `${mp?.conversionRate ?? analyticsData?.visibilityMetrics?.orderCompletionRate?.percentage ?? 0}%`,
      },
      {
        label: 'Client Satisfaction',
        value: rs?.available ? `${rs.average}/5` : '0/5',
      },
      {
        label: 'Revenue Growth Rate',
        value: `${analyticsData?.revenueGrowthRate ?? 0}%`,
      },
    ]
  }, [analyticsData])

  const mostActiveTime = useMemo(() => {
    const rows = analyticsData?.charts?.mostActiveTime || []
    if (!rows.length) {
      return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => ({
        day,
        hours: 0,
      }))
    }
    return rows.map((row) => ({
      day: row.day || '—',
      hours: Number(row.hours ?? row.count ?? 0),
    }))
  }, [analyticsData])

  const hasMostActiveTime = useMemo(
    () => mostActiveTime.some((row) => row.hours > 0),
    [mostActiveTime],
  )

  const topViewsByLocation = useMemo(() => {
    const rows = analyticsData?.charts?.topClientViewsByLocation || []
    const total = rows.reduce((sum, row) => sum + Number(row.views || 0), 0)
    return rows.map((row) => ({
      name: row.location || '—',
      views: Number(row.views || 0),
      percent: total > 0 ? Math.round((Number(row.views || 0) / total) * 1000) / 10 : 0,
    }))
  }, [analyticsData])

  const topViewsByRole = useMemo(() => {
    const rows = analyticsData?.charts?.topClientViewsByProfession || []
    const total = rows.reduce((sum, row) => sum + Number(row.views || 0), 0)
    return rows.map((row) => ({
      name: row.profession || '—',
      views: Number(row.views || 0),
      percent: total > 0 ? Math.round((Number(row.views || 0) / total) * 1000) / 10 : 0,
    }))
  }, [analyticsData])

  const conversionFunnel = useMemo(() => {
    const funnel = analyticsData?.charts?.conversionFunnel
    const profileViews = Number(funnel?.profileViews || 0)
    const listingViews = Number(funnel?.listingViews || 0)
    const ordersCount = Number(
      funnel?.ordersCount ?? analyticsData?.listingOverview?.ordersCompleted ?? 0,
    )
    return [
      { stage: 'Profile Views', value: profileViews, label: formatCompactCount(profileViews) },
      { stage: 'Listing Views', value: listingViews, label: formatCompactCount(listingViews) },
      { stage: 'Orders', value: ordersCount, label: formatCompactCount(ordersCount) },
    ]
  }, [analyticsData])

  const hasConversionFunnel = useMemo(
    () => conversionFunnel.some((stage) => stage.value > 0),
    [conversionFunnel],
  )

  const revenueTrend = useMemo(() => {
    const rows = analyticsData?.charts?.revenueTrend || []
    const mapped = rows.map((row) => {
      const dateLabel = row.month || (row.date ? row.date.slice(5) : '—')
      return {
        month: dateLabel,
        revenue: Number(row.revenue || 0),
      }
    })

    if (revenuePeriod === 'Last 3 Months') return mapped.slice(-90)
    if (revenuePeriod === 'Last 6 Months') return mapped.slice(-180)
    return mapped
  }, [analyticsData, revenuePeriod])

  const hasRevenueTrend = useMemo(() => revenueTrend.some((row) => row.revenue > 0), [revenueTrend])

  const peakDay = useMemo(() => {
    if (!hasMostActiveTime) return null
    return mostActiveTime.reduce(
      (best, row) => (row.hours > best.hours ? row : best),
      mostActiveTime[0],
    ).day
  }, [hasMostActiveTime, mostActiveTime])

  return (
    <div className="mx-auto flex max-w-[1120px] flex-col gap-5 pb-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <button
            type="button"
            onClick={() => navigateBackOrFallback(navigate, `/experts/management/profile/${id}`)}
            className="group font-heading hover:text-brand-accent text-h3 flex w-fit items-center gap-2 font-bold tracking-tight text-white transition-colors"
          >
            <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-1" />
            <span>Expert Profile Analytics</span>
          </button>
          <div className="text-body-sm text-muted mt-2 flex items-center gap-1.5 pl-7 font-medium">
            <button
              type="button"
              onClick={() => navigateBackOrFallback(navigate, '/experts/management')}
              className="transition-colors hover:text-white"
            >
              Back
            </button>
            <span className="text-muted/40">/</span>
            <button
              type="button"
              onClick={() => navigateBackOrFallback(navigate, `/experts/management/profile/${id}`)}
              className="transition-colors hover:text-white"
            >
              {profile.name}
            </button>
            <span className="text-muted/40">/</span>
            <span className="font-bold text-white">Profile Analytics</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            className="ui-manage-metrics ui-cta ui-cta-primary h-9"
            onClick={() => navigate(manageMetricsPath)}
          >
            <SlidersHorizontal className="size-4" />
            Manage Metrics
          </Button>
          <Button className="ui-export-data h-9">
            <Upload className="size-4" />
            Export Data
          </Button>
        </div>
      </header>

      <AnalyticsCard>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/10">
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.name}
                  className="size-full object-cover"
                />
              ) : (
                <User className="text-muted size-8" />
              )}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-bold text-white">{profile.name}</h2>
                <span className="bg-brand-accent/15 text-brand-accent rounded-md px-2 py-0.5 text-[10px] font-semibold">
                  {profile.profession}
                </span>
              </div>
              <div className="text-body-sm text-muted mt-1 flex flex-wrap items-center gap-2">
                <span>{profile.role}</span>
                <span className="text-muted/40">•</span>
                <span className="inline-flex items-center gap-1 text-white">
                  <Star className="fill-brand-accent text-brand-accent size-3" />
                  {profile.rating}
                </span>
                <span className="bg-brand-positive/15 text-brand-positive rounded-md px-2 py-0.5 text-[10px] font-semibold">
                  {profile.badge}
                </span>
              </div>
              <p className="text-body-sm text-muted mt-2">
                Account Status:{' '}
                <span className="text-brand-positive font-semibold">{profile.accountStatus}</span>
                <span className="text-muted/40 mx-2">|</span>
                Last Active: <span className="text-white">{profile.lastActive}</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
            {[
              { label: 'Services Listed', value: profile.servicesListed },
              { label: 'Consultations Listed', value: profile.consultationsListed },
              { label: 'Orders Completed', value: profile.ordersCompleted },
              { label: 'Revenue', value: profile.revenue },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-muted text-[10px]">{item.label}</p>
                <p className="mt-1 text-[15px] font-bold text-white">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </AnalyticsCard>

      <div>
        <SectionTitle title="Service Analytics" subtitle="Event and engagement metrics" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {serviceAnalyticsCards.map((item) => (
            <MetricCard
              key={item.id}
              label={item.label}
              value={item.value}
              icon={<VenueAnalyticsMetricIcon />}
            />
          ))}
        </div>
      </div>

      <div>
        <SectionTitle
          title="Visibility Metrics"
          action={
            <PeriodSelect
              value={visibilityPeriod}
              options={['Last 7 Days', 'Last 30 Days', 'Last 90 Days']}
              onChange={setVisibilityPeriod}
            />
          }
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {visibilityMetrics.map((item) => (
            <MetricCard
              key={item.label}
              label={item.label}
              value={item.value}
              trend={item.trend != null ? { percent: item.trend } : undefined}
            />
          ))}
        </div>
      </div>

      <div>
        <SectionTitle title="Expert Listings" subtitle="Expert analytics and growth" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {expertListingsMetrics.map((item) => (
            <MetricCard key={item.label} label={item.label} value={item.value} />
          ))}
        </div>
      </div>

      <div>
        <SectionTitle title="Ticketing Insights" subtitle="Communication and interaction metrics" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ticketingInsights.map((item) => (
            <MetricCard key={item.label} label={item.label} value={item.value} />
          ))}
        </div>
      </div>

      <div>
        <SectionTitle title="Behavioral Insights" />
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <AnalyticsCard>
            <p className="text-body-sm mb-4 font-semibold text-white">Most Active Time</p>
            {!hasMostActiveTime ? (
              EMPTY_CHART
            ) : (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={mostActiveTime}
                    margin={{ left: -20, right: 8, top: 8, bottom: 0 }}
                  >
                    <CartesianGrid stroke="#2a2a2a" strokeDasharray="4 4" vertical={false} />
                    <XAxis
                      dataKey="day"
                      tick={{ fill: 'var(--brand-muted)', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis hide />
                    <Tooltip
                      contentStyle={CHART_TOOLTIP}
                      formatter={(value) => [`${Number(value ?? 0)} orders`, 'Activity']}
                    />
                    <Bar dataKey="hours" radius={[6, 6, 0, 0]}>
                      {mostActiveTime.map((entry) => (
                        <Cell
                          key={entry.day}
                          fill={entry.day === peakDay ? 'var(--brand-accent)' : '#3A3A3A'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </AnalyticsCard>

          <AnalyticsCard>
            <p className="text-body-sm mb-4 font-semibold text-white">Top Views by Location</p>
            {topViewsByLocation.length === 0 ? (
              EMPTY_CHART
            ) : (
              <div className="space-y-3">
                {topViewsByLocation.map((item) => (
                  <div key={item.name}>
                    <div className="text-body-sm mb-1 flex items-center justify-between">
                      <span className="text-white">{item.name}</span>
                      <span className="text-muted">{item.percent}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-black">
                      <div
                        className="bg-brand-accent h-full rounded-full"
                        style={{ width: `${Math.min(100, item.percent)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </AnalyticsCard>

          <AnalyticsCard>
            <p className="text-body-sm mb-4 font-semibold text-white">Top Views by Role</p>
            {topViewsByRole.length === 0 ? (
              EMPTY_CHART
            ) : (
              <div className="space-y-3">
                {topViewsByRole.map((item) => (
                  <div key={item.name}>
                    <div className="text-body-sm mb-1 flex items-center justify-between">
                      <span className="text-white">{item.name}</span>
                      <span className="text-muted">{item.percent}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-black">
                      <div
                        className="bg-brand-action h-full rounded-full"
                        style={{ width: `${Math.min(100, item.percent)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </AnalyticsCard>

          <AnalyticsCard>
            <p className="text-body-sm mb-4 font-semibold text-white">Conversion Funnel</p>
            {!hasConversionFunnel ? (
              EMPTY_CHART
            ) : (
              <div className="flex flex-col items-center gap-1.5 py-2">
                {conversionFunnel.map((stage, index) => {
                  const widthPercent = 100 - index * 18
                  return (
                    <div
                      key={stage.stage}
                      className="text-body-sm flex h-9 items-center justify-between rounded-md px-4 font-semibold text-white"
                      style={{
                        width: `${widthPercent}%`,
                        backgroundColor: FUNNEL_COLORS[index],
                      }}
                    >
                      <span>{stage.stage}</span>
                      <span>{stage.label}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </AnalyticsCard>
        </div>
      </div>

      <div>
        <SectionTitle
          title="Revenue Growth Trend"
          action={
            <PeriodSelect
              value={revenuePeriod}
              options={['Last 3 Months', 'Last 6 Months', 'Last 12 Months']}
              onChange={setRevenuePeriod}
            />
          }
        />
        <AnalyticsCard>
          {!hasRevenueTrend ? (
            <div className="text-muted flex h-72 items-center justify-center text-sm">
              No revenue data available.
            </div>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueTrend} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                  <defs>
                    <linearGradient id="expertRevenueFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--brand-accent)" stopOpacity={0.45} />
                      <stop offset="100%" stopColor="var(--brand-accent)" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#2a2a2a" strokeDasharray="4 4" />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: 'var(--brand-muted)', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: 'var(--brand-muted)', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={CHART_TOOLTIP}
                    formatter={(value, _name, item) => [
                      `₹${Number(value ?? 0).toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`,
                      `${item?.payload?.month ?? ''} Revenue`,
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--brand-accent)"
                    strokeWidth={2}
                    fill="url(#expertRevenueFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </AnalyticsCard>
      </div>
    </div>
  )
}
