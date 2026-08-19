import type { EscalationMetrics } from '@/modules/my-tasks/api/escalation-api'
import {
  ESCALATIONS_METRICS_CATALOG,
  ESCALATIONS_METRIC_IDS,
} from '@/modules/settings/config/escalations-metrics.config'
import type { StatCardProps } from '@/shared/components/dashboard/stat-card'

export type EscalationsMetricCard = StatCardProps & { id: string }

const mockTrend = {
  direction: 'up' as const,
  percentage: 6.7,
  label: 'vs last month',
}

const mockValues: Record<string, string> = {
  'total-escalation': '08',
  'open-escalation': '456',
  'in-review': '234',
  resolved: '34',
}

const labelById = new Map(ESCALATIONS_METRICS_CATALOG.map((metric) => [metric.id, metric.label]))

function formatMetricValue(id: string, metrics?: EscalationMetrics | null): string {
  if (!metrics) return mockValues[id] ?? '—'

  switch (id) {
    case 'total-escalation':
      return String(metrics.total).padStart(2, '0')
    case 'open-escalation':
      return String(metrics.open)
    case 'in-review':
      return String(metrics.inReview)
    case 'resolved':
      return String(metrics.resolved)
    default:
      return '—'
  }
}

export function buildEscalationsMetricCards(
  metrics?: EscalationMetrics | null,
): EscalationsMetricCard[] {
  return ESCALATIONS_METRIC_IDS.map((id) => ({
    id,
    title: labelById.get(id) ?? id,
    value: formatMetricValue(id, metrics),
    trend: mockTrend,
  }))
}
