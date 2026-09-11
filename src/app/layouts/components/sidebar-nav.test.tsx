import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { Sidebar } from '@/app/layouts/components/sidebar-nav'
import { useAuthStore } from '@/modules/auth/store/auth-store'

const adminUser = {
  id: '1',
  email: 'admin@example.com',
  fullname: 'Admin',
  kind: 'superadmin' as const,
  isSuperAdmin: true,
  permissions: ['finance.view'],
}

const logoutMutateAsync = vi.fn(async () => ({}))

vi.mock('@/modules/auth/hooks/use-logout-mutation', () => ({
  useLogoutMutation: () => ({
    mutateAsync: logoutMutateAsync,
    isPending: false,
  }),
}))

describe('Sidebar', () => {
  let host: HTMLDivElement
  let root: Root
  let queryClient: QueryClient

  beforeEach(() => {
    ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
    host = document.createElement('div')
    document.body.appendChild(host)
    root = createRoot(host)
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    })
    useAuthStore.getState().setSession(adminUser, 'test-token')
    logoutMutateAsync.mockClear()
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    host.remove()
    queryClient.clear()
    useAuthStore.getState().clearSession()
  })

  const renderSidebar = (props?: { onNavigate?: () => void; compact?: boolean }) => {
    act(() => {
      root.render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={['/dashboard/executive']}>
            <Sidebar {...props} />
          </MemoryRouter>
        </QueryClientProvider>,
      )
    })
  }

  it('renders top-level navigation for a super admin', () => {
    renderSidebar()

    expect(host.textContent).toContain('Executive Dashboard')
    expect(host.textContent).toContain('Expert Application')
    expect(host.textContent).toContain('Payment & Finance')
    expect(host.textContent).toContain('Settings')
    expect(host.textContent).toContain('Log Out')
  })

  it('calls logout and onNavigate when Log Out is clicked', async () => {
    const onNavigate = vi.fn()
    renderSidebar({ onNavigate })

    const logoutButton = host.querySelector('[aria-label="Log Out"]') as HTMLButtonElement
    expect(logoutButton).toBeTruthy()

    await act(async () => {
      logoutButton.click()
      await Promise.resolve()
    })

    expect(logoutMutateAsync).toHaveBeenCalledTimes(1)
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
    expect(onNavigate).toHaveBeenCalledTimes(1)
  })

  it('renders compact logout control without text label', () => {
    renderSidebar({ compact: true })

    expect(host.querySelector('[aria-label="Log Out"]')).toBeTruthy()
    expect(host.textContent).not.toContain('Logging out')
  })
})
