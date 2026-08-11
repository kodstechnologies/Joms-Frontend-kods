export type MarketplaceMetric = {
  id: string
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
  { id: 'listed-services', label: 'Listed Services', value: '456', trend: defaultTrend },
  { id: 'active-services', label: 'Active Services', value: '378', trend: defaultTrend },
  { id: 'services-delivered', label: 'Services Delivered', value: '2,341', trend: defaultTrend },
  { id: 'service-completion', label: 'Service Completion %', value: '94.3%', trend: defaultTrend },
  { id: 'avg-delivery-time', label: 'Avg. Delivery Time', value: '4.2 days', trend: defaultTrend },
  {
    id: 'total-service-revenue',
    label: 'Total Service Revenue',
    value: '₹892,450',
    trend: defaultTrend,
  },
  {
    id: 'avg-revenue-service',
    label: 'Avg. Revenue/Service',
    value: '₹75,834',
    trend: defaultTrend,
  },
  { id: 'repeat-service', label: 'Repeat Service %', value: '38.7%', trend: defaultTrend },
  { id: 'avg-service-rating', label: 'Avg. Service Rating', value: '4.7/5', trend: defaultTrend },
  {
    id: 'customer-satisfaction',
    label: 'Customer Satisfaction',
    value: '92%',
    trend: defaultTrend,
  },
  { id: 'on-time-delivery', label: 'On-Time Delivery', value: '88%', trend: defaultTrend },
  {
    id: 'service-cancellation-rate',
    label: 'Service Cancellation Rate',
    value: '5.2%',
    trend: { direction: 'down', percentage: 5.2, label: 'vs last month' },
  },
]

export const consultationMetricsMock: MarketplaceMetric[] = [
  { id: 'listed-consultation', label: 'Listed Consultation', value: '456', trend: defaultTrend },
  { id: 'active-consultation', label: 'Active Consultation', value: '378', trend: defaultTrend },
  { id: 'completed', label: 'Completed', value: '2,341', trend: defaultTrend },
  {
    id: 'consultation-completion',
    label: 'Consultation Completion %',
    value: '94.3%',
    trend: defaultTrend,
  },
  { id: 'avg-consultation-time', label: 'Avg. Consultation Time', value: '52 min' },
  {
    id: 'total-consultation-revenue',
    label: 'Total Consultation Revenue',
    value: '₹892,450',
    trend: defaultTrend,
  },
  {
    id: 'avg-revenue-consultation',
    label: 'Avg. Revenue/Consultation',
    value: '₹7,583',
    trend: defaultTrend,
  },
  {
    id: 'repeat-consultation',
    label: 'Repeat Consultation %',
    value: '42.3%',
    trend: defaultTrend,
  },
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
