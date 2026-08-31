import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { SidebarGroup } from '@/app/layouts/components/sidebar-group'
import type { NavItem } from '@/app/layouts/navigation/navigation.config'

const servicesModule: NavItem = {
  key: 'services',
  label: 'Services',
  children: [
    {
      key: 'services.dashboard',
      label: 'Dashboard',
      to: '/services/dashboard',
    },
    {
      key: 'services.management',
      label: 'Service Management',
      to: '/services/management',
    },
    {
      key: 'services.categories',
      label: 'Category Management',
      to: '/categories/management',
    },
  ],
}

describe('SidebarGroup', () => {
  let host: HTMLDivElement
  let root: Root

  beforeEach(() => {
    ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
    host = document.createElement('div')
    document.body.appendChild(host)
    root = createRoot(host)
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    host.remove()
  })

  it('navigates to the first child when switching modules from another active module', () => {
    act(() => {
      root.render(
        <MemoryRouter initialEntries={['/dashboard/executive']}>
          <Routes>
            <Route
              path="*"
              element={<SidebarGroup item={servicesModule} activeTopLevelKey="executive" />}
            />
          </Routes>
        </MemoryRouter>,
      )
    })

    const link = host.querySelector('a[href="/services/dashboard"]') as HTMLAnchorElement
    expect(link).toBeTruthy()
    expect(link.textContent).toContain('Services')
  })

  it('expands submenu items for the active module', () => {
    act(() => {
      root.render(
        <MemoryRouter initialEntries={['/categories/management']}>
          <Routes>
            <Route
              path="*"
              element={<SidebarGroup item={servicesModule} activeTopLevelKey="services" />}
            />
          </Routes>
        </MemoryRouter>,
      )
    })

    expect(host.textContent).toContain('Category Management')
    expect(host.querySelector('a[href="/categories/management"]')).toBeTruthy()
  })

  it('toggles submenu open state when active module header is clicked', () => {
    act(() => {
      root.render(
        <MemoryRouter initialEntries={['/services/dashboard']}>
          <Routes>
            <Route
              path="*"
              element={<SidebarGroup item={servicesModule} activeTopLevelKey="services" />}
            />
          </Routes>
        </MemoryRouter>,
      )
    })

    expect(host.textContent).toContain('Service Management')

    const toggle = host.querySelector('button') as HTMLButtonElement
    expect(toggle).toBeTruthy()

    act(() => {
      toggle.click()
    })

    expect(host.textContent).not.toContain('Service Management')

    act(() => {
      toggle.click()
    })

    expect(host.textContent).toContain('Service Management')
  })

  it('invokes onNavigate after child link click', () => {
    let navigated = false
    const onNavigate = () => {
      navigated = true
    }

    act(() => {
      root.render(
        <MemoryRouter initialEntries={['/categories/management']}>
          <Routes>
            <Route
              path="*"
              element={
                <SidebarGroup
                  item={servicesModule}
                  activeTopLevelKey="services"
                  onNavigate={onNavigate}
                />
              }
            />
          </Routes>
        </MemoryRouter>,
      )
    })

    const childLink = host.querySelector('a[href="/services/management"]') as HTMLAnchorElement
    act(() => {
      childLink.click()
    })

    expect(navigated).toBe(true)
  })
})
