import type { FilterSectionConfig, ModuleFilterConfig } from '@/shared/types/data-filter'

import { prefixSectionFields } from './base-filter-sections'

const byRbacInvitesSection: FilterSectionConfig = {
  id: 'by-rbac-invites',
  title: 'By Invite',
  defaultExpanded: true,
  fields: [
    { id: 'inviteId', label: 'Invite ID', type: 'text', placeholder: 'Enter Invite ID' },
    { id: 'username', label: 'Username', type: 'text', placeholder: 'Enter Username' },
    { id: 'roleId', label: 'Role ID', type: 'text', placeholder: 'Enter Role ID' },
    { id: 'roleName', label: 'Role Name', type: 'text', placeholder: 'Enter Role Name' },
    { id: 'email', label: 'Email ID', type: 'text', placeholder: 'Enter Email' },
    {
      id: 'sentAt',
      label: 'Time Stamp',
      type: 'date-range',
      fromPlaceholder: 'From',
      toPlaceholder: 'To',
    },
    {
      id: 'status',
      label: 'Status',
      type: 'checkbox-group',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Accepted', value: 'accepted' },
        { label: 'Revoked', value: 'revoked' },
      ],
    },
  ],
}

const rbacInvitesFilterSections: FilterSectionConfig[] = [
  prefixSectionFields(byRbacInvitesSection, 'invites'),
]

export const rbacInvitesFilterConfig: ModuleFilterConfig = {
  moduleKey: 'rbac-invites',
  moduleName: 'Invite Overview',
  sections: rbacInvitesFilterSections,
  exportSections: rbacInvitesFilterSections,
}
