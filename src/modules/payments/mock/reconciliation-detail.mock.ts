export type ReconciliationDetail = {
  id: string
  recordTitle: string
  recordDescription: string
  reconciliationInformation: {
    reconciliationId: string
    gateway: string
    transactionId: string
    platformRecordId: string
    settlementBatchId: string
    settlementDate: string
    bankCreditDate: string
    reconciledBy: string
    reconciliationDate: string
    status: 'Matched' | 'Mismatch' | 'Pending'
  }
  gatewayDetails: {
    gatewayReportedAmount: string
    gatewayFee: string
    netSettledAmount: string
    currency: string
    gatewayReferenceId: string
  }
  platformRecordSummary: {
    platformGrossAmount: string
    refundRecorded: string
    platformCommission: string
    taxCollected: string
    expectedSettlementAmount: string
  }
}

const defaultReconciliationDetail: ReconciliationDetail = {
  id: 'recon-01',
  recordTitle: 'Tax & Compliance Information',
  recordDescription: 'Provide details about your Consultation',
  reconciliationInformation: {
    reconciliationId: 'VR-2026-00021',
    gateway: 'Razor',
    transactionId: 'TXN-2026-10022',
    platformRecordId: 'SRV-REC-003112',
    settlementBatchId: 'GST',
    settlementDate: '01/01/2026',
    bankCreditDate: '01/01/2026',
    reconciledBy: 'Admin',
    reconciliationDate: '11/2/2026',
    status: 'Matched',
  },
  gatewayDetails: {
    gatewayReportedAmount: '₹18,000',
    gatewayFee: '₹250',
    netSettledAmount: '₹17,750',
    currency: 'INR',
    gatewayReferenceId: 'STR-REF-88921',
  },
  platformRecordSummary: {
    platformGrossAmount: '₹18,000',
    refundRecorded: '₹0',
    platformCommission: '₹1,800',
    taxCollected: '₹3,240',
    expectedSettlementAmount: '₹17,750',
  },
}

export function getReconciliationDetailById(id: string): ReconciliationDetail {
  return { ...defaultReconciliationDetail, id }
}
