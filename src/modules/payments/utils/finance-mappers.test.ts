import { describe, expect, it } from 'vitest'

import type {
  FinanceDashboardSummary,
  FinanceDispute,
  FinanceEscrowHold,
  FinanceInvoice,
  FinancePayment,
  FinancePayout,
  FinanceReconciliation,
  FinanceRefund,
  FinanceTaxRecord,
} from '../types/finance-api'
import {
  canReleasePayout,
  displayServiceTitle,
  formatDate,
  formatDateTime,
  formatInr,
  formatServiceTypeLabel,
  mapDashboardSummaryCards,
  mapDisputeStatus,
  mapDisputeToRefundRow,
  mapEscrowStatus,
  mapEscrowToRow,
  mapEscrowToServiceRow,
  mapInvoiceToRow,
  mapPayeeType,
  mapPaymentStatus,
  mapPaymentToRevenueRow,
  mapPaymentToServiceRow,
  mapPaymentToVenueRow,
  mapPayoutStatus,
  mapPayoutToAdminRow,
  mapReconToRow,
  mapRefundStatus,
  mapRefundToRow,
  mapTaxToRow,
  firstDate,
  titleCase,
} from './finance-mappers'

const payment = (over: Partial<FinancePayment> = {}): FinancePayment =>
  ({
    _id: 'p1',
    orderId: 'ord-1',
    amount: 1500,
    status: 'paid',
    module: 'service',
    userType: 'user',
    userId: 'u1',
    partnerId: 'pt1',
    createdAt: '2026-08-01T10:00:00.000Z',
    ...over,
  }) as FinancePayment

describe('finance-mappers', () => {
  it('formats money, dates, and titles', () => {
    expect(formatInr(1234.5)).toContain('1,234.5')
    expect(formatInr(null)).toContain('0')
    expect(firstDate(null, 'nope', '2026-08-25')).toBeTruthy()
    expect(firstDate()).toBeNull()
    expect(formatDate(null)).toBe('—')
    expect(formatDate('not-a-date')).toBe('—')
    expect(formatDate('2026-08-25T00:00:00.000Z')).toMatch(/\d{2}\/\d{2}\/2026/)
    expect(formatDateTime(null)).toBe('—')
    expect(formatDateTime('2026-08-25T10:30:00.000Z')).toMatch(/2026/)
    expect(titleCase(null)).toBe('—')
    expect(titleCase('held_amount')).toBe('Held Amount')
    expect(displayServiceTitle('saurabh (fixed)')).toBe('saurabh')
    expect(displayServiceTitle('')).toBe('')
    expect(formatServiceTypeLabel(null)).toBe('—')
    expect(formatServiceTypeLabel('fixed')).toBe('Fixed Service')
    expect(formatServiceTypeLabel('custom service')).toMatch(/Service$/i)
  })

  it('maps payment, escrow, payout, dispute, refund, recon, tax, invoice, and dashboard', () => {
    expect(mapPaymentStatus('paid')).toBe('Paid')
    expect(mapPaymentStatus('failed')).toBe('Failed')
    expect(mapPaymentStatus('created')).toBe('Pending')
    expect(
      mapPaymentToRevenueRow(
        payment({
          userType: 'partner',
          moduleSnapshot: { title: 'T', category: 'C', partnerName: 'Ada' },
        }),
      ).status,
    ).toBe('Paid')
    expect(mapEscrowStatus('held')).toBe('Active')
    expect(mapEscrowStatus('released_to_payout')).toBe('Released')
    expect(mapEscrowStatus('refunded')).toBe('Dispute')
    expect(mapEscrowStatus('other')).toBe('Active')

    const escrow = {
      _id: 'e1',
      escrowId: 'esc-1',
      amountHeld: 200,
      status: 'held',
      createdAt: '2026-08-01T00:00:00.000Z',
    } as FinanceEscrowHold
    expect(mapEscrowToRow(escrow).status).toBe('Active')
    expect(mapEscrowToServiceRow({ ...escrow, status: 'released_to_payout' }).status).toBe('Paid')

    expect(mapPayeeType('venue_partner')).toBe('Venue Partner')
    expect(mapPayeeType('expert')).toBe('Expert')
    expect(mapPayeeType('organisation')).toBe('Organisation')
    expect(mapPayeeType('other_kind')).toBe('Other Kind')
    expect(mapPayoutStatus('paid')).toBe('Paid')
    expect(mapPayoutStatus('failed')).toBe('Failed')
    expect(mapPayoutStatus('processing')).toBe('Processing')
    expect(mapPayoutStatus('paused_dispute')).toBe('On Hold')
    expect(mapPayoutStatus('cancelled')).toBe('Cancelled')
    expect(mapPayoutStatus('scheduled')).toBe('Pending')
    expect(canReleasePayout('failed')).toBe(true)
    expect(canReleasePayout('paid')).toBe(false)

    const payoutRow = mapPayoutToAdminRow({
      _id: 'po1',
      payoutId: 'py-1',
      status: 'paid',
      fees: {
        grossAmount: 100,
        taxGst: 5,
        taxTds: 2,
        platformCommission: 10,
        gatewayCharges: 1,
        netPayable: 82,
      },
    } as FinancePayout)
    expect(payoutRow.netPayout).toContain('82')

    expect(mapDisputeStatus('resolved_full_refund')).toBe('Resolved')
    expect(mapDisputeStatus('rejected')).toBe('Rejected')
    expect(mapDisputeStatus('open')).toBe('Open')
    expect(mapDisputeStatus('under_review')).toBe('In Review')
    expect(mapDisputeStatus('escalated')).toBe('In Review')
    expect(mapRefundStatus('processed')).toBe('Resolved')
    expect(mapRefundStatus('rejected')).toBe('Rejected')
    expect(mapRefundStatus('initiated')).toBe('Pending')

    expect(
      mapDisputeToRefundRow({
        _id: 'd1',
        disputeId: 'ds-1',
        caseType: 'refund_request',
        status: 'open',
        originalAmount: 50,
        createdAt: '2026-08-01',
      } as FinanceDispute).type,
    ).toBe('Refund')
    expect(
      mapRefundToRow({
        _id: 'r1',
        refundId: 'rf-1',
        amount: 20,
        status: 'processed',
        createdAt: '2026-08-01',
      } as FinanceRefund).kind,
    ).toBe('refund')
    expect(
      mapReconToRow({
        _id: 'c1',
        recordId: 'rc-1',
        status: 'matched',
        gatewayAmount: 10,
        platformReceivedAmount: 10,
        paymentId: 'p',
      } as FinanceReconciliation).difference,
    ).toBe('Matched')
    expect(
      mapReconToRow({
        _id: 'c2',
        recordId: 'rc-2',
        status: 'resolved',
        gatewayAmount: 10,
        platformReceivedAmount: 10,
        paymentId: 'p',
      } as FinanceReconciliation).difference,
    ).toBe('Matched')
    expect(
      mapReconToRow({
        _id: 'c3',
        recordId: 'rc-3',
        status: 'investigating',
        gatewayAmount: 10,
        platformReceivedAmount: 9,
        paymentId: 'p',
      } as FinanceReconciliation).difference,
    ).toBe('Pending')
    expect(
      mapReconToRow({
        _id: 'c4',
        recordId: 'rc-4',
        status: 'mismatch',
        gatewayAmount: 10,
        platformReceivedAmount: 9,
        paymentId: 'p',
      } as FinanceReconciliation).difference,
    ).toBe('Mismatch')
    expect(
      mapTaxToRow({
        _id: 't1',
        taxRecordId: 'tx-1',
        module: 'service',
        taxType: 'GST',
        taxAmount: 18,
        filingStatus: 'filed',
      } as FinanceTaxRecord).status,
    ).toBe('Filed')
    expect(
      mapInvoiceToRow({
        _id: 'i1',
        invoiceNumber: 'INV-1',
        total: 99,
        invoiceStatus: 'paid',
        paymentStatus: 'paid',
      } as FinanceInvoice).status,
    ).toBe('Paid')
    expect(
      mapInvoiceToRow({
        _id: 'i2',
        invoiceNumber: 'INV-2',
        total: 99,
        invoiceStatus: 'void',
      } as FinanceInvoice).status,
    ).toBe('Overdue')
    expect(
      mapInvoiceToRow({
        _id: 'i3',
        invoiceNumber: 'INV-3',
        total: 99,
        invoiceStatus: 'issued',
      } as FinanceInvoice).status,
    ).toBe('Pending')

    expect(mapPaymentToServiceRow(payment(), 'by-service').status).toBe('Paid')
    expect(
      mapPaymentToVenueRow(
        payment({
          status: 'created',
          moduleSnapshot: { venueName: 'Hall', venueId: 'v1', bookingId: 'b1' },
        }),
      ).status,
    ).toBe('Pending')
    expect(mapPaymentToVenueRow(payment({ status: 'failed' })).status).toBe('Cancelled')
    expect(mapDashboardSummaryCards(null)).toEqual([])
    expect(
      mapDashboardSummaryCards({
        totalInEscrow: 1,
        activeEscrows: 2,
        pendingPayouts: 3,
        pendingPayoutCount: 4,
        disputedAmount: 5,
        openDisputes: 6,
      } as FinanceDashboardSummary),
    ).toHaveLength(3)
  })
})
