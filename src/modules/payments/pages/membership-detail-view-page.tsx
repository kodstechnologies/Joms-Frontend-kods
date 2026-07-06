import { useState } from 'react'
import type { ReactNode } from 'react'
import { ArrowLeft, Check, Download } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { CancelSubscriptionModal } from '@/modules/payments/components/cancel-subscription-modal'
import { PauseSubscriptionModal } from '@/modules/payments/components/pause-subscription-modal'
import { getMembershipDetailById } from '@/modules/payments/mock/membership-detail.mock'
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
  if (status === 'Active') return 'border-emerald-500/25 bg-emerald-600/20 text-emerald-400'
  if (status === 'Paused') return 'border-amber-500/25 bg-amber-500/10 text-amber-400'
  return 'border-rose-500/25 bg-rose-500/10 text-rose-400'
}

export function MembershipDetailViewPage() {
  const navigate = useNavigate()
  const { id = 'sub-02' } = useParams<{ id: string }>()
  const detail = getMembershipDetailById(id)
  const [pauseOpen, setPauseOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <button
            type="button"
            onClick={() => navigate('/finance/memberships')}
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
            <Link to="/finance/memberships" className="transition-colors hover:text-white">
              Memberships
            </Link>
            <span> / </span>
            <span className="font-semibold text-white">Payment View Details</span>
          </p>
        </div>
        <Button onClick={() => toast.message('Download billing report coming soon')}>
          <Download className="size-4" />
          Download billing report
        </Button>
      </header>

      <DetailCard title="Subscription Details">
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <section className="rounded-lg border border-white/[0.04] bg-black/20 p-4">
            <h3 className="mb-3 text-[13px] font-semibold text-white">Subscription Information</h3>
            <DetailRow label="Subscription ID" value={detail.subscriptionId} />
            <DetailRow label="Plan" value={detail.plan} />
            <DetailRow label="Start Date" value={detail.startDate} />
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
          </section>

          <section className="rounded-lg border border-white/[0.04] bg-black/20 p-4">
            <h3 className="mb-3 text-[13px] font-semibold text-white">Billing Details</h3>
            <DetailRow label="Billing Cycle" value={detail.billingCycle} />
            <DetailRow label="Amount" value={detail.amount} />
            <DetailRow label="Payment Method" value={detail.paymentMethod} />
            <DetailRow label="Last Payment" value={detail.lastPayment} />
            <DetailRow label="Next Renewal" value={detail.nextRenewal} />
          </section>

          <section className="rounded-lg border border-white/[0.04] bg-black/20 p-4">
            <h3 className="mb-3 text-[13px] font-semibold text-white">User Details</h3>
            <DetailRow label="User Name" value={detail.userName} />
            <DetailRow label="User ID" value={detail.userId} />
            <DetailRow label="User Type" value={detail.userType} />
          </section>

          <section className="rounded-lg border border-white/[0.04] bg-black/20 p-4">
            <h3 className="mb-3 text-[13px] font-semibold text-white">Plan Features</h3>
            <ul className="space-y-2">
              {detail.planFeatures.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-[12px] text-[#CCCCCC]">
                  <Check className="mt-0.5 size-3.5 shrink-0 text-emerald-400" />
                  {feature}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </DetailCard>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="secondary" onClick={() => navigate('/finance/memberships')}>
          Close
        </Button>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button onClick={() => setPauseOpen(true)}>Pause Subscription</Button>
          <Button
            className="bg-rose-600 hover:bg-rose-500"
            onClick={() => setCancelOpen(true)}
          >
            Cancel Subscription
          </Button>
        </div>
      </div>

      <PauseSubscriptionModal
        open={pauseOpen}
        userName={detail.userName}
        onClose={() => setPauseOpen(false)}
      />
      <CancelSubscriptionModal
        open={cancelOpen}
        userName={detail.userName}
        onClose={() => setCancelOpen(false)}
      />
    </div>
  )
}
