import type { ReactNode } from 'react'
import { ArrowLeft, Download } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { useFinanceInvoice } from '@/modules/payments/hooks/use-finance'
import { formatDate, formatInr, titleCase } from '@/modules/payments/utils/finance-mappers'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'
import { navigateBackOrFallback } from '@/shared/lib/navigation'

const cardClass = 'radius-lg border border-white/[0.06] bg-brand-surface p-4 sm:p-5'
const sectionTitleClass = 'text-body-md-semibold text-brand-text leading-[20px]'
const sectionSubtitleClass = 'text-body-sm text-muted mt-1 leading-[20px]'
const labelClass = 'text-body-sm text-muted'
const valueClass = 'text-body-sm-medium text-brand-text'
const innerPanelClass = 'radius-lg border border-white/[0.04] bg-brand-bg p-4'

function DetailCard({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: ReactNode
}) {
  return (
    <section className={cn(cardClass, 'flex flex-col gap-6 p-5')}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className={sectionTitleClass}>{title}</h2>
          {subtitle ? <p className={sectionSubtitleClass}>{subtitle}</p> : null}
        </div>
        <Button onClick={() => toast.message('Download filing report coming soon')}>
          <Download className="size-4" />
          Download Filing Report
        </Button>
      </div>
      <div>{children}</div>
    </section>
  )
}

function DetailRow({
  label,
  value,
  valueClassName,
}: {
  label: string
  value: ReactNode
  valueClassName?: string
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/5 py-3 last:border-b-0">
      <span className={labelClass}>{label}</span>
      <span className={cn('text-right', valueClass, valueClassName)}>{value}</span>
    </div>
  )
}

function getStatusBadgeClass(status: string) {
  if (status === 'Paid') return 'border-brand-positive/25 bg-brand-positive/10 text-brand-positive'
  if (status === 'Pending') return 'border-brand-accent/40 bg-brand-accent/10 text-brand-accent'
  return 'border-brand-danger/25 bg-brand-danger/10 text-brand-danger'
}

export function InvoiceDetailViewPage() {
  const navigate = useNavigate()
  const { id = '' } = useParams<{ id: string }>()
  const { data, isLoading, isError } = useFinanceInvoice(id)
  const invoice = data?.data

  if (isLoading) {
    return <p className="text-body-sm text-muted">Loading invoice details...</p>
  }

  if (isError || !invoice) {
    return (
      <div className="space-y-4">
        <p className="text-body-sm text-brand-danger">Invoice not found.</p>
        <button
          type="button"
          onClick={() => navigateBackOrFallback(navigate, '/finance/invoices')}
          className="ui-cta ui-cta-secondary"
        >
          Back to Invoices
        </button>
      </div>
    )
  }

  const status =
    invoice.invoiceStatus === 'paid' || invoice.paymentStatus === 'paid'
      ? 'Paid'
      : invoice.invoiceStatus === 'cancelled' || invoice.invoiceStatus === 'void'
        ? 'Overdue'
        : 'Pending'

  const primaryItem = invoice.lineItems?.[0]

  return (
    <div className="bg-brand-bg flex flex-col gap-5 pb-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <button
            type="button"
            onClick={() => navigateBackOrFallback(navigate, '/finance/invoices')}
            className="group text-h3 hover:text-brand-accent text-brand-text flex w-fit items-center gap-2 tracking-tight transition-colors"
          >
            <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-1" />
            <span>Payment Detail View</span>
          </button>
          <p className="text-body-sm text-muted mt-2 pl-7 leading-[20px]">
            <Link to="/finance/dashboard" className="hover:text-brand-text transition-colors">
              Finance Management
            </Link>
            <span> / </span>
            <span className="text-brand-text font-semibold">PaymentView Details</span>
          </p>
        </div>
      </header>

      <DetailCard title="Invoice Details" subtitle="Issued invoice for a successful payment">
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <section className={innerPanelClass}>
            <h3 className="text-body-md-semibold text-brand-text mb-3">Invoice Information</h3>
            <DetailRow label="Invoice ID" value={invoice.invoiceNumber} />
            <DetailRow label="Type" value={titleCase(invoice.module)} />
            <DetailRow
              label="Issue Date"
              value={formatDate(invoice.issuedAt || invoice.createdAt)}
            />
            <DetailRow label="Due Date" value={formatDate(invoice.dueDate)} />
            <DetailRow
              label="Status"
              value={
                <span
                  className={cn(
                    'text-body-sm-semibold inline-flex rounded-full border px-2.5 py-0.5',
                    getStatusBadgeClass(status),
                  )}
                >
                  {status}
                </span>
              }
            />
          </section>

          <section className={innerPanelClass}>
            <h3 className="text-body-md-semibold text-brand-text mb-3">Recipient Details</h3>
            <DetailRow label="Name" value={invoice.clientName || '—'} />
            <DetailRow label="Email" value={invoice.partnerId || invoice.userId || '—'} />
          </section>

          <section className={innerPanelClass}>
            <h3 className="text-body-md-semibold text-brand-text mb-3">Invoice Items</h3>
            <DetailRow
              label="Description"
              value={primaryItem?.label || titleCase(invoice.module)}
            />
            <DetailRow label="Platform Fee" value={formatInr(0)} />
            <DetailRow
              label="Unit Price"
              value={formatInr(primaryItem?.amount ?? invoice.subtotal ?? invoice.total)}
            />
          </section>

          <section className={innerPanelClass}>
            <h3 className="text-body-md-semibold text-brand-text mb-3">Financial Summary</h3>
            <DetailRow label="Subtotal" value={formatInr(invoice.subtotal ?? invoice.total)} />
            <DetailRow label="Tax (18% GST)" value={formatInr(invoice.taxAmount ?? 0)} />
            <DetailRow
              label="Total Amount"
              value={formatInr(invoice.total)}
              valueClassName="text-body-md-semibold"
            />
          </section>
        </div>
      </DetailCard>
    </div>
  )
}
