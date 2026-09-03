export type ServiceCategoryManagementTableColumnCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultVisible: boolean
}

export const SERVICE_CATEGORY_MANAGEMENT_TABLE_COLUMNS_CATALOG: ServiceCategoryManagementTableColumnCatalogItem[] =
  [
    {
      id: 'category-id',
      label: 'Category ID',
      type: 'Text',
      description: 'Unique category identifier (UUID)',
      defaultVisible: true,
    },
    {
      id: 'category-name',
      label: 'Category Name',
      type: 'Text',
      description: 'Category display name',
      defaultVisible: true,
    },
    {
      id: 'sub-categories',
      label: 'Number of Sub Categories',
      type: 'Number',
      description: 'Count(Sub Categories)',
      defaultVisible: true,
    },
    {
      id: 'active-listings',
      label: 'Active Listings',
      type: 'Number',
      description: 'Count(Active Services)',
      defaultVisible: true,
    },
    {
      id: 'total-experts',
      label: 'Total Experts',
      type: 'Number',
      description: 'Count(Distinct Experts)',
      defaultVisible: true,
    },
    {
      id: 'total-orders',
      label: 'Total Orders',
      type: 'Number',
      description: 'Count(Orders)',
      defaultVisible: false,
    },
    {
      id: 'completed-orders',
      label: 'Completed Orders',
      type: 'Number',
      description: 'Count(Status=Completed)',
      defaultVisible: false,
    },
    {
      id: 'in-progress-orders',
      label: 'In Progress Orders',
      type: 'Number',
      description: 'Count(Status=InProgress)',
      defaultVisible: false,
    },
    {
      id: 'cancelled-orders',
      label: 'Cancelled Orders',
      type: 'Number',
      description: 'Count(Status=Cancelled)',
      defaultVisible: false,
    },
    {
      id: 'revenue-generated',
      label: 'Revenue Generated',
      type: 'Currency',
      description: 'Sum(Order Revenue)',
      defaultVisible: true,
    },
    {
      id: 'repeat-booking-pct',
      label: 'Repeat Booking %',
      type: 'Percentage',
      description: 'Repeat Clients / Total Clients ×100',
      defaultVisible: false,
    },
    {
      id: 'status',
      label: 'Status',
      type: 'Status',
      description: 'Active, Paused, Deleted',
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

export const DEFAULT_SERVICE_CATEGORY_MANAGEMENT_VISIBLE_COLUMN_IDS =
  SERVICE_CATEGORY_MANAGEMENT_TABLE_COLUMNS_CATALOG.filter((column) => column.defaultVisible).map(
    (column) => column.id,
  )

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
