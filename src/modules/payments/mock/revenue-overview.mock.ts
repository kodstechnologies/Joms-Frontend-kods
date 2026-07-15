export type RevenueOverviewStatus = 'Paid' | 'Pending' | 'Failed'

export type RevenueOverviewRow = {
  id: string
  module: string
  entityType: string
  entityId: string
  entityName: string
  category: string
  ownerType: string
  ownerName: string
  grossAmount: string
  status: RevenueOverviewStatus
}

const baseRows: RevenueOverviewRow[] = [
  {
    id: 'rev-01',
    module: 'Events',
    entityType: 'Ticketing',
    entityId: 'NM_02',
    entityName: 'AWS Conference',
    category: 'Technology',
    ownerType: 'Organizer',
    ownerName: 'Alex',
    grossAmount: '₹280,000',
    status: 'Paid',
  },
  {
    id: 'rev-02',
    module: 'Service',
    entityType: 'Consultation',
    entityId: 'NM_03',
    entityName: 'NDA Review',
    category: 'Legal',
    ownerType: 'Expert',
    ownerName: 'Legal Corp Inc.',
    grossAmount: '₹280,000',
    status: 'Paid',
  },
  {
    id: 'rev-03',
    module: 'Venue',
    entityType: 'Rental',
    entityId: 'NM_04',
    entityName: 'Strategic Business Consultation',
    category: 'Consulting',
    ownerType: 'Venue Owner',
    ownerName: 'Dr. Michael Chen',
    grossAmount: '₹280,000',
    status: 'Paid',
  },
  {
    id: 'rev-04',
    module: 'Membership',
    entityType: 'Premium',
    entityId: 'NM_04',
    entityName: 'Art Colossal Conference',
    category: 'Arts',
    ownerType: 'Platform',
    ownerName: 'Emma Rodriguez',
    grossAmount: '₹280,000',
    status: 'Paid',
  },
]

const extraRows: RevenueOverviewRow[] = Array.from({ length: 16 }, (_, index) => {
  const rowNumber = index + 5
  const modules = ['Events', 'Service', 'Venue', 'Membership']
  const module = modules[index % modules.length]

  return {
    id: `rev-${rowNumber.toString().padStart(2, '0')}`,
    module,
    entityType:
      module === 'Events'
        ? 'Ticketing'
        : module === 'Service'
          ? 'Consultation'
          : module === 'Venue'
            ? 'Rental'
            : 'Premium',
    entityId: `NM_${(rowNumber + 10).toString().padStart(2, '0')}`,
    entityName: `${module} Transaction ${rowNumber}`,
    category: ['Technology', 'Legal', 'Consulting', 'Arts'][index % 4],
    ownerType: ['Organizer', 'Expert', 'Venue Owner', 'Platform'][index % 4],
    ownerName: ['Alex', 'Legal Corp Inc.', 'Dr. Michael Chen', 'Emma Rodriguez'][index % 4],
    grossAmount: '₹280,000',
    status: index % 5 === 0 ? 'Pending' : 'Paid',
  }
})

export const revenueOverviewRowsMock: RevenueOverviewRow[] = [...baseRows, ...extraRows]
