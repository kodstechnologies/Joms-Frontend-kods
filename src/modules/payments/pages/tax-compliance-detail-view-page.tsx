import { useMemo, useState } from 'react'
import { ArrowLeft, Check, Download, Flag, SquarePen } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { AddFinanceNoteModal } from '@/modules/payments/components/add-finance-note-modal'
import { FinanceInternalNotesCard } from '@/modules/payments/components/finance-internal-notes-card'
import {
  FinanceDetailCard as DetailCard,
  FinanceDetailRow as DetailRow,
  FinanceDetailShell,
  financeDetailCardClass,
} from '@/modules/payments/components/finance-detail-layout'
import { FinanceStatusBadge } from '@/modules/payments/components/finance-status-badge'
import { financeTaxComplianceStatusClass } from '@/modules/payments/utils/finance-status-tones'
import {
  useAddFinanceNote,
  useFinanceNotes,
  useFinanceTaxDetail,
  useMarkTaxFiled,
} from '@/modules/payments/hooks/use-finance'
import { escalateUrl } from '@/modules/payments/utils/finance-escalate'
import { formatDate, formatInr, titleCase } from '@/modules/payments/utils/finance-mappers'
import {
  flattenExportPairs,
  useDownloadKeyValueReport,
} from '@/modules/payments/hooks/use-finance-list-filters'
import { Button } from '@/shared/components/ui/button'
import { getApiErrorMessage } from '@/shared/lib/api-error'
import { cn } from '@/shared/lib/cn'
import { navigateBackOrFallback } from '@/shared/lib/navigation'

const cardClass = financeDetailCardClass
const sectionTitleClass = 'text-body-md-semibold text-brand-text leading-[20px]'
const sectionSubtitleClass = 'text-body-sm text-muted mt-1'

const TAGS_PREFIX_RE = /\[Tags:\s*([^\]]+)\]/i

function parseTagsFromNotes(notes: Array<{ adminNote?: string | null }> = []) {
  const tags = new Set<string>()
  for (const note of notes) {
    const match = String(note.adminNote || '').match(TAGS_PREFIX_RE)
    if (!match?.[1]) continue
    for (const tag of match[1].split(',')) {
      const trimmed = tag.trim()
      if (trimmed) tags.add(trimmed)
    }
  }
  return [...tags]
}

function latestPlainNote(notes: Array<{ adminNote?: string | null }> = []) {
  for (const note of notes) {
    const plain = String(note.adminNote || '')
      .replace(TAGS_PREFIX_RE, '')
      .trim()
    if (plain) return plain
  }
  return '—'
}

export function TaxComplianceDetailViewPage() {
  const navigate = useNavigate()
  const downloadKeyValueReport = useDownloadKeyValueReport()
  const { id = '' } = useParams<{ id: string }>()
  const { data, isLoading, isError, refetch } = useFinanceTaxDetail(id)
  const noteMutation = useAddFinanceNote()
  const markFiledMutation = useMarkTaxFiled()
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false)
  const tax = data?.data
  const resourceId = tax?._id || tax?.taxRecordId || id
  const notesQuery = useFinanceNotes(resourceId)
  const financeNotes = notesQuery.data?.data ?? []
  const recordTags = useMemo(() => parseTagsFromNotes(financeNotes), [financeNotes])
  const notesSummary = useMemo(() => latestPlainNote(financeNotes), [financeNotes])

  if (isLoading) {
    return <p className="text-body-sm text-muted">Loading tax record...</p>
  }

  if (isError || !tax) {
    return (
      <div className="space-y-4">
        <p className="text-body-sm text-brand-danger">Tax record not found.</p>
        <button
          type="button"
          onClick={() => navigateBackOrFallback(navigate, '/finance/tax')}
          className="ui-cta ui-cta-secondary"
        >
          Back to Tax
        </button>
      </div>
    )
  }

  const filingStatus = titleCase(tax.filingStatus)
  const filingStatusKey = String(tax.filingStatus || '').toLowerCase()
  const canMarkFiled = !['filed', 'completed'].includes(filingStatusKey)
  const detail = {
    recordTitle: 'Tax & Compliance Information',
    recordDescription: `${titleCase(tax.module)} · ${tax.taxType}`,
    taxRecordOverview: {
      taxRecordId: tax.taxRecordId,
      transactionId: String(tax.paymentId || '—'),
      entityType: titleCase(tax.module),
      region: tax.region || 'India',
      taxType: tax.taxType,
      taxRate: tax.taxRatePercent != null ? `${tax.taxRatePercent}%` : '—',
      currency: tax.currency || 'INR',
      invoiceNumber: tax.invoiceNumber || '—',
      invoiceDate: formatDate(tax.createdAt),
      filingPeriod: tax.filingPeriod || '—',
      filingDate: formatDate(
        tax.filedAt || (tax.filingStatus === 'pending' ? null : tax.createdAt),
      ),
      filedBy: tax.filedByAdminId || (canMarkFiled ? '—' : 'Finance Admin'),
      referenceNumber: tax.taxRecordId,
      filingStatus,
      tags: recordTags.length ? recordTags.join(', ') : '—',
    },
    financialBreakdown: {
      clientId: tax.userId || '—',
      clientName: tax.userId || '—',
      taxId: tax.partnerId || '—',
      billingAddress: '—',
      transactionDate: formatDate(tax.createdAt),
      paymentMethod: 'Razorpay',
      subtotalBeforeTax: formatInr(tax.taxableAmount),
      discountApplied: '—',
      taxableAmount: formatInr(tax.taxableAmount),
      taxAmount: formatInr(tax.taxAmount),
      totalAmountAfterTax: formatInr((tax.taxableAmount || 0) + (tax.taxAmount || 0)),
    },
    venueInformation: {
      venueName: titleCase(tax.module),
      ownerName: tax.partnerId || '—',
      ownerId: tax.partnerId || '—',
      venueType: '—',
      capacity: '—',
      location: tax.region || 'India',
      billingAddress: '—',
      approvalStatus:
        filingStatus === 'Filed' || filingStatus === 'Completed' ? 'Approved' : 'Pending',
    },
    taxCalculation: {
      taxJurisdictionRulesApplied: 'India GST/TDS rules',
      taxCategory: tax.taxType,
      taxRateSource: 'Platform tax settings',
      taxFormulaUsed: 'taxableAmount × rate',
      reverseChargeApplied: 'No',
    },
    complianceInformation: {
      regulatoryAuthority: tax.taxType === 'TDS' ? 'Income Tax' : 'GSTN',
      filingFrequency: tax.filingPeriod || '—',
      reportingCategoryCode: tax.taxType,
      taxStatus: filingStatus,
      adjustments: '—',
      tags: recordTags.length ? recordTags.join(', ') : '—',
      notes: notesSummary,
    },
  }

  return (
    <div className="bg-brand-bg flex flex-col gap-5 pb-6">
      <header>
        <button
          type="button"
          onClick={() => navigateBackOrFallback(navigate, '/finance/tax')}
          className="group text-h3 hover:text-brand-accent text-brand-text flex w-fit items-center gap-2 tracking-tight transition-colors"
        >
          <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-1" />
          <span>Tax Records Detail View</span>
        </button>
        <p className="text-body-sm text-muted mt-2 pl-7 leading-[20px]">
          <Link to="/finance/dashboard" className="hover:text-brand-text transition-colors">
            Payment &amp; Finance
          </Link>
          <span> / </span>
          <Link to="/finance/tax" className="hover:text-brand-text transition-colors">
            Tax & Compliance
          </Link>
          <span> / </span>
          <span className="text-brand-text font-semibold">Payment View Details</span>
        </p>
      </header>

      <FinanceDetailShell>
        <section className={cn(cardClass, 'p-5')}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className={sectionTitleClass}>{detail.recordTitle}</h2>
              <p className={cn(sectionSubtitleClass, 'leading-[20px]')}>
                {detail.recordDescription}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                onClick={() =>
                  downloadKeyValueReport(
                    'tax_compliance_report',
                    flattenExportPairs({
                      Overview: detail.taxRecordOverview,
                      Financial: detail.financialBreakdown,
                      Venue: detail.venueInformation,
                      Calculation: detail.taxCalculation,
                      Compliance: detail.complianceInformation,
                    }),
                  )
                }
              >
                <Download className="size-4" />
                Download Report
              </Button>
              <Button onClick={() => setIsNoteModalOpen(true)}>
                <SquarePen className="size-4" />
                Add Notes
              </Button>
              <Button
                onClick={() =>
                  navigate(
                    escalateUrl(tax._id, {
                      kind: 'resource',
                      resourceType: 'TaxRecord',
                      returnTo: `/finance/tax/${id}`,
                    }),
                  )
                }
              >
                <Flag className="size-4" />
                Escalate
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
              <DetailRow
                label="Reference Number"
                value={detail.taxRecordOverview.referenceNumber}
              />
              <DetailRow
                label="Filing Status"
                value={
                  <FinanceStatusBadge
                    status={detail.taxRecordOverview.filingStatus}
                    toneClass={financeTaxComplianceStatusClass(
                      detail.taxRecordOverview.filingStatus,
                    )}
                  />
                }
              />
            </DetailCard>

            <DetailCard title="Financial Breakdown">
              <DetailRow label="Client ID" value={detail.financialBreakdown.clientId} />
              <DetailRow label="Client Name" value={detail.financialBreakdown.clientName} />
              <DetailRow label="Tax ID" value={detail.financialBreakdown.taxId} />
              <DetailRow label="Billing Address" value={detail.financialBreakdown.billingAddress} />
              <DetailRow
                label="Transaction Date"
                value={detail.financialBreakdown.transactionDate}
              />
              <DetailRow label="Payment Method" value={detail.financialBreakdown.paymentMethod} />
              <DetailRow
                label="Subtotal (Before Tax)"
                value={detail.financialBreakdown.subtotalBeforeTax}
              />
              <DetailRow
                label="Discount Applied"
                value={detail.financialBreakdown.discountApplied}
              />
              <DetailRow label="Taxable Amount" value={detail.financialBreakdown.taxableAmount} />
              <DetailRow label="Tax Amount" value={detail.financialBreakdown.taxAmount} />
              <DetailRow
                label="Total Amount (After Tax)"
                value={detail.financialBreakdown.totalAmountAfterTax}
                valueClassName="text-body-sm-semibold"
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
                value={
                  <FinanceStatusBadge
                    status={detail.venueInformation.approvalStatus}
                    toneClass={financeTaxComplianceStatusClass(
                      detail.venueInformation.approvalStatus,
                    )}
                  />
                }
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
              <DetailRow label="Tags" value={detail.complianceInformation.tags} />
              <DetailRow label="Notes" value={detail.complianceInformation.notes} />
            </DetailCard>
          </div>
        </div>

        <FinanceInternalNotesCard resourceId={resourceId} />

        <footer className={cn(cardClass, 'flex items-center justify-between px-5 py-4')}>
          <button
            type="button"
            onClick={() => navigateBackOrFallback(navigate, '/finance/tax')}
            className="ui-cta ui-cta-secondary"
          >
            Close
          </button>
          {canMarkFiled ? (
            <button
              type="button"
              disabled={markFiledMutation.isPending}
              onClick={() => {
                markFiledMutation.mutate(
                  { id: tax._id || tax.taxRecordId || id },
                  {
                    onSuccess: () => {
                      toast.success('Marked as filed')
                      void refetch()
                    },
                    onError: (err) => {
                      const msg = getApiErrorMessage(err, 'Failed to mark as filed')
                      toast.error(msg)
                      if (/already filed|already completed/i.test(msg)) {
                        void refetch()
                      }
                    },
                  },
                )
              }}
              className="ui-cta ui-cta-positive h-[44px]"
            >
              <Check className="icon-sm shrink-0" />
              {markFiledMutation.isPending ? 'Marking...' : 'Mark as Filed'}
            </button>
          ) : (
            <button type="button" disabled className="ui-cta ui-cta-positive h-[44px] opacity-60">
              <Check className="icon-sm shrink-0" />
              Filed
            </button>
          )}
        </footer>
      </FinanceDetailShell>

      <AddFinanceNoteModal
        open={isNoteModalOpen}
        isSubmitting={noteMutation.isPending}
        onClose={() => setIsNoteModalOpen(false)}
        onSubmit={(adminNote) => {
          noteMutation.mutate(
            { id: resourceId, resourceType: 'TaxRecord', adminNote },
            {
              onSuccess: () => {
                toast.success('Note saved')
                setIsNoteModalOpen(false)
              },
              onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to save note')),
            },
          )
        }}
      />
    </div>
  )
}
