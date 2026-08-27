/** @vitest-environment jsdom */
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
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
      root.render(<NotificationPanel open={false} onClose={() => undefined} />)
    })

    expect(host.querySelector('[role="dialog"]')).toBeNull()
    expect(host.querySelector('[aria-label="Close notifications panel"]')).toBeNull()
    expect(host.querySelector('[aria-hidden="true"]')).toBeNull()
  })

  it('exposes a dialog without aria-hidden while open', () => {
    act(() => {
      root.render(<NotificationPanel open onClose={() => undefined} />)
    })

    const dialog = host.querySelector('[role="dialog"]')
    expect(dialog?.tagName).toBe('DIV')
    expect(dialog?.getAttribute('aria-modal')).toBe('true')
    expect(dialog?.getAttribute('aria-hidden')).toBeNull()
    expect(host.querySelector('[aria-label="Close notifications panel"]')).toBeTruthy()
  })
})
