export type RefundDetail = {
  id: string
  refundInformationPrimary: {
    refundId: string
    transactionId: string
    requestedDate: string
    status: 'Pending' | 'Resolved' | 'Denied' | 'Open'
  }
  refundInformationSecondary: {
    requestedBy: string
    service: string
    refundAmount: string
    paymentMethod: string
    maxRefundableAmount: number
  }
  reason: string
  adminNotes: string
}

const defaultRefundDetail: RefundDetail = {
  id: 'refund-01',
  refundInformationPrimary: {
    refundId: 'PAY-2026-00045',
    transactionId: 'Sarah Wilson',
    requestedDate: '2026-01-12',
    status: 'Pending',
  },
  refundInformationSecondary: {
    requestedBy: 'Rajesh Kumar',
    service: 'Financial Planning Consultation',
    refundAmount: '₹15,000',
    paymentMethod: 'UPI',
    maxRefundableAmount: 15000,
  },
  reason: 'Service not delivered as promised',
  adminNotes: 'Client claims expert did not show up for scheduled consultation',
}

export function getRefundDetailById(id: string): RefundDetail {
  return { ...defaultRefundDetail, id }
}
