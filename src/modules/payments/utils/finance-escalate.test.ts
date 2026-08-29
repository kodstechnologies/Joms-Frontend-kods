import { describe, expect, it } from 'vitest'

import {
  escalateDetailPath,
  escalateKind,
  escalateUrl,
  safeEscalateReturnTo,
} from '@/modules/payments/utils/finance-escalate'

describe('finance escalate helpers', () => {
  it('maps kinds and builds assign / detail URLs', () => {
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
})
