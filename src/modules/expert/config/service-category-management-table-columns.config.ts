/**
 * Service Category Management — main table column catalog.
 * Source: JOMS_KODS_Web_Admin_Panel_full_data (SERVICE CATEGORY MANAGEMENT → Main Table).
 * Keep ids kebab-case to match Manage Metrics / ui-preferences.
 */

export type ServiceCategoryManagementTableColumnCatalogItem = {
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
): ServiceCategoryManagementTableColumnCatalogItem => ({
  id,
  label,
  type,
  description,
  defaultVisible,
})

export const SERVICE_CATEGORY_MANAGEMENT_TABLE_COLUMNS_CATALOG: ServiceCategoryManagementTableColumnCatalogItem[] =
  [
    col('category-id', 'Category ID', 'Text', 'Unique category identifier (UUID)', true),
    col('category-name', 'Category Name', 'Text', 'Category display name', true),
    col('sub-categories', 'Number of Sub Categories', 'Number', 'Count(Sub Categories)', true),
    col('active-listings', 'Active Listings', 'Number', 'Count(Active Services)', true),
    col('total-experts', 'Total Experts', 'Number', 'Count(Distinct Experts)', true),
    col('total-orders', 'Total Orders', 'Number', 'Count(Orders)'),
    col('completed-orders', 'Completed Orders', 'Number', 'Count(Status=Completed)'),
    col('in-progress-orders', 'In Progress Orders', 'Number', 'Count(Status=InProgress)'),
    col('cancelled-orders', 'Cancelled Orders', 'Number', 'Count(Status=Cancelled)'),
    col('revenue-generated', 'Revenue Generated', 'Currency', 'Sum(Order Revenue)', true),
    col(
      'repeat-booking-pct',
      'Repeat Booking %',
      'Percentage',
      'Repeat Clients / Total Clients ×100',
    ),
    col('status', 'Status', 'Status', 'Active, Paused, Deleted', true),
    col('created-by', 'Created By', 'Text', 'Admin who created the category'),
    col('created-at', 'Created At', 'Date', 'Category creation timestamp'),
    col('last-updated', 'Last Updated', 'Date', 'Latest update timestamp'),
  ]

export const DEFAULT_SERVICE_CATEGORY_MANAGEMENT_VISIBLE_COLUMN_IDS =
  SERVICE_CATEGORY_MANAGEMENT_TABLE_COLUMNS_CATALOG.filter((column) => column.defaultVisible).map(
    (column) => column.id,
  )

/** Maps legacy camelCase prefs → current catalog ids. */
export const SERVICE_CATEGORY_LEGACY_COLUMN_ID_MAP: Record<string, string> = {
  categoryId: 'category-id',
  name: 'category-name',
  subCategory: 'sub-categories',
  services: 'active-listings',
  experts: 'total-experts',
  revenue: 'revenue-generated',
  createdAt: 'created-at',
  createdBy: 'created-by',
  updatedAt: 'last-updated',
}
