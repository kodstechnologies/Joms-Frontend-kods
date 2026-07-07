import type { LucideIcon } from 'lucide-react'
import { BarChart3, Hourglass, Plus, Trash2,SlidersHorizontal } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'

export const CATEGORY_ACTION_MENU_CLASS = 'border border-slate-200 bg-white shadow-xl'
export const CATEGORY_ACTION_ITEM_CLASS =
  'text-slate-800 hover:bg-slate-100 hover:text-slate-900'
export const CATEGORY_TABLE_VIEW_BUTTON_CLASS =
  'rounded p-1 text-[#777] transition-colors hover:bg-white/10 hover:text-white'

export function CategoryStatusBadge({ status }: { status: string }) {
  const normalized = status.trim().toLowerCase()

  const className = cn(
    'rounded px-2 py-0.5 text-[10px] font-bold uppercase',
    normalized === 'accepted' || normalized === 'active'
      ? 'bg-green-500/10 text-green-500'
      : normalized === 'pending'
        ? 'bg-amber-500/10 text-amber-500'
        : normalized === 'paused'
          ? 'bg-purple-500/10 text-purple-400'
          : normalized === 'deleted'
            ? 'bg-red-500/10 text-red-400'
            : 'bg-slate-500/10 text-slate-400',
  )

  const label =
    normalized === 'accepted'
      ? 'Active'
      : normalized === 'active'
        ? 'Active'
        : status

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
        <h1 className="text-2xl font-bold text-white md:text-3xl">{title}</h1>
        <p className="mt-1 text-sm text-slate-400 md:text-base">{subtitle}</p>
      </div>
      <div className="flex w-full flex-col items-center gap-3 md:w-auto md:flex-row">
        <Button
          className="h-9 w-full bg-[#FBC078] text-black hover:bg-[#eeb46a] md:w-auto"
          onClick={() => navigate('/services/dashboard/metrics')}
        >
          <SlidersHorizontal className="size-4" />
          Manage Metrics
        </Button>

        <Button
          type="button"
          className="h-9 w-full bg-[#FBC078] text-black hover:bg-[#eeb46a] md:w-auto"
          onClick={() => navigate('/venues/categories/management/create')}
        >
          <Plus className="size-4" />
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
        'flex min-h-[72px] min-w-[220px] flex-1 items-center justify-between rounded-xl border px-6 py-5 transition-all hover:brightness-110',
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
    <div className="flex gap-3 overflow-x-auto pb-1 md:gap-4">
      <CategoryQuickLinkCard
        title="Paused Category"
        value={String(pausedCount)}
        icon={Hourglass}
        gradient="bg-gradient-to-r from-amber-700/55 to-transparent"
        border="border-amber-600/60"
        onClick={() => navigate(pausedPath)}
      />
      <CategoryQuickLinkCard
        title="Deleted Category"
        value={String(deletedCount)}
        icon={Trash2}
        gradient="bg-gradient-to-r from-red-800/55 to-transparent"
        border="border-red-800/60"
        onClick={() => navigate(deletedPath)}
      />
    </div>
  )
}
