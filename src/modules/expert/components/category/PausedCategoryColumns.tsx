import type { ColumnDef } from '@tanstack/react-table'

import CategoryTableActions from './CategoryTableActions'
import ViewCategoryButton from './ViewCategoryButton'
import { CategoryStatusBadge } from './category-list-shared'
import { categoryColumns, type Category } from './category-table-columns'

function getDisplayStatus(category: Category) {
  return category.previousStatus ?? category.status
}

export const pausedCategoryColumns: ColumnDef<Category>[] = categoryColumns.map((column) => {
  if (column.id === 'status') {
    return {
      ...column,
      cell: ({ row }) => <CategoryStatusBadge status={getDisplayStatus(row.original)} />,
    }
  }
  if (column.id === 'actions') {
    return {
      id: 'actions',
      header: 'Actions',
      meta: { headerClassName: 'text-right', cellClassName: 'text-right' },
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-2">
          <ViewCategoryButton id={row.original.id} />
          <CategoryTableActions category={row.original} />
        </div>
      ),
    }
  }
  return column
})

export type { Category as PausedCategory }
