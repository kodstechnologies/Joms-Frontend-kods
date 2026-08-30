import {
  Ban,
  CalendarRange,
  Check,
  CircleArrowDown,
  CircleArrowUp,
  CircleX,
  ClipboardList,
  Image,
  MoreVertical,
  Pause,
  Pencil,
  PlayCircle,
  Power,
} from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'

import type { MembershipPlan } from '../types/membership'
import {
  formatCurrency,
  formatMembershipDate,
  getDiscountedPrice,
  getFeatureLines,
  getStatusClassName,
  getStatusLabel,
  getTypeLabel,
} from '../utils/membership-format'
import { cn } from '@/shared/lib/cn'

const MUTE = 'text-white/50'
const SEP = 'rgba(255, 255, 255, 0.1)'

function HRule() {
  return (
    <div
      className="mx-0 h-px w-full max-w-[394px] shrink-0"
      style={{ backgroundColor: SEP }}
      aria-hidden
    />
  )
}

function VRule() {
  return (
    <div
      className="my-1 h-10 w-px shrink-0 self-center"
      style={{ backgroundColor: SEP }}
      aria-hidden
    />
  )
}

type MembershipPlanCardProps = {
  plan: MembershipPlan
  onEdit?: (plan: MembershipPlan) => void
  onPause?: (plan: MembershipPlan) => void
  onResume?: (plan: MembershipPlan) => void
  onDeactivate?: (plan: MembershipPlan) => void
  onActivate?: (plan: MembershipPlan) => void
  onDelete?: (plan: MembershipPlan) => void
  onViewFeatures?: (plan: MembershipPlan) => void
  onViewVersions?: (plan: MembershipPlan) => void
  onSetValidity?: (plan: MembershipPlan) => void
}

export function MembershipPlanCard({
  plan,
  onEdit,
  onPause,
  onResume,
  onDeactivate,
  onActivate,
  onDelete,
  onViewFeatures,
  onViewVersions,
  onSetValidity,
}: MembershipPlanCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const featureLines = getFeatureLines(plan.features)
  const stats = plan.subscriptionStats
  const pricingSlots = [0, 1, 2].map((index) => plan.pricing[index] ?? null)

  useEffect(() => {
    if (!menuOpen) return

    const handlePointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [menuOpen])

  const runAction = (action?: (plan: MembershipPlan) => void) => {
    setMenuOpen(false)
    action?.(plan)
  }

  return (
    <article className="relative flex min-h-[623px] w-[394px] max-w-full flex-col rounded-[16px] border border-white/10 bg-black">
      <div className="flex items-start justify-between gap-3 px-[22px] pt-5 pb-4">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="bg-brand-surface flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10">
            {plan.icon ? (
              <img src={plan.icon} alt={plan.planName} className="size-full object-cover" />
            ) : (
              <Image className={cn(MUTE, 'size-5')} strokeWidth={1.5} />
            )}
          </div>

          <div className="min-w-0">
            <h3 className="text-body-md-semibold truncate text-white">{plan.planName}</h3>
            <p className={cn('text-body-sm mt-0.5', MUTE)}>{plan.planId}</p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span
            className={cn(
              'rounded-brand-pill px-2.5 py-1 text-[10px] leading-[14px] font-semibold',
              plan.type === 'user'
                ? 'bg-brand-positive/15 text-brand-positive'
                : 'bg-brand-accent/20 text-brand-accent',
            )}
          >
            {getTypeLabel(plan.type)}
          </span>

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className={cn(
                MUTE,
                'hover:text-brand-text flex size-8 items-center justify-center rounded-lg transition-colors hover:bg-white/10',
              )}
              aria-label="Plan actions"
              aria-expanded={menuOpen}
            >
              <MoreVertical className="size-4" strokeWidth={1.75} />
            </button>

            {menuOpen ? (
              <div className="ui-table-actions-menu absolute right-0 z-30 mt-2">
                <MenuButton
                  label="View Details"
                  icon={<ClipboardList className="size-4" strokeWidth={1.85} />}
                  onClick={() => runAction(onEdit)}
                />
                <MenuButton
                  label="View Version History"
                  icon={<CircleArrowUp className="size-4" strokeWidth={1.85} />}
                  onClick={() => runAction(onViewVersions)}
                />
                <MenuButton
                  label="View Feature List"
                  icon={<CircleArrowDown className="size-4" strokeWidth={1.85} />}
                  onClick={() => runAction(onViewFeatures)}
                />
                <MenuButton
                  label="Set Plan validity"
                  icon={<CalendarRange className="size-4" strokeWidth={1.85} />}
                  onClick={() => runAction(onSetValidity)}
                />
                {plan.status === 'active' ? (
                  <MenuButton
                    label="Pause Plan"
                    icon={<Pause className="size-4" strokeWidth={1.85} />}
                    onClick={() => runAction(onPause)}
                    danger
                  />
                ) : null}
                {plan.status === 'paused' ? (
                  <MenuButton
                    label="Resume Plan"
                    icon={<PlayCircle className="size-4" strokeWidth={1.85} />}
                    onClick={() => runAction(onResume)}
                  />
                ) : null}
                {plan.status === 'inactive' ? (
                  <MenuButton
                    label="Activate Plan"
                    icon={<Power className="size-4" strokeWidth={1.85} />}
                    onClick={() => runAction(onActivate)}
                  />
                ) : null}
                {plan.status !== 'deleted' ? (
                  <>
                    {plan.status === 'active' ? (
                      <MenuButton
                        label="Deactivate Plan"
                        icon={<Ban className="size-4" strokeWidth={1.85} />}
                        onClick={() => runAction(onDeactivate)}
                        danger
                      />
                    ) : null}
                    <MenuButton
                      label="Delete Plan"
                      icon={<CircleX className="size-4" strokeWidth={1.85} />}
                      onClick={() => runAction(onDelete)}
                      danger
                    />
                  </>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <HRule />

      <div className="flex items-center px-2 py-4">
        {pricingSlots.map((item, index) => (
          <div
            key={item?.billingCycleName ?? `empty-${index}`}
            className="flex flex-1 items-center"
          >
            {index > 0 ? <VRule /> : null}
            <div className="flex flex-1 flex-col items-center justify-center px-2 text-center">
              <p className="text-[18px] leading-[26px] font-semibold text-white">
                {item ? formatCurrency(getDiscountedPrice(item.price, item.discount)) : '—'}
              </p>
              <p className={cn('text-body-sm mt-1', MUTE)}>
                {item?.billingCycleName ?? ['Weekly', '3 Months', '6 Months'][index]}
              </p>
            </div>
          </div>
        ))}
      </div>

      <HRule />

      <div className="px-[22px] py-4">
        <p className={cn('text-body-sm mb-3', MUTE)}>Features</p>
        <ul className="h-[125px] w-[291px] max-w-full space-y-2.5 overflow-hidden">
          {featureLines.slice(0, 4).map((feature) => (
            <li key={feature} className="text-body-sm flex items-start gap-2.5 text-white">
              <Check className="mt-0.5 size-3.5 shrink-0 text-white" strokeWidth={2.25} />
              <span className="leading-[18px]">{feature}</span>
            </li>
          ))}
          {!featureLines.length ? (
            <li className={cn('text-body-sm', MUTE)}>No features configured</li>
          ) : null}
        </ul>
      </div>

      <HRule />

      <div className="px-[22px] py-4">
        <p className={cn('text-body-sm mb-3', MUTE)}>Subscription Stats</p>
        <div className="flex gap-2">
          <StatPill label="Total" value={stats?.total ?? 0} />
          <StatPill label="Weekly" value={stats?.weekly ?? 0} />
          <StatPill label="3 Months" value={stats?.threeMonths ?? 0} />
          <StatPill label="6 Months" value={stats?.sixMonths ?? 0} />
        </div>
      </div>

      <div className="mt-auto flex flex-col gap-3 px-[22px] pt-2 pb-5">
        <div className="flex items-center justify-between gap-3">
          <span className={cn('text-body-sm', MUTE)}>Version :{plan.version}</span>
          <span
            className={cn(
              'rounded-brand-pill border px-2.5 py-0.5 text-[10px] leading-[14px] font-semibold',
              getStatusClassName(plan.status),
            )}
          >
            {getStatusLabel(plan.status)}
          </span>
        </div>

        <div className={cn('text-body-sm space-y-1', MUTE)}>
          <p>Created: {formatMembershipDate(plan.createdAt)}</p>
          <p>
            Updated: {formatMembershipDate(plan.updatedAt)}
            {plan.updatedBy ? ` by ${plan.updatedBy}` : ''}
          </p>
        </div>

        {plan.status !== 'deleted' ? (
          <button
            type="button"
            className="ui-cta ui-cta-primary h-10 w-full"
            onClick={() => onEdit?.(plan)}
          >
            Edit
            <Pencil className="size-4" strokeWidth={1.75} />
          </button>
        ) : null}
      </div>
    </article>
  )
}

function StatPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-brand-surface flex h-[66px] w-[80px] flex-col items-center justify-center rounded-[8px] px-1 text-center">
      <p className={cn('text-[10px] leading-[14px]', MUTE)}>{label}</p>
      <p className="mt-1 text-sm leading-5 font-semibold text-white tabular-nums">{value}</p>
    </div>
  )
}

function MenuButton({
  label,
  onClick,
  icon,
  danger = false,
}: {
  label: string
  onClick: () => void
  icon: ReactNode
  danger?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn('ui-table-actions-item', danger && 'ui-table-actions-item-danger')}
    >
      <span className="flex size-4 shrink-0 items-center justify-center">{icon}</span>
      <span className="truncate">{label}</span>
    </button>
  )
}
