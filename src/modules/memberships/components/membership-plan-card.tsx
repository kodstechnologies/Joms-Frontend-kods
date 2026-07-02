import {
  Check,
  MoreVertical,
  PauseCircle,
  PlayCircle,
  Power,
  Trash2,
} from 'lucide-react'
import { useState } from 'react'

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
import { Button } from '@/shared/components/ui/button'
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
  const featureLines = getFeatureLines(plan.features)
  const stats = plan.subscriptionStats

  return (
    <article className="relative flex h-full flex-col rounded-2xl border border-white/10 bg-[#111111] p-4 shadow-lg">
      {plan.status === 'deleted' ? (
        <span className="absolute right-3 top-3 rounded-full border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-rose-300">
          Deleted Plan
        </span>
      ) : null}

      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-white">{plan.planName}</h3>
            <span
              className={cn(
                'rounded-full border px-2 py-0.5 text-[10px] font-semibold',
                plan.type === 'user'
                  ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-300'
                  : 'border-amber-500/25 bg-amber-500/10 text-amber-300',
              )}
            >
              {getTypeLabel(plan.type)}
            </span>
          </div>
          <p className="text-xs text-slate-400">{plan.planId}</p>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
          >
            <MoreVertical className="size-4" />
          </button>

          {menuOpen ? (
            <div className="absolute right-0 z-20 mt-2 w-48 rounded-xl border border-white/10 bg-[#1A1A1A] p-1 shadow-2xl">
              <MenuButton label="View Details" onClick={() => onEdit?.(plan)} />
              <MenuButton label="View Version History" onClick={() => onViewVersions?.(plan)} />
              <MenuButton label="View Feature List" onClick={() => onViewFeatures?.(plan)} />
              <MenuButton label="Set Plan Validity" onClick={() => onSetValidity?.(plan)} />
              {plan.status === 'active' ? (
                <MenuButton
                  label="Pause Plan"
                  icon={PauseCircle}
                  onClick={() => onPause?.(plan)}
                  danger
                />
              ) : null}
              {plan.status === 'paused' ? (
                <MenuButton
                  label="Resume Plan"
                  icon={PlayCircle}
                  onClick={() => onResume?.(plan)}
                />
              ) : null}
              {plan.status === 'inactive' ? (
                <MenuButton
                  label="Activate Plan"
                  icon={Power}
                  onClick={() => onActivate?.(plan)}
                />
              ) : null}
              {plan.status !== 'deleted' ? (
                <>
                  {plan.status === 'active' ? (
                    <MenuButton
                      label="Deactivate Plan"
                      icon={Power}
                      onClick={() => onDeactivate?.(plan)}
                      danger
                    />
                  ) : null}
                  <MenuButton
                    label="Delete Plan"
                    icon={Trash2}
                    onClick={() => onDelete?.(plan)}
                    danger
                  />
                </>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {plan.pricing.map((item) => (
          <div key={item.billingCycleName} className="rounded-lg bg-white/5 px-2 py-2 text-center">
            <p className="text-[10px] text-slate-400">{item.billingCycleName}</p>
            <p className="mt-1 text-sm font-semibold text-white">
              {formatCurrency(getDiscountedPrice(item.price, item.discount))}
            </p>
          </div>
        ))}
      </div>

      <ul className="mt-4 space-y-2">
        {featureLines.slice(0, 4).map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-xs text-slate-300">
            <Check className="mt-0.5 size-3 shrink-0 text-emerald-400" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <div className="mt-4 rounded-xl border border-white/5 bg-black/30 p-3">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          Subscription Stats
        </p>
        <div className="grid grid-cols-4 gap-2 text-center">
          <StatPill label="Total" value={stats?.total ?? 0} />
          <StatPill label="Weekly" value={stats?.weekly ?? 0} />
          <StatPill label="3 Months" value={stats?.threeMonths ?? 0} />
          <StatPill label="6 Months" value={stats?.sixMonths ?? 0} />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-2 text-[10px] text-slate-400">
        <span>Version {plan.version}</span>
        <span
          className={cn(
            'rounded-full border px-2 py-0.5 font-semibold',
            getStatusClassName(plan.status),
          )}
        >
          {getStatusLabel(plan.status)}
        </span>
      </div>

      <p className="mt-2 text-[10px] leading-relaxed text-slate-500">
        Created {formatMembershipDate(plan.createdAt)} · Updated{' '}
        {formatMembershipDate(plan.updatedAt)}
        {plan.updatedBy ? ` by ${plan.updatedBy}` : ''}
      </p>

      <div className="mt-4 flex gap-2">
        {plan.status !== 'deleted' ? (
          <Button className="flex-1" variant="secondary" onClick={() => onEdit?.(plan)}>
            Edit
          </Button>
        ) : null}
        {plan.status === 'paused' ? (
          <Button className="flex-1" onClick={() => onResume?.(plan)}>
            Resume Plan
          </Button>
        ) : null}
        {plan.status === 'inactive' ? (
          <Button className="flex-1" onClick={() => onActivate?.(plan)}>
            Activate Plan
          </Button>
        ) : null}
      </div>
    </article>
  )
}

function StatPill({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-[10px] text-slate-500">{label}</p>
      <p className="text-sm font-semibold text-slate-100">{value}</p>
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
  icon?: typeof PauseCircle
  danger?: boolean
}) {
  return (
    <button
      type="button"
      onClick={() => {
        onClick()
      }}
      className={cn(
        'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs transition-colors hover:bg-white/5',
        danger ? 'text-rose-300' : 'text-slate-200',
      )}
    >
      {Icon ? <Icon className="size-3.5" /> : null}
      {label}
    </button>
  )
}
