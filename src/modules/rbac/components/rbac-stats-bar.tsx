import { useMemo } from 'react'

import {
  DEFAULT_RBAC_HUB_METRIC_IDS,
  RBAC_HUB_METRICS_CATALOG,
  RBAC_HUB_METRIC_IDS,
  RBAC_HUB_METRIC_ID_SET,
  RBAC_HUB_MODULE_KEY,
  RBAC_HUB_STAT_KEYS,
} from '../config/rbac-metrics.config'
import type { RbacStats } from '../types/rbac'
import {
  orderByActiveMetricIds,
  useActiveMetricIds,
} from '@/modules/expert/hooks/use-active-metric-ids'
import { sortIdsByCatalogOrder } from '@/shared/lib/dedupe-ids'

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
      {visibleCards.map((card) => (
        <div key={card.id} className="rbac-stats-card">
          <p className="rbac-stats-card-label">{card.label}</p>
          {isLoading ? (
            <div className="rbac-stats-card-skeleton" />
          ) : (
            <p className="rbac-stats-card-value">
              {String(stats?.[card.statsKey] ?? 0).padStart(2, '0')}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}
