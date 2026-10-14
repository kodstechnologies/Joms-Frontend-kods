export type TrendMetric = {
  label: string
  value: string
  change: string
  changeType: 'up' | 'down'
  changeNote?: string
}

export type RevenueFeeTrendPoint = {
  date: string
  platformFee: number
  revenue: number
}

export type RevenueCategoryPoint = {
  name: string
  percent: number
  amount: number
  color: string
}

export type MonthlyComparisonPoint = {
  month: string
  mrr: number
  netProfit: number
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
