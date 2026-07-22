import { ArrowDown, ArrowUp, Calendar, X } from 'lucide-react'
import { useState } from 'react'

import { useMemberships } from '../hooks/use-memberships'
import type { MembershipSubscription } from '../types/membership-subscription'
import { DELETE_REASON_OPTIONS, PAUSE_REASON_OPTIONS } from '../mock/membership-metrics.mock'
import { formatCurrency } from '../utils/membership-format'
import { DecisionActionModal } from '@/shared/components/modal/decision-action-modal'
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
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
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
        <div className="ui-modal-shell max-w-lg">
          <div className="ui-modal-header">
            <div>
              <h3 className="text-h4 text-brand-text">Extend</h3>
              <p className="text-muted text-body-sm">
                Extend membership plan for {subscription.partnerName}
              </p>
            </div>
            <button
              type="button"
              onClick={resetAndClose}
              className="text-muted hover:text-brand-text"
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="ui-modal-body space-y-4">
            <div className="border-brand-accent/20 bg-brand-accent/5 text-body-sm text-muted rounded-xl border p-4">
              <p>
                Current Plan:{' '}
                <span className="text-brand-text font-semibold">{subscription.planName}</span>
              </p>
              <p>
                Current Cycle:{' '}
                <span className="text-brand-text font-semibold">
                  {subscription.billingCycleName}
                </span>
              </p>
              <p>
                Price:{' '}
                <span className="text-brand-text font-semibold">
                  {formatCurrency(subscription.purchasedPrice)}
                </span>
              </p>
            </div>

            <label className="block space-y-2">
              <span className="text-muted text-body-sm">End Date *</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="ui-input"
              />
            </label>

            <ReasonTags selected={selectedReasons} onToggle={toggleReason} />

            <label className="block space-y-2">
              <span className="text-muted text-body-sm">Admin notes</span>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="ui-textarea h-24 min-h-24"
              />
            </label>

            <p className="text-muted text-body-sm">
              Note: This action will be live once the super admin approves this action.
            </p>
          </div>

          <div className="ui-modal-footer">
            <button
              type="button"
              className="ui-modal-btn ui-modal-btn-cancel"
              onClick={resetAndClose}
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              className="ui-modal-btn ui-modal-btn-gold"
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
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (action === 'upgrade' || action === 'downgrade') {
    const selectedPlan = expertPlans.find((plan) => plan._id === selectedPlanId)

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
        <div className="ui-modal-shell max-w-lg">
          <div className="ui-modal-header">
            <div>
              <h3 className="text-h4 text-brand-text">
                {action === 'upgrade' ? 'Upgrade Plan' : 'Downgrade Plan'}
              </h3>
              <p className="text-muted text-body-sm">
                {action === 'upgrade' ? 'Upgrade' : 'Downgrade'} membership for{' '}
                {subscription.partnerName}
              </p>
            </div>
            <button
              type="button"
              onClick={resetAndClose}
              className="text-muted hover:text-brand-text"
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="ui-modal-body space-y-4">
            <div className="flex items-center justify-center gap-4">
              <PlanBadge label={subscription.planName} />
              {action === 'upgrade' ? (
                <ArrowUp className="text-brand-positive size-5" />
              ) : (
                <ArrowDown className="text-brand-accent size-5" />
              )}
              <select
                value={selectedPlanId}
                onChange={(e) => {
                  setSelectedPlanId(e.target.value)
                  const plan = expertPlans.find((item) => item._id === e.target.value)
                  setBillingCycleName(plan?.pricing[0]?.billingCycleName ?? '')
                }}
                className="ui-input w-auto"
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
              <label className="block space-y-2">
                <span className="text-muted text-body-sm">Billing Cycle</span>
                <select
                  value={billingCycleName}
                  onChange={(e) => setBillingCycleName(e.target.value)}
                  className="ui-input"
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

            <label className="block space-y-2">
              <span className="text-muted text-body-sm">Admin notes</span>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="ui-textarea h-24 min-h-24"
              />
            </label>
          </div>

          <div className="ui-modal-footer">
            <button
              type="button"
              className="ui-modal-btn ui-modal-btn-cancel"
              onClick={resetAndClose}
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isSubmitting || !selectedPlanId || !selectedReasons.length}
              className="ui-modal-btn ui-modal-btn-gold"
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
            </button>
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
    <div className="bg-brand-bg/40 rounded-xl border border-white/10 px-4 py-3 text-center">
      <p className="text-muted text-body-sm">Current</p>
      <p className="text-body-md text-brand-text font-semibold">{label}</p>
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
            'ui-modal-reason-chip',
            selected.includes(option.value)
              ? 'ui-modal-reason-chip-selected'
              : 'ui-modal-reason-chip-idle',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
