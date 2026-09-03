export type VenueCategoryManagementTableColumnCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultVisible: boolean
}

export const VENUE_CATEGORY_MANAGEMENT_TABLE_COLUMNS_CATALOG: VenueCategoryManagementTableColumnCatalogItem[] =
  [
    {
      id: 'category-id',
      label: 'Category ID',
      type: 'Text',
      description: 'Unique venue category identifier (UUID)',
      defaultVisible: true,
    },
    {
      id: 'category-name',
      label: 'Category Name',
      type: 'Text',
      description: 'Venue category display name',
      defaultVisible: true,
    },
    {
      id: 'spaces',
      label: 'Spaces',
      type: 'Number',
      description: 'Count(Spaces)',
      defaultVisible: true,
    },
    {
      id: 'venues',
      label: 'Venues',
      type: 'Number',
      description: 'Count(Venues)',
      defaultVisible: true,
    },
    {
      id: 'active-spaces',
      label: 'Active Spaces',
      type: 'Number',
      description: 'Count(Status=Active)',
      defaultVisible: false,
    },
    {
      id: 'bookings',
      label: 'Bookings',
      type: 'Number',
      description: 'Count(Bookings)',
      defaultVisible: false,
    },
    {
      id: 'completed-bookings',
      label: 'Completed Bookings',
      type: 'Number',
      description: 'Count(Completed)',
      defaultVisible: false,
    },
    {
      id: 'revenue',
      label: 'Revenue',
      type: 'Currency',
      description: 'Sum(Revenue)',
      defaultVisible: true,
    },
    {
      id: 'status',
      label: 'Status',
      type: 'Status',
      description: 'Active / Paused / Deleted',
      defaultVisible: true,
    },
    {
      id: 'created-by',
      label: 'Created By',
      type: 'Text',
      description: 'Admin who created the category',
      defaultVisible: false,
    },
    {
      id: 'created-at',
      label: 'Created At',
      type: 'Date',
      description: 'Category creation timestamp',
      defaultVisible: false,
    },
    {
      id: 'last-updated',
      label: 'Last Updated',
      type: 'Date',
      description: 'Latest update timestamp',
      defaultVisible: false,
    },
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
