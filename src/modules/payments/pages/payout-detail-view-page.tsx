import { useEffect, useState } from 'react'
import { ArrowLeft, Download, SquarePen } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'

import { useBranding } from '@/app/providers/use-branding'
import { AddFinanceNoteModal } from '@/modules/payments/components/add-finance-note-modal'
import {
  FinanceDetailCard as DetailCard,
  FinanceDetailRow as DetailRow,
} from '@/modules/payments/components/finance-detail-layout'
import { FinanceInternalNotesCard } from '@/modules/payments/components/finance-internal-notes-card'
import { FinanceStatusBadge } from '@/modules/payments/components/finance-status-badge'
import { financePayoutStatusClass } from '@/modules/payments/utils/finance-status-tones'
import { fetchPartnerDisplayNames } from '@/modules/payments/api/partner-lookup-api'
import {
  useAddFinanceNote,
  useFinancePayout,
  useReleasePayout,
  useRetryPayout,
} from '@/modules/payments/hooks/use-finance'
import {
  canReleasePayout,
  formatDate,
  formatInr,
  mapPayeeType,
  mapPayoutStatus,
  titleCase,
} from '@/modules/payments/utils/finance-mappers'
import { PermissionGate } from '@/modules/rbac/components/permission-gate'
import { Button } from '@/shared/components/ui/button'
import { DetailViewSkeleton } from '@/shared/components/ui/skeleton'
import { cn } from '@/shared/lib/cn'
import { navigateBackOrFallback } from '@/shared/lib/navigation'
import { PERMISSION_LEVELS } from '@/shared/lib/permissions'
import { downloadInvoiceDocument, invoiceFromFinancePayout } from '@/shared/utils/invoice-document'

const cardClass = 'radius-lg border border-white/[0.06] bg-brand-surface p-4 sm:p-5'
const sectionTitleClass = 'text-body-md-semibold text-brand-text leading-[20px]'
const sectionSubtitleClass = 'text-body-sm text-muted mt-1 leading-[20px]'

const maskAccount = (value?: string | null) => {
  if (!value) return '—'
  const digits = value.replace(/\s/g, '')
  if (digits.length < 4) return value
  return `**** ${digits.slice(-4)}`
}

export function PayoutDetailViewPage() {
  const navigate = useNavigate()
  const { id = '' } = useParams<{ id: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const { logoUrl } = useBranding()
  const { data, isLoading, isError, isFetching, refetch } = useFinancePayout(id)
  const retryMutation = useRetryPayout()
  const releaseMutation = useReleasePayout()
  const noteMutation = useAddFinanceNote()
  const [noteModal, setNoteModal] = useState<'retry' | 'release' | 'note' | null>(null)
  const payout = data?.data
  const status = payout ? mapPayoutStatus(payout.status) : 'Pending'
  const canRelease = canReleasePayout(payout?.status)

  const partnerId = payout?.partnerId ? String(payout.partnerId) : ''
  const needsPartnerLookup = Boolean(partnerId) && !payout?.partnerName?.trim()
  const { data: partnerNameMap } = useQuery({
    queryKey: ['partner-display-names', partnerId],
    queryFn: () => fetchPartnerDisplayNames([partnerId]),
    enabled: needsPartnerLookup,
  })

  // Deep-link: /finance/payouts/:id?action=release opens the release note modal once.
  useEffect(() => {
    if (searchParams.get('action') !== 'release' || !payout || !canRelease) return
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-shot deep link open
    setNoteModal('release')
    setSearchParams({}, { replace: true })
  }, [canRelease, payout, searchParams, setSearchParams])

  if (isLoading && !payout) {
    return <DetailViewSkeleton pillCount={6} cardCount={2} />
  }

  if (isError || !payout) {
    return (
      <div className="space-y-4">
        <p className="text-body-sm text-brand-danger">Payout not found.</p>
        <button
          type="button"
          onClick={() => navigateBackOrFallback(navigate, '/finance/payouts')}
          className="ui-cta ui-cta-secondary"
        >
          Back to Payouts
        </button>
      </div>
    )
  }

  const payeeName =
    (payout.partnerName && payout.partnerName.trim()) ||
    (partnerId ? partnerNameMap?.[partnerId] : null) ||
    '—'
  const canRetry = payout.status === 'failed'
  const fees = payout.fees || { grossAmount: 0, netPayable: 0 }
  const taxDeduction = (Number(fees.taxGst) || 0) + (Number(fees.taxTds) || 0)
  const relatedTransaction =
    payout.relatedTransaction || payout.referenceId || String(payout.paymentId || '—')
  const financeApprover = payout.financeApproverId || payout.releasedByAdminId || '—'

  return (
    <div className="bg-brand-bg flex flex-col gap-5 pb-6">
      <header>
        <button
          type="button"
          onClick={() => navigateBackOrFallback(navigate, '/finance/payouts')}
          className="group text-h3 hover:text-brand-accent text-brand-text flex w-fit items-center gap-2 tracking-tight transition-colors"
        >
          <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-1" />
          <span>Payout Detail View</span>
        </button>
        <p className="text-body-sm text-muted mt-2 pl-7 leading-[20px]">
          <Link to="/finance/dashboard" className="hover:text-brand-text transition-colors">
            Finance Management
          </Link>
          <span> / </span>
          <Link to="/finance/payouts" className="hover:text-brand-text transition-colors">
            Payout Management
          </Link>
          <span> / </span>
          <span className="text-brand-text font-semibold">Payout View Details</span>
          {isFetching ? <span className="text-muted ml-2 text-xs">(updating…)</span> : null}
        </p>
      </header>

      <section className={cn(cardClass, 'flex flex-col gap-6 p-5')}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className={sectionTitleClass}>Payout Details</h2>
            <p className={sectionSubtitleClass}>
              {titleCase(payout.module)} · {titleCase(payout.pricingType)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              className="ui-cta"
              onClick={() => {
                void downloadInvoiceDocument(
                  invoiceFromFinancePayout(payout, {
                    logoUrl,
                    recipientName: typeof payeeName === 'string' ? payeeName : undefined,
                  }),
                  payout.payoutId,
                )
                  .then(() => toast.success('Invoice downloaded'))
                  .catch(() => toast.error('Failed to download invoice'))
              }}
            >
              <Download className="size-4" />
              Download Invoice
            </Button>
            <Button type="button" variant="secondary" onClick={() => setNoteModal('note')}>
              <SquarePen className="size-4" />
              Add Internal Note
            </Button>
            {canRetry ? (
              <Button className="ui-cta" onClick={() => setNoteModal('retry')}>
                Retry Payout
              </Button>
            ) : null}
            {canRelease ? (
              <PermissionGate
                permission="finance.approve_payout"
                minLevel={PERMISSION_LEVELS.SECONDARY_APPROVAL}
              >
                <Button className="ui-cta" onClick={() => setNoteModal('release')}>
                  Release Payout
                </Button>
              </PermissionGate>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <DetailCard title="Payout Information">
            <DetailRow label="Payout ID" value={payout.payoutId} />
            <DetailRow label="Payee ID" value={payout.partnerId || '—'} />
            <DetailRow label="Payee Name" value={payeeName} />
            <DetailRow label="Payee Type" value={mapPayeeType(payout.payeeType)} />
            <DetailRow label="Related Transaction" value={relatedTransaction} />
            <DetailRow
              label="Payout Status"
              value={
                <FinanceStatusBadge status={status} toneClass={financePayoutStatusClass(status)} />
              }
            />
            <DetailRow label="Scheduled Date" value={formatDate(payout.scheduledAt)} />
            <DetailRow label="Processed Date" value={formatDate(payout.paidAt)} />
            <DetailRow label="Finance Approver" value={financeApprover} />
            <DetailRow
              label="Bank Reference"
              value={payout.bankingSnapshot?.bankReference || '—'}
            />
            <DetailRow label="Currency" value={fees.currency || 'INR'} />
          </DetailCard>

          <div className="flex flex-col gap-5">
            <DetailCard title="Financial Details">
              <DetailRow label="Gross Amount" value={formatInr(fees.grossAmount)} />
              <DetailRow label="Platform Commission" value={formatInr(fees.platformCommission)} />
              <DetailRow label="Tax Deduction" value={formatInr(taxDeduction)} />
              <DetailRow label="Gateway Charges" value={formatInr(fees.gatewayCharges)} />
              <DetailRow label="Net Payout" value={formatInr(fees.netPayable)} />
            </DetailCard>

            <DetailCard title="Bank Details">
              <DetailRow
                label="Beneficiary"
                value={payout.bankingSnapshot?.beneficiaryName || '—'}
              />
              <DetailRow label="Bank Name" value={payout.bankingSnapshot?.bankName || '—'} />
              <DetailRow
                label="Account Number"
                value={maskAccount(
                  payout.bankingSnapshot?.accountNumber ||
                    payout.bankingSnapshot?.accountNumberMasked,
                )}
              />
              <DetailRow label="IFSC Code" value={payout.bankingSnapshot?.ifscCode || '—'} />
              <DetailRow
                label="Transfer Reference (UTR)"
                value={payout.bankingSnapshot?.bankReference || '—'}
              />
            </DetailCard>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => navigateBackOrFallback(navigate, '/finance/payouts')}
            className="ui-cta ui-cta-secondary"
          >
            Close
          </button>
        </div>
      </section>

      <FinanceInternalNotesCard resourceId={payout._id} />

      <AddFinanceNoteModal
        open={noteModal === 'note'}
        isSubmitting={noteMutation.isPending}
        onClose={() => setNoteModal(null)}
        onSubmit={(adminNote) => {
          noteMutation.mutate(
            { id: payout._id, resourceType: 'Payout', adminNote },
            {
              onSuccess: () => {
                toast.success('Note saved')
                setNoteModal(null)
              },
              onError: () => toast.error('Failed to save note'),
            },
          )
        }}
      />

      <AddFinanceNoteModal
        open={noteModal === 'retry'}
        title="Retry Payout"
        description="Add an admin note to confirm retrying this failed payout."
        placeholder="Enter retry note"
        submitLabel="Retry Payout"
        submittingLabel="Retrying..."
        isSubmitting={retryMutation.isPending}
        onClose={() => setNoteModal(null)}
        onSubmit={(adminNote) => {
          retryMutation.mutate(
            { id: payout._id, adminNote },
            {
              onSuccess: () => {
                toast.success('Payout retry scheduled')
                setNoteModal(null)
                void refetch()
              },
              onError: () => toast.error('Retry failed'),
            },
          )
        }}
      />

      <AddFinanceNoteModal
        open={noteModal === 'release'}
        title="Release Payout"
        description="Record the manual bank transfer, then mark this payout as paid."
        placeholder="Enter release note"
        submitLabel="Release Payout"
        submittingLabel="Releasing..."
        extraField={{
          label: 'Transfer Reference (UTR)',
          placeholder: 'Enter bank UTR / reference',
          required: true,
          minLength: 6,
        }}
        isSubmitting={releaseMutation.isPending}
        onClose={() => setNoteModal(null)}
        onSubmit={(adminNote, bankReference) => {
          if (!bankReference) {
            toast.error('Bank transfer reference (UTR) is required')
            return
          }
          releaseMutation.mutate(
            { id: payout._id, adminNote, bankReference },
            {
              onSuccess: () => {
                toast.success('Payout marked as paid')
                setNoteModal(null)
                void refetch()
              },
              onError: (err) => {
                const msg =
                  (err as { response?: { data?: { message?: string } } })?.response?.data
                    ?.message || 'Release failed'
                toast.error(msg)
                void refetch()
              },
            },
          )
        }}
      />
    </div>
  )
}
