import type { FilterSectionConfig, ModuleFilterConfig } from '@/shared/types/data-filter'

import { prefixSectionFields } from './base-filter-sections'

const byRevenueSection: FilterSectionConfig = {
  id: 'by-revenue',
  title: 'By Revenue',
  defaultExpanded: true,
  fields: [
    {
      id: 'module',
      label: 'Module',
      type: 'checkbox-group',
      options: [
        { label: 'Membership', value: 'membership' },
        { label: 'Service', value: 'service' },
        { label: 'Consultation', value: 'consultation' },
        { label: 'Venue', value: 'venue' },
        { label: 'Refund', value: 'refund' },
      ],
    },
    {
      id: 'entityType',
      label: 'Entity Type',
      type: 'checkbox-group',
      options: [
        { label: 'Fixed', value: 'fixed' },
        { label: 'Tiered', value: 'tiered' },
        { label: 'Custom', value: 'custom' },
        { label: 'Milestone', value: 'milestone' },
        { label: 'Membership Subscription', value: 'MembershipSubscription' },
        { label: 'Service Order', value: 'ServiceOrder' },
        { label: 'Payment Request', value: 'PaymentRequest' },
        { label: 'Proposal', value: 'Proposal' },
        { label: 'Consultation Booking', value: 'ConsultationBooking' },
        { label: 'Venue Booking', value: 'VenueBooking' },
      ],
    },
    {
      id: 'entityId',
      label: 'Entity ID',
      type: 'text',
      placeholder: 'Enter Entity ID or Order ID',
    },
    { id: 'entityName', label: 'Entity Name', type: 'text', placeholder: 'Enter Entity Name' },
    { id: 'category', label: 'Category', type: 'text', placeholder: 'Enter Category' },
    {
      id: 'ownerType',
      label: 'Owner Type',
      type: 'checkbox-group',
      options: [
        { label: 'Expert', value: 'partner' },
        { label: 'User', value: 'user' },
        { label: 'Admin', value: 'admin' },
      ],
    },
    { id: 'ownerName', label: 'Owner Name', type: 'text', placeholder: 'Enter Owner Name' },
    {
      id: 'amount',
      label: 'Gross Amount',
      type: 'number-range',
      fromPlaceholder: 'Min',
      toPlaceholder: 'Max',
    },
    {
      id: 'status',
      label: 'Status',
      type: 'checkbox-group',
      options: [
        { label: 'Paid', value: 'Paid' },
        { label: 'Pending', value: 'Pending' },
        { label: 'Failed', value: 'Failed' },
        { label: 'Refunded', value: 'Refunded' },
      ],
    },
    {
      id: 'paymentMethod',
      label: 'Payment Method',
      type: 'text',
      placeholder: 'Enter Payment Method',
    },
    {
      id: 'settlementStatus',
      label: 'Settlement Status',
      type: 'checkbox-group',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Settled', value: 'settled' },
      ],
    },
    {
      id: 'fulfillmentStatus',
      label: 'Fulfillment Status',
      type: 'checkbox-group',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Success', value: 'success' },
        { label: 'Failed', value: 'failed' },
      ],
    },
    {
      id: 'direction',
      label: 'Direction',
      type: 'checkbox-group',
      options: [
        { label: 'Receivable', value: 'receivable' },
        { label: 'Payable Source', value: 'payable_source' },
      ],
    },
    {
      id: 'payerType',
      label: 'Payer Type',
      type: 'checkbox-group',
      options: [
        { label: 'User', value: 'user' },
        { label: 'Partner', value: 'partner' },
        { label: 'Unknown', value: 'unknown' },
      ],
    },
    {
      id: 'createdAt',
      label: 'Created On',
      type: 'date-range',
      fromPlaceholder: 'From',
      toPlaceholder: 'To',
    },
  ],
}

const revenueFilterSections: FilterSectionConfig[] = [
  prefixSectionFields(byRevenueSection, 'revenue'),
]

export const revenueOverviewFilterConfig: ModuleFilterConfig = {
  moduleKey: 'finance-revenue',
  moduleName: 'Revenue Overview',
  sections: revenueFilterSections,
  exportSections: revenueFilterSections,
}
