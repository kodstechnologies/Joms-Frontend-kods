import type { FilterSectionConfig } from '@/shared/types/data-filter'

const yesNoOptions = [
  { label: 'Yes', value: 'yes' },
  { label: 'No', value: 'no' },
]

const yesNoDisputedOptions = [
  { label: 'Yes', value: 'yes' },
  { label: 'No', value: 'no' },
  { label: 'Disputed', value: 'disputed' },
]

export const byExpertsSection: FilterSectionConfig = {
  id: 'by-experts',
  title: 'By Experts',
  defaultExpanded: true,
  fields: [
    { id: 'expertId', label: 'Expert ID', type: 'text', placeholder: 'Enter Expert ID' },
    {
      id: 'organizationId',
      label: 'Organization ID',
      type: 'text',
      placeholder: 'Enter Organization ID',
    },
    { id: 'category', label: 'Category', type: 'search', placeholder: 'Search by name' },
    { id: 'profession', label: 'Profession', type: 'search', placeholder: 'Search by name' },
    {
      id: 'yearsOfExperience',
      label: 'Years Of Experience',
      type: 'number-range',
      fromPlaceholder: '0',
      toPlaceholder: '50',
    },
    {
      id: 'numberOfClients',
      label: 'Number of Clients',
      type: 'number-range',
      fromPlaceholder: '0',
      toPlaceholder: '500',
    },
    {
      id: 'totalOrdersCompleted',
      label: 'Total Order Completed',
      type: 'number-range',
      fromPlaceholder: 'Enter Number',
      toPlaceholder: 'Enter Number',
    },
    {
      id: 'totalOrdersCancelled',
      label: 'Total Order Cancelled',
      type: 'number-range',
      fromPlaceholder: 'Enter Number',
      toPlaceholder: 'Enter Number',
    },
    {
      id: 'averageRatings',
      label: 'Average Expert Ratings (1-5)',
      type: 'number-range',
      fromPlaceholder: '1',
      toPlaceholder: '5',
    },
    {
      id: 'totalReviews',
      label: 'Total Reviews',
      type: 'number-range',
      fromPlaceholder: 'Enter Number',
      toPlaceholder: 'Enter Number',
    },
    {
      id: 'repeatCustomerRate',
      label: 'Repeat Customer Rate (%)',
      type: 'number-range',
      fromPlaceholder: 'Enter Number',
      toPlaceholder: 'Enter Number',
    },
    {
      id: 'disputeCount',
      label: 'Dispute Count',
      type: 'number-range',
      fromPlaceholder: 'Enter Number',
      toPlaceholder: 'Enter Number',
    },
    {
      id: 'refundCount',
      label: 'Refund Count',
      type: 'number-range',
      fromPlaceholder: 'Enter Number',
      toPlaceholder: 'Enter Number',
    },
    {
      id: 'onboardingDate',
      label: 'Expert Onboarding Date',
      type: 'date-range',
      fromPlaceholder: 'From',
      toPlaceholder: 'To',
    },
    {
      id: 'numberOfListings',
      label: 'Number of Listing',
      type: 'number-range',
      fromPlaceholder: '0',
      toPlaceholder: '1000',
    },
    {
      id: 'accountStatus',
      label: 'Account Status',
      type: 'checkbox-group',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Suspended', value: 'suspended' },
        { label: 'Under Review', value: 'under-review' },
        { label: 'Deactivated', value: 'deactivated' },
        { label: 'Blacklisted', value: 'blacklisted' },
      ],
    },
    {
      id: 'verificationStatus',
      label: 'Verification Status',
      type: 'checkbox-group',
      options: [
        { label: 'Email Verified', value: 'email-verified' },
        { label: 'Phone Verified', value: 'phone-verified' },
        { label: 'KYC Verified', value: 'kyc-verified' },
        { label: 'Bank Details Verified', value: 'bank-verified' },
        { label: 'Fully Verified', value: 'fully-verified' },
      ],
    },
    {
      id: 'organisationType',
      label: 'Organisation Type',
      type: 'checkbox-group',
      options: [
        { label: 'Individual', value: 'individual' },
        { label: 'Company', value: 'company' },
        { label: 'Agency', value: 'agency' },
        { label: 'Others', value: 'others' },
      ],
    },
    {
      id: 'pendingPayouts',
      label: 'Pending Payouts',
      type: 'checkbox-group',
      options: yesNoDisputedOptions,
    },
    {
      id: 'membershipPurchased',
      label: 'Membership Purchased',
      type: 'checkbox-group',
      options: yesNoOptions,
    },
    {
      id: 'membershipType',
      label: 'Membership Type',
      type: 'checkbox-group',
      options: [
        { label: 'Basic', value: 'basic' },
        { label: 'Premium', value: 'premium' },
        { label: 'Standard', value: 'standard' },
        { label: 'Curators', value: 'curators' },
        { label: "Founder's Circle", value: 'founders-circle' },
      ],
    },
    { id: 'appLanguages', label: 'App Languages', type: 'search', placeholder: 'Search by name' },
    {
      id: 'averageResponseTime',
      label: 'Average Response Time (Hours)',
      type: 'number-range',
      fromPlaceholder: 'Enter Number',
      toPlaceholder: 'Enter Number',
    },
    {
      id: 'acceptanceRate',
      label: 'Acceptance Rate (%)',
      type: 'number-range',
      fromPlaceholder: 'Enter Number',
      toPlaceholder: 'Enter Number',
    },
    {
      id: 'lastActiveDate',
      label: 'Last Active Date Range',
      type: 'date-range',
      fromPlaceholder: 'From',
      toPlaceholder: 'To',
    },
    {
      id: 'totalRevenueGenerated',
      label: 'Total Revenue Generated',
      type: 'number-range',
      fromPlaceholder: 'Enter Number',
      toPlaceholder: 'Enter Number',
    },
    {
      id: 'platformCommissionPaid',
      label: 'Platform Commission Paid',
      type: 'number-range',
      fromPlaceholder: 'Enter Number',
      toPlaceholder: 'Enter Number',
    },
    {
      id: 'membershipExpiryDate',
      label: 'Membership Expiry Date',
      type: 'date-range',
      fromPlaceholder: 'From',
      toPlaceholder: 'To',
    },
  ],
}

export const byServicesSection: FilterSectionConfig = {
  id: 'by-services',
  title: 'By Services',
  fields: [
    { id: 'serviceId', label: 'Service ID', type: 'text', placeholder: 'Enter Service ID' },
    { id: 'category', label: 'Category', type: 'search', placeholder: 'Search by name' },
    { id: 'subCategory', label: 'Sub-category', type: 'search', placeholder: 'Search by name' },
    {
      id: 'listingStatus',
      label: 'Service Listing Status',
      type: 'checkbox-group',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
        { label: 'Draft', value: 'draft' },
        { label: 'Rejected', value: 'rejected' },
        { label: 'Pending Approval', value: 'pending-approval' },
      ],
    },
    {
      id: 'servicePromoted',
      label: 'Service Promoted',
      type: 'checkbox-group',
      options: yesNoOptions,
    },
    {
      id: 'pricingModel',
      label: 'Service Pricing Model',
      type: 'checkbox-group',
      options: [
        { label: 'Fixed', value: 'fixed' },
        { label: 'Tiered', value: 'tiered' },
        { label: 'Custom', value: 'custom' },
      ],
    },
    {
      id: 'averageRatings',
      label: 'Average Ratings',
      type: 'number-range',
      fromPlaceholder: 'Enter Number',
      toPlaceholder: 'Enter Number',
    },
    {
      id: 'totalReviews',
      label: 'Total Reviews',
      type: 'number-range',
      fromPlaceholder: 'Enter Number',
      toPlaceholder: 'Enter Number',
    },
    {
      id: 'repeatCustomerRate',
      label: 'Repeat Customer Rate',
      type: 'number-range',
      fromPlaceholder: 'Enter Number',
      toPlaceholder: 'Enter Number',
    },
    {
      id: 'disputeCount',
      label: 'Dispute Count',
      type: 'number-range',
      fromPlaceholder: 'Enter Number',
      toPlaceholder: 'Enter Number',
    },
    {
      id: 'refundCount',
      label: 'Refund Count',
      type: 'number-range',
      fromPlaceholder: 'Enter Number',
      toPlaceholder: 'Enter Number',
    },
    {
      id: 'totalRevenueGenerated',
      label: 'Total Revenue Generated',
      type: 'number-range',
      fromPlaceholder: 'Enter Number',
      toPlaceholder: 'Enter Number',
    },
    {
      id: 'platformCommissionPaid',
      label: 'Platform Commission Paid',
      type: 'number-range',
      fromPlaceholder: 'Enter Number',
      toPlaceholder: 'Enter Number',
    },
    {
      id: 'basePriceRange',
      label: 'Base Price Range',
      type: 'number-range',
      fromPlaceholder: 'Enter Number',
      toPlaceholder: 'Enter Number',
    },
    {
      id: 'discountPercentRange',
      label: 'Discount % Range',
      type: 'number-range',
      fromPlaceholder: 'Enter Number',
      toPlaceholder: 'Enter Number',
    },
    {
      id: 'discountApplied',
      label: 'Discount Applied',
      type: 'checkbox-group',
      options: yesNoOptions,
    },
  ],
}

export const byOrdersSection: FilterSectionConfig = {
  id: 'by-orders',
  title: 'By Orders',
  fields: [
    {
      id: 'serviceOrderStatus',
      label: 'Service Order Status',
      type: 'checkbox-group',
      options: [
        { label: 'Completed', value: 'completed' },
        { label: 'In-Progress', value: 'in-progress' },
        { label: 'Cancelled', value: 'cancelled' },
        { label: 'Refunded', value: 'refunded' },
        { label: 'Disputed', value: 'disputed' },
      ],
    },
    {
      id: 'delaysBeyondSla',
      label: 'Delays Beyond SLA (Service Timelines Extended)',
      type: 'checkbox-group',
      options: yesNoOptions,
    },
    {
      id: 'paymentStatus',
      label: 'Payment Status',
      type: 'checkbox-group',
      options: [
        { label: 'Paid', value: 'paid' },
        { label: 'Partially Paid (Milestone)', value: 'partially-paid' },
        { label: 'Unpaid (Milestone)', value: 'unpaid' },
        { label: 'Refunded', value: 'refunded' },
        { label: 'Disputed', value: 'disputed' },
      ],
    },
    {
      id: 'paymentMethod',
      label: 'Payment Method',
      type: 'checkbox-group',
      options: [
        { label: 'Card', value: 'card' },
        { label: 'UPI/Wallet', value: 'upi-wallet' },
        { label: 'Bank Transfer', value: 'bank-transfer' },
      ],
    },
    {
      id: 'payoutStatus',
      label: 'Payout Status',
      type: 'checkbox-group',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Processed', value: 'processed' },
        { label: 'Failed', value: 'failed' },
        { label: 'Successful', value: 'successful' },
        { label: 'Disputed', value: 'disputed' },
      ],
    },
    {
      id: 'disputeStatus',
      label: 'Dispute Status',
      type: 'checkbox-group',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Resolved', value: 'resolved' },
      ],
    },
    {
      id: 'refundStatus',
      label: 'Refund Status',
      type: 'checkbox-group',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Processed', value: 'processed' },
        { label: 'Failed', value: 'failed' },
        { label: 'Successful', value: 'successful' },
        { label: 'Disputed', value: 'disputed' },
      ],
    },
    {
      id: 'riskBased',
      label: 'Risk based (Service Timelines Extended)',
      type: 'checkbox-group',
      options: [
        { label: 'SEV1', value: 'sev1' },
        { label: 'SEV2', value: 'sev2' },
      ],
    },
    {
      id: 'bookingDateRange',
      label: 'Booking Date Range',
      type: 'date-range',
      fromPlaceholder: 'From',
      toPlaceholder: 'To',
    },
    {
      id: 'serviceCompletionDateRange',
      label: 'Service Completion Date Range',
      type: 'date-range',
      fromPlaceholder: 'From',
      toPlaceholder: 'To',
    },
    {
      id: 'cancellationDateRange',
      label: 'Cancellation Date Range',
      type: 'date-range',
      fromPlaceholder: 'From',
      toPlaceholder: 'To',
    },
    {
      id: 'incompleteOrders',
      label: 'Number Of Incomplete Orders',
      type: 'number-range',
      fromPlaceholder: '0',
      toPlaceholder: '500',
    },
    {
      id: 'terminatedOrders',
      label: 'Number Of Terminated Orders',
      type: 'number-range',
      fromPlaceholder: '0',
      toPlaceholder: '500',
    },
    {
      id: 'ticketDisputeCount',
      label: 'Number Of Ticket/Dispute',
      type: 'number-range',
      fromPlaceholder: '0',
      toPlaceholder: '500',
    },
    {
      id: 'bookingThroughMicrosite',
      label: 'Booking Through Microsite',
      type: 'number-range',
      fromPlaceholder: '0',
      toPlaceholder: '500',
    },
    {
      id: 'customOrdersCreated',
      label: 'Number Of custom Order Created',
      type: 'number-range',
      fromPlaceholder: '0',
      toPlaceholder: '500',
    },
  ],
}

export const byCustomersSection: FilterSectionConfig = {
  id: 'by-customers',
  title: 'By Customers',
  fields: [
    { id: 'customerId', label: 'Customer ID', type: 'text', placeholder: 'Enter Customer ID' },
    {
      id: 'totalOrders',
      label: 'Customer Total Orders',
      type: 'number-range',
      fromPlaceholder: 'Enter Number',
      toPlaceholder: 'Enter Number',
    },
    {
      id: 'onboardingDate',
      label: 'Customer Onboarding Date',
      type: 'date-range',
      fromPlaceholder: 'From',
      toPlaceholder: 'To',
    },
    {
      id: 'cancellationRate',
      label: 'Customer Cancellation Rate %',
      type: 'number-range',
      fromPlaceholder: 'Enter Number',
      toPlaceholder: 'Enter Number',
    },
    {
      id: 'lifetimeSpend',
      label: 'Customer Lifetime Spend',
      type: 'number-range',
      fromPlaceholder: 'Enter Number',
      toPlaceholder: 'Enter Number',
    },
    {
      id: 'refundFrequency',
      label: 'Customer Refund Frequency',
      type: 'number-range',
      fromPlaceholder: 'Enter Number',
      toPlaceholder: 'Enter Number',
    },
    {
      id: 'paymentFailureCount',
      label: 'Customer Payment Failure Count',
      type: 'number-range',
      fromPlaceholder: 'Enter Number',
      toPlaceholder: 'Enter Number',
    },
  ],
}

export const byLocationSection: FilterSectionConfig = {
  id: 'by-location',
  title: 'By Location',
  fields: [
    {
      id: 'location',
      label: 'Location',
      type: 'location',
      statePlaceholder: 'State/Region',
      cityPlaceholder: 'City',
    },
  ],
}

export const standardFilterSections: FilterSectionConfig[] = [
  byExpertsSection,
  byServicesSection,
  byOrdersSection,
  byCustomersSection,
  byLocationSection,
]

export function prefixSectionFields(
  section: FilterSectionConfig,
  prefix: string,
): FilterSectionConfig {
  return {
    ...section,
    fields: section.fields.map((field) => ({
      ...field,
      id: `${prefix}.${field.id}`,
    })),
  }
}

export function createStandardModuleSections(): FilterSectionConfig[] {
  return [
    prefixSectionFields(byExpertsSection, 'experts'),
    prefixSectionFields(byServicesSection, 'services'),
    prefixSectionFields(byOrdersSection, 'orders'),
    prefixSectionFields(byCustomersSection, 'customers'),
    prefixSectionFields(byLocationSection, 'location'),
  ]
}
