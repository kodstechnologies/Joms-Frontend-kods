import type { SettingsLogMetrics } from '../types/settings'
import {
  SETTINGS_LOGS_METRICS_CATALOG,
  SETTINGS_LOGS_METRIC_IDS,
} from '../config/settings-logs-metrics.config'
import type { StatCardProps } from '@/shared/components/dashboard/stat-card'

export type SettingsLogsMetricCard = StatCardProps & { id: string }

const labelById = new Map(SETTINGS_LOGS_METRICS_CATALOG.map((metric) => [metric.id, metric.label]))

export function buildSettingsLogsMetricCards(
  metrics?: SettingsLogMetrics | null,
): SettingsLogsMetricCard[] {
  return SETTINGS_LOGS_METRIC_IDS.map((id) => {
    const title = labelById.get(id) ?? id
    const apiCard = metrics?.cards?.find((card) => card.title === title)

    return {
      id,
      title,
      value: apiCard?.value ?? '0',
      trend: apiCard?.trend,
      hint: apiCard?.hint,
    }
  })
}
