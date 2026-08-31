import type { ColumnDef } from '@tanstack/react-table'

import { sortIdsByCatalogOrder } from '@/shared/lib/dedupe-ids'

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
  const normalize = (ids: readonly string[]) =>
    [...new Set(ids.map((id) => legacyIdMap[id] ?? id))].filter((id) => id in dataColumnsById)

  const fromPrefs = normalize(rawVisibleIds)
  const fallback = normalize(defaultVisibleIds)
  const minColumns = Math.min(3, fallback.length)
  const useFallback =
    fromPrefs.length === 0 || (fromPrefs.length < minColumns && fallback.length > fromPrefs.length)

  const selected = sortIdsByCatalogOrder(
    useFallback ? fallback : fromPrefs,
    catalogOrder.length ? catalogOrder : defaultVisibleIds,
  )
    .map((id) => dataColumnsById[id])
    .filter(Boolean)

  const actionsColumn = allColumns.find((column) => column.id === 'actions')
  return actionsColumn ? [...selected, actionsColumn] : selected
}
