import type { ColumnDef } from '@tanstack/react-table'
import type { FilterValues } from '@/shared/types/data-filter'
import { sortIdsByCatalogOrder } from '@/shared/lib/dedupe-ids'
import { exportDataToFile, exportDisplayValue } from './export-utils'
export { exportDataToFile, exportDisplayValue }

export type ExportColumnDef<T> = { header: string; accessor: (item: T) => string }
export type ExportColumnMap<T> = Record<string, ExportColumnDef<T>>

export type ExportHandlerOptions = {
  columnIds?: string[]

  catalogOrder?: string[]
}

export function pickExportColumns<T>(
  columnMap: ExportColumnMap<T>,
  options?: ExportHandlerOptions,
): ExportColumnDef<T>[] {
  const columnIds = options?.columnIds
  if (!columnIds?.length) {
    return Object.values(columnMap)
  }

  const ordered = options?.catalogOrder?.length
    ? sortIdsByCatalogOrder(
        columnIds.filter((id) => columnMap[id]),
        options.catalogOrder,
      )
    : columnIds.filter((id) => columnMap[id])

  return ordered.map((id) => columnMap[id])
}

export function resolveVisibleExportColumnIds({
  visibleColumnIds,
  defaultColumnIds,
  catalogColumnIds,
  legacyColumnIdMap = {},
  allowedColumnIds,
}: {
  visibleColumnIds?: string[]
  defaultColumnIds: readonly string[]
  catalogColumnIds: readonly string[]
  legacyColumnIdMap?: Record<string, string>
  allowedColumnIds?: ReadonlySet<string> | readonly string[]
}): string[] {
  const catalogSet = new Set(catalogColumnIds)
  const allowedSet =
    allowedColumnIds === undefined
      ? null
      : allowedColumnIds instanceof Set
        ? allowedColumnIds
        : new Set(allowedColumnIds)

  const normalize = (ids: readonly string[]) =>
    [...new Set(ids.map((id) => legacyColumnIdMap[id] ?? id))].filter(
      (id) => catalogSet.has(id) && (!allowedSet || allowedSet.has(id)),
    )

  const fromPrefs = normalize(visibleColumnIds ?? [])
  const fallback = normalize(defaultColumnIds)
  const minColumns = Math.min(3, fallback.length)
  const useFallback =
    fromPrefs.length === 0 || (fromPrefs.length < minColumns && fallback.length > fromPrefs.length)

  return sortIdsByCatalogOrder(useFallback ? fallback : fromPrefs, [...catalogColumnIds])
}

export function buildExportColumnMapFromCatalog<T>(
  catalog: ReadonlyArray<{ id: string; label: string }>,
  accessors: Record<string, (row: T) => unknown>,
): ExportColumnMap<T> {
  return Object.fromEntries(
    catalog.map((column) => [
      column.id,
      {
        header: column.label,
        accessor: (row: T) => exportDisplayValue(accessors[column.id]?.(row)),
      },
    ]),
  )
}

function getNestedRowValue(row: unknown, key: string): unknown {
  return key.split('.').reduce<unknown>((value, segment) => {
    if (value == null || typeof value !== 'object') return undefined
    return (value as Record<string, unknown>)[segment]
  }, row)
}

function readColumnDefExportValue<T>(col: ColumnDef<T>, row: T): unknown {
  if ('accessorFn' in col && typeof col.accessorFn === 'function') {
    return col.accessorFn(row, 0)
  }

  const accessorKey = (col as { accessorKey?: string | number }).accessorKey
  if (accessorKey != null) {
    return getNestedRowValue(row, String(accessorKey))
  }

  return undefined
}

export function buildExportColumnMapFromColumnDefs<T>(
  columns: ColumnDef<T>[] | Record<string, ColumnDef<T>>,
  catalog?: ReadonlyArray<{ id: string; label: string }>,
): ExportColumnMap<T> {
  const labelById = catalog
    ? Object.fromEntries(catalog.map((column) => [column.id, column.label]))
    : {}
  const entries: Array<[string, ColumnDef<T>]> = Array.isArray(columns)
    ? columns.filter((column) => column.id).map((column) => [column.id!, column])
    : Object.entries(columns)

  const map: ExportColumnMap<T> = {}

  for (const [key, column] of entries) {
    const id = column.id ?? key
    if (!id || id === 'actions' || id === 'select') continue

    const header = labelById[id] ?? (typeof column.header === 'string' ? column.header : String(id))

    map[id] = {
      header,
      accessor: (row: T) => exportDisplayValue(readColumnDefExportValue(column, row)),
    }
  }

  return map
}

export function buildExportColumnMap<T>(
  catalog: ReadonlyArray<{ id: string; label: string }>,
  accessors: Record<string, (row: T) => unknown>,
  columns?: ColumnDef<T>[] | Record<string, ColumnDef<T>>,
): ExportColumnMap<T> {
  const fromCatalog = buildExportColumnMapFromCatalog(catalog, accessors)
  if (!columns) return fromCatalog

  const fromDefs = buildExportColumnMapFromColumnDefs(columns, catalog)
  return { ...fromCatalog, ...fromDefs }
}

async function exportMappedRows<T>(
  columnMap: ExportColumnMap<T>,
  items: T[],
  format: string,
  fileName: string,
  options?: ExportHandlerOptions,
) {
  if (items.length === 0) {
    throw new Error('NO_RECORDS')
  }

  const exportCols = pickExportColumns(columnMap, options)
  await exportDataToFile(
    exportCols.map((col) => col.header),
    items.map((item) => exportCols.map((col) => col.accessor(item))),
    format,
    fileName,
  )
}

export async function exportMappedItemsToFile<T>(
  columnMap: ExportColumnMap<T>,
  items: T[],
  format: string,
  fileName: string,
  options?: ExportHandlerOptions,
) {
  await exportMappedRows(columnMap, items, format, fileName, options)
}

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

function assignExtraOptions(params: Record<string, unknown>, options: Record<string, unknown>) {
  Object.entries(options).forEach(([key, val]) => {
    if (key === 'page' || key === 'limit' || key === 'status' || key === 'search' || key === 'tab')
      return
    if (typeof val === 'string' && val.trim()) {
      params[key] = val.trim()
    } else if (val !== undefined && val !== null && val !== '') {
      params[key] = val
    }
  })
}

type ExpertListQueryOptions = {
  page?: number
  limit?: number
  search?: string

  status?: string
  [key: string]: unknown
}

export function buildExpertListQueryParams(
  filterValues: FilterValues,
  options: ExpertListQueryOptions = {},
): Record<string, unknown> {
  const params: Record<string, unknown> = {
    page: options.page ?? 1,
    limit: options.limit ?? 10,
  }

  const assignParam = (key: string, value: string) => {
    if (value.trim()) params[key] = value.trim()
  }

  Object.entries(filterValues).forEach(([rawKey, val]) => {
    if (val === undefined || val === null || val === '') return

    const parts = rawKey.split('.')
    const section = parts.length > 1 ? parts[0] : ''
    const fieldId = parts.length > 1 ? parts.slice(1).join('.') : rawKey

    const resolveParamBase = () => {
      if (section === 'services' && fieldId === 'category') return 'serviceCategory'
      if (section === 'customers' && fieldId === 'totalOrders') return 'customerTotalOrders'
      if (section === 'customers' && fieldId === 'onboardingDate') return 'customerOnboardingDate'
      if (section === 'customers' && fieldId === 'cancellationRate')
        return 'customerCancellationRate'
      if (section === 'customers' && fieldId === 'lifetimeSpend') return 'customerLifetimeSpend'
      if (section === 'customers' && fieldId === 'refundFrequency') return 'customerRefundFrequency'
      if (section === 'customers' && fieldId === 'paymentFailureCount')
        return 'customerPaymentFailureCount'
      return fieldId
    }

    const paramBase = resolveParamBase()

    if (paramBase === 'location' && typeof val === 'object' && val !== null) {
      const loc = val as { state?: string; city?: string }
      if (loc.state?.trim()) params.locationState = loc.state.trim()
      if (loc.city?.trim()) params.locationCity = loc.city.trim()
      return
    }

    if (Array.isArray(val)) {
      if (val.length > 0) {
        if (paramBase === 'accountStatus') params.accountStatus = val.join(',')
        else assignParam(paramBase, val.join(','))
      }
      return
    }

    if (typeof val === 'object' && val !== null) {
      const range = val as { from?: string | number; to?: string | number }
      if (range.from !== undefined && range.from !== '') {
        assignParam(`${paramBase}Min`, String(range.from))
      }
      if (range.to !== undefined && range.to !== '') {
        assignParam(`${paramBase}Max`, String(range.to))
      }
      return
    }

    if (typeof val === 'string' && val.trim()) {
      assignParam(paramBase, val)
      return
    }

    if (typeof val === 'number' || typeof val === 'boolean') {
      assignParam(paramBase, String(val))
    }
  })

  if (options.search?.trim()) {
    params.search = options.search.trim()
  }

  if (options.status?.trim()) {
    params.status = options.status.trim()
  }

  assignExtraOptions(params, options)

  return params
}

type ServiceListQueryOptions = {
  page?: number
  limit?: number
  search?: string

  status?: string
  [key: string]: unknown
}

export function buildServiceListQueryParams(
  filterValues: FilterValues,
  options: ServiceListQueryOptions = {},
): Record<string, unknown> {
  const params: Record<string, unknown> = {
    page: options.page ?? 1,
    limit: options.limit ?? 10,
  }

  const assignParam = (key: string, value: string) => {
    if (value.trim()) params[key] = value.trim()
  }

  Object.entries(filterValues).forEach(([rawKey, val]) => {
    if (val === undefined || val === null || val === '') return

    const parts = rawKey.split('.')
    const section = parts.length > 1 ? parts[0] : ''
    const fieldId = parts.length > 1 ? parts.slice(1).join('.') : rawKey

    const resolveParamBase = () => {
      if (section === 'experts' && fieldId === 'category') return 'expertCategory'
      if (section === 'customers' && fieldId === 'lifetimeSpend') return 'customerLifetimeSpend'
      if (section === 'customers' && fieldId === 'cancellationRate')
        return 'customerCancellationRate'
      return fieldId
    }

    const paramBase = resolveParamBase()

    if (paramBase === 'location' && typeof val === 'object' && val !== null) {
      const loc = val as { state?: string; city?: string }
      if (loc.state?.trim()) params.locationState = loc.state.trim()
      if (loc.city?.trim()) params.locationCity = loc.city.trim()
      return
    }

    if (Array.isArray(val)) {
      if (val.length > 0) assignParam(paramBase, val.join(','))
      return
    }

    if (typeof val === 'object' && val !== null) {
      const range = val as { from?: string | number; to?: string | number }
      if (range.from !== undefined && range.from !== '') {
        assignParam(`${paramBase}Min`, String(range.from))
      }
      if (range.to !== undefined && range.to !== '') {
        assignParam(`${paramBase}Max`, String(range.to))
      }
      return
    }

    if (typeof val === 'string' && val.trim()) {
      assignParam(paramBase, val)
      return
    }

    if (typeof val === 'number' || typeof val === 'boolean') {
      assignParam(paramBase, String(val))
    }
  })

  if (options.search?.trim()) {
    params.search = options.search.trim()
  }

  if (options.status?.trim()) {
    params.status = options.status.trim()
  }

  assignExtraOptions(params, options)

  return params
}

export function buildExpertProfileServicesQueryParams(
  filterValues: FilterValues,
  options: ServiceListQueryOptions = {},
): Record<string, unknown> {
  const params: Record<string, unknown> = {
    page: options.page ?? 1,
    limit: options.limit ?? 10,
  }

  const assignParam = (key: string, value: string) => {
    if (value.trim()) params[key] = value.trim()
  }

  Object.entries(filterValues).forEach(([rawKey, val]) => {
    if (val === undefined || val === null || val === '') return

    const parts = rawKey.split('.')
    const section = parts.length > 1 ? parts[0] : ''
    const fieldId = parts.length > 1 ? parts.slice(1).join('.') : rawKey

    const resolveParamBase = () => {
      if (section === 'customers' && fieldId === 'totalOrders') return 'customerTotalOrders'
      if (section === 'customers' && fieldId === 'onboardingDate') return 'customerOnboardingDate'
      if (section === 'customers' && fieldId === 'cancellationRate')
        return 'customerCancellationRate'
      if (section === 'customers' && fieldId === 'lifetimeSpend') return 'customerLifetimeSpend'
      return fieldId
    }

    const paramBase = resolveParamBase()

    if (paramBase === 'location' && typeof val === 'object' && val !== null) {
      const loc = val as { state?: string; city?: string }
      if (loc.state?.trim()) params.locationState = loc.state.trim()
      if (loc.city?.trim()) params.locationCity = loc.city.trim()
      return
    }

    if (Array.isArray(val)) {
      if (val.length > 0) assignParam(paramBase, val.join(','))
      return
    }

    if (typeof val === 'object' && val !== null) {
      const range = val as { from?: string | number; to?: string | number }
      if (range.from !== undefined && range.from !== '') {
        assignParam(`${paramBase}Min`, String(range.from))
      }
      if (range.to !== undefined && range.to !== '') {
        assignParam(`${paramBase}Max`, String(range.to))
      }
      return
    }

    if (typeof val === 'string' && val.trim()) {
      assignParam(paramBase, val)
      return
    }

    if (typeof val === 'number' || typeof val === 'boolean') {
      assignParam(paramBase, String(val))
    }
  })

  if (options.search?.trim()) {
    params.search = options.search.trim()
  }

  if (options.status?.trim()) {
    params.status = options.status.trim()
  }

  assignExtraOptions(params, options)

  return params
}

type PaginatedExportResult<T> = {
  data?: T[]
  meta?: {
    pagination?: { pages?: number; totalPages?: number }
    pages?: number
    totalPages?: number
  }
  pagination?: { pages?: number; totalPages?: number }
}

const EXPORT_PAGE_SIZE = 100
const EXPORT_MAX_PAGES = 100

function extractExportPage<T>(result: PaginatedExportResult<T> | T[]): {
  items: T[]
  pages: number
} {
  if (Array.isArray(result)) {
    return { items: result, pages: 1 }
  }

  const items = result.data ?? []
  const pages = Number(
    result.meta?.pagination?.pages ??
      result.meta?.pagination?.totalPages ??
      result.pagination?.pages ??
      result.pagination?.totalPages ??
      result.meta?.pages ??
      result.meta?.totalPages,
  )

  return {
    items,
    pages: Number.isFinite(pages) && pages > 0 ? pages : 1,
  }
}

export function createFilteredExportHandler<T>(
  fetchFn: (params: Record<string, unknown>) => Promise<PaginatedExportResult<T> | T[]>,
  columnMap: ExportColumnMap<T>,
  fileName: string,
  baseParams: Record<string, unknown> = {},
  options?: ExportHandlerOptions,
) {
  return async (values: FilterValues, format: string): Promise<void> => {
    const filterParams = buildFilterParams(values)
    const items: T[] = []
    let page = 1
    let totalPages = 1

    while (page <= totalPages) {
      const result = await fetchFn({
        ...baseParams,
        ...filterParams,
        page,
        limit: EXPORT_PAGE_SIZE,
      })
      const extracted = extractExportPage<T>(result)
      items.push(...extracted.items)
      totalPages = Math.min(extracted.pages, EXPORT_MAX_PAGES)
      page += 1
    }

    await exportMappedRows(columnMap, items, format, fileName, options)
  }
}

export function createServiceFilteredExportHandler<T>(
  fetchFn: (params: Record<string, unknown>) => Promise<{ data?: T[]; data_?: T[] } | T[]>,
  columnMap: ExportColumnMap<T>,
  fileName: string,
  baseParams: Record<string, unknown> = {},
  options?: ExportHandlerOptions,
) {
  return async (values: FilterValues, format: string): Promise<void> => {
    const filterParams = buildServiceListQueryParams(values, baseParams)
    const result = await fetchFn({ ...filterParams, limit: 1000 })

    const items: T[] = Array.isArray(result) ? result : ((result as { data?: T[] }).data ?? [])

    await exportMappedRows(columnMap, items, format, fileName, options)
  }
}

type CategoryListQueryOptions = {
  page?: number
  limit?: number
  search?: string

  status?: 'ACTIVE' | 'PAUSED' | 'DELETED'
  [key: string]: unknown
}

export function buildCategoryListQueryParams(
  filterValues: FilterValues,
  options: CategoryListQueryOptions = {},
): Record<string, unknown> {
  const params: Record<string, unknown> = {
    page: options.page ?? 1,
    limit: options.limit ?? 10,
  }

  const assignParam = (key: string, value: string) => {
    if (value.trim()) params[key] = value.trim()
  }

  Object.entries(filterValues).forEach(([rawKey, val]) => {
    if (val === undefined || val === null || val === '') return

    const parts = rawKey.split('.')
    const section = parts.length > 1 ? parts[0] : ''
    const fieldId = parts.length > 1 ? parts.slice(1).join('.') : rawKey

    const resolveParamBase = () => {
      if (section === 'experts' && fieldId === 'category') return 'expertCategory'
      if (section === 'experts' && fieldId === 'categoryStatus') return 'categoryStatus'
      if (section === 'customers' && fieldId === 'lifetimeSpend') return 'customerLifetimeSpend'
      if (section === 'customers' && fieldId === 'cancellationRate')
        return 'customerCancellationRate'
      if (section === 'services' && fieldId === 'categoryStatus') return 'categoryStatus'
      return fieldId
    }

    const paramBase = resolveParamBase()

    if (paramBase === 'location' && typeof val === 'object' && val !== null) {
      const loc = val as { state?: string; city?: string }
      if (loc.state?.trim()) params.locationState = loc.state.trim()
      if (loc.city?.trim()) params.locationCity = loc.city.trim()
      return
    }

    if (Array.isArray(val)) {
      if (val.length > 0) {
        if (paramBase === 'accountStatus') params.accountStatus = val.join(',')
        else assignParam(paramBase, val.join(','))
      }
      return
    }

    if (typeof val === 'object' && val !== null) {
      const range = val as { from?: string | number; to?: string | number }
      if (range.from !== undefined && range.from !== '') {
        assignParam(`${paramBase}Min`, String(range.from))
      }
      if (range.to !== undefined && range.to !== '') {
        assignParam(`${paramBase}Max`, String(range.to))
      }
      return
    }

    if (typeof val === 'string' && val.trim()) {
      assignParam(paramBase, val)
      return
    }

    if (typeof val === 'number' || typeof val === 'boolean') {
      assignParam(paramBase, String(val))
    }
  })

  if (options.search?.trim()) {
    params.search = options.search.trim()
  }

  if (options.status) {
    params.status = options.status
  }

  assignExtraOptions(params, options)

  return params
}

export function createCategoryFilteredExportHandler<T>(
  fetchFn: (params: Record<string, unknown>) => Promise<{ data?: T[] } | T[]>,
  columnMap: ExportColumnMap<T>,
  fileName: string,
  baseParams: Record<string, unknown> = {},
  options?: ExportHandlerOptions,
) {
  return async (values: FilterValues, format: string): Promise<void> => {
    const filterParams = buildCategoryListQueryParams(values, baseParams)
    const result = await fetchFn({ ...filterParams, limit: 1000 })

    const items: T[] = Array.isArray(result) ? result : ((result as { data?: T[] }).data ?? [])

    await exportMappedRows(columnMap, items, format, fileName, options)
  }
}

type VenueListQueryOptions = {
  page?: number
  limit?: number
  search?: string

  status?: string
  [key: string]: unknown
}

export function buildVenueListQueryParams(
  filterValues: FilterValues,
  options: VenueListQueryOptions = {},
): Record<string, unknown> {
  const params: Record<string, unknown> = {
    page: options.page ?? 1,
    limit: options.limit ?? 10,
  }

  const assignParam = (key: string, value: string) => {
    if (value.trim()) params[key] = value.trim()
  }

  Object.entries(filterValues).forEach(([rawKey, val]) => {
    if (val === undefined || val === null || val === '') return

    const parts = rawKey.split('.')
    const section = parts.length > 1 ? parts[0] : ''
    const fieldId = parts.length > 1 ? parts.slice(1).join('.') : rawKey

    const resolveParamBase = () => {
      if (section === 'bookings' && fieldId === 'totalNumberOfBookings')
        return 'totalNumberOfBookings'
      return fieldId
    }

    const paramBase = resolveParamBase()

    if (paramBase === 'location' && typeof val === 'object' && val !== null) {
      const loc = val as { state?: string; city?: string }
      if (loc.state?.trim()) params.locationState = loc.state.trim()
      if (loc.city?.trim()) params.locationCity = loc.city.trim()
      return
    }

    if (Array.isArray(val)) {
      if (val.length > 0) assignParam(paramBase, val.join(','))
      return
    }

    if (typeof val === 'object' && val !== null) {
      const range = val as { from?: string | number; to?: string | number }
      if (range.from !== undefined && range.from !== '') {
        assignParam(`${paramBase}Min`, String(range.from))
      }
      if (range.to !== undefined && range.to !== '') {
        assignParam(`${paramBase}Max`, String(range.to))
      }
      return
    }

    if (typeof val === 'string' && val.trim()) {
      assignParam(paramBase, val)
      return
    }

    if (typeof val === 'number' || typeof val === 'boolean') {
      assignParam(paramBase, String(val))
    }
  })

  if (options.search?.trim()) {
    params.search = options.search.trim()
  }

  if (options.status) {
    params.status = options.status
  }

  assignExtraOptions(params, options)

  return params
}

export function createVenueFilteredExportHandler<T>(
  fetchFn: (params: Record<string, unknown>) => Promise<{ data?: T[] } | T[]>,
  columnMap: Record<string, { header: string; accessor: (item: T) => string }>,
  fileName: string,
  baseParams: Record<string, unknown> = {},
  options?: ExportHandlerOptions,
) {
  return async (values: FilterValues, format: string): Promise<void> => {
    const filterParams = buildVenueListQueryParams(values, baseParams)
    const result = await fetchFn({ ...filterParams, limit: 1000 })

    const items: T[] = Array.isArray(result) ? result : ((result as { data?: T[] }).data ?? [])

    await exportMappedRows(columnMap, items, format, fileName, options)
  }
}

type VenueCategoryListQueryOptions = {
  page?: number
  limit?: number
  search?: string

  excludePaused?: boolean
}

export function buildVenueCategoryListQueryParams(
  filterValues: FilterValues,
  options: VenueCategoryListQueryOptions = {},
): Record<string, unknown> {
  const params = buildVenueListQueryParams(filterValues, {
    page: options.page,
    limit: options.limit,
    search: options.search,
  })

  if (options.excludePaused) {
    params.excludePaused = true
  }

  return params
}

export function createVenueCategoryFilteredExportHandler<T>(
  fetchFn: (params: Record<string, unknown>) => Promise<{ data?: T[] } | T[]>,
  columnMap: Record<string, { header: string; accessor: (item: T) => string }>,
  fileName: string,
  baseParams: Record<string, unknown> = {},
  options?: ExportHandlerOptions,
) {
  return async (values: FilterValues, format: string): Promise<void> => {
    const filterParams = buildVenueCategoryListQueryParams(values, baseParams)
    const result = await fetchFn({ ...filterParams, limit: 1000 })

    const items: T[] = Array.isArray(result) ? result : ((result as { data?: T[] }).data ?? [])

    await exportMappedRows(columnMap, items, format, fileName, options)
  }
}

type CommunicationListQueryOptions = {
  page?: number
  limit?: number
  search?: string
}

const COMMUNICATION_DATE_RANGE_PARAMS: Record<string, [string, string]> = {
  createdAt: ['createdAtFrom', 'createdAtTo'],
  scheduledAt: ['scheduledAtFrom', 'scheduledAtTo'],
}

export function buildCommunicationListQueryParams(
  filterValues: FilterValues,
  options: CommunicationListQueryOptions = {},
): Record<string, unknown> {
  const params: Record<string, unknown> = {
    page: options.page ?? 1,
    limit: options.limit ?? 10,
  }

  const assignParam = (key: string, value: string) => {
    if (value.trim()) params[key] = value.trim()
  }

  Object.entries(filterValues).forEach(([rawKey, val]) => {
    if (val === undefined || val === null || val === '') return

    const parts = rawKey.split('.')
    const fieldId = parts.length > 1 ? parts.slice(1).join('.') : rawKey

    if (Array.isArray(val)) {
      if (val.length > 0) assignParam(fieldId, val.join(','))
      return
    }

    if (typeof val === 'object' && val !== null) {
      const range = val as { from?: string | number; to?: string | number }
      const [fromKey, toKey] = COMMUNICATION_DATE_RANGE_PARAMS[fieldId] ?? [
        `${fieldId}Min`,
        `${fieldId}Max`,
      ]
      if (range.from !== undefined && range.from !== '') {
        assignParam(fromKey, String(range.from))
      }
      if (range.to !== undefined && range.to !== '') {
        assignParam(toKey, String(range.to))
      }
      return
    }

    if (typeof val === 'string' && val.trim()) {
      assignParam(fieldId, val)
      return
    }

    if (typeof val === 'number' || typeof val === 'boolean') {
      assignParam(fieldId, String(val))
    }
  })

  if (options.search?.trim()) {
    params.search = options.search.trim()
  }

  return params
}

export function createCommunicationFilteredExportHandler<T>(
  fetchFn: (params: Record<string, unknown>) => Promise<{ data?: T[] } | T[]>,
  columnMap: Record<string, { header: string; accessor: (item: T) => string }>,
  fileName: string,
  baseParams: Record<string, unknown> = {},
  options?: ExportHandlerOptions,
) {
  return async (values: FilterValues, format: string): Promise<void> => {
    const filterParams = buildCommunicationListQueryParams(values, baseParams)
    const result = await fetchFn({ ...filterParams, limit: 1000 })

    const items: T[] = Array.isArray(result) ? result : ((result as { data?: T[] }).data ?? [])

    await exportMappedRows(columnMap, items, format, fileName, options)
  }
}

type ReferralListQueryOptions = {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  [key: string]: unknown
}

const REFERRAL_LEGACY_SEARCH_MAP: Record<string, string> = {
  searchById: 'referralId',
  searchByName: 'referrerName',
  searchByStatus: 'status',
}

const REFERRAL_DATE_RANGE_PARAMS: Record<string, [string, string]> = {
  createdAt: ['createdAtFrom', 'createdAtTo'],
  sentAt: ['sentAtFrom', 'sentAtTo'],
  acceptedAt: ['acceptedAtFrom', 'acceptedAtTo'],
  expiresAt: ['expiresAtFrom', 'expiresAtTo'],
}

export function buildReferralListQueryParams(
  filterValues: FilterValues,
  options: ReferralListQueryOptions = {},
): Record<string, unknown> {
  const { page, limit, search, sortBy, sortOrder, ...rest } = options
  const columnSearch: Record<string, string> = {}

  Object.entries(rest).forEach(([key, value]) => {
    if (typeof value !== 'string' || !value.trim()) return

    if (key === 'searchByDate') {
      const date = value.trim()
      columnSearch.createdAtFrom = date
      columnSearch.createdAtTo = date
      return
    }

    const mappedKey = REFERRAL_LEGACY_SEARCH_MAP[key] ?? key
    columnSearch[mappedKey] = value.trim()
  })

  const params: Record<string, unknown> = {
    page: page ?? 1,
    limit: limit ?? 10,
  }

  const assignParam = (key: string, value: string) => {
    if (value.trim()) params[key] = value.trim()
  }

  Object.entries(filterValues).forEach(([rawKey, val]) => {
    if (val === undefined || val === null || val === '') return

    const parts = rawKey.split('.')
    const fieldId = parts.length > 1 ? parts.slice(1).join('.') : rawKey

    if (Array.isArray(val)) {
      if (val.length > 0) assignParam(fieldId, val.join(','))
      return
    }

    if (typeof val === 'object' && val !== null) {
      const range = val as { from?: string | number; to?: string | number }
      const [fromKey, toKey] = REFERRAL_DATE_RANGE_PARAMS[fieldId] ?? [
        `${fieldId}Min`,
        `${fieldId}Max`,
      ]
      if (range.from !== undefined && range.from !== '') {
        assignParam(fromKey, String(range.from))
      }
      if (range.to !== undefined && range.to !== '') {
        assignParam(toKey, String(range.to))
      }
      return
    }

    if (typeof val === 'string' && val.trim()) {
      assignParam(fieldId, val)
      return
    }

    if (typeof val === 'number' || typeof val === 'boolean') {
      assignParam(fieldId, String(val))
    }
  })

  if (search?.trim()) {
    params.search = search.trim()
  }

  return {
    ...params,
    ...columnSearch,
    ...(sortBy ? { sortBy } : {}),
    ...(sortOrder ? { sortOrder } : {}),
  }
}

export function createReferralFilteredExportHandler<T>(
  fetchFn: (params: Record<string, unknown>) => Promise<{ data?: T[] } | T[]>,
  columnMap: Record<string, { header: string; accessor: (item: T) => string }>,
  fileName: string,
  baseParams: Record<string, unknown> = {},
  options?: ExportHandlerOptions,
) {
  return async (values: FilterValues, format: string): Promise<void> => {
    const filterParams = buildReferralListQueryParams(values, baseParams)
    const result = await fetchFn({ ...filterParams, limit: 1000 })

    const items: T[] = Array.isArray(result) ? result : ((result as { data?: T[] }).data ?? [])

    await exportMappedRows(columnMap, items, format, fileName, options)
  }
}

type RevenueListQueryOptions = {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  [key: string]: unknown
}

const REVENUE_DATE_RANGE_PARAMS: Record<string, [string, string]> = {
  createdAt: ['createdAtFrom', 'createdAtTo'],
  createdOn: ['createdOnMin', 'createdOnMax'],
}

export function buildRevenueListQueryParams(
  filterValues: FilterValues,
  options: RevenueListQueryOptions = {},
): Record<string, unknown> {
  const params: Record<string, unknown> = {
    page: options.page ?? 1,
    limit: options.limit ?? 10,
  }

  const assignParam = (key: string, value: string) => {
    if (value.trim()) params[key] = value.trim()
  }

  Object.entries(filterValues).forEach(([rawKey, val]) => {
    if (val === undefined || val === null || val === '') return

    const parts = rawKey.split('.')
    const fieldId = parts.length > 1 ? parts.slice(1).join('.') : rawKey

    if (Array.isArray(val)) {
      if (val.length > 0) assignParam(fieldId, val.join(','))
      return
    }

    if (typeof val === 'object' && val !== null) {
      const range = val as { from?: string | number; to?: string | number }
      const [fromKey, toKey] = REVENUE_DATE_RANGE_PARAMS[fieldId] ?? [
        `${fieldId}Min`,
        `${fieldId}Max`,
      ]
      if (range.from !== undefined && range.from !== '') {
        assignParam(fromKey, String(range.from))
      }
      if (range.to !== undefined && range.to !== '') {
        assignParam(toKey, String(range.to))
      }
      return
    }

    if (typeof val === 'string' && val.trim()) {
      assignParam(fieldId, val)
      return
    }

    if (typeof val === 'number' || typeof val === 'boolean') {
      assignParam(fieldId, String(val))
    }
  })

  if (options.search?.trim()) {
    params.search = options.search.trim()
  }

  assignExtraOptions(params, options)

  return params
}

export function createRevenueFilteredExportHandler<T>(
  fetchFn: (params: Record<string, unknown>) => Promise<{ data?: T[] } | T[]>,
  columnMap: Record<string, { header: string; accessor: (item: T) => string }>,
  fileName: string,
  baseParams: Record<string, unknown> = {},
  options?: ExportHandlerOptions,
) {
  return async (values: FilterValues, format: string): Promise<void> => {
    const filterParams = buildRevenueListQueryParams(values, baseParams)
    const result = await fetchFn({ ...filterParams, limit: 1000 })

    const items: T[] = Array.isArray(result) ? result : ((result as { data?: T[] }).data ?? [])

    await exportMappedRows(columnMap, items, format, fileName, options)
  }
}

type FinanceServicesListQueryOptions = RevenueListQueryOptions & {
  tab?: 'all' | 'escrow' | 'by-service' | 'by-consultation'
}

export function buildFinanceServicesListQueryParams(
  filterValues: FilterValues,
  options: FinanceServicesListQueryOptions = {},
): Record<string, unknown> {
  const { tab = 'all', ...revenueOptions } = options
  const params = buildRevenueListQueryParams(filterValues, revenueOptions)

  if (tab === 'by-service') {
    params.module = 'service'
  } else if (tab === 'by-consultation') {
    params.module = 'consultation'
  } else if (tab === 'all' && !params.module) {
    params.module = 'service,consultation'
  }

  if (typeof params.status === 'string' && params.status) {
    const parts = params.status
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean)
    const mapped: string[] = []
    if (tab === 'escrow') {
      parts.forEach((part) => {
        if (part === 'Paid') mapped.push('released_to_payout')
        else if (part === 'Pending') mapped.push('held', 'refunded', 'cancelled')
        else mapped.push(part)
      })
    } else {
      parts.forEach((part) => {
        if (part === 'Paid') mapped.push('paid', 'fulfilled')
        else if (part === 'Pending') mapped.push('created', 'failed', 'expired', 'refunded')
        else mapped.push(part)
      })
    }
    params.status = [...new Set(mapped)].join(',')
  }

  return params
}

export const createFinanceServicesFilteredExportHandler = createFinanceExportHandler(
  buildFinanceServicesListQueryParams,
)

type FinanceVenuesListQueryOptions = RevenueListQueryOptions

export function buildFinanceVenuesListQueryParams(
  filterValues: FilterValues,
  options: FinanceVenuesListQueryOptions = {},
): Record<string, unknown> {
  const params = buildRevenueListQueryParams(filterValues, options)

  params.module = 'venue'

  if (typeof params.status === 'string' && params.status) {
    const parts = params.status
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean)
    const mapped: string[] = []
    parts.forEach((part) => {
      if (part === 'Completed' || part === 'Paid') mapped.push('paid', 'fulfilled')
      else if (part === 'Pending') mapped.push('created', 'refunded')
      else if (part === 'Cancelled' || part === 'Failed') mapped.push('failed', 'expired')
      else mapped.push(part)
    })
    params.status = [...new Set(mapped)].join(',')
  }

  return params
}

export const createFinanceVenuesFilteredExportHandler = createFinanceExportHandler(
  buildFinanceVenuesListQueryParams,
)

type FinanceListQueryOptions = RevenueListQueryOptions

function createFinanceExportHandler(
  buildParams: (
    values: FilterValues,
    options?: FinanceListQueryOptions & Record<string, unknown>,
  ) => Record<string, unknown>,
) {
  return <T>(
    fetchFn: (params: Record<string, unknown>) => Promise<{ data?: T[] } | T[]>,
    columnMap: Record<string, { header: string; accessor: (item: T) => string }>,
    fileName: string,
    baseParams: Record<string, unknown> = {},
    exportOptions?: ExportHandlerOptions,
  ) => {
    return async (values: FilterValues, format: string): Promise<void> => {
      const filterParams = buildParams(values, baseParams)
      const result = await fetchFn({ ...filterParams, limit: 1000 })
      const items: T[] = Array.isArray(result) ? result : ((result as { data?: T[] }).data ?? [])
      await exportMappedRows(columnMap, items, format, fileName, exportOptions)
    }
  }
}

export const buildFinanceMembershipsListQueryParams = buildRevenueListQueryParams
export const createFinanceMembershipsFilteredExportHandler = createFinanceExportHandler(
  buildRevenueListQueryParams,
)

export const buildFinancePayoutsListQueryParams = buildRevenueListQueryParams
export const createFinancePayoutsFilteredExportHandler = createFinanceExportHandler(
  buildRevenueListQueryParams,
)

export const buildFinanceRefundsListQueryParams = buildRevenueListQueryParams
export const createFinanceRefundsFilteredExportHandler = createFinanceExportHandler(
  buildRevenueListQueryParams,
)

export const buildFinanceTaxListQueryParams = buildRevenueListQueryParams
export const createFinanceTaxFilteredExportHandler = createFinanceExportHandler(
  buildRevenueListQueryParams,
)

export const buildFinanceInvoicesListQueryParams = buildRevenueListQueryParams
export const createFinanceInvoicesFilteredExportHandler = createFinanceExportHandler(
  buildRevenueListQueryParams,
)

export const buildFinanceReconciliationListQueryParams = buildRevenueListQueryParams
export const createFinanceReconciliationFilteredExportHandler = createFinanceExportHandler(
  buildRevenueListQueryParams,
)

export const buildFinanceEscrowListQueryParams = buildRevenueListQueryParams
export const createFinanceEscrowFilteredExportHandler = createFinanceExportHandler(
  buildRevenueListQueryParams,
)

const getPrefixedFilterEntries = (filterValues: FilterValues) =>
  Object.entries(filterValues).map(([rawKey, val]) => {
    const parts = rawKey.split('.')
    return [parts.length > 1 ? parts.slice(1).join('.') : rawKey, val] as const
  })

export function rowMatchesClientFilters<T>(
  row: T,
  filterValues: FilterValues,
  search: string,
  accessors: Record<string, (item: T) => string>,
): boolean {
  const query = search.trim().toLowerCase()
  if (query) {
    const haystack = Object.values(accessors)
      .map((accessor) => accessor(row).toLowerCase())
      .join(' ')
    if (!haystack.includes(query)) return false
  }

  for (const [fieldId, val] of getPrefixedFilterEntries(filterValues)) {
    if (val === undefined || val === null || val === '') continue
    const accessor = accessors[fieldId]
    if (!accessor) continue
    const cell = accessor(row).toLowerCase()

    if (Array.isArray(val)) {
      if (val.length && !val.some((item) => cell === String(item).toLowerCase())) return false
      continue
    }

    if (typeof val === 'string' && val.trim() && !cell.includes(val.trim().toLowerCase())) {
      return false
    }
  }

  return true
}

type LoginTrailsListQueryOptions = {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  [key: string]: unknown
}

const LOGIN_TRAILS_LEGACY_SEARCH_MAP: Record<string, string> = {
  searchById: 'id',
  searchByName: 'adminName',
  searchByDate: 'date',
}

export function buildLoginTrailsListQueryParams(
  filterValues: FilterValues,
  options: LoginTrailsListQueryOptions = {},
): Record<string, unknown> {
  const { page, limit, search, sortBy, sortOrder, ...rest } = options
  const columnSearch: Record<string, string> = {}

  Object.entries(rest).forEach(([key, value]) => {
    if (typeof value !== 'string' || !value.trim()) return
    const mappedKey = LOGIN_TRAILS_LEGACY_SEARCH_MAP[key] ?? key
    columnSearch[mappedKey] = value.trim()
  })

  return {
    ...buildPrefixedListQueryParams(filterValues, { page, limit, search }),
    ...columnSearch,
    ...(sortBy ? { sortBy } : {}),
    ...(sortOrder ? { sortOrder } : {}),
  }
}

export const createLoginTrailsFilteredExportHandler = createFinanceExportHandler(
  buildLoginTrailsListQueryParams,
)

const ESCALATIONS_LEGACY_SEARCH_MAP: Record<string, string> = {
  searchById: 'escalationId',
  searchByName: 'roleName',
  searchByStatus: 'status',
}

export function buildEscalationsListQueryParams(
  filterValues: FilterValues,
  options: FinanceListQueryOptions & Record<string, unknown> = {},
): Record<string, unknown> {
  const { page, limit, search, sortBy, sortOrder, ...rest } = options
  const columnSearch: Record<string, string> = {}

  Object.entries(rest).forEach(([key, value]) => {
    if (typeof value !== 'string' || !value.trim()) return

    if (key === 'searchByDate') {
      const date = value.trim()
      columnSearch.createdOnMin = date
      columnSearch.createdOnMax = date
      return
    }

    const mappedKey = ESCALATIONS_LEGACY_SEARCH_MAP[key] ?? key
    columnSearch[mappedKey] = value.trim()
  })

  return {
    ...buildRevenueListQueryParams(filterValues, { page, limit, search }),
    ...columnSearch,
    ...(sortBy ? { sortBy } : {}),
    ...(sortOrder ? { sortOrder } : {}),
  }
}

export const createEscalationsFilteredExportHandler = createFinanceExportHandler(
  buildEscalationsListQueryParams,
)

export function buildPrefixedListQueryParams(
  filterValues: FilterValues,
  options: FinanceListQueryOptions & Record<string, unknown> = {},
): Record<string, unknown> {
  const { page, limit, search, ...rest } = options
  return {
    ...buildRevenueListQueryParams(filterValues, { page, limit, search }),
    ...rest,
  }
}

export const createPrefixedListExportHandler = createFinanceExportHandler(
  buildPrefixedListQueryParams,
)

export function buildExpertMembershipsListQueryParams(
  filterValues: FilterValues,
  options: FinanceListQueryOptions = {},
): Record<string, unknown> {
  const params = buildRevenueListQueryParams(filterValues, options)
  if (params.purchasedPriceMin != null && params.amountMin == null) {
    params.amountMin = params.purchasedPriceMin
  }
  if (params.purchasedPriceMax != null && params.amountMax == null) {
    params.amountMax = params.purchasedPriceMax
  }
  return params
}

export const createExpertMembershipsFilteredExportHandler = createFinanceExportHandler(
  buildExpertMembershipsListQueryParams,
)

const SUPPORT_TICKETS_LEGACY_SEARCH_MAP: Record<string, string> = {
  searchById: 'ticketId',
  searchByName: 'subject',
  searchByStatus: 'status',
  searchByCategory: 'category',
}

export function buildSupportTicketsListQueryParams(
  filterValues: FilterValues,
  options: FinanceListQueryOptions & Record<string, unknown> = {},
): Record<string, unknown> {
  const { page, limit, search, sortBy, sortOrder, ...rest } = options
  const columnSearch: Record<string, string> = {}
  const passthrough: Record<string, unknown> = {}

  Object.entries(rest).forEach(([key, value]) => {
    if (typeof value === 'string' && value.trim()) {
      if (key === 'searchByDate') {
        const date = value.trim()
        columnSearch.from = date
        columnSearch.to = date
        return
      }
      const mappedKey = SUPPORT_TICKETS_LEGACY_SEARCH_MAP[key] ?? key
      columnSearch[mappedKey] = value.trim()
      return
    }

    if (value !== undefined && value !== null && value !== '') {
      passthrough[key] = value
    }
  })

  const params = buildRevenueListQueryParams(filterValues, { page, limit, search })
  if (params.createdAtFrom != null && params.from == null) params.from = params.createdAtFrom
  if (params.createdAtTo != null && params.to == null) params.to = params.createdAtTo
  if (params.ticketId == null && params.id != null) params.ticketId = params.id

  return {
    ...params,
    ...passthrough,
    ...columnSearch,
    ...(sortBy ? { sortBy } : {}),
    ...(sortOrder ? { sortOrder } : {}),
  }
}

export function createSupportTicketsFilteredExportHandler<T>(
  fetchFn: (params: Record<string, unknown>) => Promise<PaginatedExportResult<T> | T[]>,
  columnMap: Record<string, { header: string; accessor: (item: T) => string }>,
  fileName: string,
  baseParams: Record<string, unknown> = {},
  options?: ExportHandlerOptions,
) {
  return async (values: FilterValues, format: string): Promise<void> => {
    const filterParams = buildSupportTicketsListQueryParams(values, baseParams)
    const items: T[] = []
    let page = 1
    let totalPages = 1

    while (page <= totalPages) {
      const result = await fetchFn({
        ...filterParams,
        page,
        limit: EXPORT_PAGE_SIZE,
      })
      const extracted = extractExportPage<T>(result)
      items.push(...extracted.items)
      totalPages = Math.min(extracted.pages, EXPORT_MAX_PAGES)
      page += 1
    }

    await exportMappedRows(columnMap, items, format, fileName, options)
  }
}

export const buildRbacListQueryParams = buildPrefixedListQueryParams
export const createRbacFilteredExportHandler = createPrefixedListExportHandler

type ServicePerformanceQueryOptions = {
  page?: number
  limit?: number
  search?: string
}

export function buildServicePerformanceQueryParams(
  filterValues: FilterValues,
  options: ServicePerformanceQueryOptions = {},
): Record<string, unknown> {
  const params: Record<string, unknown> = {
    page: options.page ?? 1,
    limit: options.limit ?? 10,
  }

  if (options.search?.trim()) params.search = options.search.trim()

  Object.entries(filterValues).forEach(([rawKey, val]) => {
    if (val === undefined || val === null || val === '') return

    const parts = rawKey.split('.')
    const fieldId = parts.length > 1 ? parts.slice(1).join('.') : rawKey

    if (Array.isArray(val)) {
      if (val.length > 0) {
        if (fieldId === 'disputeStatus' && val.length === 1) {
          params.disputeStatus = val[0]
        } else if (fieldId !== 'disputeStatus') {
          params[fieldId] = val.join(',')
        }
      }
      return
    }

    if (typeof val === 'object' && val !== null) {
      const range = val as { from?: string | number; to?: string | number }
      if (fieldId === 'dateRange') {
        if (range.from) params.dateFrom = String(range.from)
        if (range.to) params.dateTo = String(range.to)
      } else if (fieldId === 'priceRange') {
        if (range.from) params.minPrice = String(range.from)
        if (range.to) params.maxPrice = String(range.to)
      } else if (fieldId === 'ratingRange') {
        if (range.from) params.minRating = String(range.from)
        if (range.to) params.maxRating = String(range.to)
      }
      return
    }
  })

  return params
}

export function buildConsultationPerformanceQueryParams(
  filterValues: FilterValues,
  options: ServicePerformanceQueryOptions = {},
): Record<string, unknown> {
  const params: Record<string, unknown> = {
    page: options.page ?? 1,
    limit: options.limit ?? 10,
  }

  if (options.search?.trim()) params.search = options.search.trim()

  Object.entries(filterValues).forEach(([rawKey, val]) => {
    if (val === undefined || val === null || val === '') return

    const parts = rawKey.split('.')
    const fieldId = parts.length > 1 ? parts.slice(1).join('.') : rawKey

    if (Array.isArray(val)) {
      if (val.length > 0) {
        if (fieldId === 'status') {
          params.status = val.join(',')
        }
      }
      return
    }

    if (typeof val === 'object' && val !== null) {
      const range = val as { from?: string | number; to?: string | number }
      if (fieldId === 'dateRange') {
        if (range.from) params.dateFrom = String(range.from)
        if (range.to) params.dateTo = String(range.to)
      } else if (fieldId === 'priceRange') {
        if (range.from) params.minPrice = String(range.from)
        if (range.to) params.maxPrice = String(range.to)
      }
      return
    }
  })

  return params
}

export function createClientFilteredExportHandler<T>(
  getRows: (values: FilterValues) => T[],
  columnMap: ExportColumnMap<T>,
  fileName: string,
  options?: ExportHandlerOptions,
) {
  return async (values: FilterValues, format: string): Promise<void> => {
    const items = getRows(values)
    await exportMappedRows(columnMap, items, format, fileName, options)
  }
}
