export type ReconciliationDifference = 'Matched' | 'Mismatch' | 'Pending'

export type FinanceReconciliationRow = {
  id: string
  reconciliationId: string
  gateway: string
  transactionId: string
  platformRecordId: string
  gatewayAmount: string
  platformAmount: string
  difference: ReconciliationDifference
}

const gateways = ['Razorpay', 'Stripe', 'PayU', 'Cashfree', 'PhonePe']
const differences: ReconciliationDifference[] = ['Matched', 'Matched', 'Matched', 'Mismatch', 'Pending']

export const financeReconciliationRowsMock: FinanceReconciliationRow[] = Array.from(
  { length: 20 },
  (_, index) => {
    const rowIndex = index + 1
    const gatewayIndex = index % gateways.length
    const difference = differences[index % differences.length]

    return {
      id: `recon-${rowIndex.toString().padStart(2, '0')}`,
      reconciliationId: `PMT_${5520 + rowIndex}`,
      gateway: gateways[gatewayIndex],
      transactionId: `TXN-2026-10-${rowIndex.toString().padStart(3, '0')}`,
      platformRecordId: `EVT-REC-${(451 + index).toString().padStart(5, '0')}`,
      gatewayAmount: '₹25,000',
      platformAmount: difference === 'Mismatch' ? '₹24,500' : '₹25,000',
      difference,
    }
  },
)
