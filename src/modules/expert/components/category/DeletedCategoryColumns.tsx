import type { ColumnDef } from '@tanstack/react-table'

import DeletedCategoryActions from './DeletedCategoryActions'
import ViewCategoryButton from './ViewCategoryButton'
import { CategoryStatusBadge } from './category-list-shared'
import type { Category } from './category-table-columns'

function getDisplayStatus(category: Category) {
  return category.previousStatus ?? category.status
}

export const deletedCategoryColumns: ColumnDef<Category>[] = [
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
    accessorKey: 'services',
    header: 'No.Of Services',
    meta: { cellClassName: 'text-white' },
  },
  {
    accessorKey: 'experts',
    header: 'No.Of Experts',
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
        <ViewCategoryButton id={row.original.id} />
        <DeletedCategoryActions category={row.original} />
      </div>
    ),
  },
]

export type { Category as DeletedCategory }
