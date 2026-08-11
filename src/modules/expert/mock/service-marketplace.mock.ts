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
  { label: 'Paused Services', value: '23' },
  { label: 'Archived Services', value: '45' },
  { label: 'Deleted Services', value: '10' },
  { label: 'Most Opted Service Category', value: 'Legal Services' },
  { label: 'Most Opted Service Sub-Category', value: 'Corporate Law' },
  { label: 'Total Service Orders', value: '3,102', trend: defaultTrend },
  { label: 'Completed Service Orders', value: '2,900', trend: defaultTrend },
  { label: 'In Progress Service Orders', value: '150' },
  {
    label: 'Disputed Service Orders',
    value: '52',
    trend: { direction: 'down', percentage: 2.1, label: 'vs last month' },
  },
  { label: 'Service Completion Rate', value: '93.5%', trend: defaultTrend },
  { label: 'Average Delivery Time', value: '2 days 4h', trend: defaultTrend },
  { label: 'Total Service Revenue', value: '₹12,45,000', trend: defaultTrend },
  { label: 'Average Revenue per Service', value: '₹3,293', trend: defaultTrend },
  { label: 'Average Order Value (AOV)', value: '₹4,290', trend: defaultTrend },
  { label: 'Average Service Rating', value: '4.8/5', trend: defaultTrend },
  { label: 'Customer Satisfaction', value: '95%', trend: defaultTrend },
  { label: 'On-Time Delivery %', value: '92%', trend: defaultTrend },
  { label: 'Average services per Expert', value: '3.4', trend: defaultTrend },
  {
    label: 'Total Refund Amount',
    value: '₹45,200',
    trend: { direction: 'down', percentage: 1.5, label: 'vs last month' },
  },
  {
    label: 'Refund Rate',
    value: '1.2%',
    trend: { direction: 'down', percentage: 0.3, label: 'vs last month' },
  },
]

export const consultationMetricsMock: MarketplaceMetric[] = [
  { label: 'Listed Consultations', value: '210', trend: defaultTrend },
  { label: 'Active Consultations', value: '185', trend: defaultTrend },
  { label: 'Paused Consultations', value: '15' },
  { label: 'Archived Consultations', value: '5' },
  { label: 'Deleted Consultations', value: '5' },
  { label: 'Consultation Bookings', value: '1,420', trend: defaultTrend },
  { label: 'Completed Consultations', value: '1,350', trend: defaultTrend },
  { label: 'Scheduled Consultations', value: '45' },
  {
    label: 'Cancelled Consultations',
    value: '25',
    trend: { direction: 'down', percentage: 0.8, label: 'vs last month' },
  },
  { label: 'Consultation Completion Rate', value: '95.1%', trend: defaultTrend },
  { label: 'Average Consultation Duration', value: '45 min' },
  { label: 'Total Consultation Revenue', value: '₹5,60,000', trend: defaultTrend },
  { label: 'Average Revenue per Consultation', value: '₹414', trend: defaultTrend },
  { label: 'Average Booking Value', value: '₹450', trend: defaultTrend },
  { label: 'Most Opted Consultation Category', value: 'Tax Consulting' },
  { label: 'Average Consultation Rating', value: '4.9/5', trend: defaultTrend },
  { label: 'Consultation Satisfaction', value: '97%', trend: defaultTrend },
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
