import type { ReactNode } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { getPayoutDetailById } from '@/modules/payments/mock/payout-detail.mock'
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

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/5 py-3 last:border-b-0">
      <span className="text-[12px] text-[#888888]">{label}</span>
      <span className="text-right text-[12px] font-medium text-white">{value}</span>
    </div>
  )
}

function getStatusBadgeClass(status: string) {
  if (status === 'Completed') return 'border-emerald-500/25 bg-emerald-600/20 text-emerald-400'
  if (status === 'Pending') return 'border-amber-500/25 bg-amber-500/10 text-amber-400'
  return 'border-rose-500/25 bg-rose-500/10 text-rose-400'
}

export function PayoutDetailViewPage() {
  const navigate = useNavigate()
  const { id = 'payout-01' } = useParams<{ id: string }>()
  const detail = getPayoutDetailById(id)

  return (
    <div className="flex flex-col gap-5">
      <header>
        <button
          type="button"
          onClick={() => navigate('/finance/payouts')}
          className="group flex w-fit items-center gap-2 text-[20px] font-bold tracking-tight text-white transition-colors hover:text-[#FBC078]"
        >
          <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-1" />
          <span>Payment Detail View</span>
        </button>
        <p className="mt-2 pl-7 text-[12px] text-[#777777]">
          <Link to="/finance/dashboard" className="transition-colors hover:text-white">
            Finance Management
          </Link>
          <span> / </span>
          <Link to="/finance/payouts" className="transition-colors hover:text-white">
            Payout Management
          </Link>
          <span> / </span>
          <span className="font-semibold text-white">Payment View Details</span>
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
                  'inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold',
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
        <Button variant="secondary" onClick={() => navigate('/finance/payouts')}>
          Close
        </Button>
      </div>
    </div>
  )
}
