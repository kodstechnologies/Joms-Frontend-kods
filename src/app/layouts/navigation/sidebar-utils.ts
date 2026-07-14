import { matchPath } from 'react-router-dom'

import type { NavItem } from '@/app/layouts/navigation/navigation.config'

export function isNavItemActive(navItem: NavItem, pathname: string): boolean {
  if (navItem.to && matchPath({ path: navItem.to, end: false }, pathname)) {
    return true
  }

  return navItem.children?.some((child) => isNavItemActive(child, pathname)) ?? false
}

export function findActiveTopLevelKey(items: NavItem[], pathname: string): string | null {
  for (const item of items) {
    if (isNavItemActive(item, pathname)) {
      return item.key
    }
  }

  return null
}
