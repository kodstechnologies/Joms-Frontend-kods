/** Keep ids kebab-case to match Manage Metrics / ui-preferences. */

export type VenueCategoryManagementTableColumnCatalogItem = {
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
): VenueCategoryManagementTableColumnCatalogItem => ({
  id,
  label,
  type,
  description,
  defaultVisible,
})

export const VENUE_CATEGORY_MANAGEMENT_TABLE_COLUMNS_CATALOG: VenueCategoryManagementTableColumnCatalogItem[] =
  [
    col('category-id', 'Category ID', 'Text', 'Unique venue category identifier (UUID)', true),
    col('category-name', 'Category Name', 'Text', 'Venue category display name', true),
    col('spaces', 'Spaces', 'Number', 'Count(Spaces)', true),
    col('venues', 'Venues', 'Number', 'Count(Venues)', true),
    col('active-spaces', 'Active Spaces', 'Number', 'Count(Status=Active)'),
    col('bookings', 'Bookings', 'Number', 'Count(Bookings)'),
    col('completed-bookings', 'Completed Bookings', 'Number', 'Count(Completed)'),
    col('revenue', 'Revenue', 'Currency', 'Sum(Revenue)', true),
    col('status', 'Status', 'Status', 'Active / Paused / Deleted', true),
    col('created-by', 'Created By', 'Text', 'Admin who created the category'),
    col('created-at', 'Created At', 'Date', 'Category creation timestamp'),
    col('last-updated', 'Last Updated', 'Date', 'Latest update timestamp'),
  ]

export const DEFAULT_VENUE_CATEGORY_MANAGEMENT_VISIBLE_COLUMN_IDS =
  VENUE_CATEGORY_MANAGEMENT_TABLE_COLUMNS_CATALOG.filter((column) => column.defaultVisible).map(
    (column) => column.id,
  )

export const VENUE_CATEGORY_LEGACY_COLUMN_ID_MAP: Record<string, string> = {
  categoryId: 'category-id',
  name: 'category-name',
  subCategory: 'spaces',
  revenue: 'revenue',
  createdAt: 'created-at',
  createdBy: 'created-by',
  updatedAt: 'last-updated',
}
