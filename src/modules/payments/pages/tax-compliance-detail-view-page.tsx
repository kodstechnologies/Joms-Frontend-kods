import type { ReactNode } from 'react'
import { ArrowLeft, Check, Download, SquarePen } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { getTaxComplianceDetailById } from '@/modules/payments/mock/tax-compliance-detail.mock'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'

function DetailCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-white/[0.06] bg-[#1A1A1A] p-5">
      <h2 className="mb-4 text-[14px] font-bold text-white">{title}</h2>
      {children}
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
      <span className="text-[12px] text-[#888888]">{label}</span>
      <span
        className={cn('max-w-[60%] text-right text-[12px] font-medium text-white', valueClassName)}
      >
        {value}
      </span>
    </div>
  )
}

function getStatusBadgeClass(status: string) {
  if (status === 'Confirmed' || status === 'Approved' || status === 'Filed') {
    return 'border-emerald-500/25 bg-emerald-600/20 text-emerald-400'
  }
  if (status === 'Pending' || status === 'Under Review') {
    return 'border-amber-500/25 bg-amber-500/10 text-amber-400'
  }
  return 'border-rose-500/25 bg-rose-500/10 text-rose-400'
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold',
        getStatusBadgeClass(status),
      )}
    >
      {status}
    </span>
  )
}

export function TaxComplianceDetailViewPage() {
  const navigate = useNavigate()
  const { id = 'tax-01' } = useParams<{ id: string }>()
  const detail = getTaxComplianceDetailById(id)

  return (
    <div className="flex flex-col gap-5">
      <header>
        <button
          type="button"
          onClick={() => navigate('/finance/tax')}
          className="group flex w-fit items-center gap-2 text-[20px] font-bold tracking-tight text-white transition-colors hover:text-[#FBC078]"
        >
          <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-1" />
          <span>Tax Records Detail View</span>
        </button>
        <p className="mt-2 pl-7 text-[12px] text-[#777777]">
          <Link to="/finance/dashboard" className="transition-colors hover:text-white">
            Finance Management
          </Link>
          <span> / </span>
          <Link to="/finance/tax" className="transition-colors hover:text-white">
            Tax & Compliance
          </Link>
          <span> / </span>
          <span className="font-semibold text-white">Payment View Details</span>
        </p>
      </header>

      <section className="rounded-xl border border-white/[0.06] bg-[#1A1A1A] p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-[14px] font-bold text-white">{detail.recordTitle}</h2>
            <p className="mt-1 text-[12px] text-[#888888]">{detail.recordDescription}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={() => toast.message('Download report coming soon')}>
              <Download className="size-4" />
              Download Report
            </Button>
            <Button onClick={() => toast.message('Edit tax record coming soon')}>
              <SquarePen className="size-4" />
              Edit Tax Record
            </Button>
            <Button onClick={() => toast.message('Add notes coming soon')}>
              <SquarePen className="size-4" />
              Add Notes
            </Button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <div className="flex flex-col gap-5">
          <DetailCard title="Tax Record Overview">
            <DetailRow label="Tax Record ID" value={detail.taxRecordOverview.taxRecordId} />
            <DetailRow label="Transaction ID" value={detail.taxRecordOverview.transactionId} />
            <DetailRow label="Entity Type" value={detail.taxRecordOverview.entityType} />
            <DetailRow label="Region" value={detail.taxRecordOverview.region} />
            <DetailRow label="Tax Type" value={detail.taxRecordOverview.taxType} />
            <DetailRow label="Tax Rate" value={detail.taxRecordOverview.taxRate} />
            <DetailRow label="Currency" value={detail.taxRecordOverview.currency} />
            <DetailRow label="Invoice Number" value={detail.taxRecordOverview.invoiceNumber} />
            <DetailRow label="Invoice Date" value={detail.taxRecordOverview.invoiceDate} />
            <DetailRow label="Filing Period" value={detail.taxRecordOverview.filingPeriod} />
            <DetailRow label="Filing Date" value={detail.taxRecordOverview.filingDate} />
            <DetailRow label="Filed By" value={detail.taxRecordOverview.filedBy} />
            <DetailRow label="Reference Number" value={detail.taxRecordOverview.referenceNumber} />
            <DetailRow
              label="Filing Status"
              value={<StatusBadge status={detail.taxRecordOverview.filingStatus} />}
            />
          </DetailCard>

          <DetailCard title="Financial Breakdown">
            <DetailRow label="Client ID" value={detail.financialBreakdown.clientId} />
            <DetailRow label="Client Name" value={detail.financialBreakdown.clientName} />
            <DetailRow label="Tax ID" value={detail.financialBreakdown.taxId} />
            <DetailRow label="Billing Address" value={detail.financialBreakdown.billingAddress} />
            <DetailRow label="Transaction Date" value={detail.financialBreakdown.transactionDate} />
            <DetailRow label="Payment Method" value={detail.financialBreakdown.paymentMethod} />
            <DetailRow
              label="Subtotal (Before Tax)"
              value={detail.financialBreakdown.subtotalBeforeTax}
            />
            <DetailRow label="Discount Applied" value={detail.financialBreakdown.discountApplied} />
            <DetailRow label="Taxable Amount" value={detail.financialBreakdown.taxableAmount} />
            <DetailRow label="Tax Amount" value={detail.financialBreakdown.taxAmount} />
            <DetailRow
              label="Total Amount (After Tax)"
              value={detail.financialBreakdown.totalAmountAfterTax}
              valueClassName="font-bold"
            />
          </DetailCard>
        </div>

        <div className="flex flex-col gap-5">
          <DetailCard title="Venue Information">
            <DetailRow label="Venue Name" value={detail.venueInformation.venueName} />
            <DetailRow label="Owner Name" value={detail.venueInformation.ownerName} />
            <DetailRow label="Owner ID" value={detail.venueInformation.ownerId} />
            <DetailRow label="Venue Type" value={detail.venueInformation.venueType} />
            <DetailRow label="Capacity" value={detail.venueInformation.capacity} />
            <DetailRow label="Location" value={detail.venueInformation.location} />
            <DetailRow label="Billing Address" value={detail.venueInformation.billingAddress} />
            <DetailRow
              label="Approval Status"
              value={<StatusBadge status={detail.venueInformation.approvalStatus} />}
            />
          </DetailCard>

          <DetailCard title="Tax Calculation">
            <DetailRow
              label="Tax Jurisdiction Rules Applied"
              value={detail.taxCalculation.taxJurisdictionRulesApplied}
            />
            <DetailRow label="Tax Category" value={detail.taxCalculation.taxCategory} />
            <DetailRow label="Tax Rate Source" value={detail.taxCalculation.taxRateSource} />
            <DetailRow label="Tax Formula Used" value={detail.taxCalculation.taxFormulaUsed} />
            <DetailRow
              label="Reverse Charge Applied"
              value={detail.taxCalculation.reverseChargeApplied}
            />
          </DetailCard>

          <DetailCard title="Compliance Information">
            <DetailRow
              label="Regulatory Authority"
              value={detail.complianceInformation.regulatoryAuthority}
            />
            <DetailRow
              label="Filing Frequency"
              value={detail.complianceInformation.filingFrequency}
            />
            <DetailRow
              label="Reporting Category Code"
              value={detail.complianceInformation.reportingCategoryCode}
            />
            <DetailRow label="Tax Status" value={detail.complianceInformation.taxStatus} />
            <DetailRow label="Adjustments" value={detail.complianceInformation.adjustments} />
            <DetailRow label="Notes" value={detail.complianceInformation.notes} />
          </DetailCard>
        </div>
      </div>

      <footer className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-[#1A1A1A] px-5 py-4">
        <Button variant="secondary" onClick={() => navigate('/finance/tax')}>
          Close
        </Button>
        <button
          type="button"
          onClick={() => toast.success('Marked as filed')}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-400/30 focus-visible:outline-none"
        >
          <Check className="size-4" />
          Mark as Filed
        </button>
      </footer>
    </div>
  )
}
