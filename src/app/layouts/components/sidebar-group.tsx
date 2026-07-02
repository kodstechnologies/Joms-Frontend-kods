import { useMemo, useState, useEffect } from 'react'
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
    const checkActive = (navItem: NavItem): boolean => {
      if (navItem.to && matchPath({ path: navItem.to, end: false }, location.pathname)) {
        return true
      }
      if (navItem.children) {
        return navItem.children.some(checkActive)
      }
      return false
    }

    return item.children?.some(checkActive) ?? false
  }, [item.children, location.pathname])

 const [isOpen, setIsOpen] = useState(false)

useEffect(() => {
  if (isChildActive) {
    setIsOpen(true)
  }
}, [isChildActive])

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
        expanded={isOpen}
        compact={compact}
        onToggle={() => setIsOpen((prev) => !prev)}
        onNavigate={onNavigate}
      />

      {hasChildren ? (
        <div
          className={cn(
            'grid transition-[grid-template-rows] duration-300 ease-out',
            isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
          )}
        >
          <div className="min-h-0 overflow-hidden">
            <div className="space-y-1 py-1">
              {children.map((child) => {
                if (child.children && child.children.length > 0) {
                  return (
                    <div key={child.key} style={{ paddingLeft: compact ? '0' : '0.75rem' }}>
                      <SidebarGroup item={child} compact={compact} onNavigate={onNavigate} />
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
                    depth={1}
                    onNavigate={onNavigate}
                    compact={compact}
                  />
                )
              })}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
