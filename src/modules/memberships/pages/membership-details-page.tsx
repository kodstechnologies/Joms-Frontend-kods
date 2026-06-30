import { ArrowLeft, ArrowDown, ArrowUp, Calendar, X } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { MembershipActionModals } from '../components/membership-action-modals'
import {
  useCancelSubscription,
  useDowngradeSubscription,
  useExtendSubscription,
  useSubscription,
  useUpgradeSubscription,
} from '../hooks/use-membership-subscriptions'
import { formatCurrency, formatMembershipDate } from '../utils/membership-format'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'

export function MembershipDetailsPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const [actionType, setActionType] = useState<'upgrade' | 'downgrade' | 'extend' | 'cancel' | null>(null)

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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/memberships/experts')}
          className="rounded-lg border border-white/10 p-2 text-slate-300 hover:bg-white/5"
        >
          <ArrowLeft className="size-4" />
        </button>
        <div>
          <p className="text-xs text-slate-400">Membership Management / View Details</p>
          <h1 className="text-2xl font-semibold text-white">Membership Details</h1>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <DetailCard title="Current Membership Details" subtitle="Manage expert membership plan">
          <DetailRow label="Plan ID" value={subscription.subscriptionId} />
          <DetailRow label="Plan Name" value={subscription.planName} link />
          <DetailRow label="Billing Type" value={subscription.billingCycleName} />
          <DetailRow label="Purchased Price" value={formatCurrency(subscription.purchasedPrice)} />
          <DetailRow label="Purchased On" value={formatMembershipDate(subscription.startedAt)} />
          <DetailRow label="Next billing date" value={formatMembershipDate(subscription.nextBillingDate)} />
          <DetailRow
            label="Status"
            value={
              <span
                className={cn(
                  'rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize',
                  subscription.status === 'active'
                    ? 'bg-emerald-500/15 text-emerald-300'
                    : 'bg-orange-500/15 text-orange-300',
                )}
              >
                {subscription.status}
              </span>
            }
          />
          <button
            type="button"
            onClick={() => toast.info('Invoice view coming soon')}
            className="text-sm text-amber-300 hover:underline"
          >
            View Invoice
          </button>
        </DetailCard>

        <DetailCard title="More Details" subtitle="Get more insights about membership">
          <DetailRow label="Expert ID" value={`EXP-${String(subscription.partnerId).slice(-5)}`} />
          <DetailRow label="Expert Name" value={subscription.partnerName} link />
          <DetailRow label="Source App" value="Expert App" />
          <DetailRow label="Upgraded by" value={subscription.upgradedBy ?? 'Partner'} />
          <DetailRow
            label="Previous Membership"
            value={
              subscription.previousMembership?.planName ? (
                <span>{subscription.previousMembership.planName}</span>
              ) : (
                <button
                  type="button"
                  onClick={() => toast.info('Membership history coming soon')}
                  className="text-sm text-amber-300 hover:underline"
                >
                  Check history
                </button>
              )
            }
          />
          <DetailRow label="Auto Renewal" value={subscription.autoRenew ? 'Yes' : 'No'} />
        </DetailCard>
      </div>

      {subscription.actionHistory?.length ? (
        <DetailCard title="Activity History" subtitle="Recent membership actions">
          <div className="space-y-3">
            {subscription.actionHistory.map((entry, index) => (
              <div key={`${entry.action}-${index}`} className="rounded-lg border border-white/10 bg-black/30 p-3 text-sm text-slate-300">
                <p className="font-medium capitalize text-white">{entry.action}</p>
                <p>
                  {entry.fromPlanName ? `${entry.fromPlanName} → ` : ''}
                  {entry.toPlanName}
                </p>
                <p className="text-xs text-slate-500">
                  {entry.performedBy} · {formatMembershipDate(entry.performedAt)}
                </p>
              </div>
            ))}
          </div>
        </DetailCard>
      ) : null}

      <div className="sticky bottom-0 flex flex-wrap gap-3 rounded-2xl border border-white/10 bg-[#111111]/95 p-4 backdrop-blur">
        <Button onClick={() => setActionType('upgrade')}>
          <ArrowUp className="size-4" />
          Upgrade Membership
        </Button>
        <Button variant="secondary" onClick={() => setActionType('downgrade')}>
          <ArrowDown className="size-4" />
          Downgrade Membership
        </Button>
        <Button variant="secondary" onClick={() => setActionType('extend')}>
          <Calendar className="size-4" />
          Extend Membership
        </Button>
        <Button
          variant="secondary"
          className="text-rose-300"
          onClick={() => setActionType('cancel')}
        >
          <X className="size-4" />
          Cancel Membership
        </Button>
        <Button variant="ghost" onClick={() => navigate('/memberships/experts')}>
          Back to list
        </Button>
      </div>

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
    <section className="rounded-2xl border border-white/10 bg-[#111111] p-5">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <p className="mb-4 text-xs text-slate-400">{subtitle}</p>
      <div className="space-y-3">{children}</div>
    </section>
  )
}

function DetailRow({
  label,
  value,
  link = false,
}: {
  label: string
  value: ReactNode
  link?: boolean
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-white/5 pb-3 last:border-0">
      <span className="text-sm text-slate-400">{label}</span>
      <span className={cn('text-sm text-right text-white', link && 'text-amber-300')}>{value}</span>
    </div>
  )
}
