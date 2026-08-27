import type { FilterSectionConfig, ModuleFilterConfig } from '@/shared/types/data-filter'

import { prefixSectionFields } from './base-filter-sections'

const byCommunicationSection: FilterSectionConfig = {
  id: 'by-communication',
  title: 'By Communication',
  defaultExpanded: true,
  fields: [
    { id: 'messageId', label: 'Message ID', type: 'text', placeholder: 'Enter Message ID' },
    { id: 'title', label: 'Title', type: 'text', placeholder: 'Enter Title' },
    {
      id: 'channel',
      label: 'Channel',
      type: 'checkbox-group',
      options: [
        { label: 'In App Notification', value: 'in-app' },
        { label: 'Email', value: 'email' },
        { label: 'Push Notification', value: 'push' },
      ],
    },
    {
      id: 'type',
      label: 'Type',
      type: 'checkbox-group',
      options: [
        { label: 'Transactional', value: 'transactional' },
        { label: 'Marketing', value: 'marketing' },
        { label: 'Promotional', value: 'promotional' },
        { label: 'Reminder', value: 'reminder' },
        { label: 'Announcement', value: 'announcement' },
        { label: 'System Message', value: 'system' },
      ],
    },
    {
      id: 'audience',
      label: 'Audience',
      type: 'checkbox-group',
      options: [
        { label: 'Experts', value: 'experts' },
        { label: 'Venue Partners', value: 'venue-partners' },
        { label: 'Members', value: 'members' },
        { label: 'Admins', value: 'admins' },
        { label: 'Custom Segment', value: 'custom-segment' },
      ],
    },
    {
      id: 'priority',
      label: 'Priority',
      type: 'checkbox-group',
      options: [
        { label: 'Low', value: 'low' },
        { label: 'Medium', value: 'medium' },
        { label: 'High', value: 'high' },
        { label: 'Critical', value: 'critical' },
      ],
    },
    {
      id: 'deliveryType',
      label: 'Delivery Type',
      type: 'checkbox-group',
      options: [
        { label: 'Send Now', value: 'send-now' },
        { label: 'Schedule', value: 'schedule' },
      ],
    },
    {
      id: 'status',
      label: 'Status',
      type: 'checkbox-group',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Scheduled', value: 'scheduled' },
        { label: 'Processing', value: 'processing' },
        { label: 'Sent', value: 'sent' },
        { label: 'Delivered', value: 'delivered' },
        { label: 'Failed', value: 'failed' },
        { label: 'Cancelled', value: 'cancelled' },
        { label: 'Paused', value: 'paused' },
        { label: 'Active', value: 'active' },
      ],
    },
    { id: 'createdBy', label: 'Created By', type: 'text', placeholder: 'Enter Created By' },
    {
      id: 'createdAt',
      label: 'Created On',
      type: 'date-range',
      fromPlaceholder: 'From',
      toPlaceholder: 'To',
    },
    {
      id: 'scheduledAt',
      label: 'Scheduled At',
      type: 'date-range',
      fromPlaceholder: 'From',
      toPlaceholder: 'To',
    },
  ],
}

const communicationFilterSections: FilterSectionConfig[] = [
  prefixSectionFields(byCommunicationSection, 'communication'),
]

export const communicationManagementFilterConfig: ModuleFilterConfig = {
  moduleKey: 'communication-management',
  moduleName: 'Communication Management',
  sections: communicationFilterSections,
  exportSections: communicationFilterSections,
}
