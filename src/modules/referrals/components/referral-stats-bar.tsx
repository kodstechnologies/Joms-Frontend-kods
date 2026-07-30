import { TrendingDown, TrendingUp } from 'lucide-react'

import type { ReferralMetrics } from '../types/referral'

type ReferralStatsBarProps = {
  metrics?: ReferralMetrics
  isLoading?: boolean
}

type MetricTrend = {
  direction: 'up' | 'down'
  percentage: number
  label?: string
}

type MetricCardData = {
  id: string
  label: string
  value: string
  trend: MetricTrend
}

function buildMetricCards(metrics: ReferralMetrics): MetricCardData[] {
  return [
    {
      id: 'total-referrals',
      label: 'Total Referrals Generated',
      value: (metrics.totalReferralsGenerated ?? 0).toLocaleString('en-US'),
      trend: { direction: 'up', percentage: 6.7 },
    },
    {
      id: 'user-share-rate',
      label: 'User-to-User Share Rate',
      value: `${metrics.userToUserShareRate}%`,
      trend: { direction: 'up', percentage: 6.7 },
    },
    {
      id: 'admin-send-success',
      label: 'Admin Send Success Rate',
      value: `${metrics.adminSendSuccessRate}%`,
      trend: { direction: 'up', percentage: 6.7 },
    },
    {
      id: 'acceptance-rate',
      label: 'Referral Acceptance Rate',
      value: `${metrics.referralAcceptanceRate}%`,
      trend: { direction: 'up', percentage: 12.5 },
    },
    {
      id: 'onboarding-rate',
      label: 'Onboarding Rate',
      value: `${metrics.onboardingRate}%`,
      trend: { direction: 'up', percentage: 6.7 },
    },
    {
      id: 'conversion-rate',
      label: 'Conversion Rate',
      value: `${metrics.conversionRate}%`,
      trend: { direction: 'up', percentage: 6.7 },
    },
    {
      id: 'expiry-rate',
      label: 'Referral Expiry Rate',
      value: `${metrics.referralExpiryRate}%`,
      trend: { direction: 'up', percentage: 6.7 },
    },
    {
      id: 'top-source',
      label: 'Top Source Performance',
      value: metrics.topSourcePerformance,
      trend: { direction: 'up', percentage: 12.5 },
    },
    {
      id: 'goals-completed',
      label: 'Total Goals Completed (10/10)',
      value: String(metrics.totalGoalsCompleted),
      trend: { direction: 'up', percentage: 6.7 },
    },
    {
      id: 'memberships-unlocked',
      label: 'Memberships unlocked',
      value: String(metrics.membershipsUnlocked),
      trend: { direction: 'up', percentage: 6.7 },
    },
    {
      id: 'avg-referrals',
      label: 'Average referrals per user',
      value: String(metrics.averageReferralsPerUser),
      trend: { direction: 'up', percentage: 6.7 },
    },
    {
      id: 'avg-days-to-goal',
      label: 'Average days to reach goal',
      value: String(metrics.averageDaysToReachGoal),
      trend: { direction: 'up', percentage: 12.5 },
    },
  ]
}

function ReferralMetricCard({ metric }: { metric: MetricCardData }) {
  const isUp = metric.trend.direction === 'up'

  return (
    <div className="referral-stats-card flex flex-col p-4 transition-colors">
      <p className="referral-stats-label">{metric.label}</p>
      <p className="referral-stats-value mt-2">{metric.value}</p>
      <div className="mt-auto flex items-center gap-2 pt-3">
        <span className="referral-stats-trend-badge inline-flex items-center gap-1">
          {isUp ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
          {metric.trend.percentage}%
        </span>
        <span className="referral-stats-trend-label">{metric.trend.label ?? 'vs last month'}</span>
      </div>
    </div>
  )
}

function MetricCardSkeleton() {
  return (
    <div className="referral-stats-card p-4">
      <div className="h-3 w-28 animate-pulse rounded bg-white/10" />
      <div className="mt-3 h-7 w-20 animate-pulse rounded bg-white/10" />
      <div className="mt-4 h-5 w-32 animate-pulse rounded bg-white/5" />
    </div>
  )
}

export function ReferralStatsBar({ metrics, isLoading }: ReferralStatsBarProps) {
  const cards = metrics ? buildMetricCards(metrics) : []

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 12 }).map((_, index) => (
          <MetricCardSkeleton key={index} />
        ))}
      </div>
    )
  }

  if (!metrics) return null

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <ReferralMetricCard key={card.id} metric={card} />
      ))}
    </div>
  )
}
