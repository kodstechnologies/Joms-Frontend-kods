/**
 * Shared utilities for filter-based export across all management pages.
 * Converts FilterValues from the export modal into API query params,
 * fetches filtered data, then calls exportDataToFile.
 */

import type { FilterValues } from '@/shared/types/data-filter'
import { exportDataToFile } from './export-utils'

/**
 * Converts filter values (keyed as "section.fieldId") into flat API query params.
 * Handles text, arrays (checkboxes), range objects, and location objects.
 */
export function buildFilterParams(filterValues: FilterValues): Record<string, string> {
  const params: Record<string, string> = {}

  Object.entries(filterValues).forEach(([rawKey, val]) => {
    if (val === undefined || val === null || val === '') return

    const parts = rawKey.split('.')
    const fieldId = parts.length > 1 ? parts.slice(1).join('.') : rawKey

    if (fieldId === 'location' && typeof val === 'object' && val !== null) {
      const loc = val as { state?: string; city?: string }
      if (loc.state?.trim()) params.locationState = loc.state.trim()
      if (loc.city?.trim()) params.locationCity = loc.city.trim()
      return
    }

    if (Array.isArray(val)) {
      if (val.length > 0) params[fieldId] = val.join(',')
      return
    }

    if (typeof val === 'object' && val !== null) {
      const range = val as { from?: string | number; to?: string | number }
      if (range.from !== undefined && range.from !== '')
        params[`${fieldId}Min`] = String(range.from).trim()
      if (range.to !== undefined && range.to !== '')
        params[`${fieldId}Max`] = String(range.to).trim()
      return
    }

    if (typeof val === 'string' && val.trim()) {
      params[fieldId] = val.trim()
      return
    }

    if (typeof val === 'number' || typeof val === 'boolean') {
      params[fieldId] = String(val)
    }
  })

  return params
}

type ExportColumnMap<T> = Record<string, { header: string; accessor: (item: T) => string }>

/**
 * Creates an async export handler that:
 * 1. Converts filter values to API params
 * 2. Fetches filtered data from the API (up to 1000 records)
 * 3. Maps data through the column map
 * 4. Calls exportDataToFile
 *
 * @param fetchFn  - the API function (accepts params, returns { data: T[] } or T[])
 * @param columnMap - EXPORT_COLUMN_MAP for this page
 * @param fileName  - base filename for the export
 * @param baseParams - fixed params always added (e.g. { status: 'suspended' })
 */
export function createFilteredExportHandler<T>(
  fetchFn: (params: Record<string, unknown>) => Promise<{ data?: T[]; data_?: T[] } | T[]>,
  columnMap: ExportColumnMap<T>,
  fileName: string,
  baseParams: Record<string, unknown> = {},
) {
  return async (values: FilterValues, format: string): Promise<void> => {
    const filterParams = buildFilterParams(values)
    const result = await fetchFn({ ...baseParams, ...filterParams, limit: 1000 })

    // Handle both response shapes: { data: T[] } or T[]
    const items: T[] = Array.isArray(result) ? result : ((result as { data?: T[] }).data ?? [])

    if (items.length === 0) {
      throw new Error('NO_RECORDS')
    }

    const exportCols = Object.values(columnMap)
    const headers = exportCols.map((c) => c.header)
    const rows = items.map((item) => exportCols.map((c) => c.accessor(item)))

    exportDataToFile(headers, rows, format, fileName)
  }
}
