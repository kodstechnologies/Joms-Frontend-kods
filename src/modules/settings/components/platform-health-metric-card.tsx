import { Check, Clock3 } from 'lucide-react'

import type { PlatformHealthMetric } from '@/modules/settings/types/platform-health'
import { TrendBadge } from '@/shared/components/dashboard/trend-badge'
import { cn } from '@/shared/lib/cn'

const METRIC_CARD_CLASS =
  'flex h-[130px] w-full max-w-[280px] min-w-0 flex-col rounded-[10px] bg-[#141414] p-4 transition-colors hover:bg-[#1a1a1a]'

export function PlatformHealthMetricCard({ metric }: { metric: PlatformHealthMetric }) {
  const trend = metric.trend
  const isAbsoluteTrend = trend?.variant === 'absolute'
  const showClock = isAbsoluteTrend && (trend?.value.includes('hr') || trend?.value.includes('min'))

  return (
    <div className={METRIC_CARD_CLASS}>
      <p className="truncate text-[14px] leading-5 font-medium tracking-normal text-white/50">
        {metric.label}
      </p>
      <p className="mt-2 truncate text-[20px] leading-5 font-semibold tracking-normal text-white">
        {metric.value}
      </p>
      <div className="mt-auto flex min-h-[33px] flex-wrap items-center gap-2 pt-2">
        {metric.status ? (
          <p className="inline-flex items-center gap-1.5 truncate text-[14px] leading-5 font-medium tracking-normal text-white/50">
            <Check className="size-3.5 shrink-0 text-white" />
            <span className="truncate">{metric.status}</span>
          </p>
        ) : null}
        {!metric.status && metric.hint ? (
          <p className="truncate text-[14px] leading-5 font-medium tracking-normal text-white/50">
            {metric.hint}
          </p>
        ) : null}
        {trend ? (
          <>
            <TrendBadge
              tone={trend.tone === 'positive' ? 'positive' : 'danger'}
              direction={trend.direction}
              icon={
                showClock ? (
                  <Clock3 className="size-4 shrink-0" strokeWidth={2} aria-hidden="true" />
                ) : undefined
              }
            >
              {trend.value}
            </TrendBadge>
            <span className="truncate text-[14px] leading-5 font-medium tracking-normal text-white/50">
              {trend.label ?? 'vs last month'}
            </span>
          </>
        ) : null}
      </div>
    </div>
  )
}

export function PlatformHealthMetricCardSkeleton() {
  return (
    <div className={cn(METRIC_CARD_CLASS, 'animate-pulse')}>
      <div className="h-5 w-28 rounded bg-white/10" />
      <div className="mt-3 h-8 w-24 rounded bg-white/10" />
      <div className="mt-auto flex items-center gap-2 pt-2">
        <div className="h-[33px] w-[69px] rounded-[10px] bg-white/10" />
        <div className="h-3 w-20 rounded bg-white/5" />
      </div>
    </div>
  )
}
