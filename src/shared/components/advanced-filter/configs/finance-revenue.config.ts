import type { ModuleFilterConfig } from '@/shared/types/data-filter'

export const financeRevenueFilterConfig: ModuleFilterConfig = {
  moduleKey: 'finance-revenue',
  moduleName: 'Revenue Overview',
  sections: [
    {
      id: 'payment',
      title: 'Payment',
      defaultExpanded: true,
      fields: [
        {
          id: 'status',
          label: 'Status',
          type: 'checkbox-group',
          options: [
            { label: 'Paid', value: 'paid' },
            { label: 'Fulfilled', value: 'fulfilled' },
            { label: 'Created', value: 'created' },
            { label: 'Pending', value: 'pending' },
            { label: 'Failed', value: 'failed' },
            { label: 'Expired', value: 'expired' },
          ],
        },
        {
          id: 'module',
          label: 'Module',
          type: 'text',
          placeholder: 'e.g. service, consultation, venue',
        },
        {
          id: 'partnerId',
          label: 'Partner ID',
          type: 'text',
          placeholder: 'Enter partner ID',
        },
        {
          id: 'pricingType',
          label: 'Pricing type',
          type: 'text',
          placeholder: 'e.g. custom, milestone',
        },
      ],
    },
  ],
}
