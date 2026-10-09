import { useMemo, useState } from 'react'
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
  const shouldSwitchModule = isTopLevel && !isActiveModule

  const syncKey = `${isActiveModule}:${isInactiveModule}:${isChildActive}`
  const [openOverride, setOpenOverride] = useState<boolean | null>(null)
  const [prevSyncKey, setPrevSyncKey] = useState(syncKey)

  if (prevSyncKey !== syncKey) {
    setPrevSyncKey(syncKey)
    setOpenOverride(null)
  }

  const defaultOpen = isActiveModule && isChildActive && !isInactiveModule
  const isOpen = openOverride ?? defaultOpen

  const children = item.children ?? []
  const hasChildren = children.length > 0
  const firstTo = getFirstNavigableTo(item)

  const canExpandOwnSubmenu =
    hasChildren && !compact && !shouldSwitchModule && (isActiveModule || !isTopLevel)

  const shouldShowChildren = canExpandOwnSubmenu && isOpen

  let itemTo: string | undefined
  if (shouldSwitchModule && !compact) {
    itemTo = firstTo
  } else if (hasChildren) {
    itemTo = compact ? firstTo : undefined
  } else {
    itemTo = item.to
  }

  return (
    <div
      className={cn(
        'space-y-0.5 transition-opacity duration-200',
        isInactiveModule && !compact && 'opacity-40',
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
        expandable={hasChildren && !compact}
        expanded={Boolean(shouldShowChildren)}
        compact={compact}
        onToggle={
          canExpandOwnSubmenu && !itemTo
            ? () => setOpenOverride((prev) => !(prev ?? defaultOpen))
            : undefined
        }
        onNavigate={onNavigate}
      />

      {shouldShowChildren ? (
        <div className="space-y-0.5 pt-0.5 pb-0.5">
          {children.map((child) => {
            if (child.children && child.children.length > 0) {
              return (
                <SidebarGroup
                  key={child.key}
                  item={child}
                  depth={depth + 1}
                  activeTopLevelKey={activeTopLevelKey}
                  onNavigate={onNavigate}
                />
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
                active={isNavItemActive(child, location.pathname)}
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
