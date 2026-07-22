import {
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
  SquareDashed,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { LucideIcon } from 'lucide-react'

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
    <article className="bg-brand-bg relative flex h-full flex-col rounded-2xl border border-white/10 p-5 shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <div className="bg-brand-surface flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10">
            {plan.icon ? (
              <img src={plan.icon} alt={plan.planName} className="size-full object-cover" />
            ) : (
              <Image className="text-muted size-5" />
            )}
          </div>

          <div className="min-w-0 space-y-1">
            <h3 className="truncate text-base font-semibold text-white">{plan.planName}</h3>
            <p className="text-muted text-xs">{plan.planId}</p>
          </div>
        </div>

        <div className="flex shrink-0 items-start gap-2">
          <span
            className={cn(
              'rounded-full border px-2.5 py-1 text-[10px] font-semibold',
              plan.type === 'user'
                ? 'border-brand-positive/25 bg-brand-positive/10 text-brand-positive'
                : 'border-brand-accent/30 bg-brand-accent/12 text-brand-accent',
            )}
          >
            {getTypeLabel(plan.type)}
          </span>

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="text-muted hover:text-brand-text rounded-lg p-1.5 transition-colors hover:bg-white/10"
              aria-label="Plan actions"
            >
              <MoreVertical className="size-4" />
            </button>

            {menuOpen ? (
              <div className="absolute right-0 z-30 mt-2 w-[230px] rounded-xl bg-white p-2 shadow-[0_16px_40px_rgba(0,0,0,0.35)]">
                <MenuButton
                  label="View Details"
                  icon={ClipboardList}
                  onClick={() => runAction(onEdit)}
                />
                <MenuButton
                  label="View Version History"
                  icon={CircleArrowUp}
                  onClick={() => runAction(onViewVersions)}
                />
                <MenuButton
                  label="View Feature List"
                  icon={CircleArrowDown}
                  onClick={() => runAction(onViewFeatures)}
                />
                <MenuButton
                  label="Set Plan validity"
                  icon={CalendarRange}
                  onClick={() => runAction(onSetValidity)}
                />
                {plan.status === 'active' ? (
                  <MenuButton
                    label="Pause Plan"
                    icon={Pause}
                    onClick={() => runAction(onPause)}
                    danger
                  />
                ) : null}
                {plan.status === 'paused' ? (
                  <MenuButton
                    label="Resume Plan"
                    icon={PlayCircle}
                    onClick={() => runAction(onResume)}
                  />
                ) : null}
                {plan.status === 'inactive' ? (
                  <MenuButton
                    label="Activate Plan"
                    icon={Power}
                    onClick={() => runAction(onActivate)}
                  />
                ) : null}
                {plan.status !== 'deleted' ? (
                  <>
                    {plan.status === 'active' ? (
                      <MenuButton
                        label="Deactivate Plan"
                        icon={SquareDashed}
                        onClick={() => runAction(onDeactivate)}
                        danger
                      />
                    ) : null}
                    <MenuButton
                      label="Delete Plan"
                      icon={CircleX}
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

      <div className="mt-5 grid grid-cols-3 gap-2">
        {plan.pricing.map((item) => (
          <div
            key={item.billingCycleName}
            className="rounded-lg border border-white/5 bg-black/30 px-2 py-2.5 text-center"
          >
            <p className="text-muted text-[10px]">{item.billingCycleName}</p>
            <p className="mt-1 text-sm font-semibold text-white">
              {formatCurrency(getDiscountedPrice(item.price, item.discount))}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-5">
        <p className="text-muted mb-3 text-xs font-medium">Features</p>
        <ul className="space-y-2">
          {featureLines.slice(0, 4).map((feature) => (
            <li key={feature} className="text-muted flex items-start gap-2 text-xs">
              <Check className="mt-0.5 size-3 shrink-0 text-white" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-5 rounded-xl border border-white/5 bg-black/30 p-3">
        <p className="text-muted mb-3 text-[10px] font-semibold tracking-wide uppercase">
          Subscription Stats
        </p>
        <div className="grid grid-cols-4 gap-2">
          <StatPill label="Total" value={stats?.total ?? 0} />
          <StatPill label="Weekly" value={stats?.weekly ?? 0} />
          <StatPill label="3 Months" value={stats?.threeMonths ?? 0} />
          <StatPill label="6 Months" value={stats?.sixMonths ?? 0} />
        </div>
      </div>

      <div className="text-muted mt-4 flex flex-wrap items-center justify-between gap-2 text-[10px]">
        <span>Version :{plan.version}</span>
        <span
          className={cn(
            'rounded-full border px-2.5 py-0.5 text-[10px] font-semibold',
            getStatusClassName(plan.status),
          )}
        >
          {getStatusLabel(plan.status)}
        </span>
      </div>

      <p className="text-muted mt-2 text-[10px] leading-relaxed">
        Created: {formatMembershipDate(plan.createdAt)} · Updated:{' '}
        {formatMembershipDate(plan.updatedAt)}
        {plan.updatedBy ? ` by ${plan.updatedBy}` : ''}
      </p>

      <div className="mt-4 flex gap-2">
        {plan.status !== 'deleted' ? (
          <button
            type="button"
            className="ui-cta ui-cta-primary w-full"
            onClick={() => onEdit?.(plan)}
          >
            <Pencil className="size-4" />
            Edit
          </button>
        ) : null}
        {plan.status === 'paused' ? (
          <button
            type="button"
            className="ui-cta ui-cta-primary flex-1"
            onClick={() => onResume?.(plan)}
          >
            Resume Plan
          </button>
        ) : null}
        {plan.status === 'inactive' ? (
          <button
            type="button"
            className="ui-cta ui-cta-primary flex-1"
            onClick={() => onActivate?.(plan)}
          >
            Activate Plan
          </button>
        ) : null}
      </div>
    </article>
  )
}

function StatPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-brand-bg rounded-lg border border-white/5 px-2 py-2 text-center">
      <p className="text-muted text-[10px]">{label}</p>
      <p className="mt-1 text-sm font-semibold text-white">{value}</p>
    </div>
  )
}

function MenuButton({
  label,
  onClick,
  icon: Icon,
  danger = false,
}: {
  label: string
  onClick: () => void
  icon: LucideIcon
  danger?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors',
        danger ? 'text-brand-danger hover:bg-brand-danger/8' : 'text-black hover:bg-black/5',
      )}
    >
      <Icon className="size-4 shrink-0" strokeWidth={1.85} />
      <span>{label}</span>
    </button>
  )
}
