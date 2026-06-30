import { ArrowDown, ArrowUp, Calendar, X } from 'lucide-react'
import { useState } from 'react'

import { useMemberships } from '../hooks/use-memberships'
import type { MembershipSubscription } from '../types/membership-subscription'
import {
  DELETE_REASON_OPTIONS,
  PAUSE_REASON_OPTIONS,
} from '../mock/membership-metrics.mock'
import { formatCurrency } from '../utils/membership-format'
import { DecisionActionModal } from '@/shared/components/modal/decision-action-modal'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { cn } from '@/shared/lib/cn'

type ActionType = 'upgrade' | 'downgrade' | 'extend' | 'cancel'

type MembershipActionModalsProps = {
  subscription: MembershipSubscription | null
  action: ActionType | null
  onClose: () => void
  onUpgrade: (payload: {
    newMembershipPlanId: string
    billingCycleName?: string
    reasons: string[]
    adminNotes?: string
  }) => void
  onDowngrade: (payload: {
    newMembershipPlanId: string
    billingCycleName?: string
    reasons: string[]
    adminNotes?: string
  }) => void
  onExtend: (payload: { endDate: string; reasons: string[]; adminNotes?: string }) => void
  onCancel: (payload: { reasons: string[]; adminNotes?: string }) => void
  isSubmitting?: boolean
}

export function MembershipActionModals({
  subscription,
  action,
  onClose,
  onUpgrade,
  onDowngrade,
  onExtend,
  onCancel,
  isSubmitting = false,
}: MembershipActionModalsProps) {
  const [selectedPlanId, setSelectedPlanId] = useState('')
  const [billingCycleName, setBillingCycleName] = useState('')
  const [endDate, setEndDate] = useState('')
  const [adminNotes, setAdminNotes] = useState('')
  const [selectedReasons, setSelectedReasons] = useState<string[]>([])

  const { data: plansData } = useMemberships({
    type: 'expert',
    status: 'active',
    limit: 50,
  })

  const expertPlans = plansData?.data?.memberships ?? []

  if (!subscription || !action) return null

  const toggleReason = (value: string) => {
    setSelectedReasons((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    )
  }

  const resetAndClose = () => {
    setSelectedPlanId('')
    setBillingCycleName('')
    setEndDate('')
    setAdminNotes('')
    setSelectedReasons([])
    onClose()
  }

  if (action === 'extend') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
        <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#111111] p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Extend</h3>
              <p className="text-xs text-slate-400">Extend membership plan for {subscription.partnerName}</p>
            </div>
            <button type="button" onClick={resetAndClose} className="text-slate-400 hover:text-white">
              <X className="size-5" />
            </button>
          </div>

          <div className="mb-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-slate-300">
            <p>Current Plan: <span className="font-semibold text-white">{subscription.planName}</span></p>
            <p>Current Cycle: <span className="font-semibold text-white">{subscription.billingCycleName}</span></p>
            <p>Price: <span className="font-semibold text-white">{formatCurrency(subscription.purchasedPrice)}</span></p>
          </div>

          <label className="mb-4 block space-y-2">
            <span className="text-xs text-slate-400">End Date *</span>
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="border-white/10 bg-black text-white" />
          </label>

          <ReasonTags selected={selectedReasons} onToggle={toggleReason} />

          <label className="mt-4 block space-y-2">
            <span className="text-xs text-slate-400">Admin notes</span>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              className="h-24 w-full rounded-md border border-white/10 bg-black px-3 py-2 text-sm text-white"
            />
          </label>

          <p className="mt-4 text-[10px] text-slate-500">
            Note: This action will be live once the super admin approves this action.
          </p>

          <div className="mt-5 flex justify-end gap-3">
            <Button variant="secondary" onClick={resetAndClose}>Cancel</Button>
            <Button
              disabled={isSubmitting}
              onClick={() =>
                onExtend({
                  endDate,
                  reasons: selectedReasons,
                  adminNotes,
                })
              }
            >
              <Calendar className="size-4" />
              Send for approval
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (action === 'upgrade' || action === 'downgrade') {
    const selectedPlan = expertPlans.find((plan) => plan._id === selectedPlanId)

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
        <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#111111] p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">
                {action === 'upgrade' ? 'Upgrade Plan' : 'Downgrade Plan'}
              </h3>
              <p className="text-xs text-slate-400">
                {action === 'upgrade' ? 'Upgrade' : 'Downgrade'} membership for {subscription.partnerName}
              </p>
            </div>
            <button type="button" onClick={resetAndClose} className="text-slate-400 hover:text-white">
              <X className="size-5" />
            </button>
          </div>

          <div className="mb-4 flex items-center justify-center gap-4">
            <PlanBadge label={subscription.planName} />
            {action === 'upgrade' ? (
              <ArrowUp className="size-5 text-emerald-400" />
            ) : (
              <ArrowDown className="size-5 text-amber-400" />
            )}
            <select
              value={selectedPlanId}
              onChange={(e) => {
                setSelectedPlanId(e.target.value)
                const plan = expertPlans.find((item) => item._id === e.target.value)
                setBillingCycleName(plan?.pricing[0]?.billingCycleName ?? '')
              }}
              className="rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-white"
            >
              <option value="">Select plan</option>
              {expertPlans
                .filter((plan) => {
                  const currentPlanId =
                    typeof subscription.membershipPlanId === 'string'
                      ? subscription.membershipPlanId
                      : subscription.membershipPlanId._id
                  return plan._id !== currentPlanId
                })
                .map((plan) => (
                  <option key={plan._id} value={plan._id}>
                    {plan.planName}
                  </option>
                ))}
            </select>
          </div>

          {selectedPlan ? (
            <label className="mb-4 block space-y-2">
              <span className="text-xs text-slate-400">Billing Cycle</span>
              <select
                value={billingCycleName}
                onChange={(e) => setBillingCycleName(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-white"
              >
                {selectedPlan.pricing.map((item) => (
                  <option key={item.billingCycleName} value={item.billingCycleName}>
                    {item.billingCycleName}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          <ReasonTags selected={selectedReasons} onToggle={toggleReason} />

          <label className="mt-4 block space-y-2">
            <span className="text-xs text-slate-400">Admin notes</span>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              className="h-24 w-full rounded-md border border-white/10 bg-black px-3 py-2 text-sm text-white"
            />
          </label>

          <div className="mt-5 flex justify-end gap-3">
            <Button variant="secondary" onClick={resetAndClose}>Cancel</Button>
            <Button
              disabled={isSubmitting || !selectedPlanId || !selectedReasons.length}
              onClick={() => {
                const payload = {
                  newMembershipPlanId: selectedPlanId,
                  billingCycleName,
                  reasons: selectedReasons,
                  adminNotes,
                }
                if (action === 'upgrade') onUpgrade(payload)
                else onDowngrade(payload)
              }}
            >
              Send for approval
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <DecisionActionModal
      open
      variant="reject"
      title="Cancel Plan"
      description={`Are you sure you want to cancel ${subscription.partnerName}'s plan?`}
      submitLabel="Send for approval"
      adminNotes={adminNotes}
      onAdminNotesChange={setAdminNotes}
      onClose={resetAndClose}
      onSubmit={() =>
        onCancel({
          reasons: selectedReasons,
          adminNotes,
        })
      }
      reasonOptions={DELETE_REASON_OPTIONS}
      selectedReasons={selectedReasons}
      onReasonToggle={toggleReason}
      isSubmitting={isSubmitting}
    />
  )
}

function PlanBadge({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-center">
      <p className="text-[10px] text-slate-400">Current</p>
      <p className="text-sm font-semibold text-white">{label}</p>
    </div>
  )
}

function ReasonTags({
  selected,
  onToggle,
}: {
  selected: string[]
  onToggle: (value: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {PAUSE_REASON_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onToggle(option.value)}
          className={cn(
            'rounded-md px-3 py-1.5 text-[10px] font-semibold',
            selected.includes(option.value)
              ? 'bg-amber-400/20 text-amber-200'
              : 'bg-black text-slate-300',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
