import type { ReactNode } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { getEscrowDetailById } from '@/modules/payments/mock/escrow-detail.mock'
import { cn } from '@/shared/lib/cn'
import { navigateBackOrFallback } from '@/shared/lib/navigation'

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
  const isActive = status === 'Active' || status === 'Released'
  return (
    <span
      className={cn(
        'text-body-sm-semibold inline-flex rounded-full border px-2.5 py-0.5',
        isActive
          ? 'border-brand-positive/25 bg-brand-positive/10 text-brand-positive'
          : 'border-brand-accent/40 bg-brand-accent/10 text-brand-accent',
      )}
    >
      {status}
    </span>
  )
}

export function EscrowDetailViewPage() {
  const navigate = useNavigate()
  const { id = 'escrow-escrow-01' } = useParams<{ id: string }>()
  const detail = getEscrowDetailById(id)

  return (
    <div className="bg-brand-bg flex flex-col gap-5 pb-6">
      <header>
        <button
          type="button"
          onClick={() => navigateBackOrFallback(navigate, '/finance/escrow')}
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
          <span className="text-brand-text font-semibold">Escrow View Details</span>
        </p>
      </header>

      <section className={cn(cardClass, 'p-5')}>
        <div className="mb-4">
          <h2 className={sectionTitleClass}>Escrow Hold Details</h2>
          <p className={sectionSubtitleClass}>Provide details about your Consultation</p>
        </div>
        <div className="mb-5 border-b border-white/5" />

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <div className="flex flex-col gap-5">
            <InnerCard title="Escrow Information">
              <DetailRow label="Escrow ID" value={detail.escrowInformation.escrowId} />
              <DetailRow label="Transaction ID" value={detail.escrowInformation.transactionId} />
              <DetailRow label="Type" value={detail.escrowInformation.type} />
              <DetailRow
                label="Status"
                value={<StatusBadge status={detail.escrowInformation.status} />}
              />
              <DetailRow label="Created On" value={detail.escrowInformation.createdOn} />
              <DetailRow label="Days in Escrow" value={detail.escrowInformation.daysInEscrow} />
            </InnerCard>

            <InnerCard title="Release Information">
              <p className="text-body-sm text-brand-text">
                Expected release date:{' '}
                <span className="text-body-sm-medium">
                  {detail.releaseInformation.expectedReleaseDate}
                </span>
              </p>
            </InnerCard>
          </div>

          <div className="flex flex-col gap-5">
            <InnerCard title="Parties">
              <DetailRow label="Client" value={detail.parties.client} />
              <DetailRow label="Expert" value={detail.parties.expert} />
            </InnerCard>

            <InnerCard title="Financial Details">
              <DetailRow label="Escrow Amount" value={detail.financialDetails.escrowAmount} />
              <DetailRow label="Platform Fee" value={detail.financialDetails.platformFee} />
              <DetailRow
                label="Release Amount"
                value={detail.financialDetails.releaseAmount}
                valueClassName="text-body-sm-semibold"
              />
            </InnerCard>
          </div>
        </div>
      </section>

      <footer className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigateBackOrFallback(navigate, '/finance/escrow')}
          className="ui-cta ui-cta-secondary"
        >
          Close
        </button>
        <button
          type="button"
          onClick={() => toast.message('Download invoice coming soon')}
          className="ui-cta ui-cta-primary"
        >
          Download Invoice
        </button>
      </footer>
    </div>
  )
}
