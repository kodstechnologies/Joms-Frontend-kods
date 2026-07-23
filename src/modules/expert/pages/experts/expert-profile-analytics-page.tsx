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

import { useExpertProfile } from '../../hooks/use-expert-profile'
import {
  CONVERSION_FUNNEL,
  EXPERT_ANALYTICS_PROFILE,
  EXPERT_LISTINGS_METRICS,
  MOST_ACTIVE_TIME,
  REVENUE_GROWTH_TREND,
  TICKETING_INSIGHTS,
  TOP_VIEWS_BY_LOCATION,
  TOP_VIEWS_BY_ROLE,
  VISIBILITY_METRICS,
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

  const profile = useMemo(() => {
    const name = expert?.fullname || EXPERT_ANALYTICS_PROFILE.name
    const profession =
      expert?.basicProfile?.industry ||
      expert?.basicProfile?.serviceCategory?.[0] ||
      EXPERT_ANALYTICS_PROFILE.profession
    const avatarUrl = expert?.basicProfile?.profileImage || EXPERT_ANALYTICS_PROFILE.avatarUrl

    const accountStatus = expert?.isDeactivated
      ? 'Inactive'
      : expert?.isBlocked
        ? 'Blocked'
        : 'Active'

    return {
      name,
      profession,
      avatarUrl,
      role: EXPERT_ANALYTICS_PROFILE.role,
      rating: EXPERT_ANALYTICS_PROFILE.rating,
      badge: EXPERT_ANALYTICS_PROFILE.badge,
      accountStatus,
      lastActive: expert?.updatedAt
        ? new Date(expert.updatedAt).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
          })
        : EXPERT_ANALYTICS_PROFILE.lastActive,
      servicesListed: EXPERT_ANALYTICS_PROFILE.servicesListed,
      consultationsListed: EXPERT_ANALYTICS_PROFILE.consultationsListed,
      ordersCompleted: EXPERT_ANALYTICS_PROFILE.ordersCompleted,
      revenue: EXPERT_ANALYTICS_PROFILE.revenue,
    }
  }, [expert])

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
          {VISIBILITY_METRICS.map((item) => (
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
          {EXPERT_LISTINGS_METRICS.map((item) => (
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
          {TICKETING_INSIGHTS.map((item) => (
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
