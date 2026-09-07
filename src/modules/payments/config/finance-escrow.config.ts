import type {
  EscrowBookingRow,
  EscrowManagementTab,
} from '@/modules/payments/types/finance-table-rows'

const serviceNames = [
  'Business Coaching Session',
  'Legal Consultation',
  'Tax Advisory Call',
  'Marketing Strategy Review',
  'Financial Planning Session',
]

const expertNames = [
  'Sarah Jhonson',
  'Michael Chen',
  'Emma Rodriguez',
  'Alex Smith',
  'Priya Sharma',
]
const userNames = ['Alex Smith', 'John Carter', 'Maria Lopez', 'David Kim', 'Sophie Turner']

function createBookingRows(tab: EscrowManagementTab, count: number): EscrowBookingRow[] {
  return Array.from({ length: count }, (_, index) => {
    const rowIndex = index + 1
    const nameIndex = index % serviceNames.length

    return {
      id: `${tab}-booking-${rowIndex.toString().padStart(2, '0')}`,
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

/** Booking tab preview rows for the escrow management layout. */
export const escrowBookingPreviewRows: EscrowBookingRow[] = [
  ...createBookingRows('all', 20),
  ...createBookingRows('by-service', 15),
  ...createBookingRows('by-consultation', 14),
]

export const escrowViewTabs: Array<{ id: EscrowManagementTab; label: string }> = [
  { id: 'all', label: 'All Transaction' },
  { id: 'escrow', label: 'Escrow Holds' },
  { id: 'by-service', label: 'Booking By Service' },
  { id: 'by-consultation', label: 'Booking By Consultation' },
]
