import { useState } from 'react'

import {
  BASIC_INFO,
  BOOKING_SNAPSHOT,
  REVENUE_SNAPSHOT,
  VISIBILITY_METRICS,
} from '../../mock/venue-profile-analytics.mock'
import { AnalyticsCard, MetricCard, PeriodSelect, SectionTitle } from './analytics-ui'

export function OverviewTab() {
  const [period, setPeriod] = useState('Last 7 Days')

  return (
    <div className="flex flex-col gap-5">
      <AnalyticsCard className="p-0">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg bg-white/5 sm:grid-cols-3 lg:grid-cols-5">
          {BASIC_INFO.map((item) => (
            <div key={item.label} className="bg-[#111111] px-5 py-4">
              <p className="text-[10px] text-[#777]">{item.label}</p>
              <p className="mt-2 text-[13px] font-semibold text-white">{item.value}</p>
            </div>
          ))}
        </div>
      </AnalyticsCard>

      <div>
        <SectionTitle
          title="Visibility Metrics"
          subtitle={period}
          action={<PeriodSelect value={period} onChange={setPeriod} />}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {VISIBILITY_METRICS.map((item) => (
            <MetricCard key={item.label} label={item.label} value={item.value} trend={item.trend} />
          ))}
        </div>
      </div>

      <div>
        <SectionTitle title="Booking Snapshot" subtitle="Venue booking analysis" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {BOOKING_SNAPSHOT.map((item) => (
            <MetricCard key={item.label} label={item.label} value={item.value} trend={item.trend} />
          ))}
        </div>
      </div>

      <div>
        <SectionTitle title="Revenue Snapshot" subtitle="Communication and interaction metrics" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {REVENUE_SNAPSHOT.map((item) => (
            <MetricCard key={item.label} label={item.label} value={item.value} trend={item.trend} />
          ))}
        </div>
      </div>
    </div>
  )
}
