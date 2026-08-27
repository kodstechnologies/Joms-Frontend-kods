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

const defaultTrend = {
  direction: 'up' as const,
  percentage: 0,
  label: 'vs last month',
}

const defaultValues: Record<string, string> = {
  'total-open-tickets': '0',
  'new-tickets-today': '0',
  'tickets-in-progress': '0',
  'escalated-tickets': '0',
  'resolved-today': '0',
  'priority-tickets': '0',
  'avg-response-time': '00:00:00',
  'avg-resolution-time': '00:00:00',
}

const labelById = new Map(
  SUPPORT_DASHBOARD_METRICS_CATALOG.map((metric) => [metric.id, metric.label]),
)

export function buildSupportDashboardMetricCardsMock(): SupportDashboardMetricCard[] {
  return SUPPORT_DASHBOARD_METRIC_IDS.map((id) => ({
    id,
    title: labelById.get(id) ?? id,
    value: defaultValues[id] ?? '0',
    trend: defaultTrend,
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
