import { useMemo } from 'react'

import { membershipMemberMetricsMock } from '../mock/membership-metrics.mock'
import { useMembershipStats } from '../hooks/use-memberships'
import {
  DEFAULT_MEMBERSHIP_METRIC_IDS,
  MEMBERSHIP_METRIC_IDS,
  MEMBERSHIP_METRIC_ID_SET,
  MEMBERSHIPS_MODULE_KEY,
} from '../config/membership-metrics.config'
import type { MembershipStatsResponse } from '../types/membership'
import {
  orderByActiveMetricIds,
  useActiveMetricIds,
} from '@/modules/expert/hooks/use-active-metric-ids'
import { StatCard, type StatCardProps } from '@/shared/components/dashboard/stat-card'
import { sortIdsByCatalogOrder } from '@/shared/lib/dedupe-ids'

type MembershipKpiStat = StatCardProps & { id: string }

function buildMembershipKpiStats(
  apiStats: MembershipStatsResponse['data'] | undefined,
): MembershipKpiStat[] {
  const mock = membershipMemberMetricsMock

  return [
    {
      id: 'total-members',
      title: 'Total Members',
      value: String(apiStats?.totalActivePlans ?? mock.totalMembers.value),
      trend: mock.totalMembers.trend,
    },
    {
      id: 'expired-memberships',
      title: 'Expired Memberships',
      value: String(apiStats?.expiredMemberships ?? mock.expiredMemberships.value),
      hint: mock.expiredMemberships.hint,
    },
    {
      id: 'total-revenue',
      title: 'Total Revenue',
      value: apiStats?.totalRevenue
        ? `₹${apiStats.totalRevenue.toLocaleString('en-IN')}`
        : mock.totalRevenue.value,
      trend: mock.totalRevenue.trend,
    },
    {
      id: 'renewal-rate',
      title: 'Renewal Rate',
      value: apiStats?.renewalRate ? `${apiStats.renewalRate}%` : mock.renewalRate.value,
      trend: mock.renewalRate.trend,
    },
    {
      id: 'most-subscribed-plan',
      title: 'Most Subscribed Plan',
      value: apiStats?.mostSubscribedPlan ?? mock.mostSubscribedPlan.value ?? '—',
      hint: mock.mostSubscribedPlan.hint,
    },
  ]
}

export function MembershipStatsBar() {
  const { data } = useMembershipStats()
  const apiStats = data?.data
  const activeMetricIds = useActiveMetricIds(MEMBERSHIPS_MODULE_KEY, [
    ...DEFAULT_MEMBERSHIP_METRIC_IDS,
  ])

  const filteredActiveMetricIds = useMemo(
    () =>
      sortIdsByCatalogOrder(
        activeMetricIds.filter((id) => MEMBERSHIP_METRIC_ID_SET.has(id)),
        MEMBERSHIP_METRIC_IDS,
      ),
    [activeMetricIds],
  )

  const visibleStats = useMemo(() => {
    const allStats = buildMembershipKpiStats(apiStats)
    return orderByActiveMetricIds(allStats, filteredActiveMetricIds)
  }, [apiStats, filteredActiveMetricIds])

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
      {visibleStats.map((stat) => (
        <StatCard
          key={stat.id}
          title={stat.title}
          value={stat.value}
          trend={stat.trend}
          hint={stat.hint}
        />
      ))}
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
