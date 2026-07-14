import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'

import type { NavItem } from '@/app/layouts/navigation/navigation.config'
import { SidebarItem } from '@/app/layouts/components/sidebar-item'
import { getFirstNavigableTo, isNavItemActive } from '@/app/layouts/navigation/sidebar-utils'
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
  const isInactiveModule = isTopLevel && Boolean(activeTopLevelKey) && !isActiveModule

  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (isActiveModule && isChildActive) {
      setIsOpen(true)
    } else if (isInactiveModule) {
      setIsOpen(false)
    }
  }, [isActiveModule, isChildActive, isInactiveModule])

  const children = item.children ?? []
  const hasChildren = children.length > 0
  const firstTo = getFirstNavigableTo(item)

  // Expanded: inactive modules cannot open their submenu (only switch by navigating).
  // Collapsed: inactive modules are fully blocked.
  const blockInactive = isInactiveModule && compact
  const canExpandOwnSubmenu =
    hasChildren && !compact && !isInactiveModule && (isActiveModule || !isTopLevel)

  const shouldShowChildren = canExpandOwnSubmenu && isOpen

  let itemTo: string | undefined
  if (blockInactive) {
    itemTo = undefined
  } else if (isInactiveModule && !compact) {
    // Clicking a dimmed module switches into it — never opens its submenu here
    itemTo = firstTo
  } else if (hasChildren) {
    itemTo = compact && isActiveModule ? firstTo : undefined
  } else {
    itemTo = item.to
  }

  return (
    <div
      className={cn(
        'space-y-1 transition-opacity duration-200',
        isInactiveModule && 'opacity-40',
        blockInactive && 'pointer-events-none select-none',
      )}
    >
      <SidebarItem
        label={item.label}
        to={itemTo}
        icon={item.icon}
        badge={item.badge}
        depth={depth}
        active={isChildActive}
        moduleActive={isActiveModule}
        disabled={blockInactive}
        expandable={hasChildren && !compact}
        expanded={Boolean(shouldShowChildren)}
        compact={compact}
        onToggle={
          canExpandOwnSubmenu && !itemTo ? () => setIsOpen((prev) => !prev) : undefined
        }
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
