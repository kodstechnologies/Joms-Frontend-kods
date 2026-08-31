import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { getDefaultHomeRoute } from '@/app/layouts/navigation/navigation.filter'
import { LoginPage } from '@/modules/auth/pages/login-page'
import { postLoginPath } from '@/modules/auth/utils/post-login-path'

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), warning: vi.fn() },
}))

vi.mock('@/modules/auth/hooks/use-login-mutation', () => ({
  useLoginMutation: () => ({ mutateAsync: vi.fn(), isPending: false }),
}))

vi.mock('@/modules/auth/hooks/use-verify-otp-mutation', () => ({
  useVerifyOtpMutation: () => ({ mutateAsync: vi.fn(), isPending: false }),
}))

const adminUser = {
  id: '1',
  email: 'admin@example.com',
  fullname: 'Admin',
  kind: 'superadmin' as const,
  isSuperAdmin: true,
  permissions: [],
}

describe('UX-01 / DEF-UX-002 login heuristics', () => {
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

  it('email placeholder is instruction text, not a filled-looking address', () => {
    act(() => {
      root.render(
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>,
      )
    })

    const email = host.querySelector('input[type="email"]') as HTMLInputElement | null
    expect(email).toBeTruthy()
    expect(email?.value).toBe('')
    expect(email?.placeholder).toBe('Enter your email')
    expect(email?.placeholder).not.toMatch(/@/)
  })

  it('postLoginPath keeps deep link to finance (DEF-UX-002)', () => {
    expect(
      postLoginPath(
        adminUser,
        { pathname: '/finance/revenue', search: '?q=1', hash: '#row' },
        getDefaultHomeRoute,
      ),
    ).toBe('/finance/revenue?q=1#row')
  })

  it('postLoginPath ignores /auth paths and uses default home', () => {
    const home = getDefaultHomeRoute(adminUser)
    expect(postLoginPath(adminUser, { pathname: '/auth/login' }, getDefaultHomeRoute)).toBe(home)
    expect(postLoginPath(adminUser, null, getDefaultHomeRoute)).toBe(home)
  })
})
