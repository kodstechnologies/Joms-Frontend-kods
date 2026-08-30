import { describe, expect, it } from 'vitest'

import type { NavItem } from '@/app/layouts/navigation/navigation.config'
import {
  findActiveTopLevelKey,
  getFirstNavigableTo,
  isNavItemActive,
} from '@/app/layouts/navigation/sidebar-utils'

const child: NavItem = {
  key: 'revenue',
  label: 'Revenue',
  to: '/finance/revenue',
}

const parent: NavItem = {
  key: 'finance',
  label: 'Finance',
  children: [child],
}

const membership: NavItem = {
  key: 'membership',
  label: 'Membership',
  to: '/memberships/plans',
}

describe('sidebar-utils', () => {
  it('matches a leaf path and nested parents', () => {
    expect(isNavItemActive(child, '/finance/revenue')).toBe(true)
    expect(isNavItemActive(child, '/finance/refunds')).toBe(false)
    expect(isNavItemActive(parent, '/finance/revenue')).toBe(true)
  })

  it('treats /memberships as the membership nav item', () => {
    expect(isNavItemActive(membership, '/memberships/subscribers')).toBe(true)
  })

  it('finds the active top-level key and first navigable child', () => {
    expect(findActiveTopLevelKey([parent, membership], '/finance/revenue')).toBe('finance')
    expect(findActiveTopLevelKey([parent], '/settings')).toBeNull()
    expect(getFirstNavigableTo(parent)).toBe('/finance/revenue')
    expect(getFirstNavigableTo({ key: 'empty', label: 'Empty' })).toBeUndefined()
  })
})
