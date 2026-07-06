export type FinanceEventStatus = 'Paid' | 'Pending' | 'Refunded'

export type FinanceEventSummaryMetric = {
  label: string
  value: string
  change: string
  changeNote: string
}

export type FinanceEventRow = {
  id: string
  eventId: string
  eventName: string
  organizer: string
  ticketSales: string
  platformFee: string
  netRevenue: string
  eventDate: string
  status: FinanceEventStatus
}

export const financeEventSummaryMetricsMock: FinanceEventSummaryMetric[] = [
  { label: 'Total Events', value: '24', change: '+4.1%', changeNote: 'vs last month' },
  { label: 'Ticket Revenue', value: '$1,24,500', change: '+4.1%', changeNote: 'vs last month' },
  { label: 'Pending Settlements', value: '$18,200', change: '+4.1%', changeNote: 'vs last month' },
  { label: 'Refunded', value: '$3,400', change: '+4.1%', changeNote: 'vs last month' },
]

export const financeEventRowsMock: FinanceEventRow[] = [
  {
    id: 'evt-01',
    eventId: 'EVT_1001',
    eventName: 'AWS Conference',
    organizer: 'Alex Johnson',
    ticketSales: '$280,000',
    platformFee: '$56,000',
    netRevenue: '$224,000',
    eventDate: '15/03/2025',
    status: 'Paid',
  },
  {
    id: 'evt-02',
    eventId: 'EVT_1002',
    eventName: 'Art Colossal Conference',
    organizer: 'Sarah Wilson',
    ticketSales: '$95,000',
    platformFee: '$19,000',
    netRevenue: '$76,000',
    eventDate: '22/03/2025',
    status: 'Pending',
  },
  {
    id: 'evt-03',
    eventId: 'EVT_1003',
    eventName: 'Tech Startup Summit',
    organizer: 'Rajesh Kumar',
    ticketSales: '$150,000',
    platformFee: '$30,000',
    netRevenue: '$120,000',
    eventDate: '01/04/2025',
    status: 'Paid',
  },
  {
    id: 'evt-04',
    eventId: 'EVT_1004',
    eventName: 'Wellness Retreat',
    organizer: 'Dr. Michael Chen',
    ticketSales: '$42,000',
    platformFee: '$8,400',
    netRevenue: '$33,600',
    eventDate: '10/02/2025',
    status: 'Refunded',
  },
]
