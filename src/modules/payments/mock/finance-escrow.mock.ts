import type {
  EscrowBookingRow,
  EscrowHoldRow,
  EscrowHoldStatus,
  EscrowManagementTab,
} from '@/modules/payments/types/finance-table-rows'

const serviceTypes = ['Fixed Service', 'Custom Service']
const holdReasons = [
  'Dispute filed by customer',
  'On-Going Project',
  'Pending verification',
  'Awaiting completion',
]
const holdStatuses: EscrowHoldStatus[] = ['Active', 'Released', 'Dispute', 'Active', 'Released']

function createEscrowRows(tab: EscrowManagementTab, count: number): EscrowHoldRow[] {
  return Array.from({ length: count }, (_, index) => {
    const rowIndex = index + 1
    const typeIndex = index % serviceTypes.length

    return {
      id: `${tab}-escrow-${rowIndex.toString().padStart(2, '0')}`,
      tab,
      escrowId: `ESC${rowIndex.toString().padStart(3, '0')}`,
      transactionId: `TXN_${8820 + rowIndex}`,
      type: serviceTypes[typeIndex],
      amount: '₹1,25,000',
      holdReason: holdReasons[typeIndex],
      initiatedDate: '01/02/2025',
      expectedRelease: '01/05/2025',
      status: holdStatuses[index % holdStatuses.length],
    }
  })
}

export const escrowHoldRowsMock: EscrowHoldRow[] = [
  ...createEscrowRows('all', 20),
  ...createEscrowRows('escrow', 20),
  ...createEscrowRows('by-service', 15),
  ...createEscrowRows('by-consultation', 14),
]

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

export const escrowBookingRowsMock: EscrowBookingRow[] = [
  ...createBookingRows('all', 20),
  ...createBookingRows('by-service', 15),
  ...createBookingRows('by-consultation', 14),
]

export const escrowManagementTabs: Array<{ id: EscrowManagementTab; label: string }> = [
  { id: 'all', label: 'All Transaction' },
  { id: 'escrow', label: 'Escrow Holds' },
  { id: 'by-service', label: 'Booking By Service' },
  { id: 'by-consultation', label: 'Booking By Consultation' },
]
