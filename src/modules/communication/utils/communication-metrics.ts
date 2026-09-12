import type { CommunicationMetrics } from '../api/communication-api'
import {
  COMMUNICATION_METRICS_CATALOG,
  COMMUNICATION_METRIC_IDS,
} from '../config/communication-metrics.config'
import type { StatCardProps } from '@/shared/components/dashboard/stat-card'

export type CommunicationMetricCardView = StatCardProps & { id: string }

const labelById = new Map(COMMUNICATION_METRICS_CATALOG.map((metric) => [metric.id, metric.label]))

const TEXT_METRIC_IDS = new Set([
  'most-used-channel',
  'most-engaged-audience',
  'top-performing-campaign',
])

function formatCount(value: number | undefined | null) {
  return String(Number(value ?? 0))
}

function formatPercent(value: number | undefined | null) {
  return `${Number(value ?? 0)}%`
}

function formatText(value: string | undefined | null) {
  const text = String(value ?? '').trim()
  return text || '—'
}

function formatMetricValue(id: string, metrics?: CommunicationMetrics | null): string {
  if (!metrics) return '—'

  switch (id) {
    case 'total-messages-sent':
      return formatCount(metrics.totalMessagesSent ?? metrics.sent)
    case 'active-campaigns':
      return formatCount(metrics.activeCampaigns)
    case 'channels-used':
      return formatCount(metrics.channelsUsed)
    case 'scheduled-messages':
      return formatCount(metrics.scheduledMessages)
    case 'failed-undelivered':
      return formatCount(metrics.failedUndelivered ?? metrics.failed)
    case 'draft-messages':
      return formatCount(metrics.draftMessages)
    case 'withdrawn-communications':
      return formatCount(metrics.withdrawnCommunications)
    case 'total-clicks':
      return formatCount(metrics.totalClicks ?? metrics.clicked)
    case 'click-through-rate':
      return formatPercent(metrics.clickThroughRate)
    case 'open-rate':
      return formatPercent(metrics.openRate)
    case 'delivery-rate':
      return formatPercent(metrics.deliveryRate)
    case 'bounce-rate':
      return formatPercent(metrics.bounceRate)
    case 'most-used-channel':
      return formatText(metrics.mostUsedChannel)
    case 'most-engaged-audience':
      return formatText(metrics.mostEngagedAudience)
    case 'top-performing-campaign':
      return formatText(metrics.topPerformingCampaign)
    default: {
      const card = metrics.cards?.find((item) => item.id === id)
      return card?.value ?? '—'
    }
  }
}

function resolveTrend(id: string, metrics?: CommunicationMetrics | null) {
  if (!metrics || TEXT_METRIC_IDS.has(id)) return undefined
  return metrics.trends?.[id] ?? metrics.cards?.find((card) => card.id === id)?.trend
}

export function buildCommunicationMetricCards(
  metrics?: CommunicationMetrics | null,
): CommunicationMetricCardView[] {
  const totalCommunications = Number(metrics?.totalCommunications ?? 0)
  const activeCampaigns = Number(metrics?.activeCampaigns ?? 0)

  return COMMUNICATION_METRIC_IDS.map((id) => {
    const cardHint = metrics?.cards?.find((card) => card.id === id)?.hint
    const hint =
      cardHint ??
      (id === 'active-campaigns' && totalCommunications > 0
        ? `${((activeCampaigns / totalCommunications) * 100).toFixed(1)}% of total`
        : undefined)

    return {
      id,
      title: labelById.get(id) ?? id,
      value: formatMetricValue(id, metrics),
      trend: resolveTrend(id, metrics),
      hint,
    }
  })
}
