import type { ColumnDef } from '@tanstack/react-table'

import VenueViewCategoryButton from './venue-view-category-button'
import { VenueCategoryActionsDropdown } from './venue-category-actions-dropdown'
import { CategoryStatusBadge } from './category-list-shared'

export type VenueCategory = {
  id: string
  categoryId?: string
  name: string
  description: string
  icon?: string
  image?: string
  status: string
  previousStatus?: string
  subCategory: number
  venues: number
  revenue: string
  createdAt: string
  updatedAt: string
  createdBy: string
  adminNotes: string
  subCategories: {
    id: string
    subCategoryId?: string
    name: string
    status: 'Active' | 'Paused'
    description: string
    adminNotes: string
    icon?: string
    addedOn: string
    createdBy: string
    updatedAt: string
    venues: number
  }[]
}

export const venueCategoryColumns: ColumnDef<VenueCategory>[] = [
  {
    id: 'categoryId',
    header: 'Category ID',
    accessorFn: (row) => row.categoryId || row.id,
    meta: { cellClassName: 'text-white font-medium' },
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: 'Category Name',
    meta: { cellClassName: 'text-white' },
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <CategoryStatusBadge status={row.original.status} />,
  },
  {
    id: 'subCategory',
    accessorKey: 'subCategory',
    header: 'No. of Sub Category',
    meta: { cellClassName: 'text-white' },
  },
  {
    id: 'venues',
    accessorKey: 'venues',
    header: 'No. Of Venues',
    meta: { cellClassName: 'text-white' },
  },
  {
    id: 'revenue',
    accessorKey: 'revenue',
    header: 'Revenue Generated',
    meta: { cellClassName: 'text-white font-medium' },
  },
  {
    id: 'actions',
    header: 'Actions',
    enableSorting: false,
    meta: { headerClassName: 'text-right', cellClassName: 'text-right' },
    cell: ({ row }) => (
      <div className="flex items-center justify-end gap-2">
        <VenueViewCategoryButton id={row.original.id} />
        <VenueCategoryActionsDropdown category={row.original} />
      </div>
    ),
  },
]
