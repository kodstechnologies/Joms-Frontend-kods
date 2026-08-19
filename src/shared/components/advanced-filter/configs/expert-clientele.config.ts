import type { FilterSectionConfig, ModuleFilterConfig } from '@/shared/types/data-filter'

import { prefixSectionFields } from './base-filter-sections'

const byExpertClienteleSection: FilterSectionConfig = {
  id: 'by-expert-clientele',
  title: 'By Booking',
  defaultExpanded: true,
  fields: [
    {
      id: 'bookingId',
      label: 'Order / Booking ID',
      type: 'text',
      placeholder: 'Enter Booking ID',
    },
    { id: 'clientId', label: 'Client ID', type: 'text', placeholder: 'Enter Client ID' },
    { id: 'clientName', label: 'Client Name', type: 'text', placeholder: 'Enter Client Name' },
    {
      id: 'bookingSource',
      label: 'Booking Source',
      type: 'checkbox-group',
      options: [
        { label: 'User App', value: 'user app' },
        { label: 'Custom Order', value: 'custom order' },
        { label: 'Expert Microsite', value: 'expert microsite' },
      ],
    },
    {
      id: 'listingType',
      label: 'Listing Type',
      type: 'checkbox-group',
      options: [
        { label: 'Service', value: 'service' },
        { label: 'Consultation', value: 'consultation' },
        { label: 'Custom', value: 'custom' },
      ],
    },
    { id: 'listingName', label: 'Listing Name', type: 'text', placeholder: 'Enter Listing Name' },
    {
      id: 'status',
      label: 'Booking Status',
      type: 'checkbox-group',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Confirmed', value: 'confirmed' },
        { label: 'In Progress', value: 'in progress' },
        { label: 'Scheduled', value: 'scheduled' },
        { label: 'Completed', value: 'completed' },
        { label: 'Disputed', value: 'disputed' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
    },
    {
      id: 'pricingType',
      label: 'Pricing Type',
      type: 'checkbox-group',
      options: [
        { label: 'Fixed', value: 'fixed' },
        { label: 'Tiered', value: 'tiered' },
        { label: 'Custom', value: 'custom' },
      ],
    },
    {
      id: 'bookingDate',
      label: 'Booking Date',
      type: 'date-range',
      fromPlaceholder: 'From',
      toPlaceholder: 'To',
    },
    {
      id: 'orderValue',
      label: 'Order Value',
      type: 'number-range',
      fromPlaceholder: 'Min',
      toPlaceholder: 'Max',
    },
    {
      id: 'paymentStatus',
      label: 'Payment Status',
      type: 'checkbox-group',
      options: [
        { label: 'Paid', value: 'paid' },
        { label: 'Pending', value: 'pending' },
        { label: 'Failed', value: 'failed' },
        { label: 'Refunded', value: 'refunded' },
        { label: 'Partially Refunded', value: 'partially refunded' },
      ],
    },
    {
      id: 'rating',
      label: 'Rating',
      type: 'number-range',
      fromPlaceholder: 'Min',
      toPlaceholder: 'Max',
    },
  ],
}

const expertClienteleFilterSections: FilterSectionConfig[] = [
  prefixSectionFields(byExpertClienteleSection, 'clientele'),
]

export const expertClienteleFilterConfig: ModuleFilterConfig = {
  moduleKey: 'expert-clientele',
  moduleName: 'Expert Clientele',
  sections: expertClienteleFilterSections,
  exportSections: expertClienteleFilterSections,
}
