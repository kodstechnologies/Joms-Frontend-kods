import { useState } from 'react'

import {
  REVENUE_BREAKDOWN,
  REVENUE_KPIS,
  TOP_REVENUE_SPACES,
} from '../../mock/venue-profile-analytics.mock'
import { AnalyticsCard, MetricCard, PeriodSelect, SectionTitle } from './analytics-ui'

export function RevenueTab() {
  const [period, setPeriod] = useState('Today')

  return (
    <div className="flex flex-col gap-5">
      <PeriodSelect
        value={period}
        options={['Today', 'This Week', 'This Month', 'This Year']}
        onChange={setPeriod}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {REVENUE_KPIS.map((item) => (
          <MetricCard key={item.label} label={item.label} value={item.value} trend={item.trend} />
        ))}
      </div>

      <div>
        <SectionTitle title="Revenue Breakdown" />
        <AnalyticsCard>
          <div className="space-y-5">
            {REVENUE_BREAKDOWN.map((item) => (
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
        </AnalyticsCard>
      </div>

      <div>
        <SectionTitle title="Top Revenue Spaces" />
        <AnalyticsCard>
          <div className="space-y-4">
            {TOP_REVENUE_SPACES.map((space) => (
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
        </AnalyticsCard>
      </div>
    </div>
  )
}
