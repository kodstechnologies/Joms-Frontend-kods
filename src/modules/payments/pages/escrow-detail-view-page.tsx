import { useState, type ReactNode } from 'react'
import { ArrowLeft, Download, Flag, SquarePen } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/shared/lib/api-error'

import { useBranding } from '@/app/providers/use-branding'
import { AddFinanceNoteModal } from '@/modules/payments/components/add-finance-note-modal'
import { FinanceInternalNotesCard } from '@/modules/payments/components/finance-internal-notes-card'
import { fetchPartnerDisplayNames } from '@/modules/payments/api/partner-lookup-api'
import {
  useAddFinanceNote,
  useFinanceEscrowDetail,
  useReleaseEscrow,
} from '@/modules/payments/hooks/use-finance'
import { escalateUrl } from '@/modules/payments/utils/finance-escalate'
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
import { downloadInvoiceDocument, invoiceFromEscrow } from '@/shared/utils/invoice-document'
import {
  FinanceDetailRow as DetailRow,
  FinanceDetailShell,
  financeDetailCardClass,
} from '@/modules/payments/components/finance-detail-layout'
import { FinanceStatusBadge } from '@/modules/payments/components/finance-status-badge'
import { financeEscrowStatusClass } from '@/modules/payments/utils/finance-status-tones'

const cardClass = financeDetailCardClass
const sectionTitleClass = 'text-body-md-semibold text-brand-text leading-[20px]'
const sectionSubtitleClass = 'text-body-sm text-muted mt-1 leading-[20px]'

function InnerCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className={cn(cardClass, 'p-5')}>
      <h3 className={cn(sectionTitleClass, 'mb-3')}>{title}</h3>
      <div className="mb-4 border-b border-white/5" />
      {children}
    </section>
  )
}

export function EscrowDetailViewPage() {
  const navigate = useNavigate()
  const { id = '' } = useParams<{ id: string }>()
  const { logoUrl } = useBranding()
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
    void downloadInvoiceDocument(
      invoiceFromEscrow(escrow, {
        logoUrl,
        expertName: typeof expertName === 'string' ? expertName : undefined,
      }),
      escrow.escrowId,
    )
      .then(() => toast.success('Invoice downloaded'))
      .catch((error) => toast.error(getApiErrorMessage(error, 'Failed to download invoice')))
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
            Payment &amp; Finance
          </Link>
          <span> / </span>
          <Link to="/finance/services" className="hover:text-brand-text transition-colors">
            Service
          </Link>
          <span> / </span>
          <span className="text-brand-text font-semibold">Escrow View Details</span>
        </p>
      </header>

      <FinanceDetailShell>
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
              <Button
                type="button"
                variant="secondary"
                onClick={() =>
                  navigate(
                    escalateUrl(escrow._id, {
                      kind: 'resource',
                      resourceType: 'EscrowHold',
                      returnTo: `/finance/escrow/${id}`,
                    }),
                  )
                }
              >
                <Flag className="size-4" />
                Escalate
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
                <DetailRow
                  label="Status"
                  value={
                    <FinanceStatusBadge
                      status={status}
                      toneClass={financeEscrowStatusClass(status)}
                    />
                  }
                />
                <DetailRow label="Created On" value={formatDate(heldAt)} />
                <DetailRow label="Days in Escrow" value={`${daysInEscrow} Days`} />
              </InnerCard>

              <InnerCard title="Release Information">
                <p className="text-body-sm text-brand-text">
                  Expected release date:{' '}
                  <span className="text-body-sm-medium">
                    {formatDate(escrow.expectedReleaseAt)}
                  </span>
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
      </FinanceDetailShell>

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
              onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to save note')),
            },
          )
        }}
      />
    </div>
  )
}
