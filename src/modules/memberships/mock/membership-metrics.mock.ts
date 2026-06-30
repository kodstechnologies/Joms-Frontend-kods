export const membershipMemberMetricsMock = {
  totalMembers: {
    value: '265',
    trend: { direction: 'up' as const, percentage: 6.7, label: 'vs last month' },
  },
  expiredMemberships: {
    value: '57',
    hint: 'Requires attention',
  },
  totalRevenue: {
    value: '₹74,069.74',
    trend: { direction: 'up' as const, percentage: 8.2, label: 'vs previous week' },
  },
  renewalRate: {
    value: '83.3%',
    trend: { direction: 'up' as const, percentage: 12.5, label: 'vs last month' },
  },
  mostSubscribedPlan: {
    value: 'Popular',
    hint: 'Top performer',
  },
}

export const DEFAULT_BILLING_CYCLES = ['Weekly', '3 Months', '6 Months'] as const

export const PAUSE_REASON_OPTIONS = [
  { label: 'Seasonal pause', value: 'seasonal_pause' },
  { label: 'Maintenance window', value: 'maintenance_window' },
  { label: 'Policy review', value: 'policy_review' },
  { label: 'Low demand period', value: 'low_demand_period' },
]

export const DELETE_REASON_OPTIONS = [
  { label: 'Plan discontinued', value: 'plan_discontinued' },
  { label: 'Merged with another plan', value: 'merged_plan' },
  { label: 'Compliance requirement', value: 'compliance_requirement' },
  { label: 'Low adoption', value: 'low_adoption' },
]
