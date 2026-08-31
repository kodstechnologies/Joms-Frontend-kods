import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { useAuthStore } from '@/modules/auth/store/auth-store'

import { ProtectedRoute } from './protected-route'

const adminUser = {
  id: '1',
  email: 'admin@example.com',
  fullname: 'Admin',
  kind: 'superadmin' as const,
  isSuperAdmin: true,
  permissions: [],
}

describe('ProtectedRoute REG-03 / AUTH-UI-02', () => {
  let root: Root
  let host: HTMLDivElement

  beforeEach(() => {
    ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
    host = document.createElement('div')
    document.body.appendChild(host)
    root = createRoot(host)
    useAuthStore.getState().clearSession()
    localStorage.clear()
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    host.remove()
    useAuthStore.getState().clearSession()
    localStorage.clear()
  })

  it('redirects logged-out /finance/revenue to login', () => {
    act(() => {
      root.render(
        <MemoryRouter initialEntries={['/finance/revenue']}>
          <Routes>
            <Route path="/auth/login" element={<div>login-page</div>} />
            <Route element={<ProtectedRoute />}>
              <Route path="/finance/revenue" element={<div>finance-secret</div>} />
            </Route>
          </Routes>
        </MemoryRouter>,
      )
    })

    expect(host.textContent).toContain('login-page')
    expect(host.textContent).not.toContain('finance-secret')
  })

  it('renders the finance page when a session token exists', () => {
    act(() => {
      useAuthStore.getState().setSession(adminUser, 'test-token')
      root.render(
        <MemoryRouter initialEntries={['/finance/revenue']}>
          <Routes>
            <Route path="/auth/login" element={<div>login-page</div>} />
            <Route element={<ProtectedRoute />}>
              <Route path="/finance/revenue" element={<div>finance-secret</div>} />
            </Route>
          </Routes>
        </MemoryRouter>,
      )
    })

    expect(host.textContent).toContain('finance-secret')
    expect(host.textContent).not.toContain('login-page')
  })
})
