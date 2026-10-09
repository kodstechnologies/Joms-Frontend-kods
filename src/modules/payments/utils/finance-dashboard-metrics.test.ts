import { describe, expect, it } from 'vitest'

import type { FinanceDashboardSummary } from '@/modules/payments/types/finance-api'
import {
  buildFinanceDashboardMetricCards,
  NO_DATA_VALUE,
} from '@/modules/payments/utils/finance-dashboard-metrics'

const SAMPLE_FIGURES = ['₹8,43,290', '₹5,67,120', '₹1,24,650', '₹10,00,000', '42.5%', '2.4%', '14']

describe('buildFinanceDashboardMetricCards', () => {
  it('shows no-data placeholders and no fake trends before the summary loads', () => {
    const cards = buildFinanceDashboardMetricCards(null)
    expect(cards.length).toBeGreaterThan(0)
    for (const card of cards) {
      expect(card.value).toBe(NO_DATA_VALUE)
      expect(card.change).toBe('')
      expect(SAMPLE_FIGURES).not.toContain(card.value)
    }
  })

  it('uses live summary values and leaves unsourced metrics empty', () => {
    const summary: FinanceDashboardSummary = {
      totalInEscrow: 0,
      activeEscrows: 0,
      pendingPayouts: 2500,
      pendingPayoutCount: 1,
      disputedAmount: 0,
      openDisputes: 0,
      totalPlatformRevenue: 10000,
      collectionsThisMonth: 4000,
    }
    const byId = new Map(buildFinanceDashboardMetricCards(summary).map((c) => [c.id, c]))

    expect(byId.get('total-amount-in-escrow')?.value).toMatch(/₹\s?0/)
    expect(byId.get('pending-payouts')?.value).toContain('2,500')
    expect(byId.get('collections-this-month')?.value).toContain('4,000')
    expect(byId.get('gmv')?.value).toBe(NO_DATA_VALUE)
    expect(byId.get('chargeback-rate')?.value).toBe(NO_DATA_VALUE)
    expect(byId.get('failed-transactions')?.value).toBe(NO_DATA_VALUE)
    expect(new Set([...byId.values()].map((c) => c.change))).toEqual(new Set(['']))
  })

  it('emits each metric id once', () => {
    const ids = buildFinanceDashboardMetricCards(null).map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
