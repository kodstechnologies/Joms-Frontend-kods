import type { ColumnDef } from '@tanstack/react-table'

import type { ServerSortOrder } from '@/shared/hooks/use-server-table-sort'

const NON_SORTABLE_COLUMN_IDS = new Set(['select', 'actions', 'action'])

export function isSortableColumnId(columnId: string) {
  return columnId.length > 0 && !NON_SORTABLE_COLUMN_IDS.has(columnId)
}

/** Attach meta.sortField (defaults to column id) for server-side sorting. */
export function withServerSortMeta<T>(
  columns: ColumnDef<T>[],
  sortFieldMap?: Record<string, string | null | undefined>,
): ColumnDef<T>[] {
  return columns.map((column) => {
    const columnId = String(column.id ?? '')
    if (!isSortableColumnId(columnId)) {
      return { ...column, enableSorting: false }
    }

    const mapped = sortFieldMap?.[columnId]
    if (mapped === null) {
      return { ...column, enableSorting: false }
    }

    const sortField = mapped ?? columnId
    return {
      ...column,
      enableSorting: true,
      meta: {
        ...column.meta,
        sortField,
      },
    }
  })
}

export function appendSortQueryParams(
  params: Record<string, unknown>,
  sortBy?: string,
  sortOrder?: ServerSortOrder,
) {
  if (sortBy) params.sortBy = sortBy
  if (sortOrder) params.sortOrder = sortOrder
  return params
}

const toSortableValue = (value: unknown) => {
  if (value == null) return null
  if (typeof value === 'number') return value
  if (typeof value === 'boolean') return value ? 1 : 0
  const asNumber = Number(value)
  if (!Number.isNaN(asNumber) && String(value).trim() !== '') return asNumber
  return String(value).toLowerCase()
}

/** Client-side sort for mock / locally paginated tables. */
export function sortClientRows<T extends Record<string, unknown>>(
  rows: T[],
  sortBy: string | undefined,
  sortOrder: ServerSortOrder | undefined,
) {
  if (!sortBy) return rows
  const dir = sortOrder === 'asc' ? 1 : -1
  return [...rows].sort((left, right) => {
    const a = toSortableValue(left[sortBy])
    const b = toSortableValue(right[sortBy])
    if (a == null && b == null) return 0
    if (a == null) return 1
    if (b == null) return -1
    if (typeof a === 'number' && typeof b === 'number') return (a - b) * dir
    return (
      String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' }) * dir
    )
  })
}
