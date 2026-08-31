/** @vitest-environment jsdom */
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { ClipboardList } from 'lucide-react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { SidebarItem } from '@/app/layouts/components/sidebar-item'

describe('SidebarItem', () => {
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

  it('renders a navigable link when to is provided', () => {
    act(() => {
      root.render(
        <MemoryRouter>
          <SidebarItem label="My Task" to="/my-tasks" icon={ClipboardList} />
        </MemoryRouter>,
      )
    })

    const link = host.querySelector('a[href="/my-tasks"]')
    expect(link).toBeTruthy()
    expect(link?.textContent).toContain('My Task')
  })

  it('calls onToggle for expandable items without a route', () => {
    const onToggle = vi.fn()

    act(() => {
      root.render(
        <MemoryRouter>
          <SidebarItem label="Services" expandable expanded={false} onToggle={onToggle} />
        </MemoryRouter>,
      )
    })

    const button = host.querySelector('button') as HTMLButtonElement
    act(() => {
      button.click()
    })

    expect(onToggle).toHaveBeenCalledTimes(1)
  })

  it('calls onNavigate when a link is clicked', () => {
    const onNavigate = vi.fn()

    act(() => {
      root.render(
        <MemoryRouter>
          <SidebarItem label="Settings" to="/settings/health" onNavigate={onNavigate} />
        </MemoryRouter>,
      )
    })

    const link = host.querySelector('a[href="/settings/health"]') as HTMLAnchorElement
    act(() => {
      link.click()
    })

    expect(onNavigate).toHaveBeenCalledTimes(1)
  })

  it('uses aria-label in compact mode', () => {
    act(() => {
      root.render(
        <MemoryRouter>
          <SidebarItem label="Executive Dashboard" to="/dashboard/executive" compact />
        </MemoryRouter>,
      )
    })

    expect(host.querySelector('[aria-label="Executive Dashboard"]')).toBeTruthy()
  })
})
