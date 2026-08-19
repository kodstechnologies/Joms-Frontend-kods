import { describe, expect, it } from 'vitest'

import { cn } from '@/shared/lib/cn'
import { getApiErrorMessage, assertFileWithinUploadLimit } from '@/shared/lib/api-error'
import { sanitizeMobileNumber, validateMobileNumber } from '@/shared/lib/phone'
import { PLATFORM_TAGS } from '@/shared/constants/platform-tags'
import { MODULE_METRICS_REGISTRY } from '@/shared/lib/module-metrics-registry'
import {
  createEmptyFilterValues,
  getEmptyFieldValue,
  hasActiveFilters,
} from '@/shared/components/advanced-filter/filter-utils'
import { buildFilterParams } from '@/shared/utils/export-filter-utils'
import { exportDisplayValue } from '@/shared/utils/export-utils'
import { toFinanceListFilterParams } from '@/modules/payments/hooks/use-finance-list-filters'
import { getModuleFilterConfig } from '@/shared/components/advanced-filter/configs'
import { financeRevenueFilterConfig } from '@/shared/components/advanced-filter/configs/finance-revenue.config'
import { navigateBackOrFallback } from '@/shared/lib/navigation'
import { MODULE_TAG_OPTIONS } from '@/shared/constants/module-tags'
import { uiTokens } from '@/shared/lib/design-tokens'

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('p-2', 'p-4')).toContain('p-4')
  })
})

describe('phone helpers', () => {
  it('sanitizes and validates a 10-digit number', () => {
    expect(sanitizeMobileNumber('+91 98765-43210')).toBe('9198765432')
    expect(validateMobileNumber('')).toMatch(/required/)
    expect(validateMobileNumber('123')).toMatch(/10-digit/)
    expect(validateMobileNumber('9876543210')).toBeNull()
  })
})

describe('getApiErrorMessage', () => {
  it('returns fallback for unknown values', () => {
    expect(getApiErrorMessage(null, 'fallback')).toBe('fallback')
  })

  it('uses Error.message', () => {
    expect(getApiErrorMessage(new Error('nope'))).toBe('nope')
  })

  it('maps 413 messages', () => {
    expect(getApiErrorMessage(new Error('Request failed with status code 413'))).toMatch(
      /Maximum upload/,
    )
  })
})

describe('assertFileWithinUploadLimit', () => {
  it('allows a small file', () => {
    expect(() => assertFileWithinUploadLimit({ size: 10 } as File)).not.toThrow()
  })

  it('rejects an oversized file', () => {
    expect(() =>
      assertFileWithinUploadLimit({ size: 51 * 1024 * 1024 } as File),
    ).toThrow(/Maximum upload/)
  })
})

describe('filter and export helpers', () => {
  it('builds empty values and detects activity', () => {
    const empty = createEmptyFilterValues(financeRevenueFilterConfig.sections)
    expect(hasActiveFilters(empty)).toBe(false)
    expect(getEmptyFieldValue({ id: 'x', type: 'checkbox-group', label: 'x' })).toEqual([])
    expect(hasActiveFilters({ status: 'open' })).toBe(true)
  })

  it('flattens filter params and finance params', () => {
    const params = buildFilterParams({
      'section.status': 'paid',
      'section.tags': ['a', 'b'],
      'section.amount': { from: '1', to: '9' },
      location: { state: 'TN', city: 'Chennai' },
    })
    expect(params.status).toBe('paid')
    expect(params.tags).toBe('a,b')
    expect(params.amountMin).toBe('1')
    expect(params.locationState).toBe('TN')
    expect(toFinanceListFilterParams({ status: 'paid' }).status).toBe('paid')
  })

  it('formats export display values', () => {
    expect(exportDisplayValue(null)).toBe('')
    expect(exportDisplayValue(true)).toBe('Yes')
    expect(exportDisplayValue(false)).toBe('No')
    expect(exportDisplayValue(12)).toBe('12')
  })
})

describe('catalogs', () => {
  it('exposes platform tags and metrics modules', () => {
    expect(PLATFORM_TAGS).toContain('VIP')
    expect(MODULE_METRICS_REGISTRY['finance-dashboard']?.moduleKey).toBe('finance-dashboard')
    expect(getModuleFilterConfig('finance-revenue').moduleKey).toBe('finance-revenue')
    expect(getModuleFilterConfig('expert-management').sections.length).toBeGreaterThan(0)
    expect(uiTokens.shellBg).toBeTruthy()
    expect(MODULE_TAG_OPTIONS).toContain('VIP')
  })
})

describe('navigateBackOrFallback', () => {
  it('uses fallback when history is empty', () => {
    const calls: unknown[] = []
    navigateBackOrFallback((to, opts) => calls.push([to, opts]), '/home')
    expect(calls[0]?.[0]).toBe('/home')
  })
})
