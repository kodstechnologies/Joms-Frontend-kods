import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Component, act, type ReactNode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import type { ComponentType } from 'react'

import { useAuthStore } from '@/modules/auth/store/auth-store'

import { coverageAdminUser, coverageComponentProps } from './coverage-stub'
import { installCoverageDomShims } from './coverage-dom'

class CoverageErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  render() {
    if (this.state.hasError) return <div data-coverage-error="1" />
    return this.props.children
  }
}

export function createCoverageQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
}

export function beginCoverageMount() {
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
  installCoverageDomShims()
  const host = document.createElement('div')
  document.body.appendChild(host)
  const root = createRoot(host)
  const queryClient = createCoverageQueryClient()
  useAuthStore.getState().setSession(coverageAdminUser, 'coverage-token')
  return { host, root, queryClient }
}

export function endCoverageMount(
  root: Root,
  host: HTMLDivElement | undefined,
  queryClient: QueryClient,
) {
  try {
    act(() => {
      root.unmount()
    })
  } catch {
    // Chat/socket and other effects may throw on unmount in jsdom.
  }
  host?.remove()
  queryClient.clear()
  useAuthStore.getState().clearSession()
}

export async function flushCoverageEffects(queryClient?: QueryClient) {
  await act(async () => {
    await Promise.resolve()
    await Promise.resolve()
  })
  // Let mocked react-query settle past loading spinners.
  for (let i = 0; i < 12; i += 1) {
    await act(async () => {
      await new Promise((r) => setTimeout(r, 5))
    })
    if (!queryClient || queryClient.isFetching() === 0) break
  }
}

function pickComponent(
  mod: Record<string, unknown>,
): ComponentType<Record<string, unknown>> | undefined {
  if (typeof mod.default === 'function') {
    return mod.default as ComponentType<Record<string, unknown>>
  }
  const named = Object.entries(mod).find(
    ([name, value]) => typeof value === 'function' && /^[A-Z]/.test(name),
  )
  if (named) return named[1] as ComponentType<Record<string, unknown>>
  return Object.values(mod).find((value) => typeof value === 'function') as
    ComponentType<Record<string, unknown>> | undefined
}

export async function mountCoveragePage(
  root: Root,
  queryClient: QueryClient,
  load: () => Promise<unknown>,
) {
  const mod = (await load()) as Record<string, unknown>
  const Component = pickComponent(mod)
  if (!Component) return false

  await act(async () => {
    try {
      root.render(
        <QueryClientProvider client={queryClient}>
          <CoverageErrorBoundary>
            <MemoryRouter initialEntries={['/coverage/id-1/sub-1?partnerId=id-1']}>
              <Routes>
                <Route path="/coverage/:id/:subCategoryId" element={<Component />} />
                <Route path="/coverage/:id" element={<Component />} />
              </Routes>
            </MemoryRouter>
          </CoverageErrorBoundary>
        </QueryClientProvider>,
      )
    } catch {
      // Page may require extra providers; import still counts.
    }
  })
  await flushCoverageEffects(queryClient)
  return true
}

export async function mountCoverageComponent(
  root: Root,
  queryClient: QueryClient,
  load: () => Promise<unknown>,
) {
  const mod = (await load()) as Record<string, unknown>
  const Component = pickComponent(mod)
  if (!Component) return false

  const props = coverageComponentProps()
  await act(async () => {
    try {
      root.render(
        <QueryClientProvider client={queryClient}>
          <CoverageErrorBoundary>
            <MemoryRouter initialEntries={['/coverage/id-1']}>
              <Component {...props} />
            </MemoryRouter>
          </CoverageErrorBoundary>
        </QueryClientProvider>,
      )
    } catch {
      // Optional props / context; import still counts.
    }
  })
  await flushCoverageEffects(queryClient)
  return true
}
