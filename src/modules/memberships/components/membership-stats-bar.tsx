import { BarChart3, Crown, RefreshCw, TrendingUp, Users } from 'lucide-react'

import { membershipMemberMetricsMock } from '../mock/membership-metrics.mock'
import { useMembershipStats } from '../hooks/use-memberships'
import { StatCard } from '@/shared/components/dashboard/stat-card'

export function MembershipStatsBar() {
  const { data } = useMembershipStats()
  const apiStats = data?.data
  const mock = membershipMemberMetricsMock

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
      <StatCard
        title="Total Members"
        value={String(apiStats?.totalActivePlans ?? mock.totalMembers.value)}
        icon={Users}
        trend={mock.totalMembers.trend}
      />
      <StatCard
        title="Expired Memberships"
        value={String(apiStats?.expiredMemberships ?? mock.expiredMemberships.value)}
        icon={RefreshCw}
        hint={mock.expiredMemberships.hint}
      />
      <StatCard
        title="Total Revenue"
        value={
          apiStats?.totalRevenue
            ? `₹${apiStats.totalRevenue.toLocaleString('en-IN')}`
            : mock.totalRevenue.value
        }
        icon={TrendingUp}
        trend={mock.totalRevenue.trend}
      />
      <StatCard
        title="Renewal Rate"
        value={
          apiStats?.renewalRate
            ? `${apiStats.renewalRate}%`
            : mock.renewalRate.value
        }
        icon={BarChart3}
        trend={mock.renewalRate.trend}
      />
      <StatCard
        title="Most Subscribed Plan"
        value={apiStats?.mostSubscribedPlan ?? mock.mostSubscribedPlan.value ?? '—'}
        icon={Crown}
        hint={mock.mostSubscribedPlan.hint}
      />
    </div>
  )
}

export function MembershipPlanStatsBar() {
  const { data } = useMembershipStats()
  const counts = data?.data?.counts

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <MiniStat label="Active Plans" value={counts?.active ?? 0} />
      <MiniStat label="Inactive Plans" value={counts?.inactive ?? 0} />
      <MiniStat label="Cancelled Plans" value={counts?.cancelled ?? 0} />
      <MiniStat label="Deleted Plans" value={counts?.deleted ?? 0} />
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-white">{String(value).padStart(2, '0')}</p>
    </div>
  )
}
