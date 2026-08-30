import { describe, expect, it } from 'vitest'

import {
  dedupeCatalogItems,
  dedupeOrderedIds,
  sortIdsByCatalogOrder,
} from '@/shared/lib/dedupe-ids'
import { getApiErrorMessage } from '@/shared/lib/api-error'
import { sanitizeMobileNumber, validateMobileNumber } from '@/shared/lib/phone'

describe('dedupe-ids', () => {
  it('dedupes catalog items and ordered ids', () => {
    expect(dedupeCatalogItems([{ id: '1' }, { id: '1' }, { id: '2' }])).toEqual([
      { id: '1' },
      { id: '2' },
    ])
    expect(dedupeOrderedIds(['b', 'a', 'b', 'c'])).toEqual(['b', 'a', 'c'])
    expect(sortIdsByCatalogOrder(['c', 'a'], ['a', 'b', 'c'])).toEqual(['a', 'c'])
  })
})

describe('api-error + phone', () => {
  it('maps api errors and validates mobile', () => {
    expect(getApiErrorMessage(new Error('boom'))).toBe('boom')
    expect(getApiErrorMessage(undefined)).toMatch(/something went wrong/i)
    expect(validateMobileNumber('9876543210')).toBeNull()
    expect(validateMobileNumber('123')).toMatch(/10-digit/)
    expect(sanitizeMobileNumber('98-765-43210')).toBe('9876543210')
  })
})
