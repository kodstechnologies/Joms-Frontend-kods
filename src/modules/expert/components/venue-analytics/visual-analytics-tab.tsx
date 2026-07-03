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
import { RefreshCw } from 'lucide-react'

import {
  BOOKING_CATEGORY_SPLIT,
  BOOKING_FUNNEL,
  BOOKINGS_TREND,
  REVENUE_TREND,
} from '../../mock/venue-profile-analytics.mock'
import { AnalyticsCard, CHART_TOOLTIP, PeriodSelect, SectionTitle } from './analytics-ui'

export function VisualAnalyticsTab() {
  const [revenuePeriod, setRevenuePeriod] = useState('This Week')
  const [bookingsPeriod, setBookingsPeriod] = useState('This Month')

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
            <button type="button" className="rounded-lg p-2 text-white hover:bg-white/5">
              <RefreshCw className="size-4" />
            </button>
          </div>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={REVENUE_TREND} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
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
                  <span style={{ color: '#999' }}>{value === 'events' ? 'Events' : 'Meet Ups'}</span>
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
        </div>
      </AnalyticsCard>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <AnalyticsCard>
          <SectionTitle title="Booking Category Split" subtitle="Distribution by category" />
          <div className="space-y-3">
            {BOOKING_FUNNEL.map((stage, index) => (
              <div key={stage.stage}>
                <div className="mb-1 flex items-center justify-between text-[11px]">
                  <span className="text-white">{stage.stage}</span>
                  <span className="text-[#999]">
                    {stage.value.toLocaleString('en-IN')} ({stage.conversion})
                  </span>
                </div>
                <div
                  className="h-8 rounded-md bg-[#FBC078]"
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
        </AnalyticsCard>

        <AnalyticsCard>
          <SectionTitle title="Booking Category Split" subtitle="Distribution by category" />
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip contentStyle={CHART_TOOLTIP} />
                <Pie
                  data={BOOKING_CATEGORY_SPLIT}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={85}
                  stroke="rgba(255,255,255,0.08)"
                >
                  <Cell fill="#FBC078" />
                  <Cell fill="#C4956A" />
                </Pie>
                <Legend
                  verticalAlign="middle"
                  align="right"
                  layout="vertical"
                  wrapperStyle={{ fontSize: 11, color: '#999' }}
                />
              </PieChart>
            </ResponsiveContainer>
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
            <button type="button" className="rounded-lg p-2 text-white hover:bg-white/5">
              <RefreshCw className="size-4" />
            </button>
          </div>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={BOOKINGS_TREND} barGap={4} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
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
                  <span style={{ color: '#999' }}>{value === 'events' ? 'Events' : 'Meet Ups'}</span>
                )}
              />
              <Bar dataKey="events" fill="#FBC078" radius={[4, 4, 0, 0]} name="events" />
              <Bar dataKey="meetups" fill="#1A73E8" radius={[4, 4, 0, 0]} name="meetups" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </AnalyticsCard>
    </div>
  )
}
