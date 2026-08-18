import type { LucideIcon } from 'lucide-react'
import { BadgeIndianRupee, ChartLine, Clock, Lock } from 'lucide-react'

export type TrendMetric = {
  label: string
  value: string
  change: string
  changeType: 'up' | 'down'
  changeNote?: string
}

export type KeyMetric = {
  label: string
  value: string
  change?: string
  changeType?: 'up' | 'down'
  subtext?: string
  icon: LucideIcon
}

export const topSummaryCardsMock: TrendMetric[] = [
  {
    label: 'Total In Escrow',
    value: '₹8,43,290',
    change: '6.7%',
    changeType: 'up',
    changeNote: 'vs last month',
  },
  {
    label: 'Pending Payout',
    value: '₹8,43,290',
    change: '6.7%',
    changeType: 'up',
    changeNote: 'vs last month',
  },
  {
    label: 'Disputed Amount',
    value: '₹8,43,290',
    change: '6.7%',
    changeType: 'up',
    changeNote: 'vs last month',
  },
]

export const revenueProfitCardsMock: TrendMetric[] = [
  {
    label: 'Total Platform Revenue',
    value: '$487,650',
    change: '6.7%',
    changeType: 'up',
    changeNote: 'vs last month',
  },
  {
    label: 'Monthly Recurring Revenue',
    value: '$487,650',
    change: '6.7%',
    changeType: 'up',
    changeNote: 'vs last month',
  },
  {
    label: 'Gross Margin',
    value: '$487,650',
    change: '6.7%',
    changeType: 'up',
    changeNote: 'vs last month',
  },
  {
    label: 'Net Profit',
    value: '$487,650',
    change: '6.7%',
    changeType: 'up',
    changeNote: 'vs last month',
  },
]

export const payoutsCashFlowCardsMock: TrendMetric[] = [
  {
    label: 'Pending Payouts',
    value: '$487,650',
    change: '6.7%',
    changeType: 'up',
    changeNote: 'vs last month',
  },
  {
    label: 'Avg. Payout Cycle Time',
    value: '$487,650',
    change: '6.7%',
    changeType: 'up',
    changeNote: 'vs last month',
  },
  {
    label: 'Refund Rate',
    value: '$487,650',
    change: '6.7%',
    changeType: 'up',
    changeNote: 'vs last month',
  },
  {
    label: 'Chargeback Rate',
    value: '$487,650',
    change: '6.7%',
    changeType: 'up',
    changeNote: 'vs last month',
  },
]

export const keyFinancialMetricsMock: KeyMetric[] = [
  {
    label: 'GMV',
    value: '₹10,00,000',
    change: '18.4%',
    changeType: 'up',
    icon: BadgeIndianRupee,
  },
  {
    label: 'Platform Revenue',
    value: '₹1,15,986',
    change: '22.3%',
    changeType: 'up',
    icon: ChartLine,
  },
  {
    label: 'In Escrow',
    value: '₹8,43,290',
    subtext: '12 Holds',
    icon: Lock,
  },
  {
    label: 'Pending Payouts',
    value: '₹2,14,500',
    subtext: '5 Pending',
    icon: Clock,
  },
]

export type RevenueFeeTrendPoint = {
  date: string
  platformFee: number
  revenue: number
}

export const revenueFeeTrendsMock: RevenueFeeTrendPoint[] = [
  { date: 'Jan 1', platformFee: 8000, revenue: 22000 },
  { date: 'Jan 3', platformFee: 2000, revenue: 33253 },
  { date: 'Jan 5', platformFee: 12000, revenue: 33253 },
  { date: 'Jan 7', platformFee: 15000, revenue: 38000 },
  { date: 'Jan 11', platformFee: 18000, revenue: 42000 },
  { date: 'Jan 13', platformFee: 22000, revenue: 48000 },
]

export type RevenueCategoryPoint = {
  name: string
  percent: number
  amount: number
  color: string
}

export const revenueByCategoryMock: RevenueCategoryPoint[] = [
  { name: 'Services', percent: 45, amount: 450000, color: '#FBC078' },
  { name: 'Memberships', percent: 28, amount: 280000, color: '#1447E6' },
  { name: 'Events', percent: 18, amount: 180000, color: '#00A63E' },
  { name: 'Venues', percent: 9, amount: 90000, color: '#E5E7EB' },
]

export type MonthlyComparisonPoint = {
  month: string
  mrr: number
  netProfit: number
  totalRevenue: number
}

export const monthlyComparisonMock: MonthlyComparisonPoint[] = [
  { month: 'Sep', mrr: 58785, netProfit: 48345, totalRevenue: 58785 },
  { month: 'Oct', mrr: 65000, netProfit: 52000, totalRevenue: 68000 },
  { month: 'Nov', mrr: 72000, netProfit: 58000, totalRevenue: 75000 },
  { month: 'Dec', mrr: 78000, netProfit: 62000, totalRevenue: 82000 },
  { month: 'Jan', mrr: 85000, netProfit: 68000, totalRevenue: 90000 },
  { month: 'Feb', mrr: 92000, netProfit: 74000, totalRevenue: 96000 },
]

export type EscrowStatusItem = {
  label: string
  value: number
  color: string
}

export const escrowStatusMock: EscrowStatusItem[] = [
  { label: 'Active Services', value: 450000, color: '#FBC078' },
  { label: 'Milestone hold', value: 280000, color: '#1447E6' },
  { label: 'Dispute hold', value: 45500, color: '#F54900' },
  { label: 'Ready to release', value: 67490, color: '#00A63E' },
]

export const totalEscrowAmount = 843290

export type WeeklyPayoutPoint = {
  day: string
  amount: number
}

export const weeklyPayoutScheduleMock: WeeklyPayoutPoint[] = [
  { day: 'Mon', amount: 42000 },
  { day: 'Tue', amount: 58785 },
  { day: 'Wed', amount: 52100 },
  { day: 'Thu', amount: 49800 },
  { day: 'Fri', amount: 63400 },
  { day: 'Sat', amount: 38900 },
  { day: 'Sun', amount: 31200 },
]
