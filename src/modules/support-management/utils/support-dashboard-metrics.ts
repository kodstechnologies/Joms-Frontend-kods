import type { SupportStatCard } from '@/modules/support-management/api/support-api'
import {
  SUPPORT_DASHBOARD_LEGACY_METRIC_ID_MAP,
  SUPPORT_DASHBOARD_METRICS_CATALOG,
  SUPPORT_DASHBOARD_METRIC_IDS,
} from '@/modules/support-management/config/support-dashboard-metrics.config'

export type SupportDashboardMetricCard = {
  id: string
  title: string
  value: string
  trend: {
    direction: 'up' | 'down'
    percentage: number
    label: string
  }
}

/** Re-export for consumers resolving saved preference ids. */
export { SUPPORT_DASHBOARD_LEGACY_METRIC_ID_MAP }

const defaultTrend = {
  direction: 'up' as const,
  percentage: 0,
  label: 'vs last month',
}

const defaultValues: Record<string, string> = {
  'total-tickets': '0',
  'open-tickets': '0',
  'tickets-in-progress': '0',
  'assigned-to-me': '0',
  'escalated-by-me': '0',
  'average-first-response-time': '00:00:00',
  'average-resolution-time': '00:00:00',
  'tickets-resolved-today': '0',
  // legacy keys fallback
  'total-open-tickets': '0',
  'new-tickets-today': '0',
  'escalated-tickets': '0',
  'resolved-today': '0',
  'priority-tickets': '0',
  'avg-response-time': '00:00:00',
  'avg-resolution-time': '00:00:00',
}

const labelById = new Map(
  SUPPORT_DASHBOARD_METRICS_CATALOG.map((metric) => [metric.id, metric.label]),
)

export function resolveSupportDashboardMetricId(id: string): string {
  return SUPPORT_DASHBOARD_LEGACY_METRIC_ID_MAP[id] ?? id
}

function emptyValueFor(id: string): string {
  return defaultValues[id] ?? (id.includes('time') ? '00:00:00' : '0')
}

function displayValue(id: string, value: string | number | null | undefined): string {
  if (value == null || value === '' || value === '—') return emptyValueFor(id)
  return String(value)
}

export function buildSupportDashboardMetricCardsMock(): SupportDashboardMetricCard[] {
  return SUPPORT_DASHBOARD_METRIC_IDS.map((id) => ({
    id,
    title: labelById.get(id) ?? id,
    value: emptyValueFor(id),
    trend: defaultTrend,
  }))
}

export function buildSupportDashboardMetricCardsFromApi(
  cards: SupportStatCard[],
): SupportDashboardMetricCard[] {
  const catalogIdSet = new Set(SUPPORT_DASHBOARD_METRIC_IDS)
  const byId = new Map<string, SupportDashboardMetricCard>()

  for (const card of cards) {
    const id = resolveSupportDashboardMetricId(card.key)
    if (!catalogIdSet.has(id)) continue
    byId.set(id, {
      id,
      title: labelById.get(id) ?? card.title,
      value: displayValue(id, card.value),
      trend: {
        direction: (card.changeDirection ?? 'up') as 'up' | 'down',
        percentage: card.changePercent ?? 0,
        label: 'vs last month',
      },
    })
  }

  return SUPPORT_DASHBOARD_METRIC_IDS.map((id) => byId.get(id)).filter(
    Boolean,
  ) as SupportDashboardMetricCard[]
}

export function buildSupportDashboardMetricCards(
  cards?: SupportStatCard[],
): SupportDashboardMetricCard[] {
  const apiById = new Map(
    buildSupportDashboardMetricCardsFromApi(cards ?? []).map((card) => [card.id, card]),
  )

  return SUPPORT_DASHBOARD_METRIC_IDS.map((id) => {
    const fromApi = apiById.get(id)
    if (fromApi) return fromApi

    return {
      id,
      title: labelById.get(id) ?? id,
      value: emptyValueFor(id),
      trend: defaultTrend,
    }
  })
}
