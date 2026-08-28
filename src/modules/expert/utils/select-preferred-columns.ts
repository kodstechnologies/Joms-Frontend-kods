import type { ColumnDef } from '@tanstack/react-table'

import { sortIdsByCatalogOrder } from '@/shared/lib/dedupe-ids'

/** Build preference-driven columns from a full catalog, always appending actions. */
export function selectPreferredColumns<T>(
  allColumns: ColumnDef<T>[],
  rawVisibleIds: string[],
  defaultVisibleIds: string[],
  legacyIdMap: Record<string, string> = {},
): ColumnDef<T>[] {
  const dataColumnsById = Object.fromEntries(
    allColumns
      .filter((column) => column.id && column.id !== 'actions')
      .map((column) => [column.id!, column]),
  ) as Record<string, ColumnDef<T>>

  const catalogOrder = allColumns.map((column) => column.id).filter(Boolean) as string[]
  const visibleIds = rawVisibleIds.map((id) => legacyIdMap[id] ?? id)
  const matched = visibleIds.filter((id) => id in dataColumnsById)
  const selected = sortIdsByCatalogOrder(
    matched.length > 0 ? matched : defaultVisibleIds,
    catalogOrder.length ? catalogOrder : defaultVisibleIds,
  )
    .map((id) => dataColumnsById[id])
    .filter(Boolean)

  const actionsColumn = allColumns.find((column) => column.id === 'actions')
  return actionsColumn ? [...selected, actionsColumn] : selected
}
