import type { StatCardProps } from '@/shared/components/dashboard/stat-card'

export type ExecutiveKpiStat = StatCardProps & { id: string }

export type ExecutiveMetricValue = {
  value: number
  formatted: string
  previousValue?: number | null
  changePercent?: number | null
  changeLabel?: string | null
  hint?: string | null
  notInstrumented?: boolean
  proxy?: string | null
}

export type ExecutiveEngagementMetric = {
  id: string
  label: string
  value: number
  formatted: string
}

export type RevenueMemberPoint = {
  month: string
  monthKey?: string
  revenue: number
  newMembers: number
}

export type MembershipTrendPoint = {
  month: string
  monthKey?: string
  active: number
  expired: number
  new: number
}

export type FunnelPoint = {
  stage: string
  value: number
}

export type ServiceDistributionPoint = {
  name: string
  value: number
}

export type ExecutiveOverviewPayload = {
  metrics: Record<string, ExecutiveMetricValue>
  engagement: ExecutiveEngagementMetric[]
  charts: {
    revenueMemberGrowth: RevenueMemberPoint[]
    membershipTrends: MembershipTrendPoint[]
    conversionFunnel: FunnelPoint[]
    serviceTypeDistribution: ServiceDistributionPoint[]
  }
  generatedAt: string
}
