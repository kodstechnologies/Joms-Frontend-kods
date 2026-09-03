export type ServiceTableColumnCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultVisible: boolean
}

export const SERVICE_MANAGEMENT_MODULE_KEY = 'service-management'
export const SERVICE_PENDING_APPROVALS_MODULE_KEY = 'service-pending-approvals'
export const SERVICE_REPORTED_MODULE_KEY = 'service-reported'
export const SERVICE_SUSPENDED_MODULE_KEY = 'service-suspended'
export const SERVICE_DELETED_MODULE_KEY = 'service-deleted'

export const SERVICE_MANAGEMENT_TABLE_COLUMNS_CATALOG: ServiceTableColumnCatalogItem[] = [
  {
    id: 'service-id',
    label: 'Listing ID',
    type: 'Text',
    description: 'Unique listing identifier (SER/CON)',
    defaultVisible: true,
  },
  {
    id: 'name',
    label: 'Listing Name',
    type: 'Text',
    description: 'Service or consultation title',
    defaultVisible: true,
  },
  {
    id: 'type',
    label: 'Listing Type',
    type: 'Text',
    description: 'Service or Consultation',
    defaultVisible: true,
  },
  {
    id: 'category',
    label: 'Category',
    type: 'Text',
    description: 'Marketplace category',
    defaultVisible: true,
  },
  {
    id: 'sub-category',
    label: 'Sub Category',
    type: 'Text',
    description: 'Marketplace sub-category',
    defaultVisible: false,
  },
  {
    id: 'status',
    label: 'Status',
    type: 'Status',
    description: 'Current listing lifecycle status',
    defaultVisible: true,
  },
  {
    id: 'promoted',
    label: 'Promoted',
    type: 'Status',
    description: 'Whether the listing is promoted',
    defaultVisible: false,
  },
  {
    id: 'pricing-model',
    label: 'Pricing Model',
    type: 'Text',
    description: 'Fixed, Tiered, or Custom',
    defaultVisible: false,
  },
  {
    id: 'tier-name',
    label: 'Tier Name',
    type: 'Text',
    description: 'Pricing tier name when tiered',
    defaultVisible: false,
  },
  {
    id: 'pricing',
    label: 'Base Price',
    type: 'Currency',
    description: 'Original listing price',
    defaultVisible: true,
  },
  {
    id: 'platform-discount-percent',
    label: 'Platform Discount %',
    type: 'Percentage',
    description: 'Platform-funded discount',
    defaultVisible: false,
  },
  {
    id: 'final-price',
    label: 'Final Price',
    type: 'Currency',
    description: 'Customer payable price after discount',
    defaultVisible: false,
  },
  {
    id: 'platform-discount-active',
    label: 'Platform Discount Active',
    type: 'Status',
    description: 'Whether a platform discount is currently live',
    defaultVisible: false,
  },
  {
    id: 'expert-id',
    label: 'Expert ID',
    type: 'Text',
    description: 'Listing owner expert identifier',
    defaultVisible: true,
  },
  {
    id: 'expert-name',
    label: 'Expert Name',
    type: 'Text',
    description: 'Listing owner display name',
    defaultVisible: true,
  },
  {
    id: 'expert-rating',
    label: 'Expert Rating',
    type: 'Average',
    description: 'Owner average review rating',
    defaultVisible: false,
  },
  {
    id: 'expert-account-status',
    label: 'Expert Account Status',
    type: 'Status',
    description: 'Owner account lifecycle status',
    defaultVisible: false,
  },
  {
    id: 'total-transactions',
    label: 'Total Transactions',
    type: 'Count',
    description: 'Total orders / bookings',
    defaultVisible: false,
  },
  {
    id: 'scheduled-bookings',
    label: 'Scheduled Bookings',
    type: 'Count',
    description: 'Upcoming scheduled bookings',
    defaultVisible: false,
  },
  {
    id: 'in-progress-orders',
    label: 'In Progress Orders',
    type: 'Count',
    description: 'Active in-progress orders',
    defaultVisible: false,
  },
  {
    id: 'completed-transactions',
    label: 'Completed Transactions',
    type: 'Count',
    description: 'Completed orders / bookings',
    defaultVisible: false,
  },
  {
    id: 'cancelled-terminated-transactions',
    label: 'Cancelled / Terminated Transactions',
    type: 'Count',
    description: 'Cancelled or terminated orders',
    defaultVisible: false,
  },
  {
    id: 'total-disputes',
    label: 'Total Disputes',
    type: 'Count',
    description: 'All disputes on this listing',
    defaultVisible: false,
  },
  {
    id: 'client-raised-disputes',
    label: 'Client Raised Disputes',
    type: 'Count',
    description: 'Disputes opened by clients',
    defaultVisible: false,
  },
  {
    id: 'expert-raised-disputes',
    label: 'Expert Raised Disputes',
    type: 'Count',
    description: 'Disputes opened by experts',
    defaultVisible: false,
  },
  {
    id: 'repeat-booking-percent',
    label: 'Repeat Booking %',
    type: 'Percentage',
    description: 'Share of clients with more than one completed booking',
    defaultVisible: false,
  },
  {
    id: 'average-rating',
    label: 'Average Rating',
    type: 'Average',
    description: 'Listing-level average review rating',
    defaultVisible: false,
  },
  {
    id: 'total-revenue',
    label: 'Total Revenue',
    type: 'Currency',
    description: 'Lifetime completed revenue excluding refunds',
    defaultVisible: false,
  },
  {
    id: 'cancellation-rate',
    label: 'Cancellation Rate',
    type: 'Percentage',
    description: 'Cancelled transactions over total transactions',
    defaultVisible: false,
  },
  {
    id: 'created-at',
    label: 'Created At',
    type: 'Date',
    description: 'Listing creation timestamp',
    defaultVisible: true,
  },
  {
    id: 'approved-at',
    label: 'Approved At',
    type: 'Date',
    description: 'When the listing was approved',
    defaultVisible: false,
  },
  {
    id: 'last-updated-at',
    label: 'Last Updated At',
    type: 'Date',
    description: 'Latest modification timestamp',
    defaultVisible: false,
  },
]

export const DEFAULT_SERVICE_MANAGEMENT_VISIBLE_COLUMN_IDS =
  SERVICE_MANAGEMENT_TABLE_COLUMNS_CATALOG.filter((c) => c.defaultVisible).map((c) => c.id)

export const SERVICE_PENDING_APPROVALS_TABLE_COLUMNS_CATALOG: ServiceTableColumnCatalogItem[] = [
  {
    id: 'service-id',
    label: 'Listing ID',
    type: 'Text',
    description: 'Unique listing identifier (SER/CON)',
    defaultVisible: true,
  },
  {
    id: 'name',
    label: 'Listing Name',
    type: 'Text',
    description: 'Service or consultation title',
    defaultVisible: true,
  },
  {
    id: 'type',
    label: 'Listing Type',
    type: 'Text',
    description: 'Service or Consultation',
    defaultVisible: true,
  },
  {
    id: 'category',
    label: 'Category',
    type: 'Text',
    description: 'Marketplace category',
    defaultVisible: true,
  },
  {
    id: 'sub-category',
    label: 'Sub-Category',
    type: 'Text',
    description: 'Marketplace sub-category',
    defaultVisible: false,
  },
  {
    id: 'pricing-model',
    label: 'Pricing Model',
    type: 'Text',
    description: 'Fixed, Tiered, or Custom',
    defaultVisible: true,
  },
  {
    id: 'tier-name',
    label: 'Tier Name',
    type: 'Text',
    description: 'Pricing tier name when tiered',
    defaultVisible: false,
  },
  {
    id: 'pricing',
    label: 'Base Price',
    type: 'Currency',
    description: 'Original listing price',
    defaultVisible: true,
  },
  {
    id: 'platform-discount-percent',
    label: 'Platform Discount %',
    type: 'Percentage',
    description: 'Platform-funded discount',
    defaultVisible: false,
  },
  {
    id: 'final-price',
    label: 'Final Price',
    type: 'Currency',
    description: 'Customer payable price after discount',
    defaultVisible: true,
  },
  {
    id: 'expert-id',
    label: 'Expert ID',
    type: 'Text',
    description: 'Listing owner expert identifier',
    defaultVisible: true,
  },
  {
    id: 'expert-name',
    label: 'Expert Name',
    type: 'Text',
    description: 'Listing owner display name',
    defaultVisible: true,
  },
  {
    id: 'expert-rating',
    label: 'Expert Rating',
    type: 'Average',
    description: 'Owner average review rating',
    defaultVisible: false,
  },
  {
    id: 'expert-account-status',
    label: 'Expert Account Status',
    type: 'Status',
    description: 'Owner account lifecycle status',
    defaultVisible: false,
  },
  {
    id: 'submitted-at',
    label: 'Submitted At',
    type: 'Date',
    description: 'When the listing was submitted for review',
    defaultVisible: true,
  },
  {
    id: 'last-updated-at',
    label: 'Last Updated At',
    type: 'Date',
    description: 'Latest modification timestamp',
    defaultVisible: true,
  },
]

export const DEFAULT_SERVICE_PENDING_VISIBLE_COLUMN_IDS =
  SERVICE_PENDING_APPROVALS_TABLE_COLUMNS_CATALOG.filter((c) => c.defaultVisible).map((c) => c.id)

export const SERVICE_REPORTED_TABLE_COLUMNS_CATALOG: ServiceTableColumnCatalogItem[] = [
  {
    id: 'report-id',
    label: 'Report ID',
    type: 'Text',
    description: 'Unique report identifier',
    defaultVisible: true,
  },
  {
    id: 'listing-id',
    label: 'Listing ID',
    type: 'Text',
    description: 'Reported listing identifier',
    defaultVisible: true,
  },
  {
    id: 'listing-name',
    label: 'Listing Name',
    type: 'Text',
    description: 'Reported listing title',
    defaultVisible: true,
  },
  {
    id: 'reported-at',
    label: 'Reported At',
    type: 'Date',
    description: 'Report timestamp',
    defaultVisible: true,
  },
  {
    id: 'report-reason',
    label: 'Report Reason',
    type: 'Text',
    description: 'Selected report reason',
    defaultVisible: true,
  },
  {
    id: 'reported-by',
    label: 'Reported By',
    type: 'Text',
    description: 'Reporter role (Client / Expert / Admin)',
    defaultVisible: true,
  },
  {
    id: 'reporter-id',
    label: 'Reporter ID',
    type: 'Text',
    description: 'Reporter identifier',
    defaultVisible: false,
  },
  {
    id: 'case-status',
    label: 'Case Status',
    type: 'Status',
    description: 'Investigation case status',
    defaultVisible: true,
  },
  {
    id: 'assigned-admin',
    label: 'Assigned Admin',
    type: 'Text',
    description: 'Investigating admin identifier',
    defaultVisible: false,
  },
]

export const DEFAULT_SERVICE_REPORTED_VISIBLE_COLUMN_IDS =
  SERVICE_REPORTED_TABLE_COLUMNS_CATALOG.filter((c) => c.defaultVisible).map((c) => c.id)

export const SERVICE_SUSPENDED_TABLE_COLUMNS_CATALOG: ServiceTableColumnCatalogItem[] = [
  {
    id: 'service-id',
    label: 'Listing ID',
    type: 'Text',
    description: 'Suspended listing identifier',
    defaultVisible: true,
  },
  {
    id: 'name',
    label: 'Listing Name',
    type: 'Text',
    description: 'Listing title',
    defaultVisible: true,
  },
  {
    id: 'suspension-reason',
    label: 'Suspension Reason',
    type: 'Text',
    description: 'Reason for suspension',
    defaultVisible: true,
  },
  {
    id: 'suspension-type',
    label: 'Suspension Type',
    type: 'Text',
    description: 'Temporary or Indefinite',
    defaultVisible: true,
  },
  {
    id: 'suspended-at',
    label: 'Suspended At',
    type: 'Date',
    description: 'Suspension start timestamp',
    defaultVisible: true,
  },
  {
    id: 'suspension-until',
    label: 'Suspension Until',
    type: 'Date',
    description: 'Suspension end date',
    defaultVisible: false,
  },
  {
    id: 'suspended-by',
    label: 'Suspended By',
    type: 'Text',
    description: 'Admin who suspended the listing',
    defaultVisible: false,
  },
  {
    id: 'compliance-status',
    label: 'Compliance Status',
    type: 'Status',
    description: 'Pending / Cleared / Failed',
    defaultVisible: false,
  },
  {
    id: 'last-updated-at',
    label: 'Last Updated At',
    type: 'Date',
    description: 'Latest modification timestamp',
    defaultVisible: true,
  },
]

export const DEFAULT_SERVICE_SUSPENDED_VISIBLE_COLUMN_IDS =
  SERVICE_SUSPENDED_TABLE_COLUMNS_CATALOG.filter((c) => c.defaultVisible).map((c) => c.id)

export const SERVICE_DELETED_TABLE_COLUMNS_CATALOG: ServiceTableColumnCatalogItem[] = [
  {
    id: 'service-id',
    label: 'Listing ID',
    type: 'Text',
    description: 'Deleted listing identifier',
    defaultVisible: true,
  },
  {
    id: 'name',
    label: 'Listing Name',
    type: 'Text',
    description: 'Listing title',
    defaultVisible: true,
  },
  {
    id: 'deleted-by',
    label: 'Deleted By',
    type: 'Text',
    description: 'Who deleted (Expert / Admin / System)',
    defaultVisible: true,
  },
  {
    id: 'deleted-by-id',
    label: 'Deleted By ID',
    type: 'Text',
    description: 'User or admin identifier',
    defaultVisible: false,
  },
  {
    id: 'deletion-reason',
    label: 'Deletion Reason',
    type: 'Text',
    description: 'Reason for deletion',
    defaultVisible: true,
  },
  {
    id: 'deleted-at',
    label: 'Deleted At',
    type: 'Date',
    description: 'Deletion timestamp',
    defaultVisible: true,
  },
  {
    id: 'restore-eligible',
    label: 'Restore Eligible',
    type: 'Status',
    description: 'Whether restore is still allowed',
    defaultVisible: true,
  },
  {
    id: 'last-updated-at',
    label: 'Last Updated At',
    type: 'Date',
    description: 'Latest modification timestamp',
    defaultVisible: false,
  },
]

export const DEFAULT_SERVICE_DELETED_VISIBLE_COLUMN_IDS =
  SERVICE_DELETED_TABLE_COLUMNS_CATALOG.filter((c) => c.defaultVisible).map((c) => c.id)
