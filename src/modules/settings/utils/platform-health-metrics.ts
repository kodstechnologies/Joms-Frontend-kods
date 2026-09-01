import { PLATFORM_HEALTH_METRICS_CATALOG } from '@/modules/settings/config/platform-health-metrics.config'
import type { PlatformHealthMetric } from '@/modules/settings/types/platform-health'

export function buildPlatformHealthMetricCards(
  metrics: PlatformHealthMetric[] = [],
): PlatformHealthMetric[] {
  const byId = new Map<string, PlatformHealthMetric>()
  for (const metric of metrics) {
    byId.set(metric.id, metric)
  }

  return PLATFORM_HEALTH_METRICS_CATALOG.map((item) => {
    const live = byId.get(item.id)
    if (live) {
      return {
        ...live,
        label: live.label || item.label,
      }
    }
    return {
      id: item.id,
      label: item.label,
      value: '—',
    }
  })
}
