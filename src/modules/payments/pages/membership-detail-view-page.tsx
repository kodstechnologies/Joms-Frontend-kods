import { useState } from 'react'
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
import { navigateBackOrFallback } from '@/shared/lib/navigation'
import {
  FinanceDetailCard as DetailCard,
  FinanceDetailRow as DetailRow,
  FinanceDetailShell,
} from '@/modules/payments/components/finance-detail-layout'
import { FinanceStatusBadge } from '@/modules/payments/components/finance-status-badge'
import { financeMembershipStatusClass } from '@/modules/payments/utils/finance-status-tones'
import {
  downloadInvoiceDocument,
  invoiceFromMembershipSubscription,
} from '@/shared/utils/invoice-document'

const sectionTitleClass = 'text-h4 text-brand-text leading-[26px]'
const sectionSubtitleClass = 'text-body-sm text-muted mt-1 leading-[20px]'

function getErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message
    if (typeof message === 'string' && message.trim()) return message
  }
  if (error instanceof Error && error.message) return error.message
  return fallback
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

      <FinanceDetailShell>
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
            Download Filing Report
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <DetailCard title="Subscription Information">
            <DetailRow label="Subscription ID" value={detail.subscriptionId} />
            <DetailRow label="Plan" value={detail.plan} />
            <DetailRow label="Start Date" value={detail.startDate} />
            <DetailRow
              label="Status"
              value={
                <FinanceStatusBadge
                  status={detail.status}
                  toneClass={financeMembershipStatusClass(detail.status)}
                />
              }
            />
          </DetailCard>

          <DetailCard title="Billing Details">
            <DetailRow label="Billing Cycle" value={detail.billingCycle} />
            <DetailRow label="Amount" value={detail.amount} />
            <DetailRow label="Payment Method" value={detail.paymentMethod} />
            <DetailRow label="Last Payment" value={detail.lastPayment} />
            <DetailRow label="Next Renewal" value={detail.nextRenewal} />
          </DetailCard>

          <DetailCard title="User Details">
            <DetailRow label="User Name" value={detail.userName} />
            <DetailRow label="User ID" value={detail.userId} />
            <DetailRow label="User Type" value={detail.userType} />
          </DetailCard>

          <DetailCard title="Plan Features">
            {detail.planFeatures.length ? (
              <ul className="space-y-3">
                {detail.planFeatures.map((feature) => (
                  <li
                    key={feature}
                    className="text-body-md text-brand-text flex items-start gap-2 leading-[22px]"
                  >
                    <Check className="text-brand-text mt-0.5 size-5 shrink-0" strokeWidth={2.5} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-body-md text-muted">No plan features available.</p>
            )}
          </DetailCard>
        </div>

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
      </FinanceDetailShell>

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
