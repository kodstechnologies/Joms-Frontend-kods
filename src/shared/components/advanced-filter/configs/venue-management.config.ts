import type { FilterSectionConfig, ModuleFilterConfig } from '@/shared/types/data-filter'

import { byLocationSection, prefixSectionFields } from './base-filter-sections'

/** By Venues — matches Figma Advanced Filters - Venue Management */
const venueByVenuesSection: FilterSectionConfig = {
  id: 'by-venues',
  title: 'By Venues',
  defaultExpanded: true,
  fields: [
    {
      id: 'location',
      label: 'Location',
      type: 'location',
      statePlaceholder: 'State/Region',
      cityPlaceholder: 'City',
    },
    { id: 'category', label: 'Category', type: 'search', placeholder: 'Search by name' },
    { id: 'subCategory', label: 'Sub-category', type: 'search', placeholder: 'Search by name' },
    {
      id: 'venueType',
      label: 'Venue Type',
      type: 'checkbox-group',
      options: [
        { label: 'Indoor', value: 'indoor' },
        { label: 'Outdoor', value: 'outdoor' },
      ],
    },
    {
      id: 'venueStatus',
      label: 'Venue Status',
      type: 'checkbox-group',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
        { label: 'Suspended', value: 'suspended' },
      ],
    },
    {
      id: 'approvalStatus',
      label: 'Approval Status',
      type: 'checkbox-group',
      options: [
        { label: 'Approved', value: 'approved' },
        { label: 'Pending', value: 'pending' },
        { label: 'Rejected', value: 'rejected' },
      ],
    },
    {
      id: 'availability',
      label: 'Availability',
      type: 'checkbox-group',
      options: [
        { label: 'Available Now', value: 'available-now' },
        { label: 'Weekdays', value: 'weekdays' },
        { label: 'Weekends', value: 'weekends' },
        { label: '24/7', value: '24-7' },
        { label: 'By Appointment', value: 'by-appointment' },
      ],
    },
    {
      id: 'amenities',
      label: 'Amenities',
      type: 'checkbox-group',
      options: [
        { label: 'Wifi', value: 'wifi' },
        { label: 'Parking', value: 'parking' },
        { label: 'Catering', value: 'catering' },
        { label: 'Kitchen', value: 'kitchen' },
        { label: 'AV Equipment', value: 'av-equipment' },
      ],
    },
  ],
}

/** By Bookings — matches Figma */
const venueByBookingsSection: FilterSectionConfig = {
  id: 'by-bookings',
  title: 'By Bookings',
  fields: [
    {
      id: 'totalNumberOfBookings',
      label: 'Total Number Of Bookings',
      type: 'number-range',
      fromPlaceholder: '0',
      toPlaceholder: '500',
    },
    {
      id: 'bookingStatus',
      label: 'Booking Status',
      type: 'checkbox-group',
      options: [
        { label: 'Confirmed', value: 'confirmed' },
        { label: 'Completed', value: 'completed' },
        { label: 'Cancelled', value: 'cancelled' },
        { label: 'Pending', value: 'pending' },
        { label: 'Refunded', value: 'refunded' },
        { label: 'No Show', value: 'no-show' },
      ],
    },
    {
      id: 'paymentStatus',
      label: 'Payment Status',
      type: 'checkbox-group',
      options: [
        { label: 'Paid', value: 'paid' },
        { label: 'Partial', value: 'partial' },
        { label: 'Failed', value: 'failed' },
        { label: 'Refunded', value: 'refunded' },
      ],
    },
    {
      id: 'paymentMethod',
      label: 'Payment Method',
      type: 'checkbox-group',
      options: [
        { label: 'Card', value: 'card' },
        { label: 'UPI', value: 'upi' },
        { label: 'Bank Transfer', value: 'bank-transfer' },
      ],
    },
    {
      id: 'refundedStatus',
      label: 'Refunded Status',
      type: 'checkbox-group',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Failed', value: 'failed' },
        { label: 'Partial', value: 'partial' },
      ],
    },
  ],
}

/** By Customers — Figma shows Registration Date only */
const venueByCustomersSection: FilterSectionConfig = {
  id: 'by-customers',
  title: 'By Customers',
  fields: [
    {
      id: 'registrationDate',
      label: 'Registration Date',
      type: 'date-range',
      fromPlaceholder: 'From',
      toPlaceholder: 'To',
    },
  ],
}

const venueFilterSections: FilterSectionConfig[] = [
  prefixSectionFields(venueByVenuesSection, 'venues'),
  prefixSectionFields(venueByBookingsSection, 'bookings'),
  prefixSectionFields(venueByCustomersSection, 'customers'),
  prefixSectionFields(byLocationSection, 'location'),
]

export const venueManagementFilterConfig: ModuleFilterConfig = {
  moduleKey: 'venue-management',
  moduleName: 'Venue Management',
  sections: venueFilterSections,
  exportSections: venueFilterSections,
}
