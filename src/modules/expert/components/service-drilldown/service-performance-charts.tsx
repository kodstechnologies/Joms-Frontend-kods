import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { AnalyticsCard, SectionTitle } from '../venue-analytics/analytics-ui'
import { CHART_TOOLTIP } from '../venue-analytics/analytics-constants'
import type { ServicePerformance } from '../../type/service-drilldown'
import { ShimmerBlock } from './drilldown-primitives'
import { titleCase } from './drilldown-format'

const ACCENT = 'var(--brand-action)'

const FUNNEL_COLORS = [
  'var(--brand-action)',
  'color-mix(in srgb, var(--brand-action) 80%, white)',
  'color-mix(in srgb, var(--brand-action) 60%, white)',
  'color-mix(in srgb, var(--brand-action) 40%, white)',
]

const axisProps = {
  stroke: 'rgba(255,255,255,0.25)',
  tick: { fill: 'rgba(255,255,255,0.45)', fontSize: 10 },
  tickLine: false,
  axisLine: false,
} as const

function ChartFrame({
  title,
  subtitle,
  isEmpty,
  emptyMessage,
  children,
}: {
  title: string
  subtitle?: string
  isEmpty: boolean
  emptyMessage: string
  children: React.ReactNode
}) {
  return (
    <AnalyticsCard>
      <SectionTitle title={title} subtitle={subtitle} />
      {isEmpty ? (
        <div className="text-muted flex h-56 items-center justify-center px-6 text-center text-sm">
          {emptyMessage}
        </div>
      ) : (
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            {children as React.ReactElement}
          </ResponsiveContainer>
        </div>
      )}
    </AnalyticsCard>
  )
}

export function ServicePerformanceCharts({
  performance,
  isLoading,
}: {
  performance?: ServicePerformance
  isLoading: boolean
}) {
  if (isLoading || !performance) {
    return (
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <ShimmerBlock key={`chart-skeleton-${index}`} className="h-72 w-full" />
        ))}
      </div>
    )
  }

  const { charts } = performance

  const statusData = charts.orderStatusDistribution.data.map((row) => ({
    ...row,
    label: titleCase(row.status),
  }))

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
      <ChartFrame
        title="Revenue Trend"
        subtitle="Net revenue from successful, non-refunded payments"
        isEmpty={charts.revenueTrend.data.length === 0}
        emptyMessage={charts.revenueTrend.reason || 'No revenue recorded for this service yet.'}
      >
        <AreaChart data={charts.revenueTrend.data}>
          <defs>
            <linearGradient id="service-revenue-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={ACCENT} stopOpacity={0.45} />
              <stop offset="100%" stopColor={ACCENT} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis dataKey="month" {...axisProps} />
          <YAxis {...axisProps} width={56} />
          <Tooltip contentStyle={CHART_TOOLTIP} cursor={{ stroke: 'rgba(255,255,255,0.15)' }} />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke={ACCENT}
            strokeWidth={2}
            fill="url(#service-revenue-fill)"
          />
        </AreaChart>
      </ChartFrame>

      <ChartFrame
        title="Orders Trend"
        subtitle="Orders placed, completed and terminated per month"
        isEmpty={charts.ordersTrend.data.length === 0}
        emptyMessage="No orders placed for this service yet."
      >
        <LineChart data={charts.ordersTrend.data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis dataKey="month" {...axisProps} />
          <YAxis {...axisProps} width={36} allowDecimals={false} />
          <Tooltip contentStyle={CHART_TOOLTIP} />
          <Line type="monotone" dataKey="total" stroke={ACCENT} strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="completed" stroke="#4ADE80" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="terminated" stroke="#F87171" strokeWidth={2} dot={false} />
        </LineChart>
      </ChartFrame>

      <ChartFrame
        title="Order Status Distribution"
        isEmpty={statusData.length === 0}
        emptyMessage="No orders to break down yet."
      >
        <BarChart data={statusData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis dataKey="label" {...axisProps} />
          <YAxis {...axisProps} width={36} allowDecimals={false} />
          <Tooltip contentStyle={CHART_TOOLTIP} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
          <Bar dataKey="count" radius={[6, 6, 0, 0]} fill={ACCENT} />
        </BarChart>
      </ChartFrame>

      <ChartFrame
        title="Booking Conversion"
        subtitle="Funnel from first contact to a paid engagement"
        isEmpty={charts.bookingConversionFunnel.data.length === 0}
        emptyMessage="Not enough activity to build a funnel."
      >
        <BarChart data={charts.bookingConversionFunnel.data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
          <XAxis type="number" {...axisProps} allowDecimals={false} />
          <YAxis type="category" dataKey="stage" {...axisProps} width={120} />
          <Tooltip contentStyle={CHART_TOOLTIP} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
          <Bar dataKey="count" radius={[0, 6, 6, 0]}>
            {charts.bookingConversionFunnel.data.map((row, index) => (
              <Cell key={row.stage} fill={FUNNEL_COLORS[index % FUNNEL_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ChartFrame>

      <ChartFrame
        title="Ratings Distribution"
        isEmpty={charts.ratingsDistribution.data.every((row) => row.count === 0)}
        emptyMessage="No reviews submitted for this service yet."
      >
        <BarChart data={charts.ratingsDistribution.data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis dataKey="stars" {...axisProps} tickFormatter={(value) => `${value}★`} />
          <YAxis {...axisProps} width={36} allowDecimals={false} />
          <Tooltip contentStyle={CHART_TOOLTIP} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
          <Bar dataKey="count" radius={[6, 6, 0, 0]} fill={ACCENT} />
        </BarChart>
      </ChartFrame>

      <ChartFrame
        title="Refund Trend"
        isEmpty={charts.refundTrend.data.length === 0}
        emptyMessage="No refunds processed for this service."
      >
        <BarChart data={charts.refundTrend.data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis dataKey="month" {...axisProps} />
          <YAxis {...axisProps} width={56} />
          <Tooltip contentStyle={CHART_TOOLTIP} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
          <Bar dataKey="amount" radius={[6, 6, 0, 0]} fill="#F87171" />
        </BarChart>
      </ChartFrame>

      <ChartFrame
        title="Source Distribution"
        isEmpty
        emptyMessage={charts.sourceDistribution.reason || 'Order source is not captured yet.'}
      >
        <div />
      </ChartFrame>

      <ChartFrame
        title="Top Client Locations"
        isEmpty
        emptyMessage={charts.topClientLocations.reason || 'Client location is not captured yet.'}
      >
        <div />
      </ChartFrame>
    </div>
  )
}
