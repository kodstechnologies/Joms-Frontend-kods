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
    services: number
    experts: number
  }[]
}

export const categoryColumns: ColumnDef<Category>[] = [
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
    id: 'services',
    accessorKey: 'services',
    header: 'No.Of Services',
    meta: { cellClassName: 'text-white' },
  },
  {
    id: 'experts',
    accessorKey: 'experts',
    header: 'No.Of Experts',
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
        <ViewCategoryButton id={row.original.id} />
        <CategoryActionsDropdown category={row.original} />
      </div>
    ),
  },
]
