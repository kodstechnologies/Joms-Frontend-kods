import type { FilterSectionConfig, ModuleFilterConfig } from '@/shared/types/data-filter'

import { prefixSectionFields } from './base-filter-sections'

const yesNoOptions = [
  { label: 'Yes', value: 'true' },
  { label: 'No', value: 'false' },
]

const byReferralSection: FilterSectionConfig = {
  id: 'by-referral',
  title: 'By Referral',
  defaultExpanded: true,
  fields: [
    { id: 'referralId', label: 'Referral ID', type: 'text', placeholder: 'Enter Referral ID' },
    {
      id: 'referralCode',
      label: 'Referral Code',
      type: 'text',
      placeholder: 'Enter Referral Code',
    },
    {
      id: 'referrerName',
      label: 'Referrer Name',
      type: 'text',
      placeholder: 'Enter Referrer Name',
    },
    {
      id: 'referredExpertName',
      label: 'Referred Expert',
      type: 'text',
      placeholder: 'Enter Expert Name',
    },
    {
      id: 'referredExpertEmail',
      label: 'Expert Email',
      type: 'text',
      placeholder: 'Enter Email',
    },
    {
      id: 'referredExpertPhone',
      label: 'Expert Phone',
      type: 'text',
      placeholder: 'Enter Phone',
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
      id: 'signedUpCount',
      label: 'Goal Progress',
      type: 'number-range',
      fromPlaceholder: 'Min',
      toPlaceholder: 'Max',
    },
    {
      id: 'emailSent',
      label: 'Email Sent',
      type: 'checkbox-group',
      options: yesNoOptions,
    },
    {
      id: 'smsSent',
      label: 'SMS Sent',
      type: 'checkbox-group',
      options: yesNoOptions,
    },
    {
      id: 'whatsappSent',
      label: 'WhatsApp Sent',
      type: 'checkbox-group',
      options: yesNoOptions,
    },
    {
      id: 'createdAt',
      label: 'Created On',
      type: 'date-range',
      fromPlaceholder: 'From',
      toPlaceholder: 'To',
    },
    {
      id: 'sentAt',
      label: 'Sent At',
      type: 'date-range',
      fromPlaceholder: 'From',
      toPlaceholder: 'To',
    },
    {
      id: 'acceptedAt',
      label: 'Accepted At',
      type: 'date-range',
      fromPlaceholder: 'From',
      toPlaceholder: 'To',
    },
    {
      id: 'expiresAt',
      label: 'Expires At',
      type: 'date-range',
      fromPlaceholder: 'From',
      toPlaceholder: 'To',
    },
  ],
}

const referralFilterSections: FilterSectionConfig[] = [
  prefixSectionFields(byReferralSection, 'referral'),
]

export const referralManagementFilterConfig: ModuleFilterConfig = {
  moduleKey: 'referral-management',
  moduleName: 'Referral Management',
  sections: referralFilterSections,
  exportSections: referralFilterSections,
}
