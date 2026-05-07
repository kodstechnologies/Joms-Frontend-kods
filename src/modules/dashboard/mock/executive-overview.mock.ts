import {
  Activity,
  BadgeIndianRupee,
  BarChart3,
  CreditCard,
  Percent,
  Users,
  Wallet,
} from 'lucide-react'

import type { StatCardProps } from '@/shared/components/dashboard/stat-card'
import type { AnalyticsMetric } from '@/shared/components/dashboard/analytics-widget'

export const kpiStatsMock: StatCardProps[] = [
  {
    title: 'Total Platform Revenue',
    value: '₹184.3K',
    icon: BadgeIndianRupee,
    trend: { direction: 'up', percentage: 12.5, label: 'vs last month' },
  },
  {
    title: 'Monthly Recurring Revenue',
    value: '₹15.7K',
    icon: Wallet,
    trend: { direction: 'up', percentage: 6.7, label: 'vs last month' },
  },
  {
    title: 'Customer Lifetime Value',
    value: '₹180.0K',
    icon: BarChart3,
    trend: { direction: 'up', percentage: 12.5, label: 'vs last quarter' },
  },
  {
    title: 'Gross Margin',
    value: '68.3%',
    icon: Percent,
    trend: { direction: 'up', percentage: 12.5, label: 'vs last quarter' },
  },
  {
    title: 'Active Members',
    value: '10,234',
    icon: Users,
    trend: { direction: 'up', percentage: 3.3, label: 'vs last month' },
  },
  {
    title: 'Total Events (MTD)',
    value: '1,245',
    icon: Activity,
    trend: { direction: 'up', percentage: 15.2, label: 'vs last month' },
  },
  {
    title: 'LTV:CAC Ratio',
    value: '7.4',
    icon: CreditCard,
    trend: { direction: 'up', percentage: 6.2, label: 'Healthy acquisition efficiency' },
  },
  {
    title: 'Net Promoter Score',
    value: '98',
    icon: Activity,
    trend: { direction: 'up', percentage: 2.1, label: 'Strong customer loyalty' },
  },
]

export const engagementMetricsMock: AnalyticsMetric[] = [
  { label: 'Avg Session/member', value: '48m 20sec' },
  { label: 'Event Participation', value: '70.23%' },
  { label: 'Avg. Event Ratings', value: '4.6/5' },
  { label: 'Venue Utilisation', value: '79.90%' },
  { label: 'Service Utilisation', value: '42.8%' },
  { label: 'Avg Service Ratings', value: '4.6/5' },
]

export type RevenueMemberPoint = { month: string; revenue: number; newMembers: number }
export const revenueMemberGrowthMock: RevenueMemberPoint[] = [
  { month: 'Jun', revenue: 18000, newMembers: 900 },
  { month: 'Jul', revenue: 72000, newMembers: 1123 },
  { month: 'Aug', revenue: 82000, newMembers: 1180 },
  { month: 'Sep', revenue: 94000, newMembers: 1250 },
  { month: 'Oct', revenue: 108000, newMembers: 1370 },
  { month: 'Nov', revenue: 126000, newMembers: 1490 },
]

export type MembershipTrendPoint = { month: string; active: number; expired: number; new: number }
export const membershipTrendsMock: MembershipTrendPoint[] = [
  { month: 'Jan', active: 12000, expired: 3200, new: 1400 },
  { month: 'Feb', active: 9800, expired: 2900, new: 1200 },
  { month: 'Mar', active: 11200, expired: 3400, new: 1500 },
  { month: 'Apr', active: 10400, expired: 3100, new: 1350 },
  { month: 'May', active: 10950, expired: 3300, new: 1480 },
]

export type FunnelPoint = { stage: string; value: number }
export const conversionFunnelMock: FunnelPoint[] = [
  { stage: 'Visits', value: 15000 },
  { stage: 'Sign Ups', value: 15000 },
  { stage: 'Profile complete', value: 15000 },
  { stage: 'First event', value: 14700 },
  { stage: 'Paid Member', value: 9800 },
]

export type ServiceDistributionPoint = { name: string; value: number }
export const serviceDistributionMock: ServiceDistributionPoint[] = [
  { name: 'Service', value: 20 },
  { name: 'Consultation', value: 20 },
  { name: 'Venues Booked', value: 10 },
  { name: 'Events Booked', value: 40 },
  { name: 'Community', value: 10 },
]
