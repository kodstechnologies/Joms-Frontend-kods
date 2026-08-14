import type { FilterSectionConfig, ModuleFilterConfig } from '@/shared/types/data-filter'
import { prefixSectionFields, byCustomersSection, byLocationSection } from './base-filter-sections'

const yesNoOptions = [
  { label: 'Yes', value: 'yes' },
  { label: 'No', value: 'no' },
]

const yesNoDisputedOptions = [
  { label: 'Yes', value: 'yes' },
  { label: 'No', value: 'no' },
  { label: 'Disputed', value: 'disputed' },
]

const byServicesSection: FilterSectionConfig = {
  id: 'by-services',
  title: 'By Services',
  defaultExpanded: true,
  fields: [
    { id: 'category', label: 'Category', type: 'search', placeholder: 'Search by name' },
    { id: 'subCategory', label: 'Sub-category', type: 'search', placeholder: 'Search by name' },
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

const byExpertsSection: FilterSectionConfig = {
  id: 'by-experts',
  title: 'By Experts',
  fields: [
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
  ],
}

const byOrdersSection: FilterSectionConfig = {
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
  ],
}

export const serviceCategoryManagementFilterConfig: ModuleFilterConfig = {
  moduleKey: 'service-category-management',
  moduleName: 'Service Category Management',
  sections: [
    prefixSectionFields(byServicesSection, 'services'),
    prefixSectionFields(byExpertsSection, 'experts'),
    prefixSectionFields(byOrdersSection, 'orders'),
    prefixSectionFields(byCustomersSection, 'customers'),
    prefixSectionFields(byLocationSection, 'location'),
  ],
}
