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
  spaces: number
  activeSpaces: number
  venues: number
  bookings: number
  completedBookings: number
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
    id: 'category-id',
    header: 'Category ID',
    accessorFn: (row) => row.categoryId || row.id,
    meta: { cellClassName: 'text-white font-medium' },
  },
  {
    id: 'category-name',
    accessorKey: 'name',
    header: 'Category Name',
    meta: { cellClassName: 'text-white' },
  },
  {
    id: 'spaces',
    accessorKey: 'spaces',
    header: 'Spaces',
    meta: { cellClassName: 'text-white' },
  },
  {
    id: 'venues',
    accessorKey: 'venues',
    header: 'Venues',
    meta: { cellClassName: 'text-white' },
  },
  {
    id: 'active-spaces',
    accessorKey: 'activeSpaces',
    header: 'Active Spaces',
    meta: { cellClassName: 'text-white' },
  },
  {
    id: 'bookings',
    accessorKey: 'bookings',
    header: 'Bookings',
    meta: { cellClassName: 'text-white' },
  },
  {
    id: 'completed-bookings',
    accessorKey: 'completedBookings',
    header: 'Completed Bookings',
    meta: { cellClassName: 'text-white' },
  },
  {
    id: 'revenue',
    accessorKey: 'revenue',
    header: 'Revenue',
    meta: { cellClassName: 'text-white font-medium' },
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <CategoryStatusBadge status={row.original.status} />,
  },
  {
    id: 'created-by',
    accessorKey: 'createdBy',
    header: 'Created By',
    meta: { cellClassName: 'text-white' },
  },
  {
    id: 'created-at',
    accessorKey: 'createdAt',
    header: 'Created At',
    meta: { cellClassName: 'text-white' },
  },
  {
    id: 'last-updated',
    accessorKey: 'updatedAt',
    header: 'Last Updated',
    meta: { cellClassName: 'text-white' },
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
