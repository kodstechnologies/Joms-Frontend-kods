import type { SupportStatCard } from '@/modules/support-management/api/support-api'
import {
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

const mockTrend = {
  direction: 'up' as const,
  percentage: 6.7,
  label: 'vs last month',
}

const mockValues: Record<string, string> = {
  'total-open-tickets': '$487,650',
  'new-tickets-today': '$487,650',
  'tickets-in-progress': '$487,650',
  'escalated-tickets': '$487,650',
  'resolved-today': '$487,650',
  'priority-tickets': '$487,650',
  'avg-response-time': '$487,650',
  'avg-resolution-time': '$487,650',
}

const labelById = new Map(
  SUPPORT_DASHBOARD_METRICS_CATALOG.map((metric) => [metric.id, metric.label]),
)

export function buildSupportDashboardMetricCardsMock(): SupportDashboardMetricCard[] {
  return SUPPORT_DASHBOARD_METRIC_IDS.map((id) => ({
    id,
    title: labelById.get(id) ?? id,
    value: mockValues[id] ?? '—',
    trend: mockTrend,
  }))
}

export function buildSupportDashboardMetricCardsFromApi(
  cards: SupportStatCard[],
): SupportDashboardMetricCard[] {
  const catalogIdSet = new Set(SUPPORT_DASHBOARD_METRIC_IDS)

  return cards
    .filter((card) => catalogIdSet.has(card.key))
    .map((card) => ({
      id: card.key,
      title: labelById.get(card.key) ?? card.title,
      value: String(card.value),
      trend: {
        direction: (card.changeDirection ?? 'up') as 'up' | 'down',
        percentage: card.changePercent ?? 0,
        label: 'vs last month',
      },
    }))
}

export function buildSupportDashboardMetricCards(
  cards?: SupportStatCard[],
): SupportDashboardMetricCard[] {
  const mockById = new Map(buildSupportDashboardMetricCardsMock().map((card) => [card.id, card]))
  const apiById = new Map(
    buildSupportDashboardMetricCardsFromApi(cards ?? []).map((card) => [card.id, card]),
  )

  return SUPPORT_DASHBOARD_METRIC_IDS.map((id) => apiById.get(id) ?? mockById.get(id)!)
}
