import { ArrowLeft, CircleArrowDown, CircleArrowUp, ExternalLink, Flag } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { EscalateMembershipUpgradeModal } from '../components/escalate-membership-upgrade-modal'
import { MembershipActionModals } from '../components/membership-action-modals'
import { MembershipHistoryModal } from '../components/membership-history-modal'
import {
  useCancelSubscription,
  useDowngradeSubscription,
  useExtendSubscription,
  useSubscription,
  useUpgradeSubscription,
} from '../hooks/use-membership-subscriptions'
import { formatCurrency, formatMembershipDateTime } from '../utils/membership-format'
import { useAuthStore } from '@/modules/auth/store/auth-store'
import { navigateBackOrFallback } from '@/shared/lib/navigation'

export function MembershipDetailsPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const isSuperAdmin = useAuthStore((state) => state.user?.isSuperAdmin)
  const [actionType, setActionType] = useState<
    'upgrade' | 'downgrade' | 'extend' | 'cancel' | null
  >(null)
  const [escalateOpen, setEscalateOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)

  const { data, isLoading } = useSubscription(id)
  const subscription = data?.data

  const upgradeMutation = useUpgradeSubscription()
  const downgradeMutation = useDowngradeSubscription()
  const extendMutation = useExtendSubscription()
  const cancelMutation = useCancelSubscription()

  if (isLoading) {
    return <p className="text-body-md text-muted">Loading membership details...</p>
  }

  if (!subscription) {
    return <p className="text-body-md text-brand-danger">Membership not found.</p>
  }

  const upgradedByLabel =
    subscription.upgradedBy === 'admin'
      ? 'Platform'
      : subscription.upgradedBy === 'partner'
        ? 'User'
        : (subscription.upgradedBy ?? 'User')

  const paymentMethod = subscription.paymentInfo?.paymentMethod || 'Credit Card'

  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col">
      <div className="mb-6 flex items-start gap-3">
        <button
          type="button"
          onClick={() => navigateBackOrFallback(navigate, '/memberships/experts')}
          className="radius-md text-brand-text mt-1 p-1.5 transition-colors hover:bg-white/5"
          aria-label="Go back"
        >
          <ArrowLeft className="size-5" strokeWidth={1.75} />
        </button>
        <div>
          <h1 className="text-h2 text-brand-text font-semibold">Membership Details</h1>
          <p className="text-body-md text-muted mt-1">
            Membership Management / <span className="text-brand-text">View Details</span>
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4">
        <section className="radius-lg bg-brand-surface px-6 pt-5 pb-6">
          <h2 className="text-body-lg text-brand-text font-semibold">Current Membership Details</h2>
          <p className="text-body-md text-muted mt-0.5">Manage user&apos;s membership plans</p>

          <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-7 sm:grid-cols-3 lg:grid-cols-5">
            <DetailField label="Plan ID" value={subscription.subscriptionId} />
            <DetailField
              label="Plan Name"
              value={
                <span className="inline-flex items-center gap-1.5">
                  {subscription.planName}
                  <ExternalLink className="text-brand-text size-3.5" strokeWidth={1.75} />
                </span>
              }
            />
            <DetailField label="Billing Type" value={subscription.billingCycleName} />
            <DetailField
              label="Purchased Price"
              value={formatCurrency(subscription.purchasedPrice)}
            />
            <DetailField
              label="Purchased On"
              value={formatMembershipDateTime(subscription.startedAt)}
            />
            <DetailField
              label="Next billing date"
              value={formatMembershipDateTime(subscription.nextBillingDate)}
            />
            <DetailField label="Payment method" value={paymentMethod} />
            <div className="flex items-end pb-0.5">
              <button
                type="button"
                onClick={() => toast.info('Invoice view coming soon')}
                className="text-body-md-semibold text-brand-text hover:text-brand-text/80 underline underline-offset-[3px]"
              >
                View Invoice
              </button>
            </div>
          </div>
        </section>

        <section className="radius-lg bg-brand-surface px-6 pt-5 pb-6">
          <h2 className="text-body-lg text-brand-text font-semibold">More Details</h2>
          <p className="text-body-md text-muted mt-0.5">Get more insights about membership</p>

          <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-7 sm:grid-cols-3 lg:grid-cols-5">
            <DetailField
              label="User ID"
              value={`USR-${String(subscription.partnerId).slice(-3).padStart(3, '0')}`}
            />
            <DetailField
              label="Username"
              value={
                <span className="inline-flex items-center gap-1.5">
                  {subscription.partnerName}
                  <ExternalLink className="text-brand-text size-3.5" strokeWidth={1.75} />
                </span>
              }
            />
            <DetailField
              label="Source App"
              value={subscription.sourceApp === 'expert' ? 'Expert App' : 'User App'}
            />
            <DetailField label="Upgraded by" value={upgradedByLabel} />
            <DetailField
              label="Previous Membership"
              value={
                <button
                  type="button"
                  onClick={() => setHistoryOpen(true)}
                  className="text-body-md-semibold text-brand-text hover:text-brand-text/80 underline underline-offset-[3px]"
                >
                  Check history
                </button>
              }
            />
          </div>
        </section>
      </div>

      <div className="radius-lg bg-brand-surface mt-6 flex flex-wrap items-center justify-end gap-3 px-5 py-4">
        {isSuperAdmin ? (
          <button
            type="button"
            onClick={() => setEscalateOpen(true)}
            className="ui-cta ui-cta-secondary inline-flex h-10 items-center gap-2 px-4"
          >
            Escalate Upgrade
            <Flag className="size-4" strokeWidth={1.75} />
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => setActionType('upgrade')}
          className="ui-cta ui-cta-positive inline-flex h-10 items-center gap-2 px-4"
        >
          Upgrade Membership
          <CircleArrowUp className="size-5" strokeWidth={1.75} />
        </button>
        <button
          type="button"
          onClick={() => setActionType('downgrade')}
          className="ui-cta ui-cta-primary inline-flex h-10 items-center gap-2 px-4"
        >
          Downgrade Membership
          <CircleArrowDown className="size-5" strokeWidth={1.75} />
        </button>
      </div>

      <MembershipHistoryModal
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        subscription={subscription}
      />

      <EscalateMembershipUpgradeModal
        open={escalateOpen}
        subscription={subscription}
        onClose={() => setEscalateOpen(false)}
      />

      <MembershipActionModals
        subscription={subscription}
        action={actionType}
        onClose={() => setActionType(null)}
        isSubmitting={
          upgradeMutation.isPending ||
          downgradeMutation.isPending ||
          extendMutation.isPending ||
          cancelMutation.isPending
        }
        onUpgrade={async (payload) => {
          try {
            await upgradeMutation.mutateAsync({
              id: subscription._id,
              payload: { ...payload, updatedBy: 'Admin' },
            })
            toast.success('Membership upgraded')
            setActionType(null)
          } catch {
            toast.error('Failed to upgrade membership')
          }
        }}
        onDowngrade={async (payload) => {
          try {
            await downgradeMutation.mutateAsync({
              id: subscription._id,
              payload: { ...payload, updatedBy: 'Admin' },
            })
            toast.success('Membership downgraded')
            setActionType(null)
          } catch {
            toast.error('Failed to downgrade membership')
          }
        }}
        onExtend={async (payload) => {
          try {
            await extendMutation.mutateAsync({
              id: subscription._id,
              payload: { ...payload, updatedBy: 'Admin' },
            })
            toast.success('Membership extended')
            setActionType(null)
          } catch {
            toast.error('Failed to extend membership')
          }
        }}
        onCancel={async (payload) => {
          try {
            await cancelMutation.mutateAsync({
              id: subscription._id,
              payload: { ...payload, updatedBy: 'Admin' },
            })
            toast.success('Membership cancelled')
            setActionType(null)
          } catch {
            toast.error('Failed to cancel membership')
          }
        }}
      />
    </div>
  )
}

function DetailField({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-body-sm text-muted mb-1.5">{label}</p>
      <div className="text-body-md-semibold text-brand-text">{value}</div>
    </div>
  )
}
