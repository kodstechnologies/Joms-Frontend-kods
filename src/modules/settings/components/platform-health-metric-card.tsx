import { Check, Clock3, TrendingDown, TrendingUp } from 'lucide-react'

import type { PlatformHealthMetric } from '@/modules/settings/types/platform-health'
import { cn } from '@/shared/lib/cn'

const METRIC_CARD_CLASS =
  'rounded-brand-lg bg-brand-surface flex h-[130px] w-full max-w-[280px] flex-col border border-white/[0.06] p-4 transition-colors hover:border-white/10'

export function PlatformHealthMetricCard({ metric }: { metric: PlatformHealthMetric }) {
  const trend = metric.trend
  const isAbsoluteTrend = trend?.variant === 'absolute'
  const isUp = trend?.direction === 'up'
  const showClock = isAbsoluteTrend && (trend?.value.includes('hr') || trend?.value.includes('min'))

  return (
    <div className={METRIC_CARD_CLASS}>
      <p className="text-body-sm text-muted truncate font-medium">{metric.label}</p>
      <p className="text-h2 text-brand-text mt-2 truncate font-bold tracking-tight">
        {metric.value}
      </p>
      <div className="mt-auto flex min-h-[33px] flex-wrap items-center gap-2 pt-2">
        {metric.status ? (
          <p className="text-muted inline-flex items-center gap-1.5 text-[10px]">
            <Check className="text-brand-text size-3.5 shrink-0" />
            <span className="truncate">{metric.status}</span>
          </p>
        ) : null}
        {!metric.status && metric.hint ? (
          <p className="text-muted truncate text-[10px]">{metric.hint}</p>
        ) : null}
        {trend ? (
          <>
            <span
              className={cn(
                'inline-flex h-[33px] shrink-0 items-center gap-1 rounded-md px-1.5 text-[10px] font-bold',
                trend.tone === 'positive'
                  ? 'bg-brand-positive/15 text-brand-positive'
                  : 'bg-brand-danger/10 text-brand-danger',
              )}
            >
              {showClock ? (
                <Clock3 className="size-3" strokeWidth={2.5} />
              ) : isUp ? (
                <TrendingUp className="size-3" strokeWidth={2.5} />
              ) : (
                <TrendingDown className="size-3" strokeWidth={2.5} />
              )}
              {trend.value}
            </span>
            <span className="text-muted truncate text-[10px]">
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
      <div className="h-3.5 w-28 rounded bg-white/10" />
      <div className="mt-3 h-8 w-24 rounded bg-white/10" />
      <div className="mt-auto flex items-center gap-2 pt-2">
        <div className="h-[33px] w-14 rounded-md bg-white/10" />
        <div className="h-3 w-20 rounded bg-white/5" />
      </div>
    </div>
  )
}
