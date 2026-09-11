import { useMemo } from 'react'
import { TrendingDown, TrendingUp } from 'lucide-react'

import {
  DEFAULT_RBAC_HUB_METRIC_IDS,
  RBAC_HUB_METRICS_CATALOG,
  RBAC_HUB_METRIC_IDS,
  RBAC_HUB_METRIC_ID_SET,
  RBAC_HUB_MODULE_KEY,
  RBAC_HUB_STAT_KEYS,
} from '../config/rbac-metrics.config'
import type { RbacMetricTrend, RbacStats } from '../types/rbac'
import {
  orderByActiveMetricIds,
  useActiveMetricIds,
} from '@/modules/expert/hooks/use-active-metric-ids'
import { sortIdsByCatalogOrder } from '@/shared/lib/dedupe-ids'
import { cn } from '@/shared/lib/cn'

type RbacMetricCard = {
  id: string
  label: string
  statsKey: keyof RbacStats
}

function buildRbacMetricCards(): RbacMetricCard[] {
  const labelById = new Map(RBAC_HUB_METRICS_CATALOG.map((metric) => [metric.id, metric.label]))

  return RBAC_HUB_METRIC_IDS.map((id) => ({
    id,
    label: labelById.get(id) ?? id,
    statsKey: RBAC_HUB_STAT_KEYS[id as keyof typeof RBAC_HUB_STAT_KEYS],
  }))
}

function TrendFooter({ trend }: { trend?: RbacMetricTrend | null }) {
  if (!trend) {
    return <span className="rbac-stats-card-trend-note">vs last month —</span>
  }

  const isFlat = Number(trend.percentage) === 0
  const isUp = trend.changeType === 'up'

  return (
    <div className="rbac-stats-card-trend">
      <span
        className={cn(
          'rbac-stats-card-trend-badge',
          isFlat && 'is-flat',
          !isFlat && isUp && 'is-up',
          !isFlat && !isUp && 'is-down',
        )}
      >
        {!isFlat &&
          (isUp ? (
            <TrendingUp className="size-3 shrink-0" strokeWidth={2.5} />
          ) : (
            <TrendingDown className="size-3 shrink-0" strokeWidth={2.5} />
          ))}
        {isUp && !isFlat ? '+' : ''}
        {trend.change}
      </span>
      <span className="rbac-stats-card-trend-note">{trend.changeNote || 'vs last month'}</span>
    </div>
  )
}

type RbacStatsBarProps = {
  stats?: RbacStats
  isLoading?: boolean
}

export function RbacStatsBar({ stats, isLoading }: RbacStatsBarProps) {
  const activeMetricIds = useActiveMetricIds(RBAC_HUB_MODULE_KEY, [...DEFAULT_RBAC_HUB_METRIC_IDS])

  const filteredActiveMetricIds = useMemo(
    () =>
      sortIdsByCatalogOrder(
        activeMetricIds.filter((id) => RBAC_HUB_METRIC_ID_SET.has(id)),
        RBAC_HUB_METRIC_IDS,
      ),
    [activeMetricIds],
  )

  const visibleCards = useMemo(() => {
    const allCards = buildRbacMetricCards()
    return orderByActiveMetricIds(allCards, filteredActiveMetricIds)
  }, [filteredActiveMetricIds])

  return (
    <div className="rbac-stats-grid">
      {visibleCards.map((card) => {
        const raw = stats?.[card.statsKey]
        const isPercent =
          card.id === 'invitation-acceptance-rate' || card.id === 'mfa-adoption-rate'
        const display = isPercent
          ? `${Number(raw ?? 0).toFixed(1)}%`
          : String(raw ?? 0).padStart(2, '0')
        const trend = stats?.metricTrends?.[card.id]

        return (
          <div key={card.id} className="rbac-stats-card">
            <p className="rbac-stats-card-label">{card.label}</p>
            {isLoading ? (
              <div className="rbac-stats-card-skeleton" />
            ) : (
              <>
                <p className="rbac-stats-card-value">{display}</p>
                <TrendFooter trend={trend} />
              </>
            )}
          </div>
        )
      })}
    </div>
  )
}
