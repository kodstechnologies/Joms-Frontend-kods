import type { FilterSectionConfig, ModuleFilterConfig } from '@/shared/types/data-filter'

const byReferralSection: FilterSectionConfig = {
  id: 'by-expert',
  title: 'By Expert',
  defaultExpanded: true,
  fields: [
    { id: 'referralId', label: 'Referral ID', type: 'text', placeholder: 'Enter Referral ID' },
    {
      id: 'referrerName',
      label: 'Referrer Name',
      type: 'text',
      placeholder: 'Enter Referrer Name',
    },
    {
      id: 'referredExpertName',
      label: 'Expert Name',
      type: 'text',
      placeholder: 'Enter Expert Name',
    },
    {
      id: 'sourceType',
      label: 'Source Type',
      type: 'checkbox-group',
      options: [
        { label: 'Platform Referral', value: 'Platform Referral' },
        { label: 'Expert Referral', value: 'Expert Referral' },
      ],
    },
    {
      id: 'status',
      label: 'Status',
      type: 'checkbox-group',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Accepted', value: 'accepted' },
        { label: 'Rejected', value: 'rejected' },
        { label: 'Expired', value: 'expired' },
      ],
    },
    {
      id: 'referralType',
      label: 'Referral Type',
      type: 'checkbox-group',
      options: [
        { label: 'Manual', value: 'manual' },
        { label: 'Bulk', value: 'bulk' },
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

export const referralManagementFilterConfig: ModuleFilterConfig = {
  moduleKey: 'referral-management',
  moduleName: 'Referral Management',
  sections: [byReferralSection],
}
