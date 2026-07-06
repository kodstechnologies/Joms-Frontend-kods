export type TaxComplianceStatus = 'Completed' | 'Pending' | 'Filed'

export type TaxComplianceRow = {
  id: string
  recordId: string
  entityType: string
  entityId: string
  owner: string
  bookingId: string
  bookingTitle: string
  status: TaxComplianceStatus
  revenue: string
}

const entityTypes = ['Event', 'Service', 'Venue', 'Membership', 'Consultation']
const entityIds = ['EVT001', 'SEV001', 'VEN001', 'MEM001', 'CON001']
const ownerNames = ['Sarah Jhonson', 'Michael Chen', 'Emma Rodriguez', 'Alex Smith', 'Priya Sharma']
const bookingTitles = ['Event', 'Meetup', 'Conference', 'Workshop', 'Wedding']

export const financeTaxComplianceRowsMock: TaxComplianceRow[] = Array.from({ length: 20 }, (_, index) => {
  const rowIndex = index + 1
  const typeIndex = index % entityTypes.length

  return {
    id: `tax-${rowIndex.toString().padStart(2, '0')}`,
    recordId: `PMT_${5520 + rowIndex}`,
    entityType: entityTypes[typeIndex],
    entityId: entityIds[typeIndex],
    owner: ownerNames[typeIndex],
    bookingId: `BK${rowIndex.toString().padStart(4, '0')}`,
    bookingTitle: bookingTitles[typeIndex],
    status: index % 8 === 0 ? 'Pending' : 'Completed',
    revenue: '$12,500',
  }
})
