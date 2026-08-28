import { useMemo } from 'react'

import {
  DEFAULT_MEMBERSHIP_METRIC_IDS,
  MEMBERSHIP_METRIC_IDS,
  MEMBERSHIP_METRIC_ID_SET,
  MEMBERSHIPS_DASHBOARD_METRICS_CATALOG,
  MEMBERSHIPS_MODULE_KEY,
} from '../config/membership-metrics.config'
import { useMembershipStats } from '../hooks/use-memberships'
import type { MembershipStatsResponse } from '../types/membership'
import {
  orderByActiveMetricIds,
  useActiveMetricIds,
} from '@/modules/expert/hooks/use-active-metric-ids'
import { StatCard, type StatCardProps } from '@/shared/components/dashboard/stat-card'
import { StatCardSkeleton } from '@/shared/components/ui/skeleton'
import { sortIdsByCatalogOrder } from '@/shared/lib/dedupe-ids'

type MembershipKpiStat = StatCardProps & { id: string }

function formatCurrencyValue(value: number | undefined | null) {
  const amount = Number(value ?? 0)
  return `₹${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

function formatPercent(value: number | undefined | null) {
  return `${Number(value ?? 0)}%`
}

function formatCount(value: number | undefined | null) {
  return String(Number(value ?? 0))
}

function formatText(value: string | undefined | null) {
  const text = String(value ?? '').trim()
  return text || '—'
}

function buildMembershipKpiStats(
  apiStats: MembershipStatsResponse['data'] | undefined,
): MembershipKpiStat[] {
  const trends = apiStats?.trends || {}

  const valueById: Record<string, string> = {
    'total-membership-plans': formatCount(apiStats?.totalMembershipPlans ?? apiStats?.totalPlans),
    'active-membership-plans': formatCount(
      apiStats?.activeMembershipPlans ?? apiStats?.totalActivePlans,
    ),
    'total-subscribers': formatCount(apiStats?.totalSubscribers),
    'active-subscribers': formatCount(apiStats?.activeSubscribers ?? apiStats?.totalMembers),
    'expired-memberships': formatCount(apiStats?.expiredMemberships),
    'cancelled-memberships': formatCount(apiStats?.cancelledMemberships),
    'total-membership-revenue': formatCurrencyValue(
      apiStats?.totalMembershipRevenue ?? apiStats?.totalRevenue,
    ),
    'monthly-recurring-revenue': formatCurrencyValue(apiStats?.monthlyRecurringRevenue),
    'revenue-growth-rate': formatPercent(apiStats?.revenueGrowthRate),
    'average-revenue-per-subscriber': formatCurrencyValue(apiStats?.averageRevenuePerSubscriber),
    'renewal-rate': formatPercent(apiStats?.renewalRate),
    'failed-renewals': formatCount(apiStats?.failedRenewals),
    'most-subscribed-plan': formatText(apiStats?.mostSubscribedPlan),
    'subscribers-by-plan': formatText(apiStats?.subscribersByPlan),
    'membership-upgrades': formatCount(apiStats?.membershipUpgrades),
    'membership-downgrades': formatCount(apiStats?.membershipDowngrades),
    'membership-renewals': formatCount(apiStats?.membershipRenewals),
    'new-subscribers-current-month': formatCount(apiStats?.newSubscribersCurrentMonth),
    'cancellations-current-month': formatCount(apiStats?.cancellationsCurrentMonth),
    'most-selected-billing-cycle': formatText(apiStats?.mostSelectedBillingCycle),
    'trial-to-paid-conversion-rate': formatPercent(apiStats?.trialToPaidConversionRate),
    'most-cancelled-plan': formatText(apiStats?.mostCancelledPlan),
    'churn-rate': formatPercent(apiStats?.churnRate),
  }

  const trendKeyById: Record<string, string> = {
    'total-subscribers': 'totalSubscribers',
    'active-subscribers': 'activeSubscribers',
    'total-membership-revenue': 'totalMembershipRevenue',
    'monthly-recurring-revenue': 'monthlyRecurringRevenue',
    'renewal-rate': 'renewalRate',
    'churn-rate': 'churnRate',
  }

  return MEMBERSHIPS_DASHBOARD_METRICS_CATALOG.map((item) => {
    const trendKey = trendKeyById[item.id]
    const trend = trendKey ? trends[trendKey] : undefined
    return {
      id: item.id,
      title: item.label,
      value: valueById[item.id] ?? '0',
      trend: trend
        ? {
            direction: trend.direction,
            percentage: trend.percentage,
            label: trend.label || 'vs last month',
          }
        : undefined,
    }
  })
}

export function MembershipStatsBar() {
  const { data, isLoading } = useMembershipStats()
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

  const columnsClass =
    (isLoading ? filteredActiveMetricIds.length : visibleStats.length) <= 3
      ? 'md:grid-cols-2 xl:grid-cols-3'
      : (isLoading ? filteredActiveMetricIds.length : visibleStats.length) <= 5
        ? 'md:grid-cols-2 xl:grid-cols-5'
        : 'md:grid-cols-2 xl:grid-cols-4'

  return (
    <div className={`grid grid-cols-1 gap-4 ${columnsClass}`}>
      {isLoading
        ? filteredActiveMetricIds.map((id) => <StatCardSkeleton key={id} />)
        : visibleStats.map((stat) => (
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
  const { data, isLoading } = useMembershipStats()
  const counts = data?.data?.counts

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={idx}
            className="animate-pulse space-y-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3"
          >
            <div className="h-3 w-20 rounded bg-white/10" />
            <div className="h-7 w-12 rounded bg-white/10" />
          </div>
        ))}
      </div>
    )
  }

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
