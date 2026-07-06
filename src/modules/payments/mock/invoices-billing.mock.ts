export type InvoiceStatus = 'Paid' | 'Pending' | 'Overdue'

export type InvoiceSummaryMetric = {
  label: string
  value: string
  change: string
  changeNote: string
}

export type InvoiceRow = {
  id: string
  invoiceId: string
  clientName: string
  amount: string
  issueDate: string
  dueDate: string
  description: string
  status: InvoiceStatus
}

export const invoiceSummaryMetricsMock: InvoiceSummaryMetric[] = [
  { label: 'Total Invoices', value: '08', change: '+5.7%', changeNote: 'vs last month' },
  { label: 'Amount Paid', value: '$487,650', change: '+5.7%', changeNote: 'vs last month' },
  { label: 'Pending', value: '$487,650', change: '+5.7%', changeNote: 'vs last month' },
  { label: 'Overdue', value: '$487,650', change: '+5.7%', changeNote: 'vs last month' },
]

export const invoiceRowsMock: InvoiceRow[] = [
  {
    id: 'inv-01',
    invoiceId: 'PMT_5521',
    clientName: 'Alex Johnson',
    amount: '$12,500',
    issueDate: '01/02/2025',
    dueDate: '01/02/2025',
    description: 'AWS Conference - Event Hosting Services',
    status: 'Paid',
  },
  {
    id: 'inv-02',
    invoiceId: 'PMT_5522',
    clientName: 'Rajesh Kumar',
    amount: '₹59,000',
    issueDate: '12/01/2025',
    dueDate: '13/01/2025',
    description: 'Financial Planning Consultation',
    status: 'Pending',
  },
  {
    id: 'inv-03',
    invoiceId: 'PMT_5523',
    clientName: 'Sarah Wilson',
    amount: '$8,200',
    issueDate: '15/01/2025',
    dueDate: '20/01/2025',
    description: 'Venue booking - Grand Hall',
    status: 'Overdue',
  },
  {
    id: 'inv-04',
    invoiceId: 'PMT_5524',
    clientName: 'Legal Corp Inc.',
    amount: '$15,000',
    issueDate: '18/01/2025',
    dueDate: '25/01/2025',
    description: 'NDA Review Service',
    status: 'Paid',
  },
]
