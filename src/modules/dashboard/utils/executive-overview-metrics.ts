import {
  Activity,
  BadgeIndianRupee,
  BarChart3,
  Building2,
  CalendarDays,
  ClipboardList,
  CreditCard,
  Handshake,
  MessageSquare,
  Percent,
  Repeat,
  ShieldAlert,
  Star,
  Timer,
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
  'overall-platform-commission': Wallet,
  'active-members': Users,
  'total-events-mtd': CalendarDays,
  'ltv-cac-ratio': CreditCard,
  'net-promoter-score': Star,
  'avg-revenue-per-partner': Handshake,
  'total-listed-services': ClipboardList,
  'active-services': Activity,
  'total-services-delivered': ClipboardList,
  'service-completion-rate': Percent,
  'avg-service-delivery-time': Timer,
  'total-service-revenue': BadgeIndianRupee,
  'avg-revenue-per-completed-service': BadgeIndianRupee,
  'repeat-service-client-rate': Repeat,
  'total-listed-consultations': MessageSquare,
  'active-consultations': MessageSquare,
  'total-consultations-completed': MessageSquare,
  'consultation-completion-rate': Percent,
  'avg-consultation-duration': Timer,
  'total-consultation-revenue': BadgeIndianRupee,
  'avg-revenue-per-completed-consultation': BadgeIndianRupee,
  'repeat-consultation-client-rate': Repeat,
  'total-venues': Building2,
  'active-venues': Building2,
  'avg-venue-utilisation': Percent,
  'events-per-venue': CalendarDays,
  'venue-revenue-contribution': Percent,
  'venue-cancellation-rate': Percent,
  'avg-venue-rating': Star,
  'admin-actions-mtd': ClipboardList,
  'critical-actions-logged': ShieldAlert,
  'open-support-tickets': MessageSquare,
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
      hint: data?.hint || data?.proxy || undefined,
    }
  })
}
