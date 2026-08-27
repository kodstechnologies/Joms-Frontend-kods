import { ArrowLeft, ArrowRight, ChevronDown, X } from 'lucide-react'
import calendarIcon from '@/assets/JOMS_ICONS-2/icons8-calendar.svg'
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'

import { useMembership, useMemberships } from '../hooks/use-memberships'
import type { MembershipPlan } from '../types/membership'
import type { MembershipSubscription } from '../types/membership-subscription'
import { PAUSE_REASON_OPTIONS } from '../mock/membership-metrics.mock'
import { formatCurrency } from '../utils/membership-format'
import { RequiredMark } from '@/shared/components/form/required-mark'
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
  onCancel: (payload: {
    reasons: string[]
    adminNotes?: string
    fromDate?: string
    toDate?: string
  }) => void
  isSubmitting?: boolean
}

const GOLD = '#f6cb86'
const GOLD_TO = '#e0a263'

function MembershipModalShell({
  title,
  description,
  onClose,
  children,
  footer,
}: {
  title: string
  description: string
  onClose: () => void
  children: ReactNode
  footer: ReactNode
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div
        className="ui-modal-shell w-full max-w-[551px] !bg-[#141414]"
        role="dialog"
        aria-modal="true"
      >
        <div className="ui-modal-header !items-start">
          <div className="min-w-0 flex-1">
            <h3 className="text-[20px] leading-7 font-semibold text-white">{title}</h3>
            <p className="mt-1 text-[14px] leading-[22px] text-white/50">{description}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-white/50 hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="ui-modal-body min-h-0 space-y-5">{children}</div>

        <div className="ui-modal-footer !justify-end gap-3">{footer}</div>
      </div>
    </div>
  )
}

export function MembershipActionModals({
  subscription,
  action,
  ...rest
}: MembershipActionModalsProps) {
  if (!subscription || !action) return null

  // Remount on action/subscription change so form state resets without setState-in-effect
  return (
    <MembershipActionModalsContent
      key={`${action}-${subscription._id}`}
      subscription={subscription}
      action={action}
      {...rest}
    />
  )
}

type MembershipActionModalsContentProps = Omit<
  MembershipActionModalsProps,
  'subscription' | 'action'
> & {
  subscription: MembershipSubscription
  action: ActionType
}

function MembershipActionModalsContent({
  subscription,
  action,
  onClose,
  onUpgrade,
  onDowngrade,
  onExtend,
  onCancel,
  isSubmitting = false,
}: MembershipActionModalsContentProps) {
  const [selectedPlanId, setSelectedPlanId] = useState('')
  const [billingCycleName, setBillingCycleName] = useState('')
  const [endDate, setEndDate] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [adminNotes, setAdminNotes] = useState('')
  const [selectedReasons, setSelectedReasons] = useState<string[]>([])
  const [planMenuOpen, setPlanMenuOpen] = useState(false)

  const { data: plansData } = useMemberships({
    type: 'expert',
    status: 'active',
    limit: 100,
  })

  const expertPlans = plansData?.data?.memberships ?? []

  const currentPlanId =
    typeof subscription.membershipPlanId === 'string'
      ? subscription.membershipPlanId
      : subscription.membershipPlanId?._id

  const { data: currentPlanResponse } = useMembership(currentPlanId ?? '')

  const currentPlan =
    currentPlanResponse?.data ??
    expertPlans.find((plan) => plan._id === currentPlanId) ??
    expertPlans.find((plan) => plan.planId === subscription.planId) ??
    null

  const currentPlanIcon =
    currentPlan?.icon ??
    (subscription.membershipPlanId && typeof subscription.membershipPlanId === 'object'
      ? (subscription.membershipPlanId.icon ?? null)
      : null)

  const selectablePlans = expertPlans.filter((plan) => plan._id !== currentPlanId)
  const selectedPlan = expertPlans.find((plan) => plan._id === selectedPlanId)

  const toggleReason = (value: string) => {
    setSelectedReasons((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
    )
  }

  const resetAndClose = () => {
    onClose()
  }

  const selectPlan = (plan: MembershipPlan) => {
    setSelectedPlanId(plan._id)
    setBillingCycleName(plan.pricing[0]?.billingCycleName ?? '')
    setPlanMenuOpen(false)
  }

  if (action === 'extend') {
    return (
      <MembershipModalShell
        title="Extend"
        description={`Extend membership plan for ${subscription.partnerName}`}
        onClose={resetAndClose}
        footer={
          <>
            <button
              type="button"
              className="inline-flex h-10 flex-1 items-center justify-center rounded-[10px] border border-white text-[14px] font-semibold text-white hover:bg-white/5"
              onClick={resetAndClose}
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isSubmitting || !endDate || !selectedReasons.length || !adminNotes.trim()}
              className="ui-cta ui-cta-primary flex-1"
              onClick={() =>
                onExtend({
                  endDate,
                  reasons: selectedReasons,
                  adminNotes,
                })
              }
            >
              Send for approval
            </button>
          </>
        }
      >
        <div className="rounded-[10px] border border-white/10 bg-white/5 p-4 text-[14px] text-white/50">
          <p>
            Current Plan: <span className="font-semibold text-white">{subscription.planName}</span>
          </p>
          <p>
            Current Cycle:{' '}
            <span className="font-semibold text-white">{subscription.billingCycleName}</span>
          </p>
          <p>
            Price:{' '}
            <span className="font-semibold text-white">
              {formatCurrency(subscription.purchasedPrice)}
            </span>
          </p>
        </div>

        <label className="block space-y-2">
          <span className="text-[12px] text-white/50">
            End Date <RequiredMark />
          </span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="box-border h-[42px] w-full rounded-[8px] border border-white/10 bg-black px-3.5 text-[14px] text-white outline-none"
          />
        </label>

        <ReasonTags selected={selectedReasons} onToggle={toggleReason} />

        <label className="block space-y-2">
          <span className="text-[14px] text-white">
            Admin notes <RequiredMark />
          </span>
          <textarea
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            className="box-border min-h-[119px] w-full resize-none rounded-[8px] border border-white/10 bg-black px-3.5 py-3 text-[14px] text-white outline-none"
          />
        </label>

        <p className="text-[14px] text-white/70 italic">
          Note: This action will be live once the super admin approves this action.
        </p>
      </MembershipModalShell>
    )
  }

  if (action === 'upgrade' || action === 'downgrade') {
    const isUpgrade = action === 'upgrade'
    const currentCard = (
      <PlanVisual
        label={currentPlan?.planName ?? subscription.planName}
        iconUrl={currentPlanIcon}
        tone="current"
      />
    )
    const targetCard = (
      <PlanPicker
        selectedPlan={selectedPlan}
        plans={selectablePlans}
        open={planMenuOpen}
        onOpenChange={setPlanMenuOpen}
        onSelect={selectPlan}
      />
    )

    return (
      <MembershipModalShell
        title={isUpgrade ? 'Upgrade Plan' : 'Downgrade Plan'}
        description={
          isUpgrade
            ? 'Upgrade membership plans for the users'
            : 'Downgrade membership plans for the users'
        }
        onClose={resetAndClose}
        footer={
          <>
            <button
              type="button"
              className="inline-flex h-10 flex-1 items-center justify-center rounded-[10px] border border-white text-[14px] font-semibold text-white hover:bg-white/5"
              onClick={resetAndClose}
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={
                isSubmitting || !selectedPlanId || !selectedReasons.length || !adminNotes.trim()
              }
              className="ui-cta ui-cta-primary flex-1"
              onClick={() => {
                const payload = {
                  newMembershipPlanId: selectedPlanId,
                  billingCycleName: billingCycleName || undefined,
                  reasons: selectedReasons,
                  adminNotes,
                }
                if (isUpgrade) onUpgrade(payload)
                else onDowngrade(payload)
              }}
            >
              Send for approval
            </button>
          </>
        }
      >
        <div className="flex items-start justify-center gap-6 pt-2">
          {isUpgrade ? currentCard : targetCard}

          <div className="flex h-[106px] items-center">
            {isUpgrade ? (
              <ArrowRight className="size-5 text-white/80" strokeWidth={1.75} />
            ) : (
              <ArrowLeft className="size-5 text-white/80" strokeWidth={1.75} />
            )}
          </div>

          {isUpgrade ? targetCard : currentCard}
        </div>

        {selectedPlan && selectedPlan.pricing.length > 1 ? (
          <label className="block space-y-2">
            <span className="text-[12px] text-white/50">Billing Cycle</span>
            <select
              value={billingCycleName}
              onChange={(e) => setBillingCycleName(e.target.value)}
              className="box-border h-[42px] w-full rounded-[8px] border border-white/10 bg-black px-3.5 text-[14px] text-white outline-none"
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
          <span className="text-[14px] text-white">
            Admin notes <RequiredMark />
          </span>
          <textarea
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            className="box-border min-h-[119px] w-full resize-none rounded-[8px] border border-white/10 bg-black px-3.5 py-3 text-[14px] text-white outline-none"
          />
        </label>

        <p className="text-[14px] text-white/70 italic">
          Note: This action will be live once the super admin approves this action.
        </p>
      </MembershipModalShell>
    )
  }

  return (
    <MembershipModalShell
      title="Cancel Plan"
      description="Cancel membership plans for the users"
      onClose={resetAndClose}
      footer={
        <>
          <button
            type="button"
            className="inline-flex h-10 flex-1 items-center justify-center rounded-[10px] border border-white text-[14px] font-semibold text-white hover:bg-white/5"
            onClick={resetAndClose}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={
              isSubmitting || !fromDate || !toDate || !selectedReasons.length || !adminNotes.trim()
            }
            className="ui-cta ui-cta-primary flex-1"
            onClick={() =>
              onCancel({
                reasons: selectedReasons,
                adminNotes,
                fromDate,
                toDate,
              })
            }
          >
            Send for Approval
          </button>
        </>
      }
    >
      <div className="flex flex-col items-center gap-3 pt-1 text-center">
        <span className="inline-flex size-14 items-center justify-center rounded-full bg-[#d3191c]">
          <X className="size-7 text-white" strokeWidth={2.5} />
        </span>
        <div className="max-w-[420px] space-y-1">
          <p className="text-[16px] leading-6 font-semibold text-white">
            Are you sure you want to cancel this user&apos;s plan?
          </p>
          <p className="text-[14px] leading-[22px] text-white/50">
            This will result in cancel the membership of this account.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <CancelDateField label="From" value={fromDate} onChange={setFromDate} />
        <CancelDateField label="To" value={toDate} onChange={setToDate} />
      </div>

      <ReasonTags selected={selectedReasons} onToggle={toggleReason} />

      <label className="block space-y-2">
        <span className="text-[14px] text-white">
          Admin notes <RequiredMark />
        </span>
        <textarea
          value={adminNotes}
          onChange={(e) => setAdminNotes(e.target.value)}
          className="box-border min-h-[119px] w-full resize-none rounded-[8px] border border-white/10 bg-black px-3.5 py-3 text-[14px] text-white outline-none focus:border-white/30"
        />
      </label>

      <p className="text-[14px] text-white/70 italic">
        Note: This action will be live once the super admin approves this action.
      </p>
    </MembershipModalShell>
  )
}

function CancelDateField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label className="block space-y-2">
      <span className="text-[14px] text-white">
        {label} <RequiredMark />
      </span>
      <div className="relative">
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="box-border h-[42px] w-full rounded-[8px] border border-white/10 bg-black px-3.5 pr-10 text-[14px] text-white [color-scheme:dark] outline-none focus:border-white/30"
        />
        <img
          src={calendarIcon}
          alt="calendar"
          className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-white/50"
          aria-hidden="true"
        />
      </div>
    </label>
  )
}

function PlanVisual({
  label,
  iconUrl,
  tone,
}: {
  label: string
  iconUrl?: string | null
  tone: 'current' | 'target'
}) {
  return (
    <div className="flex w-[106px] flex-col items-center gap-3">
      <div
        className={cn(
          'flex size-[80px] items-center justify-center overflow-hidden rounded-[16px]',
          tone === 'target' ? 'border-0' : 'border border-white/15 bg-black',
        )}
        style={
          tone === 'target'
            ? { background: `linear-gradient(180deg, ${GOLD} 0%, ${GOLD_TO} 100%)` }
            : undefined
        }
      >
        {iconUrl ? (
          <img src={iconUrl} alt="" className="size-full object-cover" />
        ) : (
          <PlanIconPlaceholder dark={tone === 'target'} />
        )}
      </div>
      <p className="text-center text-[14px] leading-[22px] font-medium text-white">{label}</p>
    </div>
  )
}

function PlanPicker({
  selectedPlan,
  plans,
  open,
  onOpenChange,
  onSelect,
}: {
  selectedPlan?: MembershipPlan
  plans: MembershipPlan[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (plan: MembershipPlan) => void
}) {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointer = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) onOpenChange(false)
    }
    document.addEventListener('mousedown', onPointer)
    return () => document.removeEventListener('mousedown', onPointer)
  }, [open, onOpenChange])

  return (
    <div className="relative flex w-[106px] flex-col items-center gap-3" ref={menuRef}>
      <div
        className="flex size-[80px] items-center justify-center overflow-hidden rounded-[16px]"
        style={{ background: `linear-gradient(180deg, ${GOLD} 0%, ${GOLD_TO} 100%)` }}
      >
        {selectedPlan?.icon ? (
          <img src={selectedPlan.icon} alt="" className="size-full object-cover" />
        ) : (
          <PlanIconPlaceholder dark />
        )}
      </div>

      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        className="inline-flex h-[36px] max-w-[140px] min-w-[106px] items-center justify-center gap-1.5 rounded-full px-3 text-[13px] font-semibold text-black"
        style={{ background: `linear-gradient(180deg, ${GOLD} 0%, ${GOLD_TO} 100%)` }}
      >
        <span className="truncate">{selectedPlan?.planName ?? 'Select plan'}</span>
        <ChevronDown className="size-4 shrink-0" strokeWidth={2} />
      </button>

      {open ? (
        <div className="absolute top-[128px] z-20 min-w-[200px] overflow-hidden rounded-[10px] border border-white/10 bg-[#141414] py-1 shadow-[0_16px_40px_rgba(0,0,0,0.5)]">
          {plans.length ? (
            plans.map((plan) => (
              <button
                key={plan._id}
                type="button"
                onClick={() => onSelect(plan)}
                className={cn(
                  'flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-[14px] text-white transition-colors hover:bg-white/5',
                  selectedPlan?._id === plan._id && 'bg-white/5',
                )}
              >
                <span className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-black">
                  {plan.icon ? (
                    <img src={plan.icon} alt="" className="size-full object-cover" />
                  ) : (
                    <PlanIconPlaceholder size={18} />
                  )}
                </span>
                <span className="truncate">{plan.planName}</span>
              </button>
            ))
          ) : (
            <p className="px-4 py-2.5 text-[13px] text-white/50">No plans available</p>
          )}
        </div>
      ) : null}
    </div>
  )
}

function PlanIconPlaceholder({ dark = false, size = 40 }: { dark?: boolean; size?: number }) {
  const stroke = dark ? '#1a1a1a' : '#ffffff'
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden>
      <circle cx="20" cy="22" r="10" stroke={stroke} strokeWidth="1.5" />
      <circle cx="14" cy="14" r="4" fill={stroke} opacity="0.85" />
      <circle cx="26" cy="14" r="4" fill={stroke} opacity="0.55" />
      <circle cx="20" cy="12" r="4.5" fill={stroke} />
    </svg>
  )
}

function ReasonTags({
  selected,
  onToggle,
}: {
  selected: string[]
  onToggle: (value: string) => void
}) {
  const options = useMemo(() => PAUSE_REASON_OPTIONS, [])

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = selected.includes(option.value)
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onToggle(option.value)}
            className="inline-flex h-[37px] items-center justify-center rounded-[8px] px-3 text-[12px] leading-[18px] font-medium transition-colors"
            style={
              active
                ? {
                    background: `linear-gradient(180deg, ${GOLD} 0%, ${GOLD_TO} 100%)`,
                    color: '#000000',
                    border: '1px solid transparent',
                  }
                : {
                    background: '#000000',
                    color: '#ffffff',
                    border: '1px solid rgba(255,255,255,0.35)',
                  }
            }
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
