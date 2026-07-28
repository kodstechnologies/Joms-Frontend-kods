export type PaymentDetail = {
  id: string
  serviceTitle: string
  serviceDescription: string
  revenueId: string
  sourceModule: string
  sourceType: string
  sourceId: string
  sourceName: string
  hostOwner: string
  transactionDate: string
  currency: string
  paymentStatus: 'Successful' | 'Pending' | 'Failed'
  revenueFlow: {
    customerPaid: string
    afterDiscounts: string
    afterRefunds: string
    platformCommission: string
    gatewayDeduction: string
    finalPlatformEarnings: string
    hostPayout: string
  }
  revenueBreakdown: {
    grossAmount: string
    discounts: string
    refunds: string
    netRevenue: string
  }
  taxFeeBreakdown: {
    taxCollected: string
    paymentGatewayFee: string
    platformFee: string
    netPlatformEarnings: string
  }
  transactionReferences: {
    gatewayName: string
    gatewayTransactionId: string
    platformRecordId: string
    settlementDate: string
  }
  additionalVenueContext?: {
    bookingDates: string
    duration: string
    eventType: string
    cancellationPolicy: string
    venueId: string
    ownerId: string
  }
}

const defaultPaymentDetail: PaymentDetail = {
  id: 'rev-01',
  serviceTitle: 'Service Information',
  serviceDescription: 'Provide details about your Consultation',
  revenueId: 'REV-2026-00124',
  sourceModule: 'Event',
  sourceType: 'Paid Event',
  sourceId: 'EVT-4582',
  sourceName: 'Digital Growth Summit 2026',
  hostOwner: 'Alex Smith',
  transactionDate: '01/01/2026',
  currency: 'INR',
  paymentStatus: 'Successful',
  revenueFlow: {
    customerPaid: '₹50,000',
    afterDiscounts: '₹45,000',
    afterRefunds: '₹43,000',
    platformCommission: '₹8,600',
    gatewayDeduction: '₹1,200',
    finalPlatformEarnings: '₹7,400',
    hostPayout: '₹34,400',
  },
  revenueBreakdown: {
    grossAmount: '₹50,000',
    discounts: '-₹5,000',
    refunds: '-₹2,000',
    netRevenue: '₹43,000',
  },
  taxFeeBreakdown: {
    taxCollected: '₹7,740',
    paymentGatewayFee: '₹1,200',
    platformFee: '₹8,600',
    netPlatformEarnings: '₹7,400',
  },
  transactionReferences: {
    gatewayName: 'Razorpay',
    gatewayTransactionId: 'pay_NH82Jsk982',
    platformRecordId: 'TXN-982341',
    settlementDate: '19 Feb 2026',
  },
  additionalVenueContext: {
    bookingDates: 'Feb 2026 - 21 Feb 2026',
    duration: '02',
    eventType: 'Corporate Conference',
    cancellationPolicy: '48-hour Partial Refund',
    venueId: 'VEN-5562',
    ownerId: 'VEN-5562',
  },
}

export function getPaymentDetailById(id: string): PaymentDetail {
  return { ...defaultPaymentDetail, id }
}
