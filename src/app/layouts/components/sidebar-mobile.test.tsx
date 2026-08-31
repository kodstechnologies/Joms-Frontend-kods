import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { SidebarMobile } from './sidebar-mobile'

vi.mock('@/app/layouts/components/sidebar-nav', () => ({
  Sidebar: () => <nav>Sidebar nav</nav>,
}))

vi.mock('@/app/layouts/components/sidebar-brand', () => ({
  SidebarBrand: () => <span>JOMS</span>,
}))

describe('SidebarMobile a11y', () => {
  let root: Root
  let host: HTMLDivElement

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

  it('does not leave a dialog in the tree when closed', () => {
    act(() => {
      root.render(<SidebarMobile open={false} onClose={() => undefined} />)
    })

    expect(host.querySelector('[role="dialog"]')).toBeNull()
    expect(host.querySelector('[aria-hidden="true"]')).toBeNull()
  })

  it('exposes a real dialog only while open', () => {
    const onClose = vi.fn()
    act(() => {
      root.render(<SidebarMobile open onClose={onClose} />)
    })

    const dialog = host.querySelector('[role="dialog"]')
    expect(dialog?.tagName).toBe('DIV')
    expect(dialog?.getAttribute('aria-modal')).toBe('true')
    expect(dialog?.getAttribute('aria-label')).toBe('Sidebar navigation')
    expect(dialog?.getAttribute('aria-hidden')).toBeNull()
  })
})
