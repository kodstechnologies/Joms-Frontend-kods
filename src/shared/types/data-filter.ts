export type FilterOption = {
  label: string
  value: string
}

export type FilterFieldType =
  'text' | 'checkbox-group' | 'number-range' | 'date-range' | 'search' | 'location'

export type FilterFieldConfig = {
  id: string
  label: string
  type: FilterFieldType
  options?: FilterOption[]
  placeholder?: string
  fromPlaceholder?: string
  toPlaceholder?: string
  fromLabel?: string
  toLabel?: string
  statePlaceholder?: string
  cityPlaceholder?: string
}

export type FilterSectionConfig = {
  id: string
  title: string
  fields: FilterFieldConfig[]
  defaultExpanded?: boolean
}

export type ModuleFilterConfig = {
  moduleKey: string
  moduleName: string
  sections: FilterSectionConfig[]

  exportSections?: FilterSectionConfig[]
}

export type RangeFilterValue = {
  from: string
  to: string
}

export type LocationFilterValue = {
  state: string
  city: string
}

export type FilterValues = Record<
  string,
  string | string[] | RangeFilterValue | LocationFilterValue
>

export type ModuleFilterKey =
  | 'expert-management'
  | 'expert-pending-approvals'
  | 'expert-reported'
  | 'expert-suspended'
  | 'expert-deleted'
  | 'service-management'
  | 'service-pending-approvals'
  | 'service-reported'
  | 'service-suspended'
  | 'service-deleted'
  | 'venue-management'
  | 'service-category-management'
  | 'expert-category-management'
  | 'venue-category-management'
  | 'communication-management'
  | 'referral-management'
  | 'finance-revenue'
  | 'finance-services'
  | 'finance-venues'
  | 'finance-memberships'
  | 'finance-payouts'
  | 'finance-refunds'
  | 'finance-tax'
  | 'finance-invoices'
  | 'finance-reconciliation'
  | 'finance-escrow'
  | 'expert-memberships'
  | 'expert-clientele'
  | 'expert-profile-services'
  | 'support-tickets'
  | 'rbac-management'
  | 'rbac-invites'
  | 'rbac-admin-logs'
  | 'settings-logs'
  | 'login-trails'
  | 'incidents'
  | 'backups'
  | 'escalations'
  | 'leaderboard-management'
  | 'service-performance'
  | 'consultation-performance'
  | 'venue-profile-spaces'
