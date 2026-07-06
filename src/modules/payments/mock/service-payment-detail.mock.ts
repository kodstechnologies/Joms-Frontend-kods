export type ServicePaymentDetail = {
  id: string
  serviceTitle: string
  serviceDescription: string
  paymentInformation: {
    paymentId: string
    transactionId: string
    bookingId: string
    paymentMethod: string
    paymentGateway: string
    createdOn: string
    settlementStatus: string
    paymentStatus: 'Successful' | 'Pending' | 'Failed'
  }
  serviceInformation: {
    serviceName: string
    serviceType: string
    category: string
    startDate: string
    endDate: string
    completionStatus: 'Completed' | 'In Progress' | 'Pending'
    paymentStatus: 'Successful' | 'Pending' | 'Failed'
  }
  timelineInformation: {
    bookingDate: string
    paymentDate: string
    serviceCompletedOn: string
    payoutReleasedOn: string
  }
  parties: {
    clientId: string
    clientName: string
    expertId: string
    expertName: string
  }
  financialBreakdown: {
    payoutId: string
    payoutMethod: string
    serviceCompletedOn: string
    payoutDate: string
    paymentStatus: 'Successful' | 'Pending' | 'Failed'
  }
}

const defaultServicePaymentDetail: ServicePaymentDetail = {
  id: 'all-01',
  serviceTitle: 'Service Information',
  serviceDescription: 'Provide details about your Consultation',
  paymentInformation: {
    paymentId: 'SUB-2026-00124',
    transactionId: 'TXN-2026-00961',
    bookingId: 'SRV-2026-00452',
    paymentMethod: 'UPI',
    paymentGateway: 'Razorpay',
    createdOn: '01/02/2026',
    settlementStatus: 'Settled',
    paymentStatus: 'Successful',
  },
  serviceInformation: {
    serviceName: 'UI/UX Consultation',
    serviceType: 'Fixed Service',
    category: 'Design',
    startDate: '01/01/2026',
    endDate: '01/01/2026',
    completionStatus: 'Completed',
    paymentStatus: 'Successful',
  },
  timelineInformation: {
    bookingDate: '30/01/2026',
    paymentDate: '01/02/2026',
    serviceCompletedOn: '05/02/2026',
    payoutReleasedOn: '01/01/2026',
  },
  parties: {
    clientId: 'US0001',
    clientName: 'Alex Smith',
    expertId: 'EXP001',
    expertName: 'Sarah Jhonson',
  },
  financialBreakdown: {
    payoutId: 'PAYOUT-2026-0081',
    payoutMethod: 'Bank Transfer',
    serviceCompletedOn: '05/02/2026',
    payoutDate: '01/01/2026',
    paymentStatus: 'Successful',
  },
}

export function getServicePaymentDetailById(id: string): ServicePaymentDetail {
  return { ...defaultServicePaymentDetail, id }
}
