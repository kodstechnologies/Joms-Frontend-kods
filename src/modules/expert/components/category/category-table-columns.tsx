import type { ColumnDef } from '@tanstack/react-table'

import ViewCategoryButton from './ViewCategoryButton'
import { CategoryActionsDropdown } from './category-actions-dropdown'
import { CategoryStatusBadge } from './category-list-shared'

export type Category = {
  id: string
  categoryId?: string
  name: string
  description: string
  icon?: string
  image?: string
  status: string
  previousStatus?: string
  subCategory: number
  services: number
  experts: number
  totalOrders: number
  completedOrders: number
  inProgressOrders: number
  cancelledOrders: number
  revenue: string
  repeatBookingPct: string
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
    services: number
    experts: number
  }[]
}

export const categoryColumns: ColumnDef<Category>[] = [
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
    id: 'sub-categories',
    accessorKey: 'subCategory',
    header: 'Number of Sub Categories',
    meta: { cellClassName: 'text-white' },
  },
  {
    id: 'active-listings',
    accessorKey: 'services',
    header: 'Total Listings',
    meta: { cellClassName: 'text-white' },
  },
  {
    id: 'total-experts',
    accessorKey: 'experts',
    header: 'Total Experts',
    meta: { cellClassName: 'text-white' },
  },
  {
    id: 'total-orders',
    accessorKey: 'totalOrders',
    header: 'Total Orders',
    meta: { cellClassName: 'text-white' },
  },
  {
    id: 'completed-orders',
    accessorKey: 'completedOrders',
    header: 'Completed Orders',
    meta: { cellClassName: 'text-white' },
  },
  {
    id: 'in-progress-orders',
    accessorKey: 'inProgressOrders',
    header: 'In Progress Orders',
    meta: { cellClassName: 'text-white' },
  },
  {
    id: 'cancelled-orders',
    accessorKey: 'cancelledOrders',
    header: 'Cancelled Orders',
    meta: { cellClassName: 'text-white' },
  },
  {
    id: 'revenue-generated',
    accessorKey: 'revenue',
    header: 'Revenue Generated',
    meta: { cellClassName: 'text-white font-medium' },
  },
  {
    id: 'repeat-booking-pct',
    accessorKey: 'repeatBookingPct',
    header: 'Repeat Booking %',
    meta: { cellClassName: 'text-white' },
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
        <ViewCategoryButton id={row.original.id} />
        <CategoryActionsDropdown category={row.original} />
      </div>
    ),
  },
]
