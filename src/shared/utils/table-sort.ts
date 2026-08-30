import type { ColumnDef } from '@tanstack/react-table'

import type { ServerSortOrder } from '@/shared/hooks/use-server-table-sort'

const NON_SORTABLE_COLUMN_IDS = new Set(['select', 'actions', 'action'])

export function isSortableColumnId(columnId: string) {
  return columnId.length > 0 && !NON_SORTABLE_COLUMN_IDS.has(columnId)
}

/** Resolve stable column id from explicit id or accessorKey (TanStack default). */
export function resolveColumnDefId<T>(column: ColumnDef<T>): string {
  if (column.id) return String(column.id)
  if ('accessorKey' in column && column.accessorKey != null && column.accessorKey !== '') {
    return String(column.accessorKey)
  }
  return ''
}

export function camelToKebab(value: string) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase()
}

/** Look up API sort field by column id or kebab-case catalog id. */
export function resolveSortFieldMapEntry(
  columnId: string,
  sortFieldMap?: Record<string, string | null | undefined>,
): string | null | undefined {
  if (!sortFieldMap || !columnId) return undefined
  if (Object.prototype.hasOwnProperty.call(sortFieldMap, columnId)) {
    return sortFieldMap[columnId]
  }
  const kebab = camelToKebab(columnId)
  if (Object.prototype.hasOwnProperty.call(sortFieldMap, kebab)) {
    return sortFieldMap[kebab]
  }
  return undefined
}

/** Attach meta.sortField (defaults to column id) for server-side sorting. */
export function withServerSortMeta<T>(
  columns: ColumnDef<T>[],
  sortFieldMap?: Record<string, string | null | undefined>,
): ColumnDef<T>[] {
  return columns.map((column) => {
    const columnId = resolveColumnDefId(column)
    if (!isSortableColumnId(columnId)) {
      return { ...column, enableSorting: false }
    }

    const mapped = resolveSortFieldMapEntry(columnId, sortFieldMap)
    if (mapped === null) {
      return { ...column, enableSorting: false }
    }

    const sortField = mapped ?? columnId
    return {
      ...column,
      id: column.id ?? columnId,
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
