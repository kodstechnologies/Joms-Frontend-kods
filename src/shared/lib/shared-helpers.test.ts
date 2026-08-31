import { AxiosError } from 'axios'
import { afterEach, describe, expect, it } from 'vitest'

import {
  assertFileWithinUploadLimit,
  FILE_TOO_LARGE_MESSAGE,
  getApiErrorMessage,
  MAX_UPLOAD_FILE_SIZE_BYTES,
} from './api-error'
import { dedupeCatalogItems, dedupeOrderedIds, sortIdsByCatalogOrder } from './dedupe-ids'
import {
  clearLocalDashboardMetricIds,
  readLocalDashboardMetricIds,
  writeLocalDashboardMetricIds,
} from './local-ui-preferences'
import { getModuleMetricsDefinition, MODULE_METRICS_REGISTRY } from './module-metrics-registry'
import { navigateBackOrFallback } from './navigation'
import { sanitizeMobileNumber, validateMobileNumber } from './phone'
import {
  escalateDetailPath,
  escalateKind,
  escalateUrl,
  safeEscalateReturnTo,
} from '@/modules/payments/utils/finance-escalate'
import {
  DASH,
  displayServiceTitle,
  formatCurrency,
  formatDate,
  formatDateTime,
  formatDateTimeIst,
  formatMessageDate,
  formatMessageTime,
  formatNumber,
  formatOrdinalDate,
  formatPercent,
  formatRelativeTime,
  formatServiceTypeLabel,
  formatTimelineStamp,
  titleCase,
} from '@/modules/expert/components/service-drilldown/drilldown-format'

describe('shared helpers and catalogs', () => {
  afterEach(() => {
    localStorage.clear()
  })

  it('validates phone numbers and upload errors', () => {
    expect(sanitizeMobileNumber('98a76-543210999')).toBe('9876543210')
    expect(validateMobileNumber('')).toMatch(/required/i)
    expect(validateMobileNumber('123')).toMatch(/10-digit/)
    expect(validateMobileNumber('9876543210')).toBeNull()
    expect(() =>
      assertFileWithinUploadLimit({ size: MAX_UPLOAD_FILE_SIZE_BYTES + 1 } as File),
    ).toThrow(FILE_TOO_LARGE_MESSAGE)
    expect(() => assertFileWithinUploadLimit({ size: 10 } as File)).not.toThrow()

    const axiosError = new AxiosError('fail')
    axiosError.response = {
      status: 400,
      data: { message: 'Bad payload' },
      statusText: 'Bad Request',
      headers: {},
      config: { headers: {} } as never,
    }
    expect(getApiErrorMessage(axiosError)).toBe('Bad payload')
    const plain = new AxiosError('fail')
    plain.response = {
      status: 400,
      data: 'plain',
      statusText: '',
      headers: {},
      config: { headers: {} } as never,
    }
    expect(getApiErrorMessage(plain)).toBe('plain')
    const html = new AxiosError('fail')
    html.response = {
      status: 413,
      data: '<html>',
      statusText: '',
      headers: {},
      config: { headers: {} } as never,
    }
    expect(getApiErrorMessage(html)).toBe(FILE_TOO_LARGE_MESSAGE)
    expect(getApiErrorMessage(new Error('status code 413'))).toBe(FILE_TOO_LARGE_MESSAGE)
    expect(getApiErrorMessage(new Error('boom'))).toBe('boom')
    expect(getApiErrorMessage(123)).toMatch(/try again/)
  })

  it('dedupes ids, stores dashboard metrics, and builds escalate paths', () => {
    expect(dedupeCatalogItems([{ id: 'a' }, { id: 'a' }, { id: 'b' }, { id: '' }])).toEqual([
      { id: 'a' },
      { id: 'b' },
    ])
    expect(dedupeOrderedIds(['x', 'x', '', 'y'])).toEqual(['x', 'y'])
    expect(sortIdsByCatalogOrder(['c', 'a', 'unknown'], ['a', 'b', 'c'])).toEqual([
      'a',
      'c',
      'unknown',
    ])
    expect(readLocalDashboardMetricIds('finance-revenue')).toBeNull()
    writeLocalDashboardMetricIds('finance-revenue', ['m1', 'm1', 'm2'])
    expect(readLocalDashboardMetricIds('finance-revenue')).toEqual(['m1', 'm2'])
    localStorage.setItem('joms:ui-preferences:broken:dashboard-metrics', '{')
    expect(readLocalDashboardMetricIds('broken')).toBeNull()
    clearLocalDashboardMetricIds('finance-revenue')
    expect(readLocalDashboardMetricIds('finance-revenue')).toBeNull()

    expect(escalateUrl('abc', { kind: 'dispute', returnTo: '/finance/refunds' })).toContain(
      'kind=dispute',
    )
    expect(escalateUrl('abc', { resourceType: 'Refund' })).toContain('kind=refund')
    expect(escalateUrl('abc', { resourceType: 'Dispute' })).toContain('kind=dispute')
    expect(escalateUrl('abc')).toContain('kind=refund')
    expect(escalateKind('resource', 'Payment')).toBe('resource')
    expect(escalateKind(null, 'Dispute')).toBe('dispute')
    expect(escalateKind(null, 'TaxRecord')).toBe('resource')
    expect(safeEscalateReturnTo('/finance/tax', '/finance/refunds')).toBe('/finance/tax')
    expect(safeEscalateReturnTo('https://evil.example', '/finance/refunds')).toBe(
      '/finance/refunds',
    )
    expect(safeEscalateReturnTo('//evil.example', '/finance/refunds')).toBe('/finance/refunds')
    expect(escalateDetailPath('abc', { kind: 'dispute' })).toBe('/finance/refunds/abc/dispute')
    expect(escalateDetailPath('abc', { kind: 'refund' })).toContain('/finance/escalations/abc')
    expect(escalateDetailPath('abc', { kind: 'refund' })).toContain('kind=refund')
    expect(escalateDetailPath('abc', { kind: 'resource', from: '/finance/services' })).toContain(
      '/finance/escalations/abc',
    )
    expect(escalateDetailPath('abc', { kind: 'resource', from: '/finance/services' })).toContain(
      'from=%2Ffinance%2Fservices',
    )
    expect(escalateDetailPath('abc', { resourceType: 'TaxRecord' })).toContain(
      'resourceType=TaxRecord',
    )
  })

  it('navigates to the fallback when history is empty', () => {
    const spy = { calls: [] as unknown[] }
    const fakeNavigate = ((to: unknown) => {
      spy.calls.push(to)
    }) as never
    Object.defineProperty(window.history, 'length', { configurable: true, value: 1 })
    navigateBackOrFallback(fakeNavigate, '/dashboard/executive')
    expect(spy.calls[0]).toBe('/dashboard/executive')
  })

  it('loads every metrics catalog and formats drilldown values', () => {
    const keys = Object.keys(MODULE_METRICS_REGISTRY)
    expect(keys.length).toBeGreaterThan(20)
    for (const key of keys) {
      const def = getModuleMetricsDefinition(key)
      expect(def?.moduleName).toBeTruthy()
      expect(def?.returnTo).toMatch(/^\//)
      def?.metrics?.forEach((item) => expect(item.id).toBeTruthy())
      def?.columns?.forEach((item) => expect(item.id).toBeTruthy())
    }
    expect(getModuleMetricsDefinition('missing-module')).toBeUndefined()

    expect(formatCurrency(null)).toBe(DASH)
    expect(formatCurrency(10)).toMatch(/10/)
    expect(formatNumber(null)).toBe(DASH)
    expect(formatNumber(1000)).toMatch(/1,000/)
    expect(formatPercent(null)).toBe(DASH)
    expect(formatPercent(12.34)).toBe('12.3%')
    expect(formatDateTime(null)).toBe(DASH)
    expect(formatDateTime('2026-08-25T10:00:00.000Z')).toMatch(/2026/)
    expect(formatDateTimeIst('2026-08-25T10:00:00.000Z')).toMatch(/IST/)
    expect(formatTimelineStamp('2026-08-25T10:00:00.000Z')).toMatch(/2026/)
    expect(formatMessageTime('2026-08-25T10:00:00.000Z')).toMatch(/\d/)
    expect(formatMessageDate('2026-08-25T10:00:00.000Z')).toMatch(/2026/)
    expect(formatOrdinalDate('2026-08-01T00:00:00.000Z')).toMatch(/1st/)
    expect(formatOrdinalDate('2026-08-02T00:00:00.000Z')).toMatch(/2nd/)
    expect(formatOrdinalDate('2026-08-03T00:00:00.000Z')).toMatch(/3rd/)
    expect(formatOrdinalDate('2026-08-04T00:00:00.000Z')).toMatch(/4th/)
    expect(formatRelativeTime(null)).toBe(DASH)
    expect(formatRelativeTime(new Date(Date.now() - 30_000).toISOString())).toBe('just now')
    expect(formatRelativeTime(new Date(Date.now() - 5 * 60_000).toISOString())).toMatch(/m ago/)
    expect(formatRelativeTime(new Date(Date.now() - 3 * 60 * 60_000).toISOString())).toMatch(
      /h ago/,
    )
    expect(formatRelativeTime(new Date(Date.now() - 2 * 24 * 60 * 60_000).toISOString())).toMatch(
      /d ago/,
    )
    expect(formatDate('2026-01-15T00:00:00.000Z')).toMatch(/2026/)
    expect(titleCase('held_amount')).toBe('Held Amount')
    expect(displayServiceTitle('n (fixed)')).toBe('n')
    expect(formatServiceTypeLabel('fixed')).toBe('Fixed Service')
  })
})
