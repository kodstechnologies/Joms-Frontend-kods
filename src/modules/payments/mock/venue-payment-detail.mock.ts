export type VenuePaymentDetail = {
  id: string
  venueTitle: string
  venueDescription: string
  paymentInformation: {
    bookingId: string
    venueId: string
    transactionId: string
    entityType: string
    bookingTitle: string
    createdOn: string
    bookingDuration: string
    bookingStatus: 'Confirmed' | 'Pending' | 'Cancelled'
  }
  timelineInformation: {
    bookingRequestedOn: string
    paymentCompletedOn: string
    eventCompletedOn: string
    depositReleaseDate: string
    finalSettlementDate: string
  }
  financialBreakdown: {
    rentalFee: string
    numberOfDays: string
    depositStatus: string
    platformFee: string
    gst: string
  }
  venueInformation: {
    venueName: string
    ownerName: string
    ownerId: string
    venueType: string
    capacity: string
    location: string
    approvedStatus: 'Approved' | 'Pending' | 'Rejected'
  }
  parties: {
    clientId: string
    clientName: string
    ownerId: string
    ownerName: string
  }
  finalCalculation: {
    totalCollected: string
    platformEarnings: string
    netPayableToVenueOwner: string
    ownerName: string
  }
}

const defaultVenuePaymentDetail: VenuePaymentDetail = {
  id: 'venue-01',
  venueTitle: 'Venue Information',
  venueDescription: 'Provide details about your Consultation',
  paymentInformation: {
    bookingId: 'VB-2026-00021',
    venueId: 'TXN-2026-00981',
    transactionId: 'SRV-2026-00452',
    entityType: 'Event/Meetup',
    bookingTitle: 'Tech Conference 2026',
    createdOn: '01/02/2026',
    bookingDuration: '2 Days',
    bookingStatus: 'Confirmed',
  },
  timelineInformation: {
    bookingRequestedOn: '30/01/2026',
    paymentCompletedOn: '01/02/2026',
    eventCompletedOn: '05/02/2026',
    depositReleaseDate: '01/01/2026',
    finalSettlementDate: '01/01/2026',
  },
  financialBreakdown: {
    rentalFee: '₹25,000',
    numberOfDays: '02',
    depositStatus: 'Held',
    platformFee: '₹2,500',
    gst: '₹3,450',
  },
  venueInformation: {
    venueName: 'Grand Ballroom – Downtown',
    ownerName: 'City Venues LLC',
    ownerId: 'OWN-0045',
    venueType: 'Indoor',
    capacity: '500 Guests',
    location: 'Bangalore',
    approvedStatus: 'Approved',
  },
  parties: {
    clientId: 'US0001',
    clientName: 'Alex Smith',
    ownerId: 'EXP001',
    ownerName: 'Sarah Jhonson',
  },
  finalCalculation: {
    totalCollected: '₹64,450',
    platformEarnings: '₹2,500',
    netPayableToVenueOwner: '₹56,950',
    ownerName: 'Sarah Jhonson',
  },
}

export function getVenuePaymentDetailById(id: string): VenuePaymentDetail {
  return { ...defaultVenuePaymentDetail, id }
}
