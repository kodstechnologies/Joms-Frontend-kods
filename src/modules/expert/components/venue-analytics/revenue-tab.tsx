import { useState } from 'react'

import {
  AnalyticsCard,
  MetricCard,
  MetricCardSkeleton,
  PeriodSelect,
  SectionTitle,
} from './analytics-ui'
import type { VenueProfileAnalyticsResponse } from '../../type/venue-analytics.types'

interface RevenueTabProps {
  data?: VenueProfileAnalyticsResponse['revenue']
  isLoading?: boolean
}

export function RevenueTab({ data, isLoading }: RevenueTabProps) {
  const [period, setPeriod] = useState('Today')

  const revenueKpis = data?.revenueKpis ?? []
  const revenueBreakdown = data?.revenueBreakdown ?? []
  const topRevenueSpaces = data?.topRevenueSpaces ?? []

  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-end">
        <PeriodSelect
          value={period}
          options={['Today', 'This Week', 'This Month', 'This Year']}
          onChange={setPeriod}
          className="max-w-[110px]"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? Array.from({ length: 6 }).map((_, index) => (
              <MetricCardSkeleton key={`revenue-kpi-skeleton-${index}`} />
            ))
          : revenueKpis.map((item) => (
              <MetricCard
                key={item.label}
                label={item.label}
                value={item.value}
                trend={item.trend}
              />
            ))}
      </div>

      <div>
        <SectionTitle title="Revenue Breakdown" />
        <AnalyticsCard>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 2 }).map((_, index) => (
                <div
                  key={`breakdown-skeleton-${index}`}
                  className="h-8 animate-pulse rounded bg-white/5"
                />
              ))}
            </div>
          ) : revenueBreakdown.length === 0 ? (
            <div className="text-muted text-center text-sm">No revenue data available.</div>
          ) : (
            <div className="space-y-5">
              {revenueBreakdown.map((item) => (
                <div key={item.label}>
                  <div className="mb-2 flex items-center justify-between text-[12px]">
                    <span className="text-white">{item.label}</span>
                    <span className="text-[#999]">
                      ₹{item.value.toLocaleString('en-IN')} ({item.percent}%)
                    </span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-black">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${item.percent}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </AnalyticsCard>
      </div>

      <div>
        <SectionTitle title="Top Revenue Spaces" />
        <AnalyticsCard>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={`top-space-skeleton-${index}`}
                  className="h-10 animate-pulse rounded bg-white/5"
                />
              ))}
            </div>
          ) : topRevenueSpaces.length === 0 ? (
            <div className="text-muted text-center text-sm">No top revenue spaces yet.</div>
          ) : (
            <div className="space-y-4">
              {topRevenueSpaces.map((space) => (
                <div
                  key={space.rank}
                  className="flex items-center justify-between border-b border-white/5 pb-4 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="text-[13px] font-semibold text-white">
                      #{space.rank} {space.name}
                    </p>
                    <p className="mt-0.5 text-[11px] text-[#777]">{space.share}</p>
                  </div>
                  <span className="text-[13px] font-semibold text-white">{space.revenue}</span>
                </div>
              ))}
            </div>
          )}
        </AnalyticsCard>
      </div>
    </div>
  )
}
