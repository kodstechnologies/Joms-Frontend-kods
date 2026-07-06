import type { LucideIcon } from 'lucide-react'
import { ChevronDown } from 'lucide-react'
import { NavLink } from 'react-router-dom'

import { cn } from '@/shared/lib/cn'
import { uiTokens } from '@/shared/lib/design-tokens'

type SidebarItemProps = {
  label: string
  to?: string
  icon?: LucideIcon
  badge?: { label: string; variant?: 'default' | 'success' | 'warning' }
  depth?: number
  active?: boolean
  expandable?: boolean
  expanded?: boolean
  onToggle?: () => void
  onNavigate?: () => void
  compact?: boolean
}

export function SidebarItem({
  label,
  to,
  icon: Icon,
  badge,
  depth = 0,
  active,
  expandable,
  expanded,
  onToggle,
  onNavigate,
  compact = false,
}: SidebarItemProps) {
  const paddingLeft = compact
    ? depth === 0
      ? 'pl-2'
      : 'pl-3'
    : depth === 0
      ? 'pl-3'
      : depth === 1
        ? 'pl-8'
        : 'pl-11'

  const renderContent = (isActive?: boolean) => (
    <div
      className={cn(
        'flex items-center gap-3 py-2.5 pr-3 text-sm transition-colors duration-200',
        uiTokens.radiusSoft,
        paddingLeft,
        isActive ?? active
          ? 'bg-brand-accent/15 text-brand-text ring-1 ring-brand-accent/30'
          : 'text-brand-stroke hover:bg-white/5 hover:text-brand-text',
      )}
    >
      {Icon ? (
        <Icon className="size-4 shrink-0 opacity-90 transition-opacity duration-200" />
      ) : (
        <span className="size-4 shrink-0" />
      )}
      {!compact ? <span className="min-w-0 flex-1 truncate">{label}</span> : null}
      {!compact && badge ? (
        <span
          className={cn(
            'rounded-full border px-2 py-0.5 text-[11px] font-semibold',
            badge.variant === 'success' && 'border-brand-success/30 bg-brand-success/10 text-brand-success',
            badge.variant === 'warning' && 'border-brand-accent/30 bg-brand-accent/10 text-brand-accent',
            (!badge.variant || badge.variant === 'default') && 'border-white/10 bg-white/10 text-brand-stroke',
          )}
        >
          {badge.label}
        </span>
      ) : null}
      {expandable ? (
        <ChevronDown
          className={cn('size-4 shrink-0 transition-transform', expanded ? 'rotate-180' : 'rotate-0')}
        />
      ) : null}
    </div>
  )

  if (to) {
    return (
      <NavLink
        to={to}
        onClick={onNavigate}
        aria-label={compact ? label : undefined}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent/30"
      >
        {({ isActive }) => renderContent(isActive)}
      </NavLink>
    )
  }

  if (!onToggle) {
    return <div className="cursor-pointer">{renderContent()}</div>
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      className="w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent/30"
      aria-label={compact ? label : undefined}
    >
      {renderContent()}
    </button>
  )
}
