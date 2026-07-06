export type FinanceServiceTab = 'all' | 'escrow' | 'by-service' | 'by-consultation'

export type FinanceServiceStatus = 'Paid' | 'Pending'

export type FinanceServiceRow = {
  id: string
  tab: FinanceServiceTab
  serviceId: string
  name: string
  expertName: string
  bookingId: string
  userName: string
  status: FinanceServiceStatus
  revenue: string
}

const serviceNames = [
  'Business Coaching Session',
  'Legal Consultation',
  'Tax Advisory Call',
  'Marketing Strategy Review',
  'Financial Planning Session',
]

const expertNames = ['Sarah Jhonson', 'Michael Chen', 'Emma Rodriguez', 'Alex Smith', 'Priya Sharma']
const userNames = ['Alex Smith', 'John Carter', 'Maria Lopez', 'David Kim', 'Sophie Turner']

function createRows(tab: FinanceServiceTab, count: number, startIndex: number): FinanceServiceRow[] {
  return Array.from({ length: count }, (_, index) => {
    const rowIndex = startIndex + index + 1
    const nameIndex = index % serviceNames.length

    return {
      id: `${tab}-${rowIndex.toString().padStart(2, '0')}`,
      tab,
      serviceId: `PMT_${5520 + rowIndex}`,
      name: serviceNames[nameIndex],
      expertName: expertNames[nameIndex],
      bookingId: `BK${rowIndex.toString().padStart(4, '0')}`,
      userName: userNames[nameIndex],
      status: index % 6 === 0 ? 'Pending' : 'Paid',
      revenue: '$12,500',
    }
  })
}

export const financeServiceRowsMock: FinanceServiceRow[] = [
  ...createRows('all', 20, 0),
  ...createRows('escrow', 12, 0),
  ...createRows('by-service', 15, 0),
  ...createRows('by-consultation', 14, 0),
]

export const financeServiceTabs: Array<{ id: FinanceServiceTab; label: string }> = [
  { id: 'all', label: 'All Transaction' },
  { id: 'escrow', label: 'Escrow Holds' },
  { id: 'by-service', label: 'Booking By Service' },
  { id: 'by-consultation', label: 'Booking By Consultation' },
]
