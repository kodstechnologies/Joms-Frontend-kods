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

const defaultById: Record<string, { value: string; changePercent: number }> = {
  'my-open-tickets': { value: '0', changePercent: 0 },
  'tickets-in-progress': { value: '0', changePercent: 0 },
  'avg-response-time': { value: '00:00:00', changePercent: 0 },
  'avg-resolution-time': { value: '00:00:00', changePercent: 0 },
}

function buildFromApi(cards: SupportStatCard[]): TicketManagementMetricCard[] {
  const catalogIdSet = new Set(TICKET_MANAGEMENT_METRIC_IDS)

  return cards
    .filter((card) => catalogIdSet.has(card.key))
    .map((card) => ({
      id: card.key,
      title: labelById.get(card.key) ?? card.title,
      value: String(card.value),
      percentage: card.changePercent ?? 0,
      direction: (card.changeDirection ?? 'up') as 'up' | 'down',
    }))
}

function buildMockCards(): TicketManagementMetricCard[] {
  return TICKET_MANAGEMENT_METRIC_IDS.map((id) => {
    const label = labelById.get(id) ?? id
    const fallback = defaultById[id]

    return {
      id,
      title: label,
      value: fallback?.value ?? '0',
      percentage: fallback?.changePercent ?? 0,
      direction: 'up' as const,
    }
  })
}

export function buildTicketManagementMetricCards(
  cards?: SupportStatCard[],
): TicketManagementMetricCard[] {
  const mockByIdMap = new Map(buildMockCards().map((card) => [card.id, card]))
  const apiById = new Map(buildFromApi(cards ?? []).map((card) => [card.id, card]))

  return TICKET_MANAGEMENT_METRIC_IDS.map((id) => apiById.get(id) ?? mockByIdMap.get(id)!)
}
