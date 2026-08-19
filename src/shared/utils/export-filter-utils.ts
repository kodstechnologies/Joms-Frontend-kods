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

type ExpertListQueryOptions = {
  page?: number
  limit?: number
  search?: string
  /** Fixed list status from quick-link tabs (e.g. suspended, pending). */
  status?: string
}

/**
 * Builds query params for expert list APIs from advanced filter state.
 * Maps section-prefixed keys to backend param names (avoids experts.category vs services.category collision).
 */
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

  return params
}

type ServiceListQueryOptions = {
  page?: number
  limit?: number
  search?: string
  /** Fixed list status from quick-link tabs (e.g. suspended, in_review). */
  status?: string
}

/**
 * Builds query params for service list APIs from advanced filter state.
 * Maps section-prefixed keys to backend param names.
 */
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

  return params
}

type ExportColumnMap<T> = Record<string, { header: string; accessor: (item: T) => string }>

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

/**
 * Creates an async export handler that:
 * 1. Converts filter values to API params
 * 2. Fetches all matching pages from the API
 * 3. Maps data through the column map
 * 4. Calls exportDataToFile
 *
 * @param fetchFn  - the API function (accepts params, returns { data: T[] } or T[])
 * @param columnMap - EXPORT_COLUMN_MAP for this page
 * @param fileName  - base filename for the export
 * @param baseParams - fixed params always added (e.g. { status: 'suspended' })
 */
export function createFilteredExportHandler<T>(
  fetchFn: (params: Record<string, unknown>) => Promise<PaginatedExportResult<T> | T[]>,
  columnMap: ExportColumnMap<T>,
  fileName: string,
  baseParams: Record<string, unknown> = {},
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

    if (items.length === 0) {
      throw new Error('NO_RECORDS')
    }

    const exportCols = Object.values(columnMap)
    const headers = exportCols.map((c) => c.header)
    const rows = items.map((item) => exportCols.map((c) => c.accessor(item)))

    exportDataToFile(headers, rows, format, fileName)
  }
}

/** Export handler for service list pages using section-aware filter params. */
export function createServiceFilteredExportHandler<T>(
  fetchFn: (params: Record<string, unknown>) => Promise<{ data?: T[]; data_?: T[] } | T[]>,
  columnMap: ExportColumnMap<T>,
  fileName: string,
  baseParams: Record<string, unknown> = {},
) {
  return async (values: FilterValues, format: string): Promise<void> => {
    const filterParams = buildServiceListQueryParams(values, baseParams)
    const result = await fetchFn({ ...filterParams, limit: 1000 })

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

type CategoryListQueryOptions = {
  page?: number
  limit?: number
  search?: string
  /** Fixed list status from page tab (ACTIVE, PAUSED, DELETED). */
  status?: 'ACTIVE' | 'PAUSED' | 'DELETED'
}

/**
 * Builds query params for service category list APIs from advanced filter state.
 * Maps section-prefixed keys to backend param names.
 */
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

  return params
}

/** Export handler for service category list pages using section-aware filter params. */
export function createCategoryFilteredExportHandler<T>(
  fetchFn: (params: Record<string, unknown>) => Promise<{ data?: T[] } | T[]>,
  columnMap: ExportColumnMap<T>,
  fileName: string,
  baseParams: Record<string, unknown> = {},
) {
  return async (values: FilterValues, format: string): Promise<void> => {
    const filterParams = buildCategoryListQueryParams(values, baseParams)
    const result = await fetchFn({ ...filterParams, limit: 1000 })

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

type VenueListQueryOptions = {
  page?: number
  limit?: number
  search?: string
  /** Fixed list status from page tab (active, suspended, in_review, rejected, deleted). */
  status?: string
}

/**
 * Builds query params for venue list APIs from advanced filter state.
 * Maps section-prefixed keys to backend param names.
 */
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

  return params
}

/** Export handler for venue list pages using section-aware filter params. */
export function createVenueFilteredExportHandler<T>(
  fetchFn: (params: Record<string, unknown>) => Promise<{ data?: T[] } | T[]>,
  columnMap: Record<string, { header: string; accessor: (item: T) => string }>,
  fileName: string,
  baseParams: Record<string, unknown> = {},
) {
  return async (values: FilterValues, format: string): Promise<void> => {
    const filterParams = buildVenueListQueryParams(values, baseParams)
    const result = await fetchFn({ ...filterParams, limit: 1000 })

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

type VenueCategoryListQueryOptions = {
  page?: number
  limit?: number
  search?: string
  /** Main category list excludes paused/deleted; paused and deleted use dedicated endpoints. */
  excludePaused?: boolean
}

/**
 * Builds query params for venue category list APIs from advanced filter state.
 */
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

/** Export handler for venue category list pages. */
export function createVenueCategoryFilteredExportHandler<T>(
  fetchFn: (params: Record<string, unknown>) => Promise<{ data?: T[] } | T[]>,
  columnMap: Record<string, { header: string; accessor: (item: T) => string }>,
  fileName: string,
  baseParams: Record<string, unknown> = {},
) {
  return async (values: FilterValues, format: string): Promise<void> => {
    const filterParams = buildVenueCategoryListQueryParams(values, baseParams)
    const result = await fetchFn({ ...filterParams, limit: 1000 })

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
