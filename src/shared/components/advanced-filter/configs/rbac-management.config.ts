import type { FilterSectionConfig, ModuleFilterConfig } from '@/shared/types/data-filter'

import { createStandardModuleSections, prefixSectionFields } from './base-filter-sections'

const byUsersSection: FilterSectionConfig = {
  id: 'by-users',
  title: 'By Users',
  defaultExpanded: true,
  fields: [
    { id: 'adminCode', label: 'User ID', type: 'text', placeholder: 'Search by User ID' },
    { id: 'fullname', label: 'Username', type: 'text', placeholder: 'Search by Username' },
    { id: 'email', label: 'Email', type: 'text', placeholder: 'Search by Email' },
    { id: 'department', label: 'Department', type: 'text', placeholder: 'Search by Department' },
    { id: 'jobTitle', label: 'Job Title', type: 'text', placeholder: 'Search by Job Title' },
    {
      id: 'employmentType',
      label: 'Employment Type',
      type: 'checkbox-group',
      options: [
        { label: 'Full Time', value: 'full-time' },
        { label: 'Part Time', value: 'part-time' },
        { label: 'Contract', value: 'contract' },
      ],
    },
    {
      id: 'workplaceFlexibility',
      label: 'Workplace Flexibility',
      type: 'checkbox-group',
      options: [
        { label: 'Remote', value: 'remote' },
        { label: 'Hybrid', value: 'hybrid' },
        { label: 'On-site', value: 'on-site' },
      ],
    },
    { id: 'location', label: 'Location', type: 'location' },
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
    { id: 'createdAt', label: 'Created Date', type: 'date-range' },
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
    { id: 'scopes', label: 'Scopes', type: 'text', placeholder: 'Search by Scope' },
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
      label: 'User Count',
      type: 'number-range',
    },
    { id: 'createdAt', label: 'Created Date', type: 'date-range' },
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
  exportSections: createStandardModuleSections(),
}
