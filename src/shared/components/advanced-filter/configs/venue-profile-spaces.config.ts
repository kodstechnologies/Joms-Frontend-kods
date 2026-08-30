import type { FilterSectionConfig, ModuleFilterConfig } from '@/shared/types/data-filter'

const spaceLocationSection: FilterSectionConfig = {
  id: 'by-location',
  title: 'By Location',
  defaultExpanded: true,
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

const spaceDetailsSection: FilterSectionConfig = {
  id: 'by-spaces',
  title: 'By Spaces',
  defaultExpanded: true,
  fields: [
    {
      id: 'status',
      label: 'Approval Status',
      type: 'checkbox-group',
      options: [
        { label: 'Approved', value: 'approved' },
        { label: 'Submitted / Pending', value: 'submitted' },
        { label: 'Rejected', value: 'rejected' },
      ],
    },
    {
      id: 'visibility',
      label: 'Visibility Status',
      type: 'checkbox-group',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Hidden', value: 'hidden' },
        { label: 'Suspended', value: 'suspended' },
      ],
    },
    {
      id: 'capacity',
      label: 'Capacity (Guests)',
      type: 'number-range',
      fromPlaceholder: 'Min',
      toPlaceholder: 'Max',
    },
    {
      id: 'weekdayPrice',
      label: 'Weekday Price (₹)',
      type: 'number-range',
      fromPlaceholder: 'Min',
      toPlaceholder: 'Max',
    },
    {
      id: 'weekendPrice',
      label: 'Weekend Price (₹)',
      type: 'number-range',
      fromPlaceholder: 'Min',
      toPlaceholder: 'Max',
    },
  ],
}

export const venueProfileSpacesFilterConfig: ModuleFilterConfig = {
  moduleKey: 'venue-profile-spaces',
  moduleName: 'Venue Profile - Spaces',
  sections: [spaceLocationSection, spaceDetailsSection],
  exportSections: [spaceLocationSection, spaceDetailsSection],
}
