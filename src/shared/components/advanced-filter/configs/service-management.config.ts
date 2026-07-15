import type { FilterSectionConfig, ModuleFilterConfig } from '@/shared/types/data-filter'

import { byCustomersSection, byLocationSection, prefixSectionFields } from './base-filter-sections'

const yesNoOptions = [
  { label: 'Yes', value: 'yes' },
  { label: 'No', value: 'no' },
]

const yesNoDisputedOptions = [
  { label: 'Yes', value: 'yes' },
  { label: 'No', value: 'no' },
  { label: 'Disputed', value: 'disputed' },
]

const serviceByServicesSection: FilterSectionConfig = {
  id: 'by-services',
  title: 'By Services',
  defaultExpanded: true,
  fields: [
    { id: 'serviceId', label: 'Service ID', type: 'text', placeholder: 'Enter Service ID' },
    { id: 'category', label: 'Category', type: 'search', placeholder: 'Search by name' },
    { id: 'subCategory', label: 'Sub-category', type: 'search', placeholder: 'Search by name' },
    {
      id: 'serviceCreatedDate',
      label: 'Service Created Date',
      type: 'date-range',
      fromPlaceholder: 'From',
      toPlaceholder: 'To',
    },
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
      label: 'Average Ratings (Range: 1 - 5)',
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

const serviceByExpertsSection: FilterSectionConfig = {
  id: 'by-experts',
  title: 'By Experts',
  fields: [
    { id: 'expertId', label: 'Expert ID', type: 'text', placeholder: 'Enter Expert ID' },
    {
      id: 'organizationId',
      label: 'Organization ID',
      type: 'text',
      placeholder: 'Enter Organization ID',
    },
    { id: 'category', label: 'Category', type: 'search', placeholder: 'Search by name' },
    {
      id: 'categoryStatus',
      label: 'Category Status',
      type: 'checkbox-group',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
        { label: 'Draft', value: 'draft' },
        { label: 'Deleted', value: 'deleted' },
      ],
    },
    {
      id: 'servicePerformance',
      label: 'Service Performance',
      type: 'checkbox-group',
      options: [
        { label: 'Trending', value: 'trending' },
        { label: 'Top Performing', value: 'top-performing' },
        { label: 'Low Performing', value: 'low-performing' },
        { label: 'No Sales', value: 'no-sales' },
      ],
    },
    {
      id: 'expertsCount',
      label: 'Experts Count',
      type: 'number-range',
      fromPlaceholder: 'Enter Number',
      toPlaceholder: 'Enter Number',
    },
    {
      id: 'servicesTagged',
      label: 'Services Tagged',
      type: 'number-range',
      fromPlaceholder: 'Enter Number',
      toPlaceholder: 'Enter Number',
    },
    {
      id: 'consultationsTagged',
      label: 'Consultations Tagged',
      type: 'number-range',
      fromPlaceholder: 'Enter Number',
      toPlaceholder: 'Enter Number',
    },
    {
      id: 'revenueGenerated',
      label: 'Revenue Generated',
      type: 'number-range',
      fromPlaceholder: 'Enter Number',
      toPlaceholder: 'Enter Number',
    },
    {
      id: 'yearsOfExperience',
      label: 'Years Of Experience',
      type: 'number-range',
      fromPlaceholder: '0',
      toPlaceholder: '50',
    },
    {
      id: 'categoryCreationDate',
      label: 'Category Creation Date',
      type: 'date-range',
      fromPlaceholder: 'From',
      toPlaceholder: 'To',
    },
    { id: 'profession', label: 'Profession', type: 'search', placeholder: 'Search by name' },
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
  ],
}

const serviceByOwnerSection: FilterSectionConfig = {
  id: 'by-owner',
  title: 'By Owner',
  fields: [
    { id: 'ownerId', label: 'Owner ID', type: 'text', placeholder: 'Enter Owner ID' },
    { id: 'ownerName', label: 'Owner Name', type: 'search', placeholder: 'Search by name' },
    {
      id: 'organizationId',
      label: 'Organization ID',
      type: 'text',
      placeholder: 'Enter Organization ID',
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
  ],
}

const serviceByOrdersSection: FilterSectionConfig = {
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
      label: 'Service Completion Date Range (Services)',
      type: 'date-range',
      fromPlaceholder: 'From',
      toPlaceholder: 'To',
    },
    {
      id: 'consultationCompletionDateRange',
      label: 'Service Completion Date Range (Consultations)',
      type: 'date-range',
      fromPlaceholder: 'From',
      toPlaceholder: 'To',
    },
    {
      id: 'cancellationDateRangeServices',
      label: 'Cancellation Date Range (Services)',
      type: 'date-range',
      fromPlaceholder: 'From',
      toPlaceholder: 'To',
    },
    {
      id: 'cancellationDateRangeConsultations',
      label: 'Cancellation Date Range (Consultations)',
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

const serviceAdvancedSections: FilterSectionConfig[] = [
  prefixSectionFields(serviceByServicesSection, 'services'),
  prefixSectionFields(serviceByExpertsSection, 'experts'),
  prefixSectionFields(serviceByOrdersSection, 'orders'),
  prefixSectionFields(byCustomersSection, 'customers'),
  prefixSectionFields(byLocationSection, 'location'),
]

const serviceExportSections: FilterSectionConfig[] = [
  prefixSectionFields(serviceByServicesSection, 'services'),
  prefixSectionFields(serviceByExpertsSection, 'experts'),
  prefixSectionFields(serviceByOwnerSection, 'owner'),
  prefixSectionFields(byCustomersSection, 'customers'),
  prefixSectionFields(byLocationSection, 'location'),
]

export const serviceManagementFilterConfig: ModuleFilterConfig = {
  moduleKey: 'service-management',
  moduleName: 'Service Management',
  sections: serviceAdvancedSections,
  exportSections: serviceExportSections,
}
