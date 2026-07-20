import { ArrowLeft, CircleArrowDown, CircleArrowUp, ExternalLink } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

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
import { navigateBackOrFallback } from '@/shared/lib/navigation'

export function MembershipDetailsPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const [actionType, setActionType] = useState<
    'upgrade' | 'downgrade' | 'extend' | 'cancel' | null
  >(null)
  const [historyOpen, setHistoryOpen] = useState(false)

  const { data, isLoading } = useSubscription(id)
  const subscription = data?.data

  const upgradeMutation = useUpgradeSubscription()
  const downgradeMutation = useDowngradeSubscription()
  const extendMutation = useExtendSubscription()
  const cancelMutation = useCancelSubscription()

  if (isLoading) {
    return <p className="text-sm text-white/50">Loading membership details...</p>
  }

  if (!subscription) {
    return <p className="text-sm text-rose-300">Membership not found.</p>
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
          className="mt-1 rounded-[8px] p-1.5 text-white transition-colors hover:bg-white/5"
          aria-label="Go back"
        >
          <ArrowLeft className="size-5" strokeWidth={1.75} />
        </button>
        <div>
          <h1 className="text-[24px] leading-8 font-semibold text-white">Membership Details</h1>
          <p className="mt-1 text-[13px] leading-5 text-white/45">
            Membership Management / <span className="text-white">View Details</span>
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4">
        {/* Current Membership Details — Figma: #141414, 10px radius, ~258px */}
        <section className="rounded-[10px] bg-[#141414] px-6 pt-5 pb-6">
          <h2 className="text-[16px] leading-6 font-semibold text-white">
            Current Membership Details
          </h2>
          <p className="mt-0.5 text-[13px] leading-5 text-white/45">
            Manage user&apos;s membership plans
          </p>

          {/*
            Figma grid:
            Row 1: Plan ID | Plan Name | Billing Type | Purchased Price | Purchased On
            Row 2: Next billing date | Payment method | View Invoice
          */}
          <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-7 sm:grid-cols-3 lg:grid-cols-5">
            <DetailField label="Plan ID" value={subscription.subscriptionId} />
            <DetailField
              label="Plan Name"
              value={
                <span className="inline-flex items-center gap-1.5">
                  {subscription.planName}
                  <ExternalLink className="size-3.5 text-white" strokeWidth={1.75} />
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
                className="text-[14px] leading-5 font-medium text-white underline underline-offset-[3px] hover:text-white/80"
              >
                View Invoice
              </button>
            </div>
          </div>
        </section>

        {/* More Details — Figma: #141414, 10px radius, ~170px */}
        <section className="rounded-[10px] bg-[#141414] px-6 pt-5 pb-6">
          <h2 className="text-[16px] leading-6 font-semibold text-white">More Details</h2>
          <p className="mt-0.5 text-[13px] leading-5 text-white/45">
            Get more insights about membership
          </p>

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
                  <ExternalLink className="size-3.5 text-white" strokeWidth={1.75} />
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
                  className="text-[14px] leading-5 font-medium text-white underline underline-offset-[3px] hover:text-white/80"
                >
                  Check history
                </button>
              }
            />
          </div>
        </section>
      </div>

      {/* Bottom action bar — full-width #141414 strip, buttons right */}
      <div className="mt-6 flex items-center justify-end gap-3 rounded-[10px] bg-[#141414] px-5 py-4">
        <button
          type="button"
          onClick={() => setActionType('upgrade')}
          className="inline-flex h-10 items-center gap-2 rounded-[8px] bg-[#00A63E] px-4 text-[13px] font-semibold text-white transition-colors hover:bg-[#00b344] active:bg-[#009338]"
        >
          Upgrade Membership
          <CircleArrowUp className="size-5" strokeWidth={1.75} />
        </button>
        <button
          type="button"
          onClick={() => setActionType('downgrade')}
          className="inline-flex h-10 items-center gap-2 rounded-[8px] bg-[#FFD29D] px-4 text-[13px] font-semibold text-black transition-colors hover:bg-[#ffe0b5] active:bg-[#f4c48a]"
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
      <p className="mb-1.5 text-[12px] leading-4 text-white/45">{label}</p>
      <div className="text-[14px] leading-5 font-medium text-white">{value}</div>
    </div>
  )
}
