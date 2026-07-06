import type { ReactNode } from 'react'
import { ArrowLeft, Download } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { getInvoiceDetailById } from '@/modules/payments/mock/invoice-detail.mock'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'

function DetailCard({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-white/[0.06] bg-[#1A1A1A] p-5">
      <h2 className="text-[14px] font-bold text-white">{title}</h2>
      {subtitle ? <p className="mt-1 text-[12px] text-[#888888]">{subtitle}</p> : null}
      <div className="mt-4">{children}</div>
    </section>
  )
}

function DetailRow({ label, value, valueClassName }: { label: string; value: ReactNode; valueClassName?: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/5 py-3 last:border-b-0">
      <span className="text-[12px] text-[#888888]">{label}</span>
      <span className={cn('text-right text-[12px] font-medium text-white', valueClassName)}>{value}</span>
    </div>
  )
}

function getStatusBadgeClass(status: string) {
  if (status === 'Paid') return 'border-emerald-500/25 bg-emerald-600/20 text-emerald-400'
  if (status === 'Pending') return 'border-amber-500/25 bg-amber-500/10 text-amber-400'
  return 'border-rose-500/25 bg-rose-500/10 text-rose-400'
}

export function InvoiceDetailViewPage() {
  const navigate = useNavigate()
  const { id = 'inv-02' } = useParams<{ id: string }>()
  const detail = getInvoiceDetailById(id)

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <button
            type="button"
            onClick={() => navigate('/finance/invoices')}
            className="group flex w-fit items-center gap-2 text-[20px] font-bold tracking-tight text-white transition-colors hover:text-[#FBC078]"
          >
            <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-1" />
            <span>Payment Detail View</span>
          </button>
          <p className="mt-2 pl-7 text-[12px] text-[#777777]">
            <Link to="/finance/dashboard" className="transition-colors hover:text-white">
              Finance Management
            </Link>
            <span> / </span>
            <Link to="/finance/invoices" className="transition-colors hover:text-white">
              Invoices & Billing
            </Link>
            <span> / </span>
            <span className="font-semibold text-white">Payment View Details</span>
          </p>
        </div>
        <Button onClick={() => toast.message('Download billing report coming soon')}>
          <Download className="size-4" />
          Download Billing Report
        </Button>
      </header>

      <DetailCard title="Invoice Details" subtitle="Provide details about your Consultation">
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <section className="rounded-lg border border-white/[0.04] bg-black/20 p-4">
            <h3 className="mb-3 text-[13px] font-semibold text-white">Invoice Information</h3>
            <DetailRow label="Invoice ID" value={detail.invoiceId} />
            <DetailRow label="Type" value={detail.type} />
            <DetailRow label="Issue Date" value={detail.issueDate} />
            <DetailRow label="Due Date" value={detail.dueDate} />
            <DetailRow
              label="Status"
              value={
                <span
                  className={cn(
                    'inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold',
                    getStatusBadgeClass(detail.status),
                  )}
                >
                  {detail.status}
                </span>
              }
            />
          </section>

          <section className="rounded-lg border border-white/[0.04] bg-black/20 p-4">
            <h3 className="mb-3 text-[13px] font-semibold text-white">Recipient Details</h3>
            <DetailRow label="Name" value={detail.recipientName} />
            <DetailRow label="Email" value={detail.recipientEmail} />
          </section>

          <section className="rounded-lg border border-white/[0.04] bg-black/20 p-4">
            <h3 className="mb-3 text-[13px] font-semibold text-white">Invoice Items</h3>
            <DetailRow label="Description" value={detail.itemDescription} />
            <DetailRow label="Platform Fee" value={detail.platformFee} />
            <DetailRow label="Unit Price" value={detail.unitPrice} />
          </section>

          <section className="rounded-lg border border-white/[0.04] bg-black/20 p-4">
            <h3 className="mb-3 text-[13px] font-semibold text-white">Financial Summary</h3>
            <DetailRow label="Subtotal" value={detail.subtotal} />
            <DetailRow label="Tax (18% GST)" value={detail.tax} />
            <DetailRow label="Total Amount" value={detail.totalAmount} valueClassName="text-[14px] font-bold" />
          </section>
        </div>
      </DetailCard>

      <div className="flex justify-end">
        <Button variant="secondary" onClick={() => navigate('/finance/invoices')}>
          Close
        </Button>
      </div>
    </div>
  )
}
