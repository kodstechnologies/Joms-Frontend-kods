import { useState } from 'react'
import type { ReactNode } from 'react'
import axios from 'axios'
import { ArrowLeft, Check, Download } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { useBranding } from '@/app/providers/use-branding'
import {
  useCancelSubscription,
  usePauseSubscription,
  useSubscription,
} from '@/modules/memberships/hooks/use-membership-subscriptions'
import { CancelSubscriptionModal } from '@/modules/payments/components/cancel-subscription-modal'
import { PauseSubscriptionModal } from '@/modules/payments/components/pause-subscription-modal'
import { mapSubscriptionToFinanceDetail } from '@/modules/payments/utils/finance-membership-mapper'
import { Button } from '@/shared/components/ui/button'
import { DetailViewSkeleton } from '@/shared/components/ui/skeleton'
import { cn } from '@/shared/lib/cn'
import { navigateBackOrFallback } from '@/shared/lib/navigation'
import {
  downloadInvoiceDocument,
  invoiceFromMembershipSubscription,
} from '@/shared/utils/invoice-document'

const cardClass = 'radius-lg border border-white/[0.06] bg-brand-surface p-4 sm:p-5'
const sectionTitleClass = 'text-body-md-semibold text-brand-text leading-[20px]'
const sectionSubtitleClass = 'text-body-sm text-muted mt-1 leading-[20px]'
const labelClass = 'text-body-sm text-muted'
const valueClass = 'text-body-sm-medium text-brand-text'
const innerPanelClass = 'radius-lg border border-white/[0.04] bg-brand-bg p-4'

function getErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message
    if (typeof message === 'string' && message.trim()) return message
  }
  if (error instanceof Error && error.message) return error.message
  return fallback
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
  if (status === 'Active')
    return 'border-brand-positive/25 bg-brand-positive/10 text-brand-positive'
  if (status === 'Paused') return 'border-brand-accent/40 bg-brand-accent/10 text-brand-accent'
  if (status === 'Expired') return 'border-white/15 bg-brand-bg text-muted'
  return 'border-brand-danger/25 bg-brand-danger/10 text-brand-danger'
}

export function MembershipDetailViewPage() {
  const navigate = useNavigate()
  const { id = '' } = useParams<{ id: string }>()
  const { logoUrl } = useBranding()
  const [pauseOpen, setPauseOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)

  const { data, isLoading, isError } = useSubscription(id)
  const pauseMutation = usePauseSubscription()
  const cancelMutation = useCancelSubscription()

  const subscription = data?.data
  const detail = subscription ? mapSubscriptionToFinanceDetail(subscription) : null
  const canManage = detail?.rawStatus === 'active'

  if (isLoading) {
    return <DetailViewSkeleton pillCount={6} cardCount={2} />
  }

  if (isError || !detail) {
    return (
      <div className="space-y-4">
        <p className="text-body-sm text-brand-danger">Membership subscription not found.</p>
        <button
          type="button"
          onClick={() => navigateBackOrFallback(navigate, '/finance/memberships')}
          className="ui-cta ui-cta-secondary"
        >
          Back to Memberships
        </button>
      </div>
    )
  }

  return (
    <div className="bg-brand-bg flex flex-col gap-5 pb-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <button
            type="button"
            onClick={() => navigateBackOrFallback(navigate, '/finance/memberships')}
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
            <span className="text-brand-text font-semibold">PaymentView Details</span>
          </p>
        </div>
      </header>

      <section className={cn(cardClass, 'flex flex-col gap-6 p-5')}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className={sectionTitleClass}>Subscription Details</h2>
            <p className={sectionSubtitleClass}>Provide details about your Consultation</p>
          </div>
          <Button
            onClick={() => {
              if (!subscription) return
              void downloadInvoiceDocument(
                invoiceFromMembershipSubscription(subscription, { logoUrl }),
                subscription.paymentInfo?.paymentId || subscription.subscriptionId,
              )
                .then(() => toast.success('Invoice downloaded'))
                .catch(() => toast.error('Failed to download invoice'))
            }}
          >
            <Download className="size-4" />
            Download Invoice
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <section className={innerPanelClass}>
            <h3 className="text-body-md-semibold text-brand-text mb-3">Subscription Information</h3>
            <DetailRow label="Subscription ID" value={detail.subscriptionId} />
            <DetailRow label="Plan" value={detail.plan} />
            <DetailRow label="Start Date" value={detail.startDate} />
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
          </section>

          <section className={innerPanelClass}>
            <h3 className="text-body-md-semibold text-brand-text mb-3">Billing Details</h3>
            <DetailRow label="Billing Cycle" value={detail.billingCycle} />
            <DetailRow label="Amount" value={detail.amount} />
            <DetailRow label="Payment Method" value={detail.paymentMethod} />
            <DetailRow label="Last Payment" value={detail.lastPayment} />
            <DetailRow label="Next Renewal" value={detail.nextRenewal} />
          </section>

          <section className={innerPanelClass}>
            <h3 className="text-body-md-semibold text-brand-text mb-3">User Details</h3>
            <DetailRow label="User Name" value={detail.userName} />
            <DetailRow label="User ID" value={detail.userId} />
            <DetailRow label="User Type" value={detail.userType} />
          </section>

          <section className={innerPanelClass}>
            <h3 className="text-body-md-semibold text-brand-text mb-3">Plan Features</h3>
            {detail.planFeatures.length ? (
              <ul className="space-y-2">
                {detail.planFeatures.map((feature) => (
                  <li
                    key={feature}
                    className="text-body-sm text-brand-text/80 flex items-start gap-2 leading-[17px]"
                  >
                    <Check className="text-brand-positive size-[20px] shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-body-sm text-muted">No plan features available.</p>
            )}
          </section>
        </div>
      </section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={() => navigateBackOrFallback(navigate, '/finance/memberships')}
          className="ui-cta ui-cta-secondary"
        >
          Close
        </button>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            disabled={!canManage || pauseMutation.isPending}
            onClick={() => setPauseOpen(true)}
            className="ui-cta ui-cta-primary"
          >
            Pause Subscription
          </button>
          <button
            type="button"
            disabled={
              detail.rawStatus === 'cancelled' ||
              detail.rawStatus === 'expired' ||
              cancelMutation.isPending
            }
            onClick={() => setCancelOpen(true)}
            className="ui-cta ui-cta-primary"
          >
            Cancel Subscription
          </button>
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
