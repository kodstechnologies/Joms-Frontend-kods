import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'

import type { NavItem } from '@/app/layouts/navigation/navigation.config'
import { SidebarItem } from '@/app/layouts/components/sidebar-item'
import { isNavItemActive } from '@/app/layouts/navigation/sidebar-utils'
import { cn } from '@/shared/lib/cn'

type SidebarGroupProps = {
  item: NavItem
  compact?: boolean
  depth?: number
  activeTopLevelKey?: string | null
  onNavigate?: () => void
}

export function SidebarGroup({
  item,
  compact = false,
  depth = 0,
  activeTopLevelKey = null,
  onNavigate,
}: SidebarGroupProps) {
  const location = useLocation()

  const isChildActive = useMemo(
    () => isNavItemActive(item, location.pathname),
    [item, location.pathname],
  )

  const isTopLevel = depth === 0
  const isActiveModule = isTopLevel && activeTopLevelKey === item.key
  const isDimmed = isTopLevel && Boolean(activeTopLevelKey) && !isActiveModule

  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (isChildActive && (!activeTopLevelKey || isActiveModule)) {
      setIsOpen(true)
    } else if (isDimmed) {
      setIsOpen(false)
    }
  }, [activeTopLevelKey, isActiveModule, isChildActive, isDimmed])

  const children = item.children ?? []
  const hasChildren = children.length > 0
  const shouldShowChildren = hasChildren && isOpen && !compact && !isDimmed

  return (
    <div className={cn('space-y-1', isDimmed && 'opacity-35')}>
      <SidebarItem
        label={item.label}
        to={hasChildren ? undefined : item.to}
        icon={item.icon}
        badge={item.badge}
        depth={depth}
        active={isChildActive}
        moduleActive={isActiveModule}
        dimmed={isDimmed}
        expandable={hasChildren && !compact}
        expanded={isOpen}
        compact={compact}
        onToggle={hasChildren && !compact ? () => setIsOpen((prev) => !prev) : undefined}
        onNavigate={onNavigate}
      />

      {shouldShowChildren ? (
        <div className="space-y-1 py-1">
          {children.map((child) => {
            if (child.children && child.children.length > 0) {
              return (
                <div key={child.key} style={{ paddingLeft: '0.75rem' }}>
                  <SidebarGroup
                    item={child}
                    depth={depth + 1}
                    activeTopLevelKey={activeTopLevelKey}
                    onNavigate={onNavigate}
                  />
                </div>
              )
            }

            return (
              <SidebarItem
                key={child.key}
                label={child.label}
                to={child.to}
                icon={child.icon}
                badge={child.badge}
                depth={depth + 1}
                moduleActive={isActiveModule}
                onNavigate={onNavigate}
              />
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
