import type { ReactNode } from 'react'
import type { ColumnDef } from '@tanstack/react-table'

import { sortIdsByCatalogOrder } from '@/shared/lib/dedupe-ids'

export function resolveFinanceVisibleColumnIds(
  catalogIds: string[],
  visibleColumnIds: string[] | undefined,
  defaultColumnIds: string[],
  legacyColumnIdMap?: Record<string, string>,
) {
  const rawVisibleIds = visibleColumnIds?.length ? visibleColumnIds : defaultColumnIds
  const normalized = legacyColumnIdMap
    ? [...new Set(rawVisibleIds.map((id) => legacyColumnIdMap[id] ?? id))]
    : rawVisibleIds
  return sortIdsByCatalogOrder(
    normalized.filter((id) => catalogIds.includes(id)),
    catalogIds,
  )
}

export function buildFinancePreferenceColumns<T>(
  dataColumnsById: Record<string, ColumnDef<T>>,
  catalogIds: string[],
  visibleColumnIds: string[] | undefined,
  defaultColumnIds: string[],
  legacyColumnIdMap?: Record<string, string>,
) {
  return resolveFinanceVisibleColumnIds(
    catalogIds,
    visibleColumnIds,
    defaultColumnIds,
    legacyColumnIdMap,
  )
    .map((id) => dataColumnsById[id])
    .filter(Boolean)
}

export function createFinanceActionsColumn<T>(renderActions: (row: T) => ReactNode): ColumnDef<T> {
  return {
    id: 'actions',
    header: 'Actions',
    meta: { headerClassName: 'pr-5 text-right', cellClassName: 'relative pr-5 text-right' },
    cell: ({ row }) => renderActions(row.original),
  }
}

export function assembleFinanceTableColumns<T>(
  selectColumn: ColumnDef<T>,
  dataColumnsById: Record<string, ColumnDef<T>>,
  options: {
    catalogIds: string[]
    visibleColumnIds: string[] | undefined
    defaultColumnIds: string[]
    legacyColumnIdMap?: Record<string, string>
    renderActions: (row: T) => ReactNode
  },
): ColumnDef<T>[] {
  const preferenceColumns = buildFinancePreferenceColumns(
    dataColumnsById,
    options.catalogIds,
    options.visibleColumnIds,
    options.defaultColumnIds,
    options.legacyColumnIdMap,
  )
  return [selectColumn, ...preferenceColumns, createFinanceActionsColumn(options.renderActions)]
}
