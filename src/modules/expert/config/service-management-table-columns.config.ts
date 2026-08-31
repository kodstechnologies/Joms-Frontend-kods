export type ServiceTableColumnCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultVisible: boolean
}

const col = (
  id: string,
  label: string,
  type: string,
  description: string,
  defaultVisible = false,
): ServiceTableColumnCatalogItem => ({
  id,
  label,
  type,
  description,
  defaultVisible,
})

export const SERVICE_MANAGEMENT_MODULE_KEY = 'service-management'
export const SERVICE_PENDING_APPROVALS_MODULE_KEY = 'service-pending-approvals'
export const SERVICE_REPORTED_MODULE_KEY = 'service-reported'
export const SERVICE_SUSPENDED_MODULE_KEY = 'service-suspended'
export const SERVICE_DELETED_MODULE_KEY = 'service-deleted'

export const SERVICE_MANAGEMENT_TABLE_COLUMNS_CATALOG: ServiceTableColumnCatalogItem[] = [
  col('service-id', 'Listing ID', 'Text', 'Unique listing identifier (SER/CON)', true),
  col('name', 'Listing Name', 'Text', 'Service or consultation title', true),
  col('type', 'Listing Type', 'Text', 'Service or Consultation', true),
  col('category', 'Category', 'Text', 'Marketplace category', true),
  col('sub-category', 'Sub Category', 'Text', 'Marketplace sub-category'),
  col('status', 'Status', 'Status', 'Current listing lifecycle status', true),
  col('promoted', 'Promoted', 'Status', 'Whether the listing is promoted'),
  col('pricing-model', 'Pricing Model', 'Text', 'Fixed, Tiered, or Custom'),
  col('tier-name', 'Tier Name', 'Text', 'Pricing tier name when tiered'),
  col('pricing', 'Base Price', 'Currency', 'Original listing price', true),
  col('platform-discount-percent', 'Platform Discount %', 'Percentage', 'Platform-funded discount'),
  col('final-price', 'Final Price', 'Currency', 'Customer payable price after discount'),
  col(
    'platform-discount-active',
    'Platform Discount Active',
    'Status',
    'Whether a platform discount is currently live',
  ),
  col('expert-id', 'Expert ID', 'Text', 'Listing owner expert identifier', true),
  col('expert-name', 'Expert Name', 'Text', 'Listing owner display name', true),
  col('expert-rating', 'Expert Rating', 'Average', 'Owner average review rating'),
  col('expert-account-status', 'Expert Account Status', 'Status', 'Owner account lifecycle status'),
  col('total-transactions', 'Total Transactions', 'Count', 'Total orders / bookings'),
  col('scheduled-bookings', 'Scheduled Bookings', 'Count', 'Upcoming scheduled bookings'),
  col('in-progress-orders', 'In Progress Orders', 'Count', 'Active in-progress orders'),
  col('completed-transactions', 'Completed Transactions', 'Count', 'Completed orders / bookings'),
  col(
    'cancelled-terminated-transactions',
    'Cancelled / Terminated Transactions',
    'Count',
    'Cancelled or terminated orders',
  ),
  col('total-disputes', 'Total Disputes', 'Count', 'All disputes on this listing'),
  col('client-raised-disputes', 'Client Raised Disputes', 'Count', 'Disputes opened by clients'),
  col('expert-raised-disputes', 'Expert Raised Disputes', 'Count', 'Disputes opened by experts'),
  col(
    'repeat-booking-percent',
    'Repeat Booking %',
    'Percentage',
    'Share of clients with more than one completed booking',
  ),
  col('average-rating', 'Average Rating', 'Average', 'Listing-level average review rating'),
  col('total-revenue', 'Total Revenue', 'Currency', 'Lifetime completed revenue excluding refunds'),
  col(
    'cancellation-rate',
    'Cancellation Rate',
    'Percentage',
    'Cancelled transactions over total transactions',
  ),
  col('created-at', 'Created At', 'Date', 'Listing creation timestamp', true),
  col('approved-at', 'Approved At', 'Date', 'When the listing was approved'),
  col('last-updated-at', 'Last Updated At', 'Date', 'Latest modification timestamp'),
]

export const DEFAULT_SERVICE_MANAGEMENT_VISIBLE_COLUMN_IDS =
  SERVICE_MANAGEMENT_TABLE_COLUMNS_CATALOG.filter((c) => c.defaultVisible).map((c) => c.id)

export const SERVICE_PENDING_APPROVALS_TABLE_COLUMNS_CATALOG: ServiceTableColumnCatalogItem[] = [
  col('service-id', 'Listing ID', 'Text', 'Unique listing identifier (SER/CON)', true),
  col('name', 'Listing Name', 'Text', 'Service or consultation title', true),
  col('type', 'Listing Type', 'Text', 'Service or Consultation', true),
  col('category', 'Category', 'Text', 'Marketplace category', true),
  col('sub-category', 'Sub-Category', 'Text', 'Marketplace sub-category'),
  col('pricing-model', 'Pricing Model', 'Text', 'Fixed, Tiered, or Custom', true),
  col('tier-name', 'Tier Name', 'Text', 'Pricing tier name when tiered'),
  col('pricing', 'Base Price', 'Currency', 'Original listing price', true),
  col('platform-discount-percent', 'Platform Discount %', 'Percentage', 'Platform-funded discount'),
  col('final-price', 'Final Price', 'Currency', 'Customer payable price after discount', true),
  col('expert-id', 'Expert ID', 'Text', 'Listing owner expert identifier', true),
  col('expert-name', 'Expert Name', 'Text', 'Listing owner display name', true),
  col('expert-rating', 'Expert Rating', 'Average', 'Owner average review rating'),
  col('expert-account-status', 'Expert Account Status', 'Status', 'Owner account lifecycle status'),
  col('submitted-at', 'Submitted At', 'Date', 'When the listing was submitted for review', true),
  col('last-updated-at', 'Last Updated At', 'Date', 'Latest modification timestamp', true),
]

export const DEFAULT_SERVICE_PENDING_VISIBLE_COLUMN_IDS =
  SERVICE_PENDING_APPROVALS_TABLE_COLUMNS_CATALOG.filter((c) => c.defaultVisible).map((c) => c.id)

export const SERVICE_REPORTED_TABLE_COLUMNS_CATALOG: ServiceTableColumnCatalogItem[] = [
  col('report-id', 'Report ID', 'Text', 'Unique report identifier', true),
  col('listing-id', 'Listing ID', 'Text', 'Reported listing identifier', true),
  col('listing-name', 'Listing Name', 'Text', 'Reported listing title', true),
  col('reported-at', 'Reported At', 'Date', 'Report timestamp', true),
  col('report-reason', 'Report Reason', 'Text', 'Selected report reason', true),
  col('reported-by', 'Reported By', 'Text', 'Reporter role (Client / Expert / Admin)', true),
  col('reporter-id', 'Reporter ID', 'Text', 'Reporter identifier'),
  col('case-status', 'Case Status', 'Status', 'Investigation case status', true),
  col('assigned-admin', 'Assigned Admin', 'Text', 'Investigating admin identifier'),
]

export const DEFAULT_SERVICE_REPORTED_VISIBLE_COLUMN_IDS =
  SERVICE_REPORTED_TABLE_COLUMNS_CATALOG.filter((c) => c.defaultVisible).map((c) => c.id)

export const SERVICE_SUSPENDED_TABLE_COLUMNS_CATALOG: ServiceTableColumnCatalogItem[] = [
  col('service-id', 'Listing ID', 'Text', 'Suspended listing identifier', true),
  col('name', 'Listing Name', 'Text', 'Listing title', true),
  col('suspension-reason', 'Suspension Reason', 'Text', 'Reason for suspension', true),
  col('suspension-type', 'Suspension Type', 'Text', 'Temporary or Indefinite', true),
  col('suspended-at', 'Suspended At', 'Date', 'Suspension start timestamp', true),
  col('suspension-until', 'Suspension Until', 'Date', 'Suspension end date'),
  col('suspended-by', 'Suspended By', 'Text', 'Admin who suspended the listing'),
  col('compliance-status', 'Compliance Status', 'Status', 'Pending / Cleared / Failed'),
  col('last-updated-at', 'Last Updated At', 'Date', 'Latest modification timestamp', true),
]

export const DEFAULT_SERVICE_SUSPENDED_VISIBLE_COLUMN_IDS =
  SERVICE_SUSPENDED_TABLE_COLUMNS_CATALOG.filter((c) => c.defaultVisible).map((c) => c.id)

export const SERVICE_DELETED_TABLE_COLUMNS_CATALOG: ServiceTableColumnCatalogItem[] = [
  col('service-id', 'Listing ID', 'Text', 'Deleted listing identifier', true),
  col('name', 'Listing Name', 'Text', 'Listing title', true),
  col('deleted-by', 'Deleted By', 'Text', 'Who deleted (Expert / Admin / System)', true),
  col('deleted-by-id', 'Deleted By ID', 'Text', 'User or admin identifier'),
  col('deletion-reason', 'Deletion Reason', 'Text', 'Reason for deletion', true),
  col('deleted-at', 'Deleted At', 'Date', 'Deletion timestamp', true),
  col('restore-eligible', 'Restore Eligible', 'Status', 'Whether restore is still allowed', true),
  col('last-updated-at', 'Last Updated At', 'Date', 'Latest modification timestamp'),
]

export const DEFAULT_SERVICE_DELETED_VISIBLE_COLUMN_IDS =
  SERVICE_DELETED_TABLE_COLUMNS_CATALOG.filter((c) => c.defaultVisible).map((c) => c.id)
