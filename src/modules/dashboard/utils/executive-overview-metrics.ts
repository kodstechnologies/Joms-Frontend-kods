import type { ExecutiveKpiStat } from '@/modules/dashboard/types/executive-overview'
import type { ExecutiveMetricValue } from '@/modules/dashboard/types/executive-overview'
import { EXECUTIVE_OVERVIEW_METRICS_CATALOG } from '@/modules/dashboard/config/executive-overview-metrics.config'

export function buildExecutiveKpiStats(
  metrics: Record<string, ExecutiveMetricValue> | undefined,
): ExecutiveKpiStat[] {
  return EXECUTIVE_OVERVIEW_METRICS_CATALOG.map((item) => {
    const data = metrics?.[item.id]
    const change = data?.changePercent
    const trend =
      change == null
        ? undefined
        : {
            direction: (change >= 0 ? 'up' : 'down') as 'up' | 'down',
            percentage: Math.abs(change),
            label: data?.changeLabel || 'vs last period',
          }

    return {
      id: item.id,
      title: item.label,
      value: data?.notInstrumented ? '—' : data?.formatted || '—',
      trend: data?.notInstrumented ? undefined : trend,
      hint: data?.hint || undefined,
    }
  })
}
