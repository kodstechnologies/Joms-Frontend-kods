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
  Play,
  RefreshCw,
} from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'

import type { MembershipPlan } from '../types/membership'
import {
  formatCurrency,
  formatMembershipDate,
  formatMembershipDateSlash,
  getDiscountedPrice,
  getFeatureLines,
  getStatusClassName,
  getStatusLabel,
  getTypeLabel,
} from '../utils/membership-format'
import { cn } from '@/shared/lib/cn'

const MUTE = 'text-[#FFFFFF80]'
const SEP = 'rgba(255, 255, 255, 0.1)'

function HRule() {
  return <div className="mx-0 h-px w-full shrink-0" style={{ backgroundColor: SEP }} aria-hidden />
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
  onViewDetails?: (plan: MembershipPlan) => void
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
  onViewDetails,
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
  const primaryPrice = plan.pricing[0] ?? null
  const isLifecycleCard = plan.status === 'paused' || plan.status === 'inactive'
  const isDeleted = plan.status === 'deleted'

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
    <article className="relative mx-auto flex min-h-[567px] w-full max-w-[350px] flex-col rounded-[10px] bg-[#141414]">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-4">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-[#050505]">
            {plan.icon ? (
              <img src={plan.icon} alt={plan.planName} className="size-full object-cover" />
            ) : (
              <Image className={cn(MUTE, 'size-5')} strokeWidth={1.5} />
            )}
          </div>

          <div className="min-w-0">
            <h3 className="truncate text-[14px] leading-5 font-semibold text-white">
              {plan.planName}
            </h3>
            <p className={cn('mt-0.5 text-[12px] leading-[14px] font-medium', MUTE)}>
              {plan.planId}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {isDeleted ? (
            <span className="inline-flex h-5 max-w-full items-center justify-center rounded-[10px] bg-[#D3191C33] px-2.5 text-[10px] leading-[14px] font-semibold whitespace-nowrap text-[#D3191C]">
              Deleted on {formatMembershipDateSlash(plan.updatedAt || plan.createdAt)}
            </span>
          ) : null}

          {!isLifecycleCard && !isDeleted ? (
            <span
              className={cn(
                'inline-flex h-5 items-center justify-center rounded-[10px] px-2.5 text-[10px] leading-[14px] font-semibold',
                plan.type === 'user'
                  ? 'bg-[#00A63E33] text-[#00A63E]'
                  : 'bg-[#F6CB8633] text-[#F6CB86]',
              )}
            >
              {getTypeLabel(plan.type)}
            </span>
          ) : null}

          {!isDeleted ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                className={cn(
                  MUTE,
                  'flex size-8 items-center justify-center rounded-lg transition-colors hover:bg-white/10 hover:text-white',
                )}
                aria-label="Plan actions"
                aria-expanded={menuOpen}
              >
                <MoreVertical className="size-4" strokeWidth={1.75} />
              </button>

              {menuOpen ? (
                <div className="ui-table-actions-menu absolute right-0 z-30 mt-2">
                  <MenuButton
                    label="View users"
                    icon={<ClipboardList className="size-4" strokeWidth={1.85} />}
                    onClick={() => runAction(onViewDetails ?? onEdit)}
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
                      icon={<Play className="size-4" strokeWidth={1.85} />}
                      onClick={() => runAction(onResume)}
                    />
                  ) : null}
                  {plan.status === 'inactive' ? (
                    <MenuButton
                      label="Retrieve Plan"
                      icon={<RefreshCw className="size-4" strokeWidth={1.85} />}
                      onClick={() => runAction(onActivate)}
                    />
                  ) : null}
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
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      <HRule />

      {/* Pricing — single for paused/inactive, triple for active/deleted */}
      {isLifecycleCard ? (
        <div className="flex items-stretch gap-4 px-5 py-4">
          <div className="min-w-0">
            <p className="text-[20px] leading-5 font-semibold text-white">
              {primaryPrice
                ? formatCurrency(getDiscountedPrice(primaryPrice.price, primaryPrice.discount))
                : '—'}
            </p>
            <p className={cn('mt-1 text-[12px] leading-[14px] font-medium', MUTE)}>
              {primaryPrice?.billingCycleName ?? 'Weekly'}
            </p>
          </div>
          <div
            className="w-px shrink-0 self-stretch"
            style={{ backgroundColor: SEP }}
            aria-hidden
          />
        </div>
      ) : (
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
                <p className={cn('mt-1 text-[12px] leading-[14px] font-medium', MUTE)}>
                  {item?.billingCycleName ?? ['Weekly', '3 Months', '6 Months'][index]}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <HRule />

      {/* Features */}
      <div className="px-5 py-4">
        <p className={cn('mb-3 text-[12px] leading-[14px] font-medium', MUTE)}>Features</p>
        <ul className="max-h-[125px] space-y-2.5 overflow-hidden">
          {featureLines.slice(0, 4).map((feature) => (
            <li
              key={feature}
              className="flex items-start gap-2.5 text-[14px] leading-5 font-medium text-white"
            >
              <Check className="mt-0.5 size-3.5 shrink-0 text-white" strokeWidth={2.25} />
              <span className="line-clamp-1">{feature}</span>
            </li>
          ))}
          {!featureLines.length ? (
            <li className={cn('text-[14px] leading-5', MUTE)}>No features configured</li>
          ) : null}
        </ul>
      </div>

      <HRule />

      {/* Subscription Stats */}
      <div className="px-5 py-4">
        <p className={cn('mb-3 text-[12px] leading-[14px] font-medium', MUTE)}>
          Subscription Stats
        </p>
        <div className="grid grid-cols-4 gap-2">
          <StatPill label="Total" value={stats?.total ?? 0} />
          <StatPill label="Weekly" value={stats?.weekly ?? 0} />
          <StatPill label="3 Months" value={stats?.threeMonths ?? 0} />
          <StatPill label="6 Months" value={stats?.sixMonths ?? 0} />
        </div>
      </div>

      {/* Meta + CTA */}
      <div className="mt-auto flex flex-col gap-3 px-5 pt-1 pb-5">
        {!isDeleted ? (
          <div className="flex items-center justify-between gap-3">
            <span className={cn('text-[12px] leading-[14px] font-medium', MUTE)}>
              Version :{plan.version}
            </span>
            <span
              className={cn(
                'inline-flex h-5 items-center justify-center rounded-[10px] px-2.5 text-[10px] leading-[14px] font-semibold',
                getStatusClassName(plan.status),
              )}
            >
              {getStatusLabel(plan.status)}
            </span>
          </div>
        ) : (
          <p className={cn('text-[12px] leading-[14px] font-medium', MUTE)}>
            Version :{plan.version}
          </p>
        )}

        <div className={cn('space-y-1 text-[12px] leading-[14px] font-medium', MUTE)}>
          <p>Created: {formatMembershipDate(plan.createdAt)}</p>
          <p>
            Updated: {formatMembershipDate(plan.updatedAt)}
            {plan.updatedBy ? ` by ${plan.updatedBy}` : ''}
          </p>
        </div>

        {plan.status === 'paused' ? (
          <button
            type="button"
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-[10px] bg-[#00A63E] text-[14px] leading-5 font-semibold text-white transition-[filter] hover:brightness-95"
            onClick={() => onResume?.(plan)}
          >
            Resume Plan
            <Play className="size-4 fill-white" strokeWidth={1.75} />
          </button>
        ) : null}

        {plan.status === 'inactive' ? (
          <button
            type="button"
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-[10px] bg-[#00A63E] text-[14px] leading-5 font-semibold text-white transition-[filter] hover:brightness-95"
            onClick={() => onActivate?.(plan)}
          >
            Retrieve Plan
            <RefreshCw className="size-4" strokeWidth={1.75} />
          </button>
        ) : null}

        {plan.status === 'active' ? (
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
    <div className="flex h-[66px] min-w-0 flex-col items-center justify-center rounded-[8px] bg-[#050505] px-1 text-center">
      <p className={cn('text-[10px] leading-[14px] font-medium', MUTE)}>{label}</p>
      <p className="mt-1 text-[14px] leading-5 font-semibold text-white tabular-nums">{value}</p>
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
