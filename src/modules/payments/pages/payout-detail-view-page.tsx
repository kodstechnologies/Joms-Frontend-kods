import type { ReactNode } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { getPayoutDetailById } from '@/modules/payments/mock/payout-detail.mock'
import { cn } from '@/shared/lib/cn'
import { navigateBackOrFallback } from '@/shared/lib/navigation'

const cardClass = 'radius-lg border border-white/[0.06] bg-brand-surface p-4 sm:p-5'
const sectionTitleClass = 'text-body-md-semibold text-brand-text'
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
  const { id = 'payout-01' } = useParams<{ id: string }>()
  const detail = getPayoutDetailById(id)

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
        <p className="text-body-sm text-muted mt-2 pl-7">
          <Link to="/finance/dashboard" className="hover:text-brand-text transition-colors">
            Finance Management
          </Link>
          <span> / </span>
          <Link to="/finance/payouts" className="hover:text-brand-text transition-colors">
            Payout Management
          </Link>
          <span> / </span>
          <span className="text-brand-text font-semibold">Payment View Details</span>
        </p>
      </header>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <DetailCard title="Payout Information">
          <DetailRow label="Payout ID" value={detail.payoutId} />
          <DetailRow label="Recipient" value={detail.recipient} />
          <DetailRow label="Type" value={detail.type} />
          <DetailRow
            label="Status"
            value={
              <span
                className={cn(
                  'text-body-sm-semibold inline-flex rounded-full border px-2.5 py-0.5',
                  getStatusBadgeClass(detail.status),
                )}
              >
                {detail.status}
              </span>
            }
          />
          <DetailRow label="Initiated Date" value={detail.initiatedDate} />
        </DetailCard>

        <DetailCard title="Financial Details">
          <DetailRow label="Payout Amount" value={detail.payoutAmount} />
          <DetailRow label="Commission Deducted" value={detail.commissionDeducted} />
          <DetailRow label="Net Revenue" value={detail.netRevenue} />
        </DetailCard>
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
    </div>
  )
}
