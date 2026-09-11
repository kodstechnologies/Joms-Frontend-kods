import React, { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { NotificationPanel } from './notification-dropdown'

vi.mock('@/modules/notifications', () => ({
  useMyNotifications: () => ({
    data: { data: [], meta: { total: 0 } },
    isLoading: false,
  }),
  useMarkNotificationRead: () => ({ mutate: vi.fn() }),
  useUnreadNotificationCount: () => ({ data: 0 }),
}))

const renderPanel = (root: Root, props: { open: boolean; onClose?: () => void }) => {
  root.render(
    <MemoryRouter>
      <NotificationPanel open={props.open} onClose={props.onClose ?? (() => undefined)} />
    </MemoryRouter>,
  )
}

describe('NotificationPanel a11y', () => {
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

  it('does not keep a hidden dialog with focusable controls when closed', () => {
    act(() => {
      renderPanel(root, { open: false })
    })

    expect(host.querySelector('[role="dialog"]')).toBeNull()
    expect(host.querySelector('[aria-label="Close notifications panel"]')).toBeNull()
    expect(host.querySelector('[aria-hidden="true"]')).toBeNull()
  })

  it('exposes a dialog without aria-hidden while open', () => {
    act(() => {
      renderPanel(root, { open: true })
    })

    const dialog = host.querySelector('[role="dialog"]')
    expect(dialog?.tagName).toBe('DIV')
    expect(dialog?.getAttribute('aria-modal')).toBe('true')
    expect(dialog?.getAttribute('aria-hidden')).toBeNull()
    expect(host.querySelector('[aria-label="Close notifications panel"]')).toBeTruthy()
  })
})
