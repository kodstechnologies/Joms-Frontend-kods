import type { InvoiceStatus } from './invoices-billing.mock'

export type InvoiceDetail = {
  id: string
  invoiceId: string
  type: string
  issueDate: string
  dueDate: string
  status: InvoiceStatus
  recipientName: string
  recipientEmail: string
  itemDescription: string
  platformFee: string
  unitPrice: string
  subtotal: string
  tax: string
  totalAmount: string
}

const invoiceDetails: InvoiceDetail[] = [
  {
    id: 'inv-02',
    invoiceId: 'INV-2025-00145',
    type: 'Service',
    issueDate: '2025-01-12',
    dueDate: '2025-01-13',
    status: 'Pending',
    recipientName: 'Rajesh Kumar',
    recipientEmail: 'rajesh.k@email.com',
    itemDescription: 'Financial Planning',
    platformFee: '₹500',
    unitPrice: '₹50,000',
    subtotal: '₹50,000',
    tax: '₹9,000',
    totalAmount: '₹59,000',
  },
  {
    id: 'inv-01',
    invoiceId: 'INV-2025-00140',
    type: 'Event',
    issueDate: '2025-01-01',
    dueDate: '2025-01-01',
    status: 'Paid',
    recipientName: 'Alex Johnson',
    recipientEmail: 'alex.j@example.com',
    itemDescription: 'AWS Conference - Event Hosting',
    platformFee: '$500',
    unitPrice: '$12,000',
    subtotal: '$12,000',
    tax: '$0',
    totalAmount: '$12,500',
  },
]

export function getInvoiceDetailById(id: string) {
  return invoiceDetails.find((item) => item.id === id) ?? invoiceDetails[0]
}
