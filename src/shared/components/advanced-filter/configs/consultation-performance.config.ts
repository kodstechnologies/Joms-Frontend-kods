import type { ModuleFilterConfig } from '@/shared/types/data-filter'

export const consultationPerformanceFilterConfig: ModuleFilterConfig = {
  moduleKey: 'consultation-performance',
  moduleName: 'Consultation Performance',
  sections: [
    {
      id: 'by-booking',
      title: 'By Booking',
      defaultExpanded: true,
      fields: [
        {
          id: 'status',
          label: 'Booking Status',
          type: 'checkbox-group',
          options: [
            { label: 'Scheduled', value: 'scheduled' },
            { label: 'Completed', value: 'completed' },
            { label: 'Cancelled', value: 'cancelled' },
          ],
        },
        { id: 'dateRange', label: 'Date Range', type: 'date-range' },
        { id: 'priceRange', label: 'Price Range', type: 'number-range' },
      ],
    },
  ],
  exportSections: [],
}
