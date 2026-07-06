export type FinanceVenueStatus = 'Completed' | 'Pending' | 'Cancelled'

export type FinanceVenueRow = {
  id: string
  venueId: string
  name: string
  owner: string
  bookingId: string
  bookingTitle: string
  status: FinanceVenueStatus
  revenue: string
}

const venueNames = [
  'Grand Ballroom - Downtown',
  'Skyline Terrace',
  'Harbor View Hall',
  'Garden Pavilion',
  'Metro Conference Center',
]

const ownerNames = ['Sarah Jhonson', 'Michael Chen', 'Emma Rodriguez', 'Alex Smith', 'Priya Sharma']
const bookingTitles = ['Event', 'Meetup', 'Conference', 'Workshop', 'Wedding']

export const financeVenueRowsMock: FinanceVenueRow[] = Array.from({ length: 20 }, (_, index) => {
  const rowIndex = index + 1
  const nameIndex = index % venueNames.length

  return {
    id: `venue-${rowIndex.toString().padStart(2, '0')}`,
    venueId: `PMT_${5520 + rowIndex}`,
    name: venueNames[nameIndex],
    owner: ownerNames[nameIndex],
    bookingId: `BK${rowIndex.toString().padStart(4, '0')}`,
    bookingTitle: bookingTitles[nameIndex],
    status: index % 7 === 0 ? 'Pending' : 'Completed',
    revenue: '$12,500',
  }
})
