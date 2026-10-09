export type TrendMetric = {
  label: string
  value: string
  change: string
  changeType: 'up' | 'down'
  changeNote?: string
}

export type RevenueTrendPoint = {
  date: string
  revenue: number
}

export type RevenueCategoryPoint = {
  name: string
  percent: number
  amount: number
  color: string
}

export type MonthlyRevenuePoint = {
  month: string
  totalRevenue: number
}

export type EscrowStatusItem = {
  label: string
  value: number
  color: string
}

export type WeeklyPayoutPoint = {
  day: string
  amount: number
}

export const FINANCE_MODULE_LABELS: Record<string, string> = {
  service: 'Services',
  membership: 'Memberships',
  event: 'Events',
  venue: 'Venues',
  other: 'Other',
}

export const FINANCE_CATEGORY_COLORS = ['#FBC078', '#1447E6', '#00A63E', '#E5E7EB', '#F54900']
