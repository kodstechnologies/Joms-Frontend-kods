export type RefundChargebackStatus = 'Resolved' | 'Pending' | 'Open' | 'In Review'

export type RefundChargebackType = 'Refund' | 'Dispute'

export type RefundSummaryMetric = {
  label: string
  value: string
  change: string
  changeNote: string
}

export type RefundChargebackRow = {
  id: string
  recordId: string
  type: RefundChargebackType
  relatedEntity: string
  amount: string
  reason: string
  initiatedDate: string
  description: string
  status: RefundChargebackStatus
}

export const refundSummaryMetricsMock: RefundSummaryMetric[] = [
  {
    label: 'Pending Refunds',
    value: '08',
    change: '▲ 6.7%',
    changeNote: 'vs last month',
  },
  {
    label: 'Active Disputes',
    value: '$487,650',
    change: '▲ 6.7%',
    changeNote: 'vs last month',
  },
  {
    label: 'Amount in Disputed',
    value: '$487,650',
    change: '▲ 6.7%',
    changeNote: 'vs last month',
  },
  {
    label: 'Resolved',
    value: '$487,650',
    change: '▲ 6.7%',
    changeNote: 'vs last month',
  },
]

const reasons = [
  'Service not delivered as promised',
  'Quality issues with deliverables',
  'Unauthorized charge',
  'Event cancelled by host',
  'Duplicate payment',
]

const descriptions = [
  'Event hosting payment',
  'Business consultation payment',
  'Venue booking payment',
  'Membership subscription payment',
]

const statuses: RefundChargebackStatus[] = ['Resolved', 'Pending', 'Open', 'In Review']
const types: RefundChargebackType[] = ['Refund', 'Dispute']
const entities = ['Event', 'Service', 'Venue', 'Membership']

export const refundChargebackRowsMock: RefundChargebackRow[] = Array.from({ length: 20 }, (_, index) => {
  const rowIndex = index + 1
  const dataIndex = index % reasons.length

  return {
    id: `refund-${rowIndex.toString().padStart(2, '0')}`,
    recordId: `PMT_${5520 + rowIndex}`,
    type: types[index % types.length],
    relatedEntity: entities[dataIndex],
    amount: '$12,500',
    reason: reasons[dataIndex],
    initiatedDate: '01/02/2025',
    description: descriptions[dataIndex],
    status: statuses[index % statuses.length],
  }
})
