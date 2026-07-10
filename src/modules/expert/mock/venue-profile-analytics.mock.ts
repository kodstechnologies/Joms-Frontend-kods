export const BASIC_INFO = [
  { label: 'Account Status', value: 'Active' },
  { label: 'Last Active', value: '2 hours ago' },
  { label: 'Venue Rating', value: '4.8/5.0' },
  { label: 'Venue Category', value: 'Event space' },
  { label: 'Customer Satisfaction Score', value: '92%' },
]

export const VISIBILITY_METRICS = [
  {
    label: 'Profile Views',
    value: '2,847',
    trend: { percent: 5.2, vsLastMonth: '+12.3% vs last month' },
  },
  {
    label: 'Conversion Rate',
    value: '18.4%',
    trend: { percent: 5.2, vsLastMonth: '+12.3% vs last month' },
  },
  { label: 'Last Booking Request', value: 'Today, 2:30 PM' },
]

export const BOOKING_SNAPSHOT = [
  { label: 'Total Bookings Confirmed', value: '342', trend: { percent: 5.2, vsLastMonth: '+12.3% vs last month' } },
  { label: 'Total Bookings Completed', value: '298', trend: { percent: 5.2, vsLastMonth: '+12.3% vs last month' } },
  { label: 'Upcoming Bookings', value: '28', trend: { percent: 5.2, vsLastMonth: '+12.3% vs last month' } },
  { label: 'Ongoing Bookings', value: '10', trend: { percent: 5.2 } },
  { label: 'Canceled Bookings', value: '11', trend: { percent: 5.2, vsLastMonth: '+12.3% vs last month' } },
  { label: 'Booking Completion Rate', value: '87.1%', trend: { percent: 5.2, vsLastMonth: '+12.3% vs last month' } },
  { label: 'Cancellation Rate', value: '3.2%', trend: { percent: 5.2, vsLastMonth: '+12.3% vs last month' } },
]

export const REVENUE_SNAPSHOT = [
  { label: 'Total Revenue', value: '₹124,580', trend: { percent: 5.2 } },
  { label: 'Revenue Growth Rate', value: '+15.8%', trend: { percent: 5.2, vsLastMonth: '+12.3% vs last month' } },
  { label: 'Avg Revenue per Booking', value: '₹36,234', trend: { percent: 5.2 } },
  { label: 'Avg Revenue per Space', value: '₹15,573', trend: { percent: 5.2 } },
]

export const SPACE_ANALYSIS = [
  { label: 'Total Spaces Listed', value: '10' },
  { label: 'Active Spaces', value: '05' },
  { label: 'Inactive Spaces', value: '05' },
  {
    label: 'Space Utilization Rate',
    value: '58.3%',
    trend: { percent: 5.2, vsLastMonth: '+12.3% vs last month' },
  },
  { label: 'Highest Revenue Space', value: 'Grand Ballroom' },
  { label: 'Most Viewed Space', value: 'Conference Room A' },
  { label: 'Peak Booking Time', value: '2:00 PM - 5:00 PM' },
]

export const ALL_SPACES = [
  { name: 'Grand Ballroom', category: 'Event', bookings: 52, rating: 4.9, utilization: 78, revenue: '₹228,450', status: 'Active' as const },
  { name: 'Meeting Pod 1', category: 'Meet Up', bookings: 67, rating: 4.8, utilization: 75, revenue: '₹264,320', status: 'Active' as const },
  { name: 'Conference Room A', category: 'Meet Up', bookings: 81, rating: 4.7, utilization: 71, revenue: '₹213,890', status: 'Active' as const },
  { name: 'Breakout Room B', category: 'Meet Up', bookings: 110, rating: 4.8, utilization: 65, revenue: '₹228,100', status: 'Active' as const },
  { name: 'Rooftop Terrace', category: 'Meet Up', bookings: 102, rating: 4.6, utilization: 55, revenue: '₹193,230', status: 'Active' as const },
  { name: 'Executive Suite', category: 'Event', bookings: 97, rating: 4.6, utilization: 51, revenue: '₹264,320', status: 'Active' as const },
  { name: 'Garden Pavilion', category: 'Event', bookings: 123, rating: 4.6, utilization: 45, revenue: '₹213,890', status: 'Active' as const },
  { name: 'Main Hall', category: 'Event', bookings: 123, rating: 4.6, utilization: 28, revenue: '₹228,100', status: 'Inactive' as const },
]

export const EVENT_METRICS = [
  { label: 'Total Bookings Confirmed', value: '10' },
  { label: 'Total Bookings Completed', value: '05' },
  { label: 'Upcoming Bookings', value: '05' },
  { label: 'Ongoing Bookings', value: '02', trend: { percent: 5.2, vsLastMonth: '+12.3% vs last month' } },
  { label: 'Canceled Bookings', value: '01' },
  { label: 'Avg Revenue per Booking', value: '₹36,234' },
  { label: 'Most Frequent Host', value: 'Sarah Williams' },
]

export const MEETUP_METRICS = [
  { label: 'Total Bookings Confirmed', value: '10' },
  { label: 'Total Bookings Completed', value: '05' },
  { label: 'Upcoming Bookings', value: '05' },
  { label: 'Ongoing Bookings', value: '02', trend: { percent: 5.2, vsLastMonth: '+12.3% vs last month' } },
  { label: 'Canceled Bookings', value: '01' },
  { label: 'Avg Revenue per Booking', value: '₹36,234' },
  { label: 'Most Frequent Host', value: 'Sarah Williams' },
]

export const EVENT_BOOKINGS = [
  { id: 'BKE-001', space: 'Grand Ballroom', host: 'Sarah Williams', date: '2024-02-20', revenue: '₹228,450', status: 'confirmed' as const },
  { id: 'BKE-001', space: 'Rooftop Terrace', host: 'John Smith', date: '2024-02-20', revenue: '₹264,320', status: 'completed' as const },
  { id: 'BKE-001', space: 'Executive Suite', host: 'Sarah Williams', date: '2024-02-20', revenue: '₹213,890', status: 'confirmed' as const },
  { id: 'BKE-001', space: 'Grand Ballroom', host: 'Michael Chen', date: '2024-02-20', revenue: '₹228,100', status: 'ongoing' as const },
  { id: 'BKE-001', space: 'Main Hall', host: 'Emily Davis', date: '2024-02-20', revenue: '₹193,230', status: 'cancelled' as const },
]

export const REVENUE_KPIS = [
  { label: 'Total Revenue', value: '₹124,580' },
  { label: 'Revenue Growth Rate', value: '+15.8%', trend: { percent: 5.2, vsLastMonth: '+12.3% vs last month' } },
  { label: 'Avg Revenue per Space', value: '₹15,573' },
  { label: 'Avg Revenue per Booking (Event)', value: '₹15,573' },
  { label: 'Avg Revenue per Booking (Meetup)', value: '₹15,573' },
  { label: 'Highest Revenue Space', value: 'Grand Ballroom' },
]

export const REVENUE_BREAKDOWN = [
  { label: 'Events Revenue', value: 82400, percent: 66, color: '#1A73E8' },
  { label: 'Meetup Revenue', value: 42180, percent: 34, color: 'var(--brand-accent)' },
]

export const TOP_REVENUE_SPACES = [
  { rank: 1, name: 'Grand Ballroom', share: '34% of total', revenue: '₹42,180' },
  { rank: 2, name: 'Rooftop Terrace', share: '31% of total', revenue: '₹38,900' },
  { rank: 3, name: 'Executive Suite', share: '25% of total', revenue: '₹31,500' },
  { rank: 4, name: 'Conference Room A', share: '10% of total', revenue: '₹11,830' },
]

export const REVENUE_TREND = [
  { date: 'Feb 1', events: 45, meetups: 30 },
  { date: 'Feb 5', events: 55, meetups: 38 },
  { date: 'Feb 10', events: 62, meetups: 42 },
  { date: 'Feb 15', events: 70, meetups: 48 },
  { date: 'Feb 20', events: 78, meetups: 55 },
  { date: 'Feb 25', events: 85, meetups: 60 },
  { date: 'Feb 28', events: 92, meetups: 68 },
]

export const BOOKING_FUNNEL = [
  { stage: 'Space View', value: 1247, conversion: '100.0% conversion' },
  { stage: 'Booking Request', value: 229, conversion: '18.4% conversion', dropOff: '81.6% drop off' },
  { stage: 'Completed Bookings', value: 199, conversion: '16.0% conversion', dropOff: '2.4% drop off' },
]

export const BOOKING_CATEGORY_SPLIT = [
  { name: 'Events', value: 55 },
  { name: 'Meet Ups', value: 45 },
]

export const BOOKINGS_TREND = [
  { week: 'Week 1', events: 12, meetups: 18 },
  { week: 'Week 2', events: 16, meetups: 22 },
  { week: 'Week 3', events: 20, meetups: 26 },
  { week: 'Week 4', events: 24, meetups: 30 },
]
