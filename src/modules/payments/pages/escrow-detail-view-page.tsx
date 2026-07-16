import type { ReactNode } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { getEscrowDetailById } from '@/modules/payments/mock/escrow-detail.mock'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'
import { navigateBackOrFallback } from '@/shared/lib/navigation'

function InnerCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-white/[0.06] bg-[#121212] p-5">
      <h3 className="mb-3 text-[14px] font-bold text-white">{title}</h3>
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
      <span className="text-[12px] text-[#888888]">{label}</span>
      <span className={cn('text-right text-[12px] font-medium text-white', valueClassName)}>
        {value}
      </span>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const isActive = status === 'Active' || status === 'Released'
  return (
    <span
      className={cn(
        'inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold',
        isActive
          ? 'border-emerald-500/25 bg-emerald-600/20 text-emerald-400'
          : 'border-amber-600/25 bg-amber-600/15 text-amber-400',
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
    <div className="flex flex-col gap-5">
      <header>
        <button
          type="button"
          onClick={() => navigateBackOrFallback(navigate, '/finance/escrow')}
          className="group flex w-fit items-center gap-2 text-[20px] font-bold tracking-tight text-white transition-colors hover:text-[#FBC078]"
        >
          <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-1" />
          <span>Escrow Detail View</span>
        </button>
        <p className="mt-2 pl-7 text-[12px] text-[#777777]">
          <Link to="/finance/dashboard" className="transition-colors hover:text-white">
            Finance Management
          </Link>
          <span> / </span>
          <span className="font-semibold text-white">Escrow View Details</span>
        </p>
      </header>

      <section className="rounded-xl border border-white/[0.06] bg-[#1A1A1A] p-5">
        <div className="mb-4">
          <h2 className="text-[14px] font-bold text-white">Escrow Hold Details</h2>
          <p className="mt-1 text-[12px] text-[#888888]">Provide details about your Consultation</p>
        </div>
        <div className="mb-5 border-b border-white/5" />

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
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

          <InnerCard title="Parties">
            <DetailRow label="Client" value={detail.parties.client} />
            <DetailRow label="Expert" value={detail.parties.expert} />
          </InnerCard>

          <InnerCard title="Release Information">
            <p className="text-[12px] text-white">
              Expected release date:{' '}
              <span className="font-medium">{detail.releaseInformation.expectedReleaseDate}</span>
            </p>
          </InnerCard>

          <InnerCard title="Financial Details">
            <DetailRow label="Escrow Amount" value={detail.financialDetails.escrowAmount} />
            <DetailRow label="Platform Fee" value={detail.financialDetails.platformFee} />
            <DetailRow
              label="Release Amount"
              value={detail.financialDetails.releaseAmount}
              valueClassName="font-bold"
            />
          </InnerCard>
        </div>
      </section>

      <footer className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-[#1A1A1A] px-5 py-4">
        <Button
          variant="secondary"
          onClick={() => navigateBackOrFallback(navigate, '/finance/escrow')}
        >
          Close
        </Button>
        <Button onClick={() => toast.message('Download invoice coming soon')}>
          Download Invoice
        </Button>
      </footer>
    </div>
  )
}
