import { PLATFORM_HEALTH_METRICS_CATALOG } from '@/modules/settings/config/platform-health-metrics.config'
import type { PlatformHealthMetric } from '@/modules/settings/types/platform-health'

export function buildPlatformHealthMetricCards(
  metrics: PlatformHealthMetric[] = [],
): PlatformHealthMetric[] {
  const byId = new Map(metrics.map((metric) => [metric.id, metric]))

  return PLATFORM_HEALTH_METRICS_CATALOG.map((item) => {
    const live = byId.get(item.id)
    if (live) return live
    return {
      id: item.id,
      label: item.label,
      value: '0',
    }
  })
}
