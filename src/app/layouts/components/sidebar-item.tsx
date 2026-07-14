import type { LucideIcon } from 'lucide-react'
import { ChevronDown } from 'lucide-react'
import { NavLink } from 'react-router-dom'

import { cn } from '@/shared/lib/cn'

type SidebarItemProps = {
  label: string
  to?: string
  icon?: LucideIcon
  badge?: { label: string; variant?: 'default' | 'success' | 'warning' }
  depth?: number
  active?: boolean
  expandable?: boolean
  expanded?: boolean
  dimmed?: boolean
  moduleActive?: boolean
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
  dimmed = false,
  moduleActive = false,
  onToggle,
  onNavigate,
  compact = false,
}: SidebarItemProps) {
  const paddingLeft = compact
    ? 'px-0'
    : depth === 0
      ? 'pl-3'
      : depth === 1
        ? 'pl-8'
        : 'pl-11'

  const renderContent = (isActive?: boolean) => {
    const resolvedActive = isActive ?? active
    const showCompactActive = compact && depth === 0 && (moduleActive || resolvedActive)

    return (
      <div
        className={cn(
          'flex items-center gap-3 text-sm transition-all duration-200',
          compact ? 'justify-center py-1.5' : 'py-2 pr-3',
          paddingLeft,
          dimmed && !compact && 'opacity-35',
          showCompactActive
            ? 'mx-auto size-10 rounded-xl bg-white text-brand-text-dark shadow-sm'
            : compact
              ? 'mx-auto size-10 text-white/35'
              : resolvedActive && depth > 0
                ? 'text-white'
                : resolvedActive
                  ? 'text-white'
                  : depth > 0
                    ? 'text-white/45 hover:text-white/70'
                    : 'text-white/80 hover:text-white',
        )}
      >
        {Icon ? (
          <Icon
            className={cn(
              'shrink-0 transition-colors duration-200',
              compact ? 'size-[18px]' : 'size-4',
              showCompactActive ? 'text-brand-text-dark' : '',
            )}
          />
        ) : (
          <span className={cn('shrink-0', compact ? 'size-[18px]' : 'size-4')} />
        )}
        {!compact ? (
          <span
            className={cn(
              'min-w-0 flex-1 truncate',
              resolvedActive && depth > 0 && 'border-b border-white pb-0.5',
            )}
          >
            {label}
          </span>
        ) : null}
        {!compact && badge ? (
          <span
            className={cn(
              'rounded-full border px-2 py-0.5 text-[11px] font-semibold',
              badge.variant === 'success' && 'border-brand-success/30 bg-brand-success/10 text-brand-success',
              badge.variant === 'warning' && 'border-brand-accent/30 bg-brand-accent/10 text-brand-accent',
              (!badge.variant || badge.variant === 'default') && 'border-white/10 bg-white/10 text-white/60',
            )}
          >
            {badge.label}
          </span>
        ) : null}
        {!compact && expandable ? (
          <ChevronDown
            className={cn('size-4 shrink-0 transition-transform', expanded ? 'rotate-180' : 'rotate-0')}
          />
        ) : null}
      </div>
    )
  }

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
