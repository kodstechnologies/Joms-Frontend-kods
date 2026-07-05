import {
  BarChart3,
  Clock,
  Crown,
  RefreshCw,
  Target,
  TrendingUp,
  UserPlus,
} from 'lucide-react'

import type { ReferralMetrics } from '../types/referral'
import { StatCard } from '@/shared/components/dashboard/stat-card'

type ReferralStatsBarProps = {
  metrics?: ReferralMetrics
}

export function ReferralStatsBar({ metrics }: ReferralStatsBarProps) {
  if (!metrics) return null

  const primaryCards = [
    {
      title: 'Total Expert Referrals',
      value: metrics.totalReferralsGenerated.toLocaleString('en-IN'),
      icon: UserPlus,
      trend: { direction: 'up' as const, percentage: 5.2, label: 'vs last month' },
    },
    {
      title: 'Active Expert Invites',
      value: String(metrics.counts.activeExpertInvites),
      icon: TrendingUp,
      trend: { direction: 'up' as const, percentage: 3.2, label: 'vs last month' },
    },
    {
      title: 'Admin Send Success Rate',
      value: `${metrics.adminSendSuccessRate}%`,
      icon: BarChart3,
      trend: { direction: 'up' as const, percentage: 2.5, label: 'vs last month' },
    },
    {
      title: 'Referral Acceptance Rate',
      value: `${metrics.referralAcceptanceRate}%`,
      icon: RefreshCw,
      trend: { direction: 'up' as const, percentage: 1.5, label: 'vs last month' },
    },
  ]

  const secondaryCards = [
    { title: 'Expert Onboarding Rate', value: `${metrics.onboardingRate}%`, icon: UserPlus },
    { title: 'Conversion Rate', value: `${metrics.conversionRate}%`, icon: TrendingUp },
    { title: 'Referral Expiry Rate', value: `${metrics.referralExpiryRate}%`, icon: Clock },
    { title: 'Top Source Performance', value: metrics.topSourcePerformance, icon: Crown },
    { title: 'Total Goals Completed', value: String(metrics.totalGoalsCompleted), icon: Target },
    { title: 'Expert Memberships Unlocked', value: String(metrics.membershipsUnlocked), icon: Crown },
    {
      title: 'Average referrals per expert',
      value: String(metrics.averageReferralsPerUser),
      icon: UserPlus,
    },
    {
      title: 'Average days to reach goal',
      value: String(metrics.averageDaysToReachGoal),
      icon: Clock,
    },
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {primaryCards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-4">
        {secondaryCards.map((card) => (
          <StatCard key={card.title} title={card.title} value={card.value} icon={card.icon} />
        ))}
      </div>
    </div>
  )
}
