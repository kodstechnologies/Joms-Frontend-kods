import {
  membershipSummaryMetricsMock,
  type MembershipSummaryMetric,
} from '@/modules/payments/mock/membership-management.mock'
import { FINANCE_MEMBERSHIPS_METRICS_CATALOG } from '@/modules/payments/config/finance-memberships-metrics.config'

export type FinanceMembershipsMetricCard = MembershipSummaryMetric & { id: string }

export type FinanceMembershipStatusCounts = {
  active?: number
  paused?: number
  cancelled?: number
  expired?: number
}

function formatCount(value: number | undefined): string {
  return String(value ?? 0).padStart(2, '0')
}

const mockByLabel = new Map(membershipSummaryMetricsMock.map((metric) => [metric.label, metric]))

export function buildFinanceMembershipsMetricCards(
  counts?: FinanceMembershipStatusCounts | null,
): FinanceMembershipsMetricCard[] {
  const liveValues: Record<string, string> = {
    'active-subscriptions': formatCount(counts?.active),
    paused: formatCount(counts?.paused),
    cancelled: formatCount(counts?.cancelled),
    expired: formatCount(counts?.expired),
  }

  return FINANCE_MEMBERSHIPS_METRICS_CATALOG.map((item) => {
    const mock = mockByLabel.get(item.label)

    return {
      id: item.id,
      label: item.label,
      value: liveValues[item.id] ?? mock?.value ?? '00',
      change: mock?.change ?? '',
      changeNote: mock?.changeNote ?? 'subscriptions',
    }
  })
}
