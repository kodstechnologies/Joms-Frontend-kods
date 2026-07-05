import type { ColumnDef } from '@tanstack/react-table'

import VenueCategoryTableActions from './VenueCategoryTableActions'
import VenueViewCategoryButton from './venue-view-category-button'
import { CategoryStatusBadge } from './category-list-shared'
import type { VenueCategory } from './venue-category-table-columns'

function getDisplayStatus(category: VenueCategory) {
  return category.previousStatus ?? category.status
}

export const pausedVenueCategoryColumns: ColumnDef<VenueCategory>[] = [
  {
    id: 'categoryId',
    header: 'Category ID',
    accessorFn: (row) => row.categoryId || row.id,
    meta: { cellClassName: 'text-white font-medium' },
  },
  {
    accessorKey: 'name',
    header: 'Category Name',
    meta: { cellClassName: 'text-white' },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <CategoryStatusBadge status={getDisplayStatus(row.original)} />
    ),
  },
  {
    accessorKey: 'subCategory',
    header: 'No. of Sub Category',
    meta: { cellClassName: 'text-white' },
  },
  {
    accessorKey: 'venues',
    header: 'No.Of Venues',
    meta: { cellClassName: 'text-white' },
  },
  {
    accessorKey: 'revenue',
    header: 'Revenue Generated',
    meta: { cellClassName: 'text-white font-medium' },
  },
  {
    id: 'actions',
    header: 'Actions',
    meta: { headerClassName: 'text-right', cellClassName: 'text-right' },
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => (
      <div className="flex items-center justify-end gap-2">
        <VenueViewCategoryButton id={row.original.id} />
        <VenueCategoryTableActions category={row.original} />
      </div>
    ),
  },
]

export type { VenueCategory as PausedVenueCategory }
