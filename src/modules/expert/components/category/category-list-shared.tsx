import type { LucideIcon } from 'lucide-react'
import { Hourglass, Trash2, SlidersHorizontal } from 'lucide-react'
import createIcon from '@/assets/JOMS_ICONS-2/icons8-create.svg'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'
import { statusCardTones } from '@/shared/lib/design-tokens'

export const CATEGORY_ACTION_ITEM_CLASS = 'text-slate-800 hover:bg-slate-100 hover:text-slate-900'
export const CATEGORY_TABLE_VIEW_BUTTON_CLASS =
  'rounded p-1 text-muted transition-colors hover:bg-white/10 hover:text-brand-text'

export function CategoryStatusBadge({ status }: { status: string }) {
  const normalized = status.trim().toLowerCase()

  const className = cn(
    'text-body-sm rounded px-2 py-0.5 font-bold uppercase',
    normalized === 'accepted' || normalized === 'active'
      ? 'bg-brand-positive/15 text-brand-positive'
      : normalized === 'pending'
        ? 'bg-brand-accent/15 text-brand-accent'
        : normalized === 'paused'
          ? 'bg-brand-accent/15 text-brand-accent'
          : normalized === 'deleted'
            ? 'bg-brand-danger/15 text-brand-danger'
            : 'bg-white/10 text-muted',
  )

  const label = normalized === 'accepted' ? 'Active' : normalized === 'active' ? 'Active' : status

  return <span className={className}>{label}</span>
}

export function CategoryManagementPageHeader({
  title,
  subtitle = 'Monitor and manage all categories and sub-categories',
  metricsPath,
  createPath,
}: {
  title: string
  subtitle?: string
  metricsPath: string
  createPath: string
}) {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
      <div>
        <h1 className="text-h2 md:text-h1 text-brand-text">{title}</h1>
        <p className="text-body-sm text-muted md:text-body-md mt-1">{subtitle}</p>
      </div>
      <div className="flex w-full flex-col items-center gap-3 md:w-auto md:flex-row">
        <Button
          className="ui-manage-metrics h-9 w-full md:w-auto"
          onClick={() => navigate(metricsPath)}
        >
          <SlidersHorizontal className="size-4" />
          Manage Metrics
        </Button>

        <Button type="button" className="h-9 w-full md:w-auto" onClick={() => navigate(createPath)}>
          <img src={createIcon} alt="create" className="size-4" />
          Add New Category
        </Button>
      </div>
    </div>
  )
}

export function CategoryQuickLinkCard({
  title,
  value,
  icon: Icon,
  gradient,
  border,
  onClick,
}: {
  title: string
  value: string
  icon: LucideIcon
  gradient: string
  border: string
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex min-h-[72px] min-w-[220px] flex-1 items-center justify-between rounded-[10px] border px-6 py-5 transition-all hover:brightness-110',
        gradient,
        border,
      )}
    >
      <div className="flex items-center gap-4">
        <Icon className="size-6 text-white" aria-hidden="true" />
        <span className="text-base font-semibold text-white">{title}</span>
      </div>
      <span className="text-lg font-bold text-white">{value.padStart(2, '0')}</span>
    </button>
  )
}

export function CategoryQuickLinks({
  pausedCount,
  deletedCount,
  pausedPath,
  deletedPath,
}: {
  pausedCount: number
  deletedCount: number
  pausedPath: string
  deletedPath: string
}) {
  const navigate = useNavigate()

  return (
    <div className="ui-status-card-row md:gap-4">
      <CategoryQuickLinkCard
        title="Paused Category"
        value={String(pausedCount)}
        icon={Hourglass}
        gradient={statusCardTones.warning.background}
        border={statusCardTones.warning.border}
        onClick={() => navigate(pausedPath)}
      />
      <CategoryQuickLinkCard
        title="Deleted Category"
        value={String(deletedCount)}
        icon={Trash2}
        gradient={statusCardTones.danger.background}
        border={statusCardTones.danger.border}
        onClick={() => navigate(deletedPath)}
      />
    </div>
  )
}
