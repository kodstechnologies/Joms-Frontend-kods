import { useState, type ReactNode } from 'react'
import { ArrowLeft, Download } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { useBranding } from '@/app/providers/use-branding'
import { AddFinanceNoteModal } from '@/modules/payments/components/add-finance-note-modal'
import { fetchPartnerDisplayNames } from '@/modules/payments/api/partner-lookup-api'
import {
  useFinancePayout,
  useReleasePayout,
  useRetryPayout,
} from '@/modules/payments/hooks/use-finance'
import {
  formatDate,
  formatInr,
  mapPayoutStatus,
  titleCase,
} from '@/modules/payments/utils/finance-mappers'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'
import { navigateBackOrFallback } from '@/shared/lib/navigation'
import { downloadInvoiceDocument, invoiceFromFinancePayout } from '@/shared/utils/invoice-document'

const cardClass = 'radius-lg border border-white/[0.06] bg-brand-surface p-4 sm:p-5'
const sectionTitleClass = 'text-body-md-semibold text-brand-text leading-[20px]'
const sectionSubtitleClass = 'text-body-sm text-muted mt-1 leading-[20px]'
const labelClass = 'text-body-sm text-muted'
const valueClass = 'text-body-sm-medium text-brand-text'

function DetailCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className={cn(cardClass, 'p-5')}>
      <h2 className={cn(sectionTitleClass, 'mb-4')}>{title}</h2>
      {children}
    </section>
  )
}

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/5 py-3 last:border-b-0">
      <span className={labelClass}>{label}</span>
      <span className={cn(valueClass, 'text-right')}>{value}</span>
    </div>
  )
}

function getStatusBadgeClass(status: string) {
  if (status === 'Completed')
    return 'border-brand-positive/25 bg-brand-positive/10 text-brand-positive'
  if (status === 'Pending') return 'border-brand-accent/40 bg-brand-accent/10 text-brand-accent'
  return 'border-brand-danger/25 bg-brand-danger/10 text-brand-danger'
}

const maskAccount = (value?: string | null) => {
  if (!value) return '—'
  const digits = value.replace(/\s/g, '')
  if (digits.length < 4) return value
  return `**** ${digits.slice(-4)}`
}

export function PayoutDetailViewPage() {
  const navigate = useNavigate()
  const { id = '' } = useParams<{ id: string }>()
  const { logoUrl } = useBranding()
  const { data, isLoading, isError, isFetching, refetch } = useFinancePayout(id)
  const retryMutation = useRetryPayout()
  const releaseMutation = useReleasePayout()
  const [noteModal, setNoteModal] = useState<'retry' | 'release' | null>(null)
  const payout = data?.data
  const status = payout ? mapPayoutStatus(payout.status) : 'Pending'

  const partnerId = payout?.partnerId ? String(payout.partnerId) : ''
  const needsPartnerLookup = Boolean(partnerId) && !payout?.partnerName?.trim()
  const { data: partnerNameMap } = useQuery({
    queryKey: ['partner-display-names', partnerId],
    queryFn: () => fetchPartnerDisplayNames([partnerId]),
    enabled: needsPartnerLookup,
  })

  if (isLoading && !payout) {
    return <p className="text-body-sm text-muted">Loading payout details...</p>
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

  const partnerLabel =
    (payout.partnerName && payout.partnerName.trim()) ||
    (partnerId ? partnerNameMap?.[partnerId] : null) ||
    '—'

  const canRetry = payout.status === 'failed'
  const canRelease = ['scheduled', 'pending_approval', 'failed'].includes(payout.status)
  const gross = payout.fees?.grossAmount
  const commission = payout.fees?.platformCommission ?? 0
  const netPayable = payout.fees?.netPayable

  return (
    <div className="bg-brand-bg flex flex-col gap-5 pb-6">
      <header>
        <button
          type="button"
          onClick={() => navigateBackOrFallback(navigate, '/finance/payouts')}
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
          <Link to="/finance/payouts" className="hover:text-brand-text transition-colors">
            Payout Management
          </Link>
          <span> / </span>
          <span className="text-brand-text font-semibold">Payment View Details</span>
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
                    recipientName: typeof partnerLabel === 'string' ? partnerLabel : undefined,
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
            {canRetry ? (
              <Button className="ui-cta" onClick={() => setNoteModal('retry')}>
                Retry Payout
              </Button>
            ) : null}
            {canRelease ? (
              <Button className="ui-cta ui-cta-secondary" onClick={() => setNoteModal('release')}>
                Release Payout
              </Button>
            ) : (
              <Button className="ui-cta" disabled>
                {status === 'Completed' ? 'Paid' : status}
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <DetailCard title="Payout Information">
            <DetailRow label="Payout ID" value={payout.payoutId} />
            <DetailRow label="Recipient" value={partnerLabel} />
            <DetailRow label="Type" value={titleCase(payout.module)} />
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
            <DetailRow label="Scheduled Date" value={formatDate(payout.scheduledAt)} />
          </DetailCard>

          <div className="flex flex-col gap-5">
            <DetailCard title="Financial Details">
              <DetailRow label="Payout Amount" value={formatInr(gross)} />
              <DetailRow label="Commission Deducted" value={formatInr(commission)} />
              <DetailRow label="Minimum Threshold" value={formatInr(netPayable)} />
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
