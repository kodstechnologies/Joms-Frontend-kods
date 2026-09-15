import { useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { RotateCw } from 'lucide-react'

import { AnalyticsCard, PeriodSelect, SectionTitle } from './analytics-ui'
import { CHART_TOOLTIP } from './analytics-constants'
import type {
  RevenueTrendPoint,
  VenueProfileAnalyticsResponse,
} from '../../type/venue-analytics.types'

interface VisualAnalyticsTabProps {
  data?: VenueProfileAnalyticsResponse['visual']
  revenueTrend?: RevenueTrendPoint[]
  isLoading?: boolean
  onRefresh?: () => void
}

const EMPTY_CHART = (
  <div className="text-muted flex h-56 items-center justify-center text-sm">No data available.</div>
)

export function VisualAnalyticsTab({
  data,
  revenueTrend,
  isLoading,
  onRefresh,
}: VisualAnalyticsTabProps) {
  const [revenuePeriod, setRevenuePeriod] = useState('This Week')
  const [bookingsPeriod, setBookingsPeriod] = useState('This Month')

  const effectiveRevenueTrend = revenueTrend ?? []
  const bookingFunnel = data?.bookingFunnel ?? []
  const categorySplit = data?.bookingCategorySplit ?? []
  const bookingsTrend = data?.bookingsTrend ?? []

  return (
    <div className="flex flex-col gap-5">
      <AnalyticsCard>
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <SectionTitle
            title="Revenue Trend"
            subtitle="Revenue comparison between Events and Meetups"
          />
          <div className="flex items-center gap-2">
            <PeriodSelect
              value={revenuePeriod}
              options={['This Week', 'This Month', 'This Year']}
              onChange={setRevenuePeriod}
            />
            <button
              type="button"
              onClick={onRefresh}
              aria-label="Refresh trends"
              className="rounded-lg p-2 text-white hover:bg-white/5"
            >
              <RotateCw className={`size-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
        <div className="h-72">
          {isLoading ? (
            <div className="h-full w-full animate-pulse rounded-lg bg-white/5" />
          ) : effectiveRevenueTrend.length === 0 ? (
            EMPTY_CHART
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={effectiveRevenueTrend}
                margin={{ left: 0, right: 8, top: 8, bottom: 0 }}
              >
                <CartesianGrid stroke="#2a2a2a" strokeDasharray="4 4" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#999', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis tick={{ fill: '#999', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={CHART_TOOLTIP} />
                <Legend
                  wrapperStyle={{ fontSize: 11, color: '#999' }}
                  formatter={(value) => (
                    <span style={{ color: '#999' }}>
                      {value === 'events' ? 'Events' : 'Meet Ups'}
                    </span>
                  )}
                />
                <Line
                  type="monotone"
                  dataKey="events"
                  stroke="#1A73E8"
                  strokeWidth={2}
                  dot={false}
                  name="events"
                />
                <Line
                  type="monotone"
                  dataKey="meetups"
                  stroke="#34A853"
                  strokeWidth={2}
                  dot={false}
                  name="meetups"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </AnalyticsCard>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <AnalyticsCard>
          <SectionTitle
            title="Booking Conversion Funnel"
            subtitle="Booking Requests >> Completed"
          />
          {isLoading ? (
            <div className="mt-3 space-y-3">
              {Array.from({ length: 2 }).map((_, index) => (
                <div
                  key={`funnel-skeleton-${index}`}
                  className="h-8 animate-pulse rounded bg-white/5"
                />
              ))}
            </div>
          ) : bookingFunnel.length === 0 ? (
            EMPTY_CHART
          ) : (
            <div className="mt-3 space-y-3">
              {bookingFunnel.map((stage, index) => (
                <div key={stage.stage}>
                  <div className="mb-1 flex items-center justify-between text-[11px]">
                    <span className="text-white">{stage.stage}</span>
                    <span className="text-[#999]">
                      {stage.value.toLocaleString('en-IN')} ({stage.conversion})
                    </span>
                  </div>
                  <div
                    className="bg-brand-accent h-8 rounded-md"
                    style={{
                      width: `${100 - index * 28}%`,
                      minWidth: '40%',
                    }}
                  />
                  {stage.dropOff ? (
                    <p className="mt-1 text-center text-[10px] text-red-400">{stage.dropOff}</p>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </AnalyticsCard>

        <AnalyticsCard>
          <SectionTitle title="Booking Category Split" subtitle="Distribution by category" />
          <div className="h-56">
            {isLoading ? (
              <div className="h-full w-full animate-pulse rounded-lg bg-white/5" />
            ) : categorySplit.length === 0 ? (
              EMPTY_CHART
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip contentStyle={CHART_TOOLTIP} />
                  <Pie
                    data={categorySplit}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={85}
                    stroke="rgba(255,255,255,0.08)"
                  >
                    <Cell fill="var(--brand-accent)" />
                    <Cell fill="#1A73E8" />
                  </Pie>
                  <Legend
                    verticalAlign="middle"
                    align="right"
                    layout="vertical"
                    wrapperStyle={{ fontSize: 11, color: '#999' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </AnalyticsCard>
      </div>

      <AnalyticsCard>
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <SectionTitle title="Bookings Trend" subtitle="Weekly booking volume comparison" />
          <div className="flex items-center gap-2">
            <PeriodSelect
              value={bookingsPeriod}
              options={['This Week', 'This Month', 'This Year']}
              onChange={setBookingsPeriod}
            />
            <button
              type="button"
              onClick={onRefresh}
              aria-label="Refresh bookings trend"
              className="rounded-lg p-2 text-white hover:bg-white/5"
            >
              <RotateCw className={`size-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
        <div className="h-72">
          {isLoading ? (
            <div className="h-full w-full animate-pulse rounded-lg bg-white/5" />
          ) : bookingsTrend.length === 0 ? (
            EMPTY_CHART
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={bookingsTrend}
                barGap={4}
                margin={{ left: 0, right: 8, top: 8, bottom: 0 }}
              >
                <CartesianGrid stroke="#2a2a2a" strokeDasharray="4 4" />
                <XAxis
                  dataKey="week"
                  tick={{ fill: '#999', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis tick={{ fill: '#999', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={CHART_TOOLTIP} />
                <Legend
                  wrapperStyle={{ fontSize: 11, color: '#999' }}
                  formatter={(value) => (
                    <span style={{ color: '#999' }}>
                      {value === 'events' ? 'Events' : 'Meet Ups'}
                    </span>
                  )}
                />
                <Bar
                  dataKey="events"
                  fill="var(--brand-accent)"
                  radius={[4, 4, 0, 0]}
                  name="events"
                />
                <Bar dataKey="meetups" fill="#1A73E8" radius={[4, 4, 0, 0]} name="meetups" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </AnalyticsCard>
    </div>
  )
}
