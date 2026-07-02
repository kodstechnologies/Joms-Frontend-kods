import {
  BarChart3,
  Clock,
  Crown,
  RefreshCw,
  Target,
  TrendingUp,
  Users,
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
      title: 'Total Referrals Generated',
      value: metrics.totalReferralsGenerated.toLocaleString('en-IN'),
      icon: Users,
      trend: { direction: 'up' as const, percentage: 5.2, label: 'vs last month' },
    },
    {
      title: 'User-to-User Share Rate',
      value: `${metrics.userToUserShareRate}%`,
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
    { title: 'Onboarding Rate', value: `${metrics.onboardingRate}%`, icon: Users },
    { title: 'Conversion Rate', value: `${metrics.conversionRate}%`, icon: TrendingUp },
    { title: 'Referral Expiry Rate', value: `${metrics.referralExpiryRate}%`, icon: Clock },
    { title: 'Top Source Performance', value: metrics.topSourcePerformance, icon: Crown },
    { title: 'Total Goals Completed', value: String(metrics.totalGoalsCompleted), icon: Target },
    { title: 'Memberships unlocked', value: String(metrics.membershipsUnlocked), icon: Crown },
    {
      title: 'Average referrals per user',
      value: String(metrics.averageReferralsPerUser),
      icon: Users,
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
