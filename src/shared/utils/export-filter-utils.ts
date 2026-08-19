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

/**
 * Query params for Expert Profile → Service Listings → Services advanced filters (Figma field set).
 */
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

type CommunicationListQueryOptions = {
  page?: number
  limit?: number
  search?: string
}

const COMMUNICATION_DATE_RANGE_PARAMS: Record<string, [string, string]> = {
  createdAt: ['createdAtFrom', 'createdAtTo'],
  scheduledAt: ['scheduledAtFrom', 'scheduledAtTo'],
}

/**
 * Builds query params for communication list APIs from advanced filter state.
 * Maps date ranges to From/To to match settings-service list query names.
 */
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

/** Export handler for communication list pages using section-aware filter params. */
export function createCommunicationFilteredExportHandler<T>(
  fetchFn: (params: Record<string, unknown>) => Promise<{ data?: T[] } | T[]>,
  columnMap: Record<string, { header: string; accessor: (item: T) => string }>,
  fileName: string,
  baseParams: Record<string, unknown> = {},
) {
  return async (values: FilterValues, format: string): Promise<void> => {
    const filterParams = buildCommunicationListQueryParams(values, baseParams)
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

type ReferralListQueryOptions = {
  page?: number
  limit?: number
  search?: string
}

const REFERRAL_DATE_RANGE_PARAMS: Record<string, [string, string]> = {
  createdAt: ['createdAtFrom', 'createdAtTo'],
  sentAt: ['sentAtFrom', 'sentAtTo'],
  acceptedAt: ['acceptedAtFrom', 'acceptedAtTo'],
  expiresAt: ['expiresAtFrom', 'expiresAtTo'],
}

/**
 * Builds query params for referral list APIs from advanced filter state.
 */
export function buildReferralListQueryParams(
  filterValues: FilterValues,
  options: ReferralListQueryOptions = {},
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

  if (options.search?.trim()) {
    params.search = options.search.trim()
  }

  return params
}

/** Export handler for referral list pages using section-aware filter params. */
export function createReferralFilteredExportHandler<T>(
  fetchFn: (params: Record<string, unknown>) => Promise<{ data?: T[] } | T[]>,
  columnMap: Record<string, { header: string; accessor: (item: T) => string }>,
  fileName: string,
  baseParams: Record<string, unknown> = {},
) {
  return async (values: FilterValues, format: string): Promise<void> => {
    const filterParams = buildReferralListQueryParams(values, baseParams)
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

type RevenueListQueryOptions = {
  page?: number
  limit?: number
  search?: string
}

const REVENUE_DATE_RANGE_PARAMS: Record<string, [string, string]> = {
  createdAt: ['createdAtFrom', 'createdAtTo'],
}

/**
 * Builds query params for revenue overview list APIs from advanced filter state.
 */
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

  return params
}

/** Export handler for revenue overview using section-aware filter params. */
export function createRevenueFilteredExportHandler<T>(
  fetchFn: (params: Record<string, unknown>) => Promise<{ data?: T[] } | T[]>,
  columnMap: Record<string, { header: string; accessor: (item: T) => string }>,
  fileName: string,
  baseParams: Record<string, unknown> = {},
) {
  return async (values: FilterValues, format: string): Promise<void> => {
    const filterParams = buildRevenueListQueryParams(values, baseParams)
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

type FinanceServicesListQueryOptions = {
  page?: number
  limit?: number
  search?: string
  tab?: 'all' | 'escrow' | 'by-service' | 'by-consultation'
}

/**
 * Builds query params for finance services payment/escrow list APIs.
 * Tab always constrains module on payment lists; status maps to stored values.
 */
export function buildFinanceServicesListQueryParams(
  filterValues: FilterValues,
  options: FinanceServicesListQueryOptions = {},
): Record<string, unknown> {
  const params = buildRevenueListQueryParams(filterValues, {
    page: options.page,
    limit: options.limit,
    search: options.search,
  })

  const tab = options.tab ?? 'all'
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

/** Export handler for finance services pages. */
export function createFinanceServicesFilteredExportHandler<T>(
  fetchFn: (params: Record<string, unknown>) => Promise<{ data?: T[] } | T[]>,
  columnMap: Record<string, { header: string; accessor: (item: T) => string }>,
  fileName: string,
  baseParams: Record<string, unknown> = {},
) {
  return async (values: FilterValues, format: string): Promise<void> => {
    const filterParams = buildFinanceServicesListQueryParams(values, baseParams)
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

type FinanceVenuesListQueryOptions = {
  page?: number
  limit?: number
  search?: string
}

/**
 * Builds query params for finance venues payment list APIs.
 * Always constrains module to venue; status maps table labels to stored values.
 */
export function buildFinanceVenuesListQueryParams(
  filterValues: FilterValues,
  options: FinanceVenuesListQueryOptions = {},
): Record<string, unknown> {
  const params = buildRevenueListQueryParams(filterValues, {
    page: options.page,
    limit: options.limit,
    search: options.search,
  })

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

/** Export handler for finance venues pages. */
export function createFinanceVenuesFilteredExportHandler<T>(
  fetchFn: (params: Record<string, unknown>) => Promise<{ data?: T[] } | T[]>,
  columnMap: Record<string, { header: string; accessor: (item: T) => string }>,
  fileName: string,
  baseParams: Record<string, unknown> = {},
) {
  return async (values: FilterValues, format: string): Promise<void> => {
    const filterParams = buildFinanceVenuesListQueryParams(values, baseParams)
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

type FinanceListQueryOptions = {
  page?: number
  limit?: number
  search?: string
}

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
  ) => {
    return async (values: FilterValues, format: string): Promise<void> => {
      const filterParams = buildParams(values, baseParams)
      const result = await fetchFn({ ...filterParams, limit: 1000 })
      const items: T[] = Array.isArray(result) ? result : ((result as { data?: T[] }).data ?? [])
      if (items.length === 0) throw new Error('NO_RECORDS')
      const exportCols = Object.values(columnMap)
      exportDataToFile(
        exportCols.map((col) => col.header),
        items.map((item) => exportCols.map((col) => col.accessor(item))),
        format,
        fileName,
      )
    }
  }
}

export function buildFinanceMembershipsListQueryParams(
  filterValues: FilterValues,
  options: FinanceListQueryOptions = {},
): Record<string, unknown> {
  return buildRevenueListQueryParams(filterValues, options)
}

export const createFinanceMembershipsFilteredExportHandler = createFinanceExportHandler(
  buildFinanceMembershipsListQueryParams,
)

export function buildFinancePayoutsListQueryParams(
  filterValues: FilterValues,
  options: FinanceListQueryOptions = {},
): Record<string, unknown> {
  return buildRevenueListQueryParams(filterValues, options)
}

export const createFinancePayoutsFilteredExportHandler = createFinanceExportHandler(
  buildFinancePayoutsListQueryParams,
)

export function buildFinanceRefundsListQueryParams(
  filterValues: FilterValues,
  options: FinanceListQueryOptions = {},
): Record<string, unknown> {
  return buildRevenueListQueryParams(filterValues, options)
}

export const createFinanceRefundsFilteredExportHandler = createFinanceExportHandler(
  buildFinanceRefundsListQueryParams,
)

export function buildFinanceTaxListQueryParams(
  filterValues: FilterValues,
  options: FinanceListQueryOptions = {},
): Record<string, unknown> {
  return buildRevenueListQueryParams(filterValues, options)
}

export const createFinanceTaxFilteredExportHandler = createFinanceExportHandler(
  buildFinanceTaxListQueryParams,
)

export function buildFinanceInvoicesListQueryParams(
  filterValues: FilterValues,
  options: FinanceListQueryOptions = {},
): Record<string, unknown> {
  return buildRevenueListQueryParams(filterValues, options)
}

export const createFinanceInvoicesFilteredExportHandler = createFinanceExportHandler(
  buildFinanceInvoicesListQueryParams,
)

export function buildFinanceReconciliationListQueryParams(
  filterValues: FilterValues,
  options: FinanceListQueryOptions = {},
): Record<string, unknown> {
  return buildRevenueListQueryParams(filterValues, options)
}

export const createFinanceReconciliationFilteredExportHandler = createFinanceExportHandler(
  buildFinanceReconciliationListQueryParams,
)

export function buildFinanceEscrowListQueryParams(
  filterValues: FilterValues,
  options: FinanceListQueryOptions = {},
): Record<string, unknown> {
  return buildRevenueListQueryParams(filterValues, options)
}

export const createFinanceEscrowFilteredExportHandler = createFinanceExportHandler(
  buildFinanceEscrowListQueryParams,
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

export function buildSupportTicketsListQueryParams(
  filterValues: FilterValues,
  options: FinanceListQueryOptions & Record<string, unknown> = {},
): Record<string, unknown> {
  const { page, limit, search, ...rest } = options
  const params = buildRevenueListQueryParams(filterValues, { page, limit, search })
  if (params.createdAtFrom != null && params.from == null) params.from = params.createdAtFrom
  if (params.createdAtTo != null && params.to == null) params.to = params.createdAtTo
  if (params.ticketId == null && params.id != null) params.ticketId = params.id
  return { ...params, ...rest }
}

export const createSupportTicketsFilteredExportHandler = createFinanceExportHandler(
  buildSupportTicketsListQueryParams,
)

export const buildRbacListQueryParams = buildPrefixedListQueryParams
export const createRbacFilteredExportHandler = createPrefixedListExportHandler

export function createClientFilteredExportHandler<T>(
  getRows: (values: FilterValues) => T[],
  columnMap: Record<string, { header: string; accessor: (item: T) => string }>,
  fileName: string,
) {
  return async (values: FilterValues, format: string): Promise<void> => {
    const items = getRows(values)
    if (items.length === 0) throw new Error('NO_RECORDS')
    const exportCols = Object.values(columnMap)
    exportDataToFile(
      exportCols.map((col) => col.header),
      items.map((item) => exportCols.map((col) => col.accessor(item))),
      format,
      fileName,
    )
  }
}
