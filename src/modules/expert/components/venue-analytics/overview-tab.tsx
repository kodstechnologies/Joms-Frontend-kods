import { useState } from 'react'

import {
  AnalyticsCard,
  MetricCard,
  MetricCardSkeleton,
  PeriodSelect,
  SectionTitle,
} from './analytics-ui'
import type { VenueProfileAnalyticsResponse } from '../../type/venue-analytics.types'

interface OverviewTabProps {
  data?: VenueProfileAnalyticsResponse['overview']
  isLoading?: boolean
}

const EMPTY_BASIC = [
  { label: 'Account Status', value: '—' },
  { label: 'Last Active', value: '—' },
  { label: 'Venue Rating', value: '0/5.0' },
  { label: 'Venue Category', value: '—' },
  { label: 'Customer Satisfaction Score', value: '0%' },
]

export function OverviewTab({ data, isLoading }: OverviewTabProps) {
  const [period, setPeriod] = useState('Last 7 Days')

  const basicInfo = data?.basicInfo?.length ? data.basicInfo : EMPTY_BASIC
  const visibilityMetrics = data?.visibilityMetrics ?? []
  const bookingSnapshot = data?.bookingSnapshot ?? []
  const revenueSnapshot = data?.revenueSnapshot ?? []

  return (
    <div className="flex flex-col gap-5">
      <AnalyticsCard className="p-0">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg bg-white/5 sm:grid-cols-3 lg:grid-cols-5">
          {isLoading
            ? Array.from({ length: 5 }).map((_, index) => (
                <div key={`basic-skeleton-${index}`} className="bg-[#111111] px-5 py-4">
                  <div className="h-3 w-20 animate-pulse rounded bg-white/10" />
                  <div className="mt-2 h-4 w-24 animate-pulse rounded bg-white/10" />
                </div>
              ))
            : basicInfo.map((item) => (
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
          {isLoading
            ? Array.from({ length: 3 }).map((_, index) => (
                <MetricCardSkeleton key={`visibility-skeleton-${index}`} />
              ))
            : visibilityMetrics.map((item) => (
                <MetricCard
                  key={item.label}
                  label={item.label}
                  value={item.value}
                  trend={item.trend}
                />
              ))}
          {!isLoading && visibilityMetrics.length === 0 ? (
            <p className="text-muted col-span-full text-sm">No visibility data available.</p>
          ) : null}
        </div>
      </div>

      <div>
        <SectionTitle title="Booking Snapshot" subtitle="Venue booking analysis" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading
            ? Array.from({ length: 7 }).map((_, index) => (
                <MetricCardSkeleton key={`booking-skeleton-${index}`} />
              ))
            : bookingSnapshot.map((item) => (
                <MetricCard
                  key={item.label}
                  label={item.label}
                  value={item.value}
                  trend={item.trend}
                />
              ))}
        </div>
      </div>

      <div>
        <SectionTitle title="Revenue Snapshot" subtitle="Communication and interaction metrics" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading
            ? Array.from({ length: 4 }).map((_, index) => (
                <MetricCardSkeleton key={`revenue-skeleton-${index}`} />
              ))
            : revenueSnapshot.map((item) => (
                <MetricCard
                  key={item.label}
                  label={item.label}
                  value={item.value}
                  trend={item.trend}
                />
              ))}
        </div>
      </div>
    </div>
  )
}
