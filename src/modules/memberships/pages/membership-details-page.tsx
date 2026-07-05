import { ArrowDown, ArrowLeft, ArrowUp, ExternalLink } from 'lucide-react'
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
import {
  formatCurrency,
  formatMembershipDateTime,
} from '../utils/membership-format'
import { cn } from '@/shared/lib/cn'

export function MembershipDetailsPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const [actionType, setActionType] = useState<'upgrade' | 'downgrade' | 'extend' | 'cancel' | null>(null)
  const [historyOpen, setHistoryOpen] = useState(false)

  const { data, isLoading } = useSubscription(id)
  const subscription = data?.data

  const upgradeMutation = useUpgradeSubscription()
  const downgradeMutation = useDowngradeSubscription()
  const extendMutation = useExtendSubscription()
  const cancelMutation = useCancelSubscription()

  if (isLoading) {
    return <p className="text-sm text-slate-400">Loading membership details...</p>
  }

  if (!subscription) {
    return <p className="text-sm text-rose-300">Membership not found.</p>
  }

  const upgradedByLabel =
    subscription.upgradedBy === 'admin'
      ? 'Platform'
      : subscription.upgradedBy === 'partner'
        ? 'User'
        : subscription.upgradedBy ?? 'User'

  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col">
      <div className="mb-6 flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/memberships/experts')}
          className="rounded-lg p-2 text-slate-300 transition-colors hover:bg-white/5"
        >
          <ArrowLeft className="size-5" />
        </button>
        <div>
          <h1 className="text-2xl font-semibold text-white">Membership Details</h1>
          <p className="text-sm text-slate-400">Membership Management / View Details</p>
        </div>
      </div>

      <div className="grid flex-1 gap-6 lg:grid-cols-2">
        <DetailCard title="Current Membership Details" subtitle="Manage expert membership subscription">
          <DetailGrid
            items={[
              { label: 'Plan ID', value: subscription.subscriptionId },
              {
                label: 'Plan Name',
                value: (
                  <span className="inline-flex items-center gap-1.5 text-amber-300">
                    {subscription.planName}
                    <ExternalLink className="size-3.5" />
                  </span>
                ),
              },
              { label: 'Billing Type', value: subscription.billingCycleName },
              { label: 'Purchased Price', value: formatCurrency(subscription.purchasedPrice) },
              { label: 'Purchased On', value: formatMembershipDateTime(subscription.startedAt) },
              {
                label: 'Next billing date',
                value: formatMembershipDateTime(subscription.nextBillingDate),
              },
              { label: 'Payment method', value: '—' },
              {
                label: 'Invoice Link',
                value: (
                  <button
                    type="button"
                    onClick={() => toast.info('Invoice view coming soon')}
                    className="text-sm text-amber-300 underline underline-offset-2 hover:text-amber-200"
                  >
                    View Invoice
                  </button>
                ),
              },
            ]}
          />
        </DetailCard>

        <DetailCard title="More Details" subtitle="Get more insights about membership">
          <DetailGrid
            items={[
              {
                label: 'User ID',
                value: `USR-${String(subscription.partnerId).slice(-3).padStart(3, '0')}`,
              },
              {
                label: 'Username',
                value: (
                  <span className="inline-flex items-center gap-1.5 text-amber-300">
                    {subscription.partnerName}
                    <ExternalLink className="size-3.5" />
                  </span>
                ),
              },
              {
                label: 'Source App',
                value: subscription.sourceApp === 'expert' ? 'Expert App' : 'User App',
              },
              { label: 'Upgraded by', value: upgradedByLabel },
              {
                label: 'Previous Membership',
                value: (
                  <button
                    type="button"
                    onClick={() => setHistoryOpen(true)}
                    className="text-sm text-amber-300 underline underline-offset-2 hover:text-amber-200"
                  >
                    Check history
                  </button>
                ),
              },
            ]}
          />
        </DetailCard>
      </div>

      <div className="mt-8 flex justify-end gap-3 pb-4">
        <button
          type="button"
          onClick={() => setActionType('upgrade')}
          className={cn(
            'inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-colors',
            'bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600',
          )}
        >
          <span className="flex size-5 items-center justify-center rounded-full bg-white/20">
            <ArrowUp className="size-3" />
          </span>
          Upgrade Membership
        </button>
        <button
          type="button"
          onClick={() => setActionType('downgrade')}
          className={cn(
            'inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-black transition-colors',
            'bg-[#F0C27B] hover:bg-[#f4cc91] active:bg-[#eebf73]',
          )}
        >
          <span className="flex size-5 items-center justify-center rounded-full bg-black/10">
            <ArrowDown className="size-3" />
          </span>
          Downgrade Membership
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

function DetailCard({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: ReactNode
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-[#111111] p-6">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <p className="mb-6 text-sm text-slate-400">{subtitle}</p>
      {children}
    </section>
  )
}

function DetailGrid({
  items,
}: {
  items: Array<{ label: string; value: ReactNode }>
}) {
  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-3 xl:grid-cols-4">
      {items.map((item) => (
        <div key={item.label}>
          <p className="mb-2 text-xs text-slate-500">{item.label}</p>
          <div className="text-sm font-medium text-white">{item.value}</div>
        </div>
      ))}
    </div>
  )
}
