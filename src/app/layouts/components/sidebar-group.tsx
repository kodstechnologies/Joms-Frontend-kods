import { useMemo, useState } from 'react'
import { matchPath, useLocation } from 'react-router-dom'

import type { NavItem } from '@/app/layouts/navigation/navigation.config'
import { SidebarItem } from '@/app/layouts/components/sidebar-item'
import { cn } from '@/shared/lib/cn'

type SidebarGroupProps = {
  item: NavItem
  compact?: boolean
  onNavigate?: () => void
}

export function SidebarGroup({ item, compact = false, onNavigate }: SidebarGroupProps) {
  const location = useLocation()

  const isChildActive = useMemo(() => {
    const children = item.children ?? []
    return children.some((child) => (child.to ? matchPath({ path: child.to, end: false }, location.pathname) : false))
  }, [item.children, location.pathname])

  const [manualOpen, setManualOpen] = useState(false)
  const open = manualOpen || isChildActive

  const children = item.children ?? []
  const hasChildren = children.length > 0

  return (
    <div className="space-y-1">
      <SidebarItem
        label={item.label}
        icon={item.icon}
        badge={item.badge}
        active={isChildActive}
        expandable={hasChildren}
        expanded={open}
        compact={compact}
        onToggle={() => setManualOpen((prev) => !prev)}
        onNavigate={onNavigate}
      />

      {hasChildren ? (
        <div
          className={cn(
            'grid transition-[grid-template-rows] duration-300 ease-out',
            open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
          )}
        >
          <div className="min-h-0 overflow-hidden">
            <div className="space-y-1 py-1">
              {children.map((child) => (
                <SidebarItem
                  key={child.key}
                  label={child.label}
                  to={child.to}
                  icon={child.icon}
                  badge={child.badge}
                  depth={1}
                  onNavigate={onNavigate}
                  compact={compact}
                />
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
