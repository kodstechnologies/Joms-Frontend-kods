export type TaxComplianceDetail = {
  id: string
  recordTitle: string
  recordDescription: string
  taxRecordOverview: {
    taxRecordId: string
    transactionId: string
    entityType: string
    region: string
    taxType: string
    taxRate: string
    currency: string
    invoiceNumber: string
    invoiceDate: string
    filingPeriod: string
    filingDate: string
    filedBy: string
    referenceNumber: string
    filingStatus: 'Confirmed' | 'Pending' | 'Filed'
  }
  financialBreakdown: {
    clientId: string
    clientName: string
    taxId: string
    billingAddress: string
    transactionDate: string
    paymentMethod: string
    subtotalBeforeTax: string
    discountApplied: string
    taxableAmount: string
    taxAmount: string
    totalAmountAfterTax: string
  }
  venueInformation: {
    venueName: string
    ownerName: string
    ownerId: string
    venueType: string
    capacity: string
    location: string
    billingAddress: string
    approvalStatus: 'Approved' | 'Pending' | 'Rejected'
  }
  taxCalculation: {
    taxJurisdictionRulesApplied: string
    taxCategory: string
    taxRateSource: string
    taxFormulaUsed: string
    reverseChargeApplied: string
  }
  complianceInformation: {
    regulatoryAuthority: string
    filingFrequency: string
    reportingCategoryCode: string
    taxStatus: string
    adjustments: string
    notes: string
  }
}

const defaultTaxComplianceDetail: TaxComplianceDetail = {
  id: 'tax-01',
  recordTitle: 'Tax & Compliance Information',
  recordDescription: 'Provide details about your Consultation',
  taxRecordOverview: {
    taxRecordId: 'V9-2026-00021',
    transactionId: 'SRV-2026-00452',
    entityType: 'Venue',
    region: 'India',
    taxType: 'GST',
    taxRate: '18%',
    currency: 'INR',
    invoiceNumber: '12322323',
    invoiceDate: '11/2/2026',
    filingPeriod: 'February 2026',
    filingDate: '01/02/2026',
    filedBy: 'FIN_ADMIN_01',
    referenceNumber: '12322323',
    filingStatus: 'Confirmed',
  },
  financialBreakdown: {
    clientId: 'U50001',
    clientName: 'Alex Smith',
    taxId: 'OWN-0045',
    billingAddress: '#112, Ground Floor, Tax layout, Taxnagar, Bangalore',
    transactionDate: '11/2/2026',
    paymentMethod: 'NEFT',
    subtotalBeforeTax: '$20,000.00',
    discountApplied: '10%',
    taxableAmount: '$20,000.00',
    taxAmount: '$20.00',
    totalAmountAfterTax: '$20.00',
  },
  venueInformation: {
    venueName: 'Grand Ballroom - Downtown',
    ownerName: 'City Venues LLC',
    ownerId: 'EXP001',
    venueType: 'Indoor',
    capacity: '500 Guests',
    location: 'Bangalore',
    billingAddress: '#112, Ground Floor, Tax layout, Taxnagar, Bangalore',
    approvalStatus: 'Approved',
  },
  taxCalculation: {
    taxJurisdictionRulesApplied: 'Yes',
    taxCategory: 'Standard',
    taxRateSource: 'Auto-calculated',
    taxFormulaUsed: 'Taxable Amount x Tax Rate = Tax',
    reverseChargeApplied: 'No',
  },
  complianceInformation: {
    regulatoryAuthority: 'IT Department',
    filingFrequency: 'Quarterly',
    reportingCategoryCode: 'BE_12302',
    taxStatus: 'Tax Collected',
    adjustments: 'Round-off to hundred applied',
    notes: 'Round-off to hundred applied',
  },
}

export function getTaxComplianceDetailById(id: string): TaxComplianceDetail {
  return { ...defaultTaxComplianceDetail, id }
}
