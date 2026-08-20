import {
  Activity,
  BadgeIndianRupee,
  BarChart3,
  CreditCard,
  Percent,
  Users,
  Wallet,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import type { ExecutiveKpiStat } from '@/modules/dashboard/types/executive-overview'
import type { ExecutiveMetricValue } from '@/modules/dashboard/types/executive-overview'
import { EXECUTIVE_OVERVIEW_METRICS_CATALOG } from '@/modules/dashboard/config/executive-overview-metrics.config'

const KPI_ICONS: Record<string, LucideIcon> = {
  'total-platform-revenue': BadgeIndianRupee,
  'monthly-recurring-revenue': Wallet,
  'customer-lifetime-value': BarChart3,
  'gross-margin': Percent,
  'active-members': Users,
  'total-events-mtd': Activity,
  'ltv-cac-ratio': CreditCard,
  'net-promoter-score': Activity,
}

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
      icon: KPI_ICONS[item.id],
      trend: data?.notInstrumented ? undefined : trend,
      hint: data?.hint || undefined,
    }
  })
}
