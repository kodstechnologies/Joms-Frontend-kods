import type { ColumnDef } from '@tanstack/react-table'

import DeletedVenueCategoryActions from './DeletedVenueCategoryActions'
import VenueViewCategoryButton from './venue-view-category-button'
import { CategoryStatusBadge } from './category-list-shared'
import { venueCategoryColumns, type VenueCategory } from './venue-category-table-columns'

function getDisplayStatus(category: VenueCategory) {
  return category.previousStatus ?? category.status
}

/** Full Manage Metrics catalog columns for deleted venue categories. */
export const deletedVenueCategoryColumns: ColumnDef<VenueCategory>[] = venueCategoryColumns.map(
  (column) => {
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
            <VenueViewCategoryButton id={row.original.id} />
            <DeletedVenueCategoryActions category={row.original} />
          </div>
        ),
      }
    }
    return column
  },
)

export type { VenueCategory as DeletedVenueCategory }
