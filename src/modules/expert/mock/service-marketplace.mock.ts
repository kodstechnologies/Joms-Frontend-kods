export type MarketplaceMetric = {
  label: string
  value: string
  trend?: {
    direction: 'up' | 'down'
    percentage: number
    label?: string
  }
}

const defaultTrend = { direction: 'up' as const, percentage: 5.2, label: 'vs last month' }

export const serviceMetricsMock: MarketplaceMetric[] = [
  { label: 'Listed Services', value: '456', trend: defaultTrend },
  { label: 'Active Services', value: '378', trend: defaultTrend },
  { label: 'Services Delivered', value: '2,341', trend: defaultTrend },
  { label: 'Service Completion %', value: '94.3%', trend: defaultTrend },
  { label: 'Avg. Delivery Time', value: '4.2 days', trend: defaultTrend },
  { label: 'Total Service Revenue', value: '₹892,450', trend: defaultTrend },
  { label: 'Avg. Revenue/Service', value: '₹75,834', trend: defaultTrend },
  { label: 'Repeat Service %', value: '38.7%', trend: defaultTrend },
  { label: 'Avg. Service Rating', value: '4.7/5', trend: defaultTrend },
  { label: 'Customer Satisfaction', value: '92%', trend: defaultTrend },
  { label: 'On-Time Delivery', value: '88%', trend: defaultTrend },
  {
    label: 'Service Cancellation Rate',
    value: '5.2%',
    trend: { direction: 'down', percentage: 5.2, label: 'vs last month' },
  },
]

export const consultationMetricsMock: MarketplaceMetric[] = [
  { label: 'Listed Consultation', value: '456', trend: defaultTrend },
  { label: 'Active Consultation', value: '378', trend: defaultTrend },
  { label: 'Completed', value: '2,341', trend: defaultTrend },
  { label: 'Consultation Completion %', value: '94.3%', trend: defaultTrend },
  { label: 'Avg. Consultation Time', value: '52 min' },
  { label: 'Total Consultation Revenue', value: '₹892,450', trend: defaultTrend },
  { label: 'Avg. Revenue/Consultation', value: '₹7,583', trend: defaultTrend },
  { label: 'Repeat Consultation %', value: '42.3%', trend: defaultTrend },
]

export type ServiceConsultationTrendPoint = {
  month: string
  consultationsCompleted: number
  servicesDelivered: number
  revenue: number
}

export const serviceConsultationTrendsMock: ServiceConsultationTrendPoint[] = [
  { month: 'Jan', consultationsCompleted: 410, servicesDelivered: 560, revenue: 5600 },
  { month: 'Feb', consultationsCompleted: 520, servicesDelivered: 490, revenue: 6400 },
  { month: 'Mar', consultationsCompleted: 357, servicesDelivered: 280, revenue: 4800 },
  { month: 'Apr', consultationsCompleted: 395, servicesDelivered: 340, revenue: 5200 },
  { month: 'May', consultationsCompleted: 485, servicesDelivered: 405, revenue: 6600 },
  { month: 'Jun', consultationsCompleted: 530, servicesDelivered: 425, revenue: 7100 },
  { month: 'July', consultationsCompleted: 455, servicesDelivered: 375, revenue: 5900 },
]
