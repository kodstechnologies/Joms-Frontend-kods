import { useState, type ReactNode } from 'react'
import { ArrowLeft, Download, SquarePen } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { AddFinanceNoteModal } from '@/modules/payments/components/add-finance-note-modal'
import { FinanceInternalNotesCard } from '@/modules/payments/components/finance-internal-notes-card'
import { fetchPartnerDisplayNames } from '@/modules/payments/api/partner-lookup-api'
import {
  useAddFinanceNote,
  useFinanceEscrowDetail,
  useReleaseEscrow,
} from '@/modules/payments/hooks/use-finance'
import {
  formatDate,
  formatInr,
  mapEscrowStatus,
  titleCase,
} from '@/modules/payments/utils/finance-mappers'
import { PermissionGate } from '@/modules/rbac/components/permission-gate'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'
import { navigateBackOrFallback } from '@/shared/lib/navigation'
import { PERMISSION_LEVELS } from '@/shared/lib/permissions'

const cardClass = 'radius-lg border border-white/[0.06] bg-brand-surface p-4 sm:p-5'
const sectionTitleClass = 'text-body-md-semibold text-brand-text leading-[20px]'
const sectionSubtitleClass = 'text-body-sm text-muted mt-1 leading-[20px]'
const labelClass = 'text-body-sm text-muted'
const valueClass = 'text-body-sm-medium text-brand-text'

function InnerCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className={cn(cardClass, 'p-5')}>
      <h3 className={cn(sectionTitleClass, 'mb-3')}>{title}</h3>
      <div className="mb-4 border-b border-white/5" />
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
      <span className={labelClass}>{label}</span>
      <span className={cn('text-right', valueClass, valueClassName)}>{value}</span>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const isReleased = status === 'Released'
  const isActive = status === 'Active'
  return (
    <span
      className={cn(
        'text-body-sm-semibold inline-flex rounded-full border px-2.5 py-0.5',
        isReleased
          ? 'border-brand-positive/25 bg-brand-positive/10 text-brand-positive'
          : isActive
            ? 'border-brand-accent/40 bg-brand-accent/10 text-brand-accent'
            : 'border-brand-danger/25 bg-brand-danger/10 text-brand-danger',
      )}
    >
      {status}
    </span>
  )
}

export function EscrowDetailViewPage() {
  const navigate = useNavigate()
  const { id = '' } = useParams<{ id: string }>()
  const { data, isLoading, isError, refetch } = useFinanceEscrowDetail(id)
  const releaseMutation = useReleaseEscrow()
  const noteMutation = useAddFinanceNote()
  const [activeModal, setActiveModal] = useState<'release' | 'note' | null>(null)
  const [now] = useState(() => Date.now())
  const escrow = data?.data
  const status = escrow ? mapEscrowStatus(escrow.status) : 'Active'
  const isHeld = escrow?.status === 'held'

  const partnerId = escrow?.partnerId ? String(escrow.partnerId) : ''
  const { data: partnerNameMap } = useQuery({
    queryKey: ['partner-display-names', partnerId],
    queryFn: () => fetchPartnerDisplayNames([partnerId]),
    enabled: Boolean(partnerId) && !escrow?.partnerName,
  })

  if (isLoading) {
    return <p className="text-body-sm text-muted">Loading escrow details...</p>
  }

  if (isError || !escrow) {
    return (
      <div className="space-y-4">
        <p className="text-body-sm text-brand-danger">Escrow hold not found.</p>
        <button
          type="button"
          onClick={() => navigateBackOrFallback(navigate, '/finance/services')}
          className="ui-cta ui-cta-secondary"
        >
          Back to Services
        </button>
      </div>
    )
  }

  const heldAt = escrow.heldAt || escrow.createdAt
  const daysInEscrow = heldAt
    ? Math.max(0, Math.floor((now - new Date(heldAt).getTime()) / 86_400_000))
    : 0

  const clientName = escrow.userName || '—'
  const expertName = escrow.partnerName || (partnerId ? partnerNameMap?.[partnerId] : null) || '—'
  const transactionId = escrow.transactionId || escrow.paymentOrderId || String(escrow.paymentId)

  const handleDownloadInvoice = () => {
    if (escrow.invoicePdfUrl) {
      window.open(escrow.invoicePdfUrl, '_blank', 'noopener,noreferrer')
      return
    }
    const invoiceKey = escrow.invoiceId || escrow.invoiceNumber
    if (invoiceKey) {
      navigate(`/finance/invoices/${invoiceKey}`)
      return
    }
    toast.message('Invoice not available for this escrow yet')
  }

  return (
    <div className="bg-brand-bg flex flex-col gap-5 pb-6">
      <header>
        <button
          type="button"
          onClick={() => navigateBackOrFallback(navigate, '/finance/services')}
          className="group text-h3 hover:text-brand-accent text-brand-text flex w-fit items-center gap-2 tracking-tight transition-colors"
        >
          <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-1" />
          <span>Escrow Detail View</span>
        </button>
        <p className="text-body-sm text-muted mt-2 pl-7 leading-[20px]">
          <Link to="/finance/dashboard" className="hover:text-brand-text transition-colors">
            Finance Management
          </Link>
          <span> / </span>
          <Link to="/finance/services" className="hover:text-brand-text transition-colors">
            Service
          </Link>
          <span> / </span>
          <span className="text-brand-text font-semibold">Escrow View Details</span>
        </p>
      </header>

      <section className={cn(cardClass, 'p-5')}>
        <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className={sectionTitleClass}>Escrow Hold Details</h2>
            <p className={sectionSubtitleClass}>Hold details for custom / milestone settlement</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button type="button" variant="secondary" onClick={handleDownloadInvoice}>
              <Download className="size-4" />
              Download Invoice
            </Button>
            <Button type="button" variant="secondary" onClick={() => setActiveModal('note')}>
              <SquarePen className="size-4" />
              Add Internal Note
            </Button>
            {isHeld ? (
              <PermissionGate
                permission="finance.release_escrow"
                minLevel={PERMISSION_LEVELS.SECONDARY_APPROVAL}
              >
                <Button
                  type="button"
                  disabled={releaseMutation.isPending}
                  onClick={() => setActiveModal('release')}
                >
                  Release Escrow
                </Button>
              </PermissionGate>
            ) : null}
          </div>
        </div>
        <div className="mb-5 border-b border-white/5" />

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <div className="flex flex-col gap-5">
            <InnerCard title="Escrow Information">
              <DetailRow label="Escrow ID" value={escrow.escrowId} />
              <DetailRow label="Transaction ID" value={transactionId} />
              <DetailRow label="Type" value={titleCase(escrow.pricingType)} />
              <DetailRow label="Status" value={<StatusBadge status={status} />} />
              <DetailRow label="Created On" value={formatDate(heldAt)} />
              <DetailRow label="Days in Escrow" value={`${daysInEscrow} Days`} />
            </InnerCard>

            <InnerCard title="Release Information">
              <p className="text-body-sm text-brand-text">
                Expected release date:{' '}
                <span className="text-body-sm-medium">{formatDate(escrow.expectedReleaseAt)}</span>
              </p>
            </InnerCard>
          </div>

          <div className="flex flex-col gap-5">
            <InnerCard title="Parties">
              <DetailRow label="Client" value={clientName} />
              <DetailRow label="Expert" value={expertName} />
            </InnerCard>

            <InnerCard title="Financial Details">
              <DetailRow label="Escrow Amount" value={formatInr(escrow.amountHeld)} />
              <DetailRow label="Platform Fee" value={formatInr(escrow.platformFee ?? 0)} />
              <DetailRow
                label="Release Amount"
                value={formatInr(escrow.releaseAmount ?? escrow.amountHeld)}
                valueClassName="text-body-sm-semibold"
              />
            </InnerCard>
          </div>
        </div>
      </section>

      <FinanceInternalNotesCard resourceId={escrow._id} />

      <footer className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigateBackOrFallback(navigate, '/finance/services')}
          className="ui-cta ui-cta-secondary"
        >
          Close
        </button>
      </footer>

      <AddFinanceNoteModal
        open={activeModal === 'release'}
        title="Release Escrow"
        description="Add an admin note to confirm releasing this escrow hold to payout."
        placeholder="Enter release note"
        submitLabel="Release Escrow"
        submittingLabel="Releasing..."
        isSubmitting={releaseMutation.isPending}
        onClose={() => setActiveModal(null)}
        onSubmit={(adminNote) => {
          releaseMutation.mutate(
            { id: escrow._id, adminNote },
            {
              onSuccess: () => {
                toast.success('Escrow released to payout')
                setActiveModal(null)
                void refetch()
              },
              onError: (err) => {
                const msg =
                  (err as { response?: { data?: { message?: string } } })?.response?.data
                    ?.message || 'Failed to release escrow'
                toast.error(msg)
                if (/released_to_payout|cannot release/i.test(msg)) {
                  void refetch()
                  setActiveModal(null)
                }
              },
            },
          )
        }}
      />

      <AddFinanceNoteModal
        open={activeModal === 'note'}
        isSubmitting={noteMutation.isPending}
        onClose={() => setActiveModal(null)}
        onSubmit={(adminNote) => {
          noteMutation.mutate(
            { id: escrow._id, resourceType: 'EscrowHold', adminNote },
            {
              onSuccess: () => {
                toast.success('Note saved')
                setActiveModal(null)
              },
              onError: () => toast.error('Failed to save note'),
            },
          )
        }}
      />
    </div>
  )
}
