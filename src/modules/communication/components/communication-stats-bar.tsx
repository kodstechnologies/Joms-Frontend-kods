import { formatTrendPercent, TrendBadge } from '@/shared/components/dashboard/trend-badge'
import { StatCardSkeleton } from '@/shared/components/ui/skeleton'
import { cn } from '@/shared/lib/cn'

import type { CommunicationMetricCardView } from '../utils/communication-metrics'

const TEXT_VALUE_METRIC_IDS = new Set([
  'most-used-channel',
  'most-engaged-audience',
  'top-performing-campaign',
])

const INVERT_TREND_METRIC_IDS = new Set([
  'failed-undelivered',
  'withdrawn-communications',
  'bounce-rate',
])

function CommunicationMetricCard({ metric }: { metric: CommunicationMetricCardView }) {
  const trend = metric.trend
  const isUp = trend?.direction === 'up'
  const invertTrend = INVERT_TREND_METRIC_IDS.has(metric.id)
  const isPositive = invertTrend ? !isUp : isUp
  const isTextValue = TEXT_VALUE_METRIC_IDS.has(metric.id)

  return (
    <div className="rounded-brand-lg bg-brand-surface flex min-h-[130px] flex-col border border-white/[0.06] p-4 transition-colors hover:border-white/10">
      <p className="text-body-sm text-muted truncate font-medium">{metric.title}</p>
      <div className="mt-2 flex min-w-0 flex-wrap items-baseline gap-2">
        <p
          className={cn(
            'font-bold tracking-tight text-white',
            isTextValue
              ? 'text-body-sm line-clamp-2 leading-snug font-semibold'
              : 'text-h3 truncate',
          )}
        >
          {metric.value}
        </p>
        {metric.hint ? (
          <span className="text-muted truncate text-[10px]">{metric.hint}</span>
        ) : null}
      </div>
      <div className="mt-auto flex items-center gap-2 pt-3">
        {trend ? (
          <>
            <TrendBadge tone={isPositive ? 'positive' : 'danger'} direction={isUp ? 'up' : 'down'}>
              {formatTrendPercent(trend.percentage, isUp ? 'up' : 'down')}
            </TrendBadge>
            <span className="text-muted truncate text-[10px]">
              {trend.label ?? 'vs last month'}
            </span>
          </>
        ) : null}
      </div>
    </div>
  )
}

export function CommunicationStatsBar({
  metrics,
  isLoading,
  skeletonIds,
}: {
  metrics: CommunicationMetricCardView[]
  isLoading: boolean
  skeletonIds: string[]
}) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
      {isLoading
        ? skeletonIds.map((id) => <StatCardSkeleton key={id} />)
        : metrics.map((metric) => <CommunicationMetricCard key={metric.id} metric={metric} />)}
    </div>
  )
}
