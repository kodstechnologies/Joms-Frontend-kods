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
  CONVERSION_FUNNEL,
  MOST_ACTIVE_TIME,
  REVENUE_GROWTH_TREND,
  TOP_VIEWS_BY_LOCATION,
  TOP_VIEWS_BY_ROLE,
} from '../../mock/expert-profile-analytics.mock'
import {
  AnalyticsCard,
  MetricCard,
  PeriodSelect,
  SectionTitle,
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
      : analyticsData?.ratingsSummary?.count === 0
        ? 'No ratings'
        : 'N/A'

    const servicesListed =
      analyticsData?.listingOverview?.servicesListed != null
        ? String(analyticsData.listingOverview.servicesListed)
        : '0'

    const consultationsListed =
      analyticsData?.listingOverview?.consultationsListed != null
        ? String(analyticsData.listingOverview.consultationsListed)
        : '0'

    const ordersCompleted =
      analyticsData?.listingOverview?.ordersCompleted != null
        ? String(analyticsData.listingOverview.ordersCompleted)
        : '0'

    const revenue =
      analyticsData?.listingOverview?.totalEarnings != null
        ? `₹${analyticsData.listingOverview.totalEarnings.toLocaleString('en-IN')}`
        : '₹0'

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
        : 'N/A'

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
        value: vm?.profileViews?.count != null ? String(vm.profileViews.count) : '0',
        trend: vm?.profileViews?.trendPercentage ?? 0,
      },
      {
        label: 'Total Clicks',
        value: vm?.totalClicks?.count != null ? String(vm.totalClicks.count) : '0',
        trend: vm?.totalClicks?.trendPercentage ?? 0,
      },
      {
        label: 'Repeat Client Rate',
        value:
          vm?.repeatClientRate?.percentage != null ? `${vm.repeatClientRate.percentage}%` : '0%',
        trend: vm?.repeatClientRate?.trendPercentage ?? 0,
      },
      {
        label: 'Order Completion Rate',
        value:
          vm?.orderCompletionRate?.percentage != null
            ? `${vm.orderCompletionRate.percentage}%`
            : '0%',
        trend: vm?.orderCompletionRate?.trendPercentage ?? 0,
      },
    ]
  }, [analyticsData])

  const expertListingsMetrics = useMemo(() => {
    const sa = analyticsData?.serviceAnalytics
    const lo = analyticsData?.listingOverview
    return [
      {
        label: 'Average first response time',
        value: sa?.avgResponseTime?.label || '--',
        trend: 0,
      },
      {
        label: 'Active Services',
        value: lo?.servicesListed != null ? String(lo.servicesListed) : '0',
        trend: 0,
      },
      {
        label: 'Quotations Prepared',
        value: lo?.proposalsCreated != null ? String(lo.proposalsCreated) : '0',
        trend: 0,
      },
      {
        label: 'Proposals created',
        value: lo?.proposalsCreated != null ? String(lo.proposalsCreated) : '0',
        trend: 0,
      },
      {
        label: 'Orders in progress',
        value: lo?.ordersInProgress != null ? String(lo.ordersInProgress) : '0',
        trend: 0,
      },
      {
        label: 'Terminated Orders',
        value: lo?.terminatedOrders != null ? String(lo.terminatedOrders) : '0',
        trend: 0,
      },
    ]
  }, [analyticsData])

  const ticketingInsights = useMemo(() => {
    const rs = analyticsData?.ratingsSummary
    const vm = analyticsData?.visibilityMetrics
    return [
      {
        label: 'Conversion Rate',
        value:
          vm?.orderCompletionRate?.percentage != null
            ? `${vm.orderCompletionRate.percentage}%`
            : '0%',
        trend: 0,
      },
      {
        label: 'Client Satisfaction',
        value: rs?.available ? `${rs.average}/5` : rs?.count === 0 ? 'No reviews' : 'N/A',
        trend: 0,
      },
      {
        label: 'Revenue Growth Rate',
        value:
          analyticsData?.revenueGrowthRate != null ? `${analyticsData.revenueGrowthRate}%` : '0%',
        trend: 0,
      },
    ]
  }, [analyticsData])

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
            className="ui-manage-metrics h-9"
            onClick={() => navigate('/experts/dashboard/metrics')}
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
              trend={{ percent: item.trend }}
            />
          ))}
        </div>
      </div>

      <div>
        <SectionTitle title="Expert Listings" subtitle="Expert analytics and growth" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {expertListingsMetrics.map((item) => (
            <MetricCard
              key={item.label}
              label={item.label}
              value={item.value}
              trend={{ percent: item.trend }}
            />
          ))}
        </div>
      </div>

      <div>
        <SectionTitle title="Ticketing Insights" subtitle="Communication and interaction metrics" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ticketingInsights.map((item) => (
            <MetricCard
              key={item.label}
              label={item.label}
              value={item.value}
              trend={{ percent: item.trend }}
            />
          ))}
        </div>
      </div>

      <div>
        <SectionTitle title="Behavioral Insights" />
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <AnalyticsCard>
            <p className="text-body-sm mb-4 font-semibold text-white">Most Active Time</p>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={MOST_ACTIVE_TIME}
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
                    formatter={(value) => {
                      const hours = Number(value ?? 0)
                      return [
                        `${Math.floor(hours)}hr ${Math.round((hours % 1) * 60)}m Daily Average`,
                        'Peak',
                      ]
                    }}
                  />
                  <Bar dataKey="hours" radius={[6, 6, 0, 0]}>
                    {MOST_ACTIVE_TIME.map((entry) => (
                      <Cell
                        key={entry.day}
                        fill={entry.day === 'Thu' ? 'var(--brand-accent)' : '#3A3A3A'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </AnalyticsCard>

          <AnalyticsCard>
            <p className="text-body-sm mb-4 font-semibold text-white">Top Views by Location</p>
            <div className="space-y-3">
              {TOP_VIEWS_BY_LOCATION.map((item) => (
                <div key={item.name}>
                  <div className="text-body-sm mb-1 flex items-center justify-between">
                    <span className="text-white">{item.name}</span>
                    <span className="text-muted">{item.percent}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-black">
                    <div
                      className="bg-brand-accent h-full rounded-full"
                      style={{ width: `${item.percent * 3}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </AnalyticsCard>

          <AnalyticsCard>
            <p className="text-body-sm mb-4 font-semibold text-white">Top Views by Role</p>
            <div className="space-y-3">
              {TOP_VIEWS_BY_ROLE.map((item) => (
                <div key={item.name}>
                  <div className="text-body-sm mb-1 flex items-center justify-between">
                    <span className="text-white">{item.name}</span>
                    <span className="text-muted">{item.percent}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-black">
                    <div
                      className="bg-brand-action h-full rounded-full"
                      style={{ width: `${item.percent * 2.5}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </AnalyticsCard>

          <AnalyticsCard>
            <p className="text-body-sm mb-4 font-semibold text-white">Conversion Funnel</p>
            <div className="flex flex-col items-center gap-1.5 py-2">
              {CONVERSION_FUNNEL.map((stage, index) => {
                const widthPercent = 100 - index * 14
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
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={REVENUE_GROWTH_TREND}
                margin={{ left: 0, right: 8, top: 8, bottom: 0 }}
              >
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
        </AnalyticsCard>
      </div>
    </div>
  )
}
