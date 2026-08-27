import type { SupportStatCard } from '@/modules/support-management/api/support-api'
import {
  TICKET_MANAGEMENT_METRICS_CATALOG,
  TICKET_MANAGEMENT_METRIC_IDS,
} from '@/modules/support-management/config/ticket-management-metrics.config'

export type TicketManagementMetricCard = {
  id: string
  title: string
  value: string
  percentage: number
  direction: 'up' | 'down'
}

const labelById = new Map(
  TICKET_MANAGEMENT_METRICS_CATALOG.map((metric) => [metric.id, metric.label]),
)

const emptyValueById: Record<string, string> = {
  'my-open-tickets': '0',
  'tickets-in-progress': '0',
  'avg-response-time': '00:00:00',
  'avg-resolution-time': '00:00:00',
}

function emptyValueFor(id: string) {
  return emptyValueById[id] ?? '0'
}

function displayValue(id: string, value: string | number | null | undefined) {
  if (value == null || value === '' || value === '—') return emptyValueFor(id)
  return String(value)
}

function buildFromApi(cards: SupportStatCard[]): TicketManagementMetricCard[] {
  const catalogIdSet = new Set(TICKET_MANAGEMENT_METRIC_IDS)

  return cards
    .filter((card) => catalogIdSet.has(card.key))
    .map((card) => ({
      id: card.key,
      title: labelById.get(card.key) ?? card.title,
      value: displayValue(card.key, card.value),
      percentage: card.changePercent ?? 0,
      direction: (card.changeDirection ?? 'up') as 'up' | 'down',
    }))
}

export function buildTicketManagementMetricCards(
  cards?: SupportStatCard[],
): TicketManagementMetricCard[] {
  const apiById = new Map(buildFromApi(cards ?? []).map((card) => [card.id, card]))

  return TICKET_MANAGEMENT_METRIC_IDS.map((id) => {
    const fromApi = apiById.get(id)
    if (fromApi) return fromApi

    return {
      id,
      title: labelById.get(id) ?? id,
      value: emptyValueFor(id),
      percentage: 0,
      direction: 'up' as const,
    }
  })
}
