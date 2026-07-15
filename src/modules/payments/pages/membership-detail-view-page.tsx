import { useState } from 'react'
import type { ReactNode } from 'react'
import axios from 'axios'
import { ArrowLeft, Check, Download } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import {
  useCancelSubscription,
  usePauseSubscription,
  useSubscription,
} from '@/modules/memberships/hooks/use-membership-subscriptions'
import { CancelSubscriptionModal } from '@/modules/payments/components/cancel-subscription-modal'
import { PauseSubscriptionModal } from '@/modules/payments/components/pause-subscription-modal'
import { mapSubscriptionToFinanceDetail } from '@/modules/payments/utils/finance-membership-mapper'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'

function getErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message
    if (typeof message === 'string' && message.trim()) return message
  }
  if (error instanceof Error && error.message) return error.message
  return fallback
}

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
  if (status === 'Expired') return 'border-blue-500/25 bg-blue-500/10 text-blue-300'
  return 'border-rose-500/25 bg-rose-500/10 text-rose-400'
}

export function MembershipDetailViewPage() {
  const navigate = useNavigate()
  const { id = '' } = useParams<{ id: string }>()
  const [pauseOpen, setPauseOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)

  const { data, isLoading, isError } = useSubscription(id)
  const pauseMutation = usePauseSubscription()
  const cancelMutation = useCancelSubscription()

  const detail = data?.data ? mapSubscriptionToFinanceDetail(data.data) : null
  const canManage = detail?.rawStatus === 'active'

  if (isLoading) {
    return <p className="text-sm text-slate-400">Loading subscription details...</p>
  }

  if (isError || !detail) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-rose-300">Membership subscription not found.</p>
        <Button variant="secondary" onClick={() => navigate('/finance/memberships')}>
          Back to Memberships
        </Button>
      </div>
    )
  }

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
            {detail.planFeatures.length ? (
              <ul className="space-y-2">
                {detail.planFeatures.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-[12px] text-[#CCCCCC]">
                    <Check className="mt-0.5 size-3.5 shrink-0 text-emerald-400" />
                    {feature}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[12px] text-[#888888]">No plan features available.</p>
            )}
          </section>
        </div>
      </DetailCard>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="secondary" onClick={() => navigate('/finance/memberships')}>
          Close
        </Button>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            disabled={!canManage || pauseMutation.isPending}
            onClick={() => setPauseOpen(true)}
          >
            Pause Subscription
          </Button>
          <Button
            className="bg-rose-600 hover:bg-rose-500"
            disabled={
              detail.rawStatus === 'cancelled' ||
              detail.rawStatus === 'expired' ||
              cancelMutation.isPending
            }
            onClick={() => setCancelOpen(true)}
          >
            Cancel Subscription
          </Button>
        </div>
      </div>

      <PauseSubscriptionModal
        open={pauseOpen}
        userName={detail.userName}
        isSubmitting={pauseMutation.isPending}
        onClose={() => setPauseOpen(false)}
        onConfirm={async (payload) => {
          try {
            await pauseMutation.mutateAsync({
              id: detail.id,
              payload: { ...payload, updatedBy: 'Admin' },
            })
            toast.success('Subscription paused')
            setPauseOpen(false)
          } catch (error) {
            toast.error(getErrorMessage(error, 'Failed to pause subscription'))
          }
        }}
      />
      <CancelSubscriptionModal
        open={cancelOpen}
        userName={detail.userName}
        isSubmitting={cancelMutation.isPending}
        onClose={() => setCancelOpen(false)}
        onConfirm={async (payload) => {
          try {
            await cancelMutation.mutateAsync({
              id: detail.id,
              payload: { ...payload, updatedBy: 'Admin' },
            })
            toast.success('Subscription cancelled')
            setCancelOpen(false)
          } catch (error) {
            toast.error(getErrorMessage(error, 'Failed to cancel subscription'))
          }
        }}
      />
    </div>
  )
}
