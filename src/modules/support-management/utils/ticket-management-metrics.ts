import type { SupportStatCard } from '@/modules/support-management/api/support-api'
import {
  TICKET_MANAGEMENT_LEGACY_METRIC_ID_MAP,
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

export { TICKET_MANAGEMENT_LEGACY_METRIC_ID_MAP }

const defaultById: Record<string, { value: string; changePercent: number }> = {
  'assigned-to-me': { value: '0', changePercent: 0 },
  'tickets-in-progress': { value: '0', changePercent: 0 },
  'average-first-response-time': { value: '00:00:00', changePercent: 0 },
  'average-resolution-time': { value: '00:00:00', changePercent: 0 },
  'escalated-by-me': { value: '0', changePercent: 0 },
  // legacy keys fallback
  'my-open-tickets': { value: '0', changePercent: 0 },
  'avg-response-time': { value: '00:00:00', changePercent: 0 },
  'avg-resolution-time': { value: '00:00:00', changePercent: 0 },
}

const labelById = new Map(
  TICKET_MANAGEMENT_METRICS_CATALOG.map((metric) => [metric.id, metric.label]),
)

export function resolveTicketManagementMetricId(id: string): string {
  return TICKET_MANAGEMENT_LEGACY_METRIC_ID_MAP[id] ?? id
}

function emptyValueFor(id: string): string {
  return defaultById[id]?.value ?? (id.includes('time') ? '00:00:00' : '0')
}

function displayValue(id: string, value: string | number | null | undefined): string {
  if (value == null || value === '' || value === '—') return emptyValueFor(id)
  return String(value)
}

function buildFromApi(cards: SupportStatCard[]): TicketManagementMetricCard[] {
  const catalogIdSet = new Set(TICKET_MANAGEMENT_METRIC_IDS)
  const byId = new Map<string, TicketManagementMetricCard>()

  for (const card of cards) {
    const id = resolveTicketManagementMetricId(card.key)
    if (!catalogIdSet.has(id)) continue
    byId.set(id, {
      id,
      title: labelById.get(id) ?? card.title,
      value: displayValue(id, card.value),
      percentage: card.changePercent ?? 0,
      direction: (card.changeDirection ?? 'up') as 'up' | 'down',
    })
  }

  return TICKET_MANAGEMENT_METRIC_IDS.map((id) => byId.get(id)).filter(
    Boolean,
  ) as TicketManagementMetricCard[]
}

export function buildMockCards(): TicketManagementMetricCard[] {
  return TICKET_MANAGEMENT_METRIC_IDS.map((id) => {
    const label = labelById.get(id) ?? id
    const fallback = defaultById[id]

    return {
      id,
      title: label,
      value: fallback?.value ?? emptyValueFor(id),
      percentage: fallback?.changePercent ?? 0,
      direction: 'up' as const,
    }
  })
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
      percentage: defaultById[id]?.changePercent ?? 0,
      direction: 'up' as const,
    }
  })
}
