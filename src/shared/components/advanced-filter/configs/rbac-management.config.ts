import type { FilterSectionConfig, ModuleFilterConfig } from '@/shared/types/data-filter'

import { prefixSectionFields } from './base-filter-sections'

const byUsersSection: FilterSectionConfig = {
  id: 'by-users',
  title: 'By Users',
  defaultExpanded: true,
  fields: [
    { id: 'adminCode', label: 'User ID', type: 'text', placeholder: 'Search by User ID' },
    { id: 'fullname', label: 'Username', type: 'text', placeholder: 'Search by Username' },
    { id: 'roleCode', label: 'Role ID', type: 'text', placeholder: 'Search by Role ID' },
    { id: 'roleName', label: 'Role Name', type: 'text', placeholder: 'Search by Role Name' },
    { id: 'scopes', label: 'Scope', type: 'text', placeholder: 'Search by Scope' },
    { id: 'permissions', label: 'Permissions', type: 'text', placeholder: 'Search by Permission' },
    {
      id: 'mfaEnabled',
      label: 'MFA Enabled',
      type: 'checkbox-group',
      options: [
        { label: 'Yes', value: 'yes' },
        { label: 'No', value: 'no' },
      ],
    },
    {
      id: 'status',
      label: 'User Status',
      type: 'checkbox-group',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Suspended', value: 'suspended' },
      ],
    },
    {
      id: 'lastActionAt',
      label: 'Last Action Performed',
      type: 'date-range',
      fromPlaceholder: 'From',
      toPlaceholder: 'To',
    },
  ],
}

const byRolesSection: FilterSectionConfig = {
  id: 'by-roles',
  title: 'By Roles',
  defaultExpanded: true,
  fields: [
    { id: 'roleCode', label: 'Role ID', type: 'text', placeholder: 'Search by Role ID' },
    { id: 'name', label: 'Role Name', type: 'text', placeholder: 'Search by Role Name' },
    { id: 'description', label: 'Description', type: 'text', placeholder: 'Search by Description' },
    { id: 'scopes', label: 'Scope', type: 'text', placeholder: 'Search by Scope' },
    { id: 'permissions', label: 'Permissions', type: 'text', placeholder: 'Search by Permission' },
    {
      id: 'riskLevel',
      label: 'Risk Level',
      type: 'checkbox-group',
      options: [
        { label: 'Low', value: 'low' },
        { label: 'Medium', value: 'medium' },
        { label: 'High', value: 'high' },
        { label: 'Critical', value: 'critical' },
      ],
    },
    {
      id: 'mfaRequired',
      label: 'MFA Required',
      type: 'checkbox-group',
      options: [
        { label: 'Yes', value: 'yes' },
        { label: 'No', value: 'no' },
      ],
    },
    {
      id: 'status',
      label: 'Role Status',
      type: 'checkbox-group',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Disabled', value: 'disabled' },
      ],
    },
    {
      id: 'userCount',
      label: 'Users (No.)',
      type: 'number-range',
      fromPlaceholder: 'Min',
      toPlaceholder: 'Max',
    },
  ],
}

const rbacAdvancedSections: FilterSectionConfig[] = [
  prefixSectionFields(byUsersSection, 'users'),
  prefixSectionFields(byRolesSection, 'roles'),
]

export const rbacManagementFilterConfig: ModuleFilterConfig = {
  moduleKey: 'rbac-management',
  moduleName: 'RBAC Management',
  sections: rbacAdvancedSections,
  exportSections: rbacAdvancedSections,
}
