import { TrendingDown, TrendingUp } from 'lucide-react'

import type { ReferralMetrics } from '../types/referral'
import {
  formatReferralMetricValue,
  mergeReferralMetrics,
  REFERRAL_METRIC_DEFINITIONS,
} from '../utils/referral-metrics-definitions'
import { cn } from '@/shared/lib/cn'

type ReferralStatsBarProps = {
  metrics?: Partial<ReferralMetrics> | null
  isLoading?: boolean
  activeMetricIds?: string[]
}

type MetricCardData = {
  id: string
  label: string
  description: string
  value: string
  isTextValue: boolean
  trendPercent: number
  trendDirection?: 'up' | 'down'
  trendLabel?: string
}

function buildMetricCards(metrics: ReferralMetrics, activeMetricIds?: string[]): MetricCardData[] {
  const cards = REFERRAL_METRIC_DEFINITIONS.map((def) => {
    const trendObj = metrics.trends?.[def.key]
    const trendPercent =
      trendObj?.percentage ??
      (typeof metrics.vsLastMonthPercent === 'number' ? metrics.vsLastMonthPercent : 0)
    const trendDirection = trendObj?.direction ?? 'up'
    const trendLabel = trendObj?.label ?? 'vs last month'
    const raw = metrics[def.key]

    return {
      id: def.id,
      label: def.label,
      description: def.description,
      value: formatReferralMetricValue(def.format, raw, {
        appendDays: def.id === 'avg-days-to-goal',
      }),
      isTextValue: def.format === 'string',
      trendPercent,
      trendDirection,
      trendLabel,
    }
  })

  if (!activeMetricIds?.length) return cards

  const byId = new Map(cards.map((card) => [card.id, card]))
  return activeMetricIds.map((id) => byId.get(id)).filter(Boolean) as MetricCardData[]
}

function ReferralMetricCard({ metric }: { metric: MetricCardData }) {
  const isUp = metric.trendDirection !== 'down'

  return (
    <div
      className="referral-stats-card flex flex-col p-4 transition-colors"
      title={metric.description}
    >
      <p className="referral-stats-label">{metric.label}</p>
      <p
        className={cn(
          'referral-stats-value mt-2',
          metric.isTextValue && 'referral-stats-value--text',
        )}
      >
        {metric.value}
      </p>
      <div className="mt-auto flex items-center gap-2 pt-3">
        <span
          className={cn(
            'referral-stats-trend-badge inline-flex items-center gap-1',
            !isUp && 'bg-rose-500/20 text-rose-400',
          )}
        >
          {isUp ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
          {metric.trendPercent}%
        </span>
        <span className="referral-stats-trend-label">{metric.trendLabel || 'vs last month'}</span>
      </div>
    </div>
  )
}

function MetricCardSkeleton() {
  return (
    <div className="referral-stats-card p-4">
      <div className="h-3 w-28 animate-pulse rounded bg-white/10" />
      <div className="mt-3 h-7 w-20 animate-pulse rounded bg-white/10" />
      <div className="mt-4 h-5 w-32 animate-pulse rounded bg-white/5" />
    </div>
  )
}

export function ReferralStatsBar({ metrics, isLoading, activeMetricIds }: ReferralStatsBarProps) {
  const resolved = mergeReferralMetrics(metrics)
  const cards = buildMetricCards(resolved, activeMetricIds)
  const skeletonCount = activeMetricIds?.length || 12

  if (isLoading) {
    return (
      <div className={cn('grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4')}>
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <MetricCardSkeleton key={index} />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <ReferralMetricCard key={card.id} metric={card} />
      ))}
    </div>
  )
}
