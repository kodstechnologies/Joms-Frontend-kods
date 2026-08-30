import { useMemo } from 'react'
import { TrendingDown, TrendingUp } from 'lucide-react'

import {
  DEFAULT_MEMBERSHIP_METRIC_IDS,
  MEMBERSHIP_METRIC_IDS,
  MEMBERSHIP_METRIC_ID_SET,
  MEMBERSHIPS_DASHBOARD_METRICS_CATALOG,
  MEMBERSHIPS_MODULE_KEY,
} from '../config/membership-metrics.config'
import { useMembershipStats } from '../hooks/use-memberships'
import type { MembershipStatsResponse, MembershipTrend } from '../types/membership'
import {
  orderByActiveMetricIds,
  useActiveMetricIds,
} from '@/modules/expert/hooks/use-active-metric-ids'
import { StatCardSkeleton } from '@/shared/components/ui/skeleton'
import { cn } from '@/shared/lib/cn'
import { sortIdsByCatalogOrder } from '@/shared/lib/dedupe-ids'

type MembershipKpiStat = {
  id: string
  label: string
  value: string
  trend?: MembershipTrend
}

const API_TREND_KEY_BY_METRIC_ID: Record<string, string> = {
  'total-subscribers': 'totalSubscribers',
  'active-subscribers': 'activeSubscribers',
  'total-membership-revenue': 'totalMembershipRevenue',
  'monthly-recurring-revenue': 'monthlyRecurringRevenue',
  'revenue-growth-rate': 'revenueGrowthRate',
  'average-revenue-per-subscriber': 'averageRevenuePerSubscriber',
  'renewal-rate': 'renewalRate',
  'churn-rate': 'churnRate',
  'new-subscribers-current-month': 'newSubscribersCurrentMonth',
  'membership-upgrades': 'membershipUpgrades',
  'membership-downgrades': 'membershipDowngrades',
  'membership-renewals': 'membershipRenewals',
  'cancellations-current-month': 'cancellationsCurrentMonth',
  'expired-memberships': 'expiredMemberships',
  'cancelled-memberships': 'cancelledMemberships',
  'failed-renewals': 'failedRenewals',
}

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

  return MEMBERSHIPS_DASHBOARD_METRICS_CATALOG.map((item) => {
    const trendKey = API_TREND_KEY_BY_METRIC_ID[item.id]
    const trend = trendKey ? trends[trendKey] : undefined

    return {
      id: item.id,
      label: item.label,
      value: valueById[item.id] ?? '0',
      trend,
    }
  })
}

const TEXT_VALUE_METRIC_IDS = new Set([
  'most-subscribed-plan',
  'subscribers-by-plan',
  'most-selected-billing-cycle',
  'most-cancelled-plan',
])

function MembershipMetricCard({ metric }: { metric: MembershipKpiStat }) {
  const isUp = metric.trend?.direction === 'up'
  const invertTrend = [
    'churn-rate',
    'cancellations-current-month',
    'cancelled-memberships',
    'failed-renewals',
    'membership-downgrades',
  ].includes(metric.id)
  const isPositive = invertTrend ? !isUp : isUp
  const isTextValue = TEXT_VALUE_METRIC_IDS.has(metric.id)
  const expiredCount = metric.id === 'expired-memberships' ? Number(metric.value) || 0 : 0
  const showAttentionHint = expiredCount > 0

  return (
    <div className="rounded-brand-lg bg-brand-surface flex min-h-[130px] flex-col border border-white/[0.06] p-4 transition-colors hover:border-white/10">
      <p className="text-body-sm text-muted truncate font-medium">{metric.label}</p>
      <p
        className={cn(
          'mt-2 font-bold tracking-tight text-white',
          isTextValue ? 'text-body-sm line-clamp-2 leading-snug font-semibold' : 'text-h3 truncate',
        )}
      >
        {metric.value}
      </p>
      <div className="mt-auto flex items-center gap-2 pt-3">
        {showAttentionHint ? (
          <span className="text-muted text-[10px]">Require attention</span>
        ) : metric.trend ? (
          <>
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold',
                isPositive
                  ? 'bg-brand-positive/15 text-brand-positive'
                  : 'bg-brand-danger/10 text-brand-danger',
              )}
            >
              {isUp ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
              {isUp ? '+' : metric.trend.percentage === 0 ? '' : '-'}
              {metric.trend.percentage}%
            </span>
            <span className="text-muted truncate text-[10px]">
              {metric.trend.label ?? 'vs last month'}
            </span>
          </>
        ) : null}
      </div>
    </div>
  )
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

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
      {isLoading
        ? filteredActiveMetricIds.map((id) => <StatCardSkeleton key={id} />)
        : visibleStats.map((stat) => <MembershipMetricCard key={stat.id} metric={stat} />)}
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
          <StatCardSkeleton key={idx} />
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
    <div className="rounded-brand-lg bg-brand-surface flex min-h-[130px] flex-col border border-white/[0.06] p-4">
      <p className="text-body-sm text-muted font-medium">{label}</p>
      <p className="text-h3 mt-2 font-bold tracking-tight text-white">
        {String(value).padStart(2, '0')}
      </p>
    </div>
  )
}
