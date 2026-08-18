import { useState, type ReactNode } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

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

const cardClass = 'radius-lg border border-white/[0.06] bg-brand-surface p-4 sm:p-5'
const sectionTitleClass = 'text-body-md-semibold text-brand-text leading-[20px]'
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

export function PayoutDetailViewPage() {
  const navigate = useNavigate()
  const { id = '' } = useParams<{ id: string }>()
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
        <p className="text-body-sm text-muted mt-2 pl-7 leading-5">
          <Link to="/finance/dashboard" className="hover:text-brand-text transition-colors">
            Finance Management
          </Link>
          <span> / </span>
          <Link to="/finance/payouts" className="hover:text-brand-text transition-colors">
            Payout Management
          </Link>
          <span> / </span>
          <span className="text-brand-text font-semibold">Payout Details</span>
          {isFetching ? <span className="text-muted ml-2 text-xs">(updating…)</span> : null}
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
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

      <div className="grid gap-4 lg:grid-cols-2">
        <DetailCard title="Payout Information">
          <DetailRow label="Payout ID" value={payout.payoutId} />
          <DetailRow label="Partner" value={partnerLabel} />
          <DetailRow label="Module" value={titleCase(payout.module)} />
          <DetailRow label="Pricing Type" value={titleCase(payout.pricingType)} />
          <DetailRow label="Net Payable" value={formatInr(payout.fees?.netPayable)} />
          <DetailRow label="Gross" value={formatInr(payout.fees?.grossAmount)} />
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
          <DetailRow label="Scheduled" value={formatDate(payout.scheduledAt)} />
          <DetailRow label="Paid At" value={formatDate(payout.paidAt)} />
          <DetailRow label="Failure Reason" value={payout.failureReason || '—'} />
        </DetailCard>
      </div>

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
        description="Add an admin note to confirm releasing this payout."
        placeholder="Enter release note"
        submitLabel="Release Payout"
        submittingLabel="Releasing..."
        isSubmitting={releaseMutation.isPending}
        onClose={() => setNoteModal(null)}
        onSubmit={(adminNote) => {
          releaseMutation.mutate(
            { id: payout._id, adminNote },
            {
              onSuccess: () => {
                toast.success('Payout released')
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
