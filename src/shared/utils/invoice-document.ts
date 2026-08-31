import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

import jomsLogo from '@/assets/joms-logo.png'

export type InvoiceLineItem = {
  description: string
  quantity?: number
  unitPrice?: number
  amount: number
}

export type InvoiceDocumentData = {
  invoiceNumber: string
  invoiceDate: string
  dueDate?: string | null
  status?: string
  module?: string
  billFrom?: {
    name?: string
    email?: string
    phone?: string
    address?: string
  }
  billTo: {
    name: string
    email?: string
    phone?: string
    id?: string
    address?: string
  }

  client?: {
    name?: string
    id?: string
  }
  plan?: {
    name?: string
    id?: string
    billingCycle?: string
    period?: string
  }

  planSectionTitle?: string
  lineItems: InvoiceLineItem[]
  subtotal: number
  discount?: number
  taxAmount?: number
  taxLabel?: string
  platformFee?: number
  commission?: number
  otherFees?: number
  total: number
  currency?: string
  paymentStatus?: string
  payment?: {
    method?: string
    transactionId?: string
    orderId?: string
    paidAt?: string
  }
  notes?: string
  logoUrl?: string | null
}

const GOLD: [number, number, number] = [229, 181, 78]
const INK: [number, number, number] = [24, 24, 27]
const MUTED: [number, number, number] = [113, 113, 122]
const LINE: [number, number, number] = [228, 228, 231]
const PAGE_BOTTOM = 20

const formatMoney = (amount: number, currency = 'INR') => {
  const value = Number.isFinite(Number(amount)) ? Number(amount) : 0
  const digits = value.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  if (currency === 'INR') return `Rs. ${digits}`
  return `${currency} ${digits}`
}

const safeText = (value?: string | null, fallback = '—') => {
  const text = String(value ?? '').trim()
  return text || fallback
}

const formatDisplayDate = (value?: string | Date | null) => {
  if (!value) return '—'
  const raw = String(value).trim()
  // Already formatted display strings from API (e.g. "13 Aug 2026")
  if (/^\d{1,2}\s+[A-Za-z]{3}\s+\d{4}/.test(raw)) return raw
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return raw || '—'
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const toNumber = (value: unknown, fallback = 0) => {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

async function loadImageDataUrl(url?: string | null): Promise<string | null> {
  if (!url) return null
  try {
    const response = await fetch(url)
    if (!response.ok) return null
    const blob = await response.blob()
    return await new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(typeof reader.result === 'string' ? reader.result : null)
      reader.onerror = () => resolve(null)
      reader.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}

function wrapText(doc: jsPDF, text: string, maxWidth: number): string[] {
  const value = String(text ?? '')
  if (!value) return ['—']
  const soft = value.replace(/([_\-/])/g, '$1\u200b')
  const preliminary = doc.splitTextToSize(soft, maxWidth) as string[]
  const lines: string[] = []
  for (const line of preliminary) {
    const cleaned = line.replace(/\u200b/g, '')
    if (doc.getTextWidth(cleaned) <= maxWidth + 0.5) {
      lines.push(cleaned)
      continue
    }
    let current = ''
    for (const ch of cleaned) {
      const next = current + ch
      if (current && doc.getTextWidth(next) > maxWidth) {
        lines.push(current)
        current = ch
      } else {
        current = next
      }
    }
    if (current) lines.push(current)
  }
  return lines.length ? lines : ['—']
}

function drawJomsMark(doc: jsPDF, x: number, y: number, size = 22) {
  doc.setFillColor(...INK)
  doc.roundedRect(x, y, size, size, 1.5, 1.5, 'S')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...INK)
  doc.text('JOMS', x + size / 2, y + size / 2 + 1, { align: 'center' })
}

function drawSectionLabel(doc: jsPDF, label: string, x: number, y: number) {
  doc.setTextColor(...MUTED)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text(label.toUpperCase(), x, y)
}

function drawKeyValue(
  doc: jsPDF,
  label: string,
  value: string,
  x: number,
  y: number,
  width: number,
) {
  doc.setTextColor(...MUTED)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.text(label, x, y)
  doc.setTextColor(...INK)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  const lines = wrapText(doc, value, width)
  doc.text(lines, x, y + 4.5)
  return y + 4.5 + lines.length * 4.2
}

function ensureSpace(doc: jsPDF, y: number, needed: number, margin: number): number {
  const pageHeight = doc.internal.pageSize.getHeight()
  if (y + needed <= pageHeight - PAGE_BOTTOM) return y
  doc.addPage()
  return margin
}

export async function downloadInvoiceDocument(
  data: InvoiceDocumentData,
  fileName?: string,
): Promise<void> {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 16
  const contentWidth = pageWidth - margin * 2
  const colGap = 8
  const colWidth = (contentWidth - colGap) / 2
  const currency = data.currency || 'INR'
  let y = 14
  const logoSize = 24

  const logoDataUrl =
    (await loadImageDataUrl(jomsLogo)) ||
    (await loadImageDataUrl('/joms-logo.png')) ||
    (await loadImageDataUrl(data.logoUrl))
  if (logoDataUrl) {
    try {
      doc.addImage(logoDataUrl, 'PNG', margin, y, logoSize, logoSize)
    } catch {
      drawJomsMark(doc, margin, y, logoSize)
    }
  } else {
    drawJomsMark(doc, margin, y, logoSize)
  }

  const headerRightWidth = 72
  doc.setTextColor(...INK)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.text('INVOICE', pageWidth - margin, y + 8, { align: 'right' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...MUTED)
  const headerIdLines = wrapText(doc, safeText(data.invoiceNumber), headerRightWidth)
  doc.text(headerIdLines, pageWidth - margin, y + 14, { align: 'right' })

  y += Math.max(logoSize + 4, 16 + headerIdLines.length * 3.5)
  doc.setDrawColor(...LINE)
  doc.setLineWidth(0.4)
  doc.line(margin, y, pageWidth - margin, y)
  y += 8

  const leftCol = margin
  const rightCol = margin + colWidth + colGap

  y = ensureSpace(doc, y, 40, margin)
  drawSectionLabel(doc, 'Invoice details', leftCol, y)
  drawSectionLabel(doc, 'Bill to', rightCol, y)
  y += 6

  let leftY = y
  leftY = drawKeyValue(
    doc,
    'Invoice number',
    safeText(data.invoiceNumber),
    leftCol,
    leftY,
    colWidth,
  )
  leftY = drawKeyValue(
    doc,
    'Invoice date',
    safeText(data.invoiceDate),
    leftCol,
    leftY + 3,
    colWidth,
  )
  leftY = drawKeyValue(doc, 'Due date', safeText(data.dueDate || '—'), leftCol, leftY + 3, colWidth)
  leftY = drawKeyValue(
    doc,
    'Status',
    safeText(data.status || data.paymentStatus),
    leftCol,
    leftY + 3,
    colWidth,
  )
  if (data.module) {
    leftY = drawKeyValue(doc, 'Type', safeText(data.module), leftCol, leftY + 3, colWidth)
  }

  let rightY = y
  rightY = drawKeyValue(doc, 'Customer', safeText(data.billTo.name), rightCol, rightY, colWidth)
  if (data.billTo.id) {
    rightY = drawKeyValue(
      doc,
      'Customer ID',
      safeText(data.billTo.id),
      rightCol,
      rightY + 3,
      colWidth,
    )
  }
  if (data.billTo.email) {
    rightY = drawKeyValue(doc, 'Email', safeText(data.billTo.email), rightCol, rightY + 3, colWidth)
  }
  if (data.billTo.phone) {
    rightY = drawKeyValue(doc, 'Phone', safeText(data.billTo.phone), rightCol, rightY + 3, colWidth)
  }
  if (data.billTo.address) {
    rightY = drawKeyValue(
      doc,
      'Address',
      safeText(data.billTo.address),
      rightCol,
      rightY + 3,
      colWidth,
    )
  }

  y = Math.max(leftY, rightY) + 8

  if (data.client?.name || data.client?.id) {
    y = ensureSpace(doc, y, 20, margin)
    drawSectionLabel(doc, 'Client details', leftCol, y)
    y += 6
    if (data.client?.name) {
      y = drawKeyValue(doc, 'Client', safeText(data.client.name), leftCol, y, contentWidth)
    }
    if (data.client?.id) {
      y = drawKeyValue(doc, 'Client ID', safeText(data.client.id), leftCol, y + 3, contentWidth)
    }
    y += 8
  }

  if (data.billFrom?.name || data.billFrom?.email) {
    y = ensureSpace(doc, y, 20, margin)
    drawSectionLabel(doc, 'Billed by', leftCol, y)
    y += 6
    y = drawKeyValue(
      doc,
      'Business',
      safeText(data.billFrom?.name || 'JOMS'),
      leftCol,
      y,
      contentWidth,
    )
    if (data.billFrom?.email) {
      y = drawKeyValue(doc, 'Email', safeText(data.billFrom.email), leftCol, y + 3, contentWidth)
    }
    y += 8
  }

  if (data.plan?.name || data.plan?.id || data.plan?.billingCycle || data.plan?.period) {
    y = ensureSpace(doc, y, 28, margin)
    drawSectionLabel(doc, data.planSectionTitle || 'Membership / plan details', leftCol, y)
    y += 6
    if (data.plan?.name) {
      y = drawKeyValue(doc, 'Name', safeText(data.plan.name), leftCol, y, contentWidth)
    }
    if (data.plan?.id) {
      y = drawKeyValue(doc, 'Reference ID', safeText(data.plan.id), leftCol, y + 3, contentWidth)
    }
    if (data.plan?.billingCycle) {
      y = drawKeyValue(
        doc,
        'Billing / type',
        safeText(data.plan.billingCycle),
        leftCol,
        y + 3,
        contentWidth,
      )
    }
    if (data.plan?.period) {
      y = drawKeyValue(doc, 'Period', safeText(data.plan.period), leftCol, y + 3, contentWidth)
    }
    y += 8
  }

  const rows = (
    data.lineItems?.length ? data.lineItems : [{ description: 'Charge', amount: data.total }]
  ).map((item) => [
    safeText(item.description, 'Charge'),
    String(item.quantity ?? 1),
    formatMoney(item.unitPrice ?? item.amount, currency),
    formatMoney(item.amount, currency),
  ])

  y = ensureSpace(doc, y, 30, margin)
  autoTable(doc, {
    startY: y,
    head: [['Description', 'Qty', 'Unit price', 'Amount']],
    body: rows,
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 8,
      textColor: INK,
      lineColor: LINE,
      lineWidth: 0.2,
      cellPadding: 2.5,
      overflow: 'linebreak',
      cellWidth: 'wrap',
      valign: 'middle',
    },
    headStyles: {
      fillColor: GOLD,
      textColor: INK,
      fontStyle: 'bold',
      fontSize: 8,
    },
    columnStyles: {
      0: { cellWidth: contentWidth - 18 - 36 - 36, overflow: 'linebreak' },
      1: { halign: 'center', cellWidth: 18 },
      2: { halign: 'right', cellWidth: 36, font: 'helvetica' },
      3: { halign: 'right', cellWidth: 36, font: 'helvetica' },
    },
    margin: { left: margin, right: margin },
  })

  y = ((doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || y) + 8

  const summaryWidth = 78
  const summaryX = pageWidth - margin - summaryWidth

  const addSummaryRow = (label: string, value: string, bold = false) => {
    y = ensureSpace(doc, y, 8, margin)
    doc.setFont('helvetica', bold ? 'bold' : 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...(bold ? INK : MUTED))
    doc.text(label, summaryX, y)
    doc.setTextColor(...INK)
    doc.setFont('helvetica', bold ? 'bold' : 'normal')
    doc.text(value, pageWidth - margin, y, { align: 'right' })
    y += 6
  }

  addSummaryRow('Subtotal', formatMoney(data.subtotal, currency))
  if ((data.discount || 0) > 0) {
    addSummaryRow('Discount', `- ${formatMoney(data.discount || 0, currency)}`)
  }
  if (data.platformFee != null) {
    addSummaryRow('Platform fee', formatMoney(data.platformFee || 0, currency))
  }
  if (data.commission != null) {
    addSummaryRow('Commission', formatMoney(data.commission || 0, currency))
  }
  if ((data.otherFees || 0) > 0) {
    addSummaryRow('Other fees', formatMoney(data.otherFees || 0, currency))
  }
  if (data.taxLabel != null || data.taxAmount != null) {
    addSummaryRow(data.taxLabel || 'Tax / GST', formatMoney(data.taxAmount || 0, currency))
  }

  doc.setDrawColor(...LINE)
  doc.line(summaryX, y - 2, pageWidth - margin, y - 2)
  y += 3
  addSummaryRow('Total amount', formatMoney(data.total, currency), true)

  y += 6
  y = ensureSpace(doc, y, 36, margin)
  drawSectionLabel(doc, 'Payment details', leftCol, y)
  y += 6
  y = drawKeyValue(
    doc,
    'Payment status',
    safeText(data.paymentStatus || data.status),
    leftCol,
    y,
    contentWidth,
  )
  if (data.payment?.method) {
    y = drawKeyValue(
      doc,
      'Payment method',
      safeText(data.payment.method),
      leftCol,
      y + 3,
      contentWidth,
    )
  }
  if (data.payment?.transactionId) {
    y = drawKeyValue(
      doc,
      'Transaction ID',
      safeText(data.payment.transactionId),
      leftCol,
      y + 3,
      contentWidth,
    )
  }
  if (data.payment?.orderId) {
    y = drawKeyValue(doc, 'Order ID', safeText(data.payment.orderId), leftCol, y + 3, contentWidth)
  }
  if (data.payment?.paidAt) {
    y = drawKeyValue(doc, 'Paid on', safeText(data.payment.paidAt), leftCol, y + 3, contentWidth)
  }

  if (data.notes) {
    y += 8
    y = ensureSpace(doc, y, 20, margin)
    drawSectionLabel(doc, 'Notes', leftCol, y)
    y += 5
    doc.setTextColor(...INK)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    const noteLines = wrapText(doc, data.notes, contentWidth)
    doc.text(noteLines, leftCol, y)
  }

  const pageCount = doc.getNumberOfPages()
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page)
    const footerY = doc.internal.pageSize.getHeight() - 12
    doc.setDrawColor(...LINE)
    doc.line(margin, footerY - 6, pageWidth - margin, footerY - 6)
    doc.setTextColor(...MUTED)
    doc.setFontSize(8)
    doc.text('Generated by JOMS • For records, sharing, and download', margin, footerY)
    doc.text(`Page ${page} of ${pageCount}`, pageWidth - margin, footerY, { align: 'right' })
  }

  const safeName = (fileName || data.invoiceNumber || 'invoice')
    .replace(/[^\w.-]+/g, '_')
    .slice(0, 80)
  doc.save(`${safeName}.pdf`)
}

export function invoiceFromFinanceInvoice(
  invoice: {
    invoiceNumber: string
    clientName?: string
    module?: string
    total: number
    subtotal?: number
    taxAmount?: number
    invoiceStatus?: string
    paymentStatus?: string
    issuedAt?: string
    dueDate?: string | null
    partnerId?: string | null
    userId?: string | null
    lineItems?: Array<{ label: string; amount: number }>
    createdAt?: string
    currency?: string
  },
  options?: { logoUrl?: string | null },
): InvoiceDocumentData {
  const status =
    invoice.invoiceStatus === 'paid' || invoice.paymentStatus === 'paid'
      ? 'Paid'
      : invoice.invoiceStatus === 'cancelled' || invoice.invoiceStatus === 'void'
        ? 'Cancelled'
        : 'Pending'

  const lineItems = (invoice.lineItems || []).map((item) => ({
    description: item.label,
    quantity: 1,
    unitPrice: toNumber(item.amount),
    amount: toNumber(item.amount),
  }))

  return {
    invoiceNumber: invoice.invoiceNumber,
    invoiceDate: formatDisplayDate(invoice.issuedAt || invoice.createdAt),
    dueDate: formatDisplayDate(invoice.dueDate),
    status,
    module: invoice.module,
    billFrom: { name: 'JOMS', email: 'billing@joms.app' },
    billTo: {
      name: invoice.clientName || 'Customer',
      id: invoice.partnerId || invoice.userId || undefined,
    },
    plan:
      invoice.module === 'membership'
        ? {
            name: invoice.lineItems?.[0]?.label || 'Membership plan',
            billingCycle: 'Membership',
          }
        : invoice.module
          ? {
              name: invoice.lineItems?.[0]?.label || `${invoice.module} charge`,
              billingCycle: invoice.module,
            }
          : undefined,
    planSectionTitle:
      invoice.module === 'membership' ? 'Membership / plan details' : 'Service / booking details',
    lineItems: lineItems.length
      ? lineItems
      : [
          {
            description: invoice.module || 'Charge',
            quantity: 1,
            unitPrice: toNumber(invoice.subtotal ?? invoice.total),
            amount: toNumber(invoice.subtotal ?? invoice.total),
          },
        ],
    subtotal: toNumber(invoice.subtotal ?? invoice.total),
    taxAmount: toNumber(invoice.taxAmount),
    taxLabel: 'Tax / GST',
    total: toNumber(invoice.total),
    currency: invoice.currency || 'INR',
    paymentStatus: status,
    payment: {
      method: 'Online',
      paidAt:
        status === 'Paid' ? formatDisplayDate(invoice.issuedAt || invoice.createdAt) : undefined,
    },
    logoUrl: options?.logoUrl,
  }
}

export function invoiceFromMembershipSubscription(
  subscription: {
    subscriptionId: string
    partnerId: string
    partnerName: string
    planId: string
    planName: string
    billingCycleName: string
    purchasedPrice: number
    startedAt: string
    expiresAt?: string
    nextBillingDate?: string | null
    paymentInfo?: {
      paymentId?: string
      orderId?: string
      razorpayOrderId?: string
      razorpayPaymentId?: string
      paymentMethod?: string
      lastPaymentAt?: string
      amount?: number
    }
  },
  options?: { logoUrl?: string | null; historyAction?: string },
): InvoiceDocumentData {
  const amount = toNumber(subscription.paymentInfo?.amount ?? subscription.purchasedPrice)
  const invoiceNumber =
    subscription.paymentInfo?.paymentId ||
    subscription.paymentInfo?.orderId ||
    `INV-${subscription.subscriptionId}`

  return {
    invoiceNumber,
    invoiceDate: formatDisplayDate(
      subscription.paymentInfo?.lastPaymentAt || subscription.startedAt,
    ),
    dueDate: formatDisplayDate(subscription.nextBillingDate || subscription.expiresAt),
    status: 'Paid',
    module: 'membership',
    billFrom: { name: 'JOMS', email: 'billing@joms.app' },
    billTo: {
      name: subscription.partnerName,
      id: subscription.partnerId,
    },
    plan: {
      name: subscription.planName,
      id: subscription.planId || subscription.subscriptionId,
      billingCycle: subscription.billingCycleName,
      period: `${formatDisplayDate(subscription.startedAt)} – ${formatDisplayDate(subscription.expiresAt)}`,
    },
    planSectionTitle: 'Membership / plan details',
    lineItems: [
      {
        description: `${subscription.planName} (${subscription.billingCycleName})${
          options?.historyAction ? ` • ${options.historyAction}` : ''
        }`,
        quantity: 1,
        unitPrice: amount,
        amount,
      },
    ],
    subtotal: amount,
    taxAmount: 0,
    taxLabel: 'Tax / GST',
    total: amount,
    currency: 'INR',
    paymentStatus: 'Paid',
    payment: {
      method: subscription.paymentInfo?.paymentMethod || 'Online',
      transactionId:
        subscription.paymentInfo?.razorpayPaymentId || subscription.paymentInfo?.paymentId,
      orderId: subscription.paymentInfo?.razorpayOrderId || subscription.paymentInfo?.orderId,
      paidAt: formatDisplayDate(subscription.paymentInfo?.lastPaymentAt || subscription.startedAt),
    },
    logoUrl: options?.logoUrl,
  }
}

export function invoiceFromPayout(
  payout: {
    payoutId?: string
    payoutIdFull?: string
    bookingId?: string
    serviceTitle?: string
    serviceType?: string
    serviceCategory?: string
    clientName?: string
    clientId?: string
    expertName?: string
    expertId?: string
    consultationFee?: number
    totalMilestoneFee?: number | null
    platformFee?: number
    platformFeePercent?: number | null
    taxAmount?: number
    finalPayoutAmount?: number
    payoutToExpert?: number
    paymentMethod?: string
    transactionId?: string
    paymentStatus?: string
    payoutStatus?: string
    status?: string
    payoutDate?: string
    creditedOn?: string
    creditedOnFull?: string
  },
  options?: { logoUrl?: string | null },
): InvoiceDocumentData {
  const gross = toNumber(
    payout.totalMilestoneFee != null ? payout.totalMilestoneFee : payout.consultationFee,
  )
  const platformFee = toNumber(payout.platformFee)
  const taxAmount = toNumber(payout.taxAmount)
  const total = toNumber(
    payout.finalPayoutAmount ??
      payout.payoutToExpert ??
      Math.max(0, gross - platformFee - taxAmount),
  )
  const subtotal = gross > 0 ? gross : total + platformFee + taxAmount
  const invoiceNumber =
    payout.payoutIdFull ||
    payout.payoutId ||
    payout.transactionId ||
    `PAY-${payout.bookingId || 'INV'}`
  const paidOn = formatDisplayDate(payout.creditedOnFull || payout.creditedOn || payout.payoutDate)
  const platformFeeLabel =
    payout.platformFeePercent != null && Number(payout.platformFeePercent) > 0
      ? `Platform fee (${Number(payout.platformFeePercent)}%)`
      : 'Platform fee'

  return {
    invoiceNumber,
    invoiceDate: paidOn,
    status: payout.payoutStatus || payout.status || payout.paymentStatus || 'Paid',
    module: payout.serviceType || 'service',
    billFrom: { name: 'JOMS', email: 'billing@joms.app' },
    billTo: {
      name: payout.expertName || 'Expert',
      id: payout.expertId,
    },
    client:
      payout.clientName || payout.clientId
        ? { name: payout.clientName, id: payout.clientId }
        : undefined,
    plan: {
      name: payout.serviceTitle || 'Service payout',
      id: payout.bookingId,
      billingCycle: [payout.serviceType, payout.serviceCategory].filter(Boolean).join(' · '),
    },
    planSectionTitle: 'Service / booking details',
    lineItems: [
      {
        description: payout.serviceTitle || 'Service payout',
        quantity: 1,
        unitPrice: subtotal,
        amount: subtotal,
      },
    ],
    subtotal,
    platformFee,
    taxAmount,
    taxLabel: 'Tax / GST',
    total,
    currency: 'INR',
    paymentStatus: payout.paymentStatus || payout.payoutStatus || 'Paid',
    payment: {
      method: payout.paymentMethod || 'Bank transfer',
      transactionId:
        payout.transactionId && payout.transactionId !== '—' ? payout.transactionId : undefined,
      orderId: payout.bookingId,
      paidAt: paidOn,
    },
    notes: platformFeeLabel !== 'Platform fee' ? platformFeeLabel : undefined,
    logoUrl: options?.logoUrl,
  }
}

export function invoiceFromFinancePayout(
  payout: {
    payoutId: string
    partnerId?: string
    partnerName?: string
    module?: string
    pricingType?: string
    status?: string
    scheduledAt?: string
    paidAt?: string | null
    createdAt?: string
    fees?: {
      grossAmount?: number
      platformCommission?: number
      gatewayCharges?: number
      taxGst?: number
      taxTds?: number
      netPayable?: number
      currency?: string
    }
    bankingSnapshot?: {
      beneficiaryName?: string | null
      bankName?: string | null
      bankReference?: string | null
      ifscCode?: string | null
    }
  },
  options?: { logoUrl?: string | null; recipientName?: string },
): InvoiceDocumentData {
  const gross = toNumber(payout.fees?.grossAmount ?? payout.fees?.netPayable)
  const commission = toNumber(payout.fees?.platformCommission)
  const gatewayCharges = toNumber(payout.fees?.gatewayCharges)
  const taxGst = toNumber(payout.fees?.taxGst)
  const taxTds = toNumber(payout.fees?.taxTds)
  const taxAmount = taxGst + taxTds
  const total = toNumber(
    payout.fees?.netPayable ?? Math.max(0, gross - commission - gatewayCharges - taxAmount),
  )
  const recipient = options?.recipientName || payout.partnerName || 'Expert'

  return {
    invoiceNumber: payout.payoutId,
    invoiceDate: formatDisplayDate(payout.paidAt || payout.scheduledAt || payout.createdAt),
    status: payout.status,
    module: payout.module,
    billFrom: { name: 'JOMS', email: 'billing@joms.app' },
    billTo: {
      name: recipient,
      id: payout.partnerId,
    },
    plan: {
      name: payout.module ? `${payout.module} payout` : 'Expert payout',
      billingCycle: payout.pricingType,
    },
    planSectionTitle: 'Service / booking details',
    lineItems: [
      {
        description: payout.module
          ? `${payout.module} · ${payout.pricingType || 'payout'}`
          : 'Expert payout',
        quantity: 1,
        unitPrice: gross,
        amount: gross,
      },
    ],
    subtotal: gross,
    commission,
    otherFees: gatewayCharges,
    taxAmount,
    taxLabel: taxTds > 0 ? 'GST / TDS' : 'Tax / GST',
    total,
    currency: payout.fees?.currency || 'INR',
    paymentStatus: payout.status,
    payment: {
      method: 'Bank transfer',
      transactionId: payout.bankingSnapshot?.bankReference || undefined,
      paidAt: formatDisplayDate(payout.paidAt || payout.scheduledAt || payout.createdAt),
    },
    notes: payout.bankingSnapshot?.bankName
      ? `Bank: ${payout.bankingSnapshot.bankName}${
          payout.bankingSnapshot.ifscCode ? ` · IFSC ${payout.bankingSnapshot.ifscCode}` : ''
        }${
          payout.bankingSnapshot.beneficiaryName
            ? ` · ${payout.bankingSnapshot.beneficiaryName}`
            : ''
        }`
      : undefined,
    logoUrl: options?.logoUrl,
  }
}

export function invoiceFromEscrow(
  escrow: {
    escrowId: string
    amountHeld: number
    platformFee?: number
    releaseAmount?: number
    pricingType?: string
    status?: string
    heldAt?: string
    createdAt?: string
    expectedReleaseAt?: string | null
    userName?: string | null
    partnerName?: string | null
    partnerId?: string | null
    transactionId?: string | null
    paymentOrderId?: string | null
    paymentId?: string | number | null
  },
  options?: { logoUrl?: string | null; expertName?: string },
): InvoiceDocumentData {
  const amount = toNumber(escrow.amountHeld)
  const platformFee = toNumber(escrow.platformFee)
  const total = toNumber(escrow.releaseAmount ?? amount)

  return {
    invoiceNumber: escrow.escrowId,
    invoiceDate: formatDisplayDate(escrow.heldAt || escrow.createdAt),
    dueDate: formatDisplayDate(escrow.expectedReleaseAt),
    status: escrow.status || 'Held',
    module: escrow.pricingType || 'escrow',
    billFrom: { name: 'JOMS', email: 'billing@joms.app' },
    billTo: {
      name: options?.expertName || escrow.partnerName || 'Expert',
      id: escrow.partnerId || undefined,
    },
    client: escrow.userName ? { name: escrow.userName } : undefined,
    plan: {
      name: `Escrow hold (${escrow.pricingType || 'custom'})`,
      billingCycle: escrow.pricingType,
    },
    planSectionTitle: 'Service / booking details',
    lineItems: [
      {
        description: `Escrow hold (${escrow.pricingType || 'custom'})`,
        quantity: 1,
        unitPrice: amount,
        amount,
      },
    ],
    subtotal: amount,
    platformFee,
    taxAmount: 0,
    taxLabel: 'Tax / GST',
    total,
    currency: 'INR',
    paymentStatus: escrow.status || 'Held',
    payment: {
      method: 'Escrow',
      transactionId:
        escrow.transactionId ||
        escrow.paymentOrderId ||
        (escrow.paymentId != null ? String(escrow.paymentId) : undefined),
      paidAt: formatDisplayDate(escrow.heldAt || escrow.createdAt),
    },
    logoUrl: options?.logoUrl,
  }
}

export { formatDisplayDate }
