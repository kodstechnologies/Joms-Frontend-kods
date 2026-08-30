import type { FilterSectionConfig } from '@/shared/types/data-filter'

import { byLocationSection, prefixSectionFields } from './base-filter-sections'

const yesNoOptions = [
  { label: 'Yes', value: 'yes' },
  { label: 'No', value: 'no' },
]

const yesNoDisputedOptions = [
  { label: 'Yes', value: 'yes' },
  { label: 'No', value: 'no' },
  { label: 'Disputed', value: 'disputed' },
]

const expertCheckboxFields: FilterSectionConfig['fields'] = [
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
      { label: "Founder's circle", value: 'founders-circle' },
    ],
  },
]

const expertDocumentFields: FilterSectionConfig['fields'] = [
  { id: 'expertId', label: 'Expert ID', type: 'text', placeholder: 'Enter Expert ID' },
  {
    id: 'organizationId',
    label: 'Organization ID',
    type: 'text',
    placeholder: 'Enter Organization ID',
  },
  { id: 'category', label: 'Category', type: 'search', placeholder: 'Search by name' },
  { id: 'profession', label: 'Profession', type: 'search', placeholder: 'Search by name' },
]

export const byExpertsSection: FilterSectionConfig = {
  id: 'by-experts',
  title: 'By Experts',
  defaultExpanded: true,
  fields: [...expertDocumentFields, ...expertCheckboxFields],
}

export const byExpertsSectionCheckboxesOnly: FilterSectionConfig = {
  id: 'by-experts',
  title: 'By Experts',
  defaultExpanded: true,
  fields: expertCheckboxFields,
}

export const byServicesSection: FilterSectionConfig = {
  id: 'by-services',
  title: 'By Services',
  fields: [
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
      id: 'totalRevenueGenerated',
      label: 'Total Revenue Generated',
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
  ],
}

export const byCustomersSection: FilterSectionConfig = {
  id: 'by-customers',
  title: 'By Customers',
  fields: [
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
  ],
}

export function expertFilterSections(
  expertsSection: FilterSectionConfig = byExpertsSection,
): FilterSectionConfig[] {
  return [
    prefixSectionFields(expertsSection, 'experts'),
    prefixSectionFields(byServicesSection, 'services'),
    prefixSectionFields(byOrdersSection, 'orders'),
    prefixSectionFields(byCustomersSection, 'customers'),
    prefixSectionFields(byLocationSection, 'location'),
  ]
}

export const expertManagementFilterSections = expertFilterSections()

export const expertProfileServicesFilterSections = expertFilterSections(
  byExpertsSectionCheckboxesOnly,
)
