import { healthMetricsMock, type HealthMetric } from '@/modules/settings/mock/settings.defaults'
import { PLATFORM_HEALTH_METRICS_CATALOG } from '@/modules/settings/config/platform-health-metrics.config'

export type PlatformHealthMetricCard = HealthMetric & { id: string }

const mockByTitle = new Map(healthMetricsMock.map((metric) => [metric.title, metric]))

export function buildPlatformHealthMetricCards(): PlatformHealthMetricCard[] {
  return PLATFORM_HEALTH_METRICS_CATALOG.map((item) => {
    const mock = mockByTitle.get(item.label)
    if (!mock) {
      return {
        id: item.id,
        title: item.label,
        value: '—',
      }
    }

    return {
      id: item.id,
      ...mock,
    }
  })
}
