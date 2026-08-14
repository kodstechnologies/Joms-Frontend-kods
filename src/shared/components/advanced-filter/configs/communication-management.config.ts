import type { FilterSectionConfig, ModuleFilterConfig } from '@/shared/types/data-filter'

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
        { label: 'Announcement', value: 'announcement' },
      ],
    },
    {
      id: 'audience',
      label: 'Audience',
      type: 'checkbox-group',
      options: [
        { label: 'Expert Management', value: 'expert-management' },
        { label: 'Service Management', value: 'service-management' },
        { label: 'Venue Management', value: 'venue-management' },
        { label: 'All Partners', value: 'all-partners' },
      ],
    },
    {
      id: 'status',
      label: 'Status',
      type: 'checkbox-group',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Scheduled', value: 'scheduled' },
        { label: 'Sent', value: 'sent' },
        { label: 'Failed', value: 'failed' },
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
  ],
}

export const communicationManagementFilterConfig: ModuleFilterConfig = {
  moduleKey: 'communication-management',
  moduleName: 'Communication Management',
  sections: [byCommunicationSection],
}
