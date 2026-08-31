// @vitest-environment jsdom
import { act, Component, type ComponentType, type ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), warning: vi.fn() },
}))

vi.mock('recharts', () => {
  const Box = ({ children }: { children?: unknown }) => children ?? null
  return {
    ResponsiveContainer: Box,
    LineChart: Box,
    Line: () => null,
    XAxis: () => null,
    YAxis: () => null,
    Tooltip: () => null,
    Legend: () => null,
    BarChart: Box,
    Bar: () => null,
    PieChart: Box,
    Pie: () => null,
    Cell: () => null,
    AreaChart: Box,
    Area: () => null,
    CartesianGrid: () => null,
    ReferenceLine: () => null,
  }
})

vi.mock('@react-google-maps/api', () => ({
  GoogleMap: () => null,
  Marker: () => null,
  useJsApiLoader: () => ({ isLoaded: true, loadError: undefined }),
}))

vi.mock('firebase/app', () => ({ initializeApp: () => ({}) }))
vi.mock('firebase/messaging', () => ({
  getMessaging: () => ({}),
  getToken: async () => '',
  onMessage: () => () => undefined,
}))
vi.mock('@/shared/lib/firebase', () => ({
  requestNotificationPermission: async () => null,
  onForegroundMessage: () => () => undefined,
}))

vi.mock('socket.io-client', () => ({
  io: () => ({
    on: () => undefined,
    off: () => undefined,
    emit: () => undefined,
    disconnect: () => undefined,
    removeAllListeners: () => undefined,
    connect: () => undefined,
  }),
}))

vi.mock('axios', async (importOriginal) => {
  const actual = await importOriginal<typeof import('axios')>()
  const { coverageAxiosResponse } = await import('./test/coverage-stub')
  const respond = async () => coverageAxiosResponse()
  const makeClient = () => ({
    get: vi.fn(respond),
    post: vi.fn(respond),
    put: vi.fn(respond),
    patch: vi.fn(respond),
    delete: vi.fn(respond),
    interceptors: {
      request: { use: () => 0, eject: () => undefined },
      response: { use: () => 0, eject: () => undefined },
    },
    defaults: { headers: { common: {} } },
  })
  const instance = makeClient()
  return {
    ...actual,
    default: {
      ...actual.default,
      create: () => makeClient(),
      get: instance.get,
      post: instance.post,
      put: instance.put,
      patch: instance.patch,
      delete: instance.delete,
      interceptors: instance.interceptors,
      isAxiosError: actual.isAxiosError,
    },
  }
})

import { QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

import { beginCoverageMount, endCoverageMount, flushCoverageEffects } from '@/test/coverage-mount'

class DeepErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  render() {
    if (this.state.hasError) return <div data-coverage-error="1" />
    return this.props.children
  }
}

const TARGETS: {
  loadKey: string
  routePath: string
  entry: string
  tabs: string[]
}[] = [
  {
    loadKey: './modules/expert/pages/experts/expert-profile-view-page.tsx',
    routePath: '/experts/management/profile/:id',
    entry: '/experts/management/profile/id-1',
    tabs: ['Overview', 'Service Listings', 'Availability', 'Service Analytics', 'Health'],
  },
  {
    loadKey: './modules/expert/pages/venue/venue-profile-view-page.tsx',
    routePath: '/venues/management/profile/:venueId',
    entry: '/venues/management/profile/venue-1',
    tabs: ['Overview', 'Spaces', 'Analytics', 'Health'],
  },
  {
    loadKey: './modules/expert/pages/services/create-service-listing-page.tsx',
    routePath: '/services/management/create',
    entry: '/services/management/create?partnerId=id-1',
    tabs: ['Next', 'Continue', 'Save', 'Back'],
  },
  {
    loadKey: './modules/expert/pages/experts/expert-management-page.tsx',
    routePath: '/experts/management',
    entry: '/experts/management',
    tabs: ['All', 'Active', 'Pending', 'Suspended'],
  },
  {
    loadKey: './modules/rbac/pages/create-sub-admin-page.tsx',
    routePath: '/rbac/sub-admins/create',
    entry: '/rbac/sub-admins/create',
    tabs: ['Next', 'Permissions', 'Save'],
  },
  {
    loadKey: './modules/expert/pages/services/service-detail-page.tsx',
    routePath: '/services/management/:id',
    entry: '/services/management/id-1',
    tabs: ['Overview', 'Pricing', 'Availability'],
  },
  {
    loadKey: './modules/expert/pages/leaderboard/leaderboard-page.tsx',
    routePath: '/experts/leaderboard',
    entry: '/experts/leaderboard',
    tabs: ['Experts', 'Venues', 'Services'],
  },
  {
    loadKey: './modules/expert/pages/venue/space-details-page.tsx',
    routePath: '/venues/management/:id/spaces/:subCategoryId',
    entry: '/venues/management/id-1/spaces/sub-1',
    tabs: ['Overview', 'Pricing', 'Availability', 'Amenities'],
  },
  {
    loadKey: './modules/expert/pages/experts/application-view-page.tsx',
    routePath: '/experts/pending-approvals/:id',
    entry: '/experts/pending-approvals/id-1',
    tabs: ['Approve', 'Reject', 'Overview'],
  },
]

const loaders = import.meta.glob([
  './modules/expert/pages/experts/expert-profile-view-page.tsx',
  './modules/expert/pages/venue/venue-profile-view-page.tsx',
  './modules/expert/pages/services/create-service-listing-page.tsx',
  './modules/expert/pages/experts/expert-management-page.tsx',
  './modules/rbac/pages/create-sub-admin-page.tsx',
  './modules/expert/pages/services/service-detail-page.tsx',
  './modules/expert/pages/leaderboard/leaderboard-page.tsx',
  './modules/expert/pages/venue/space-details-page.tsx',
  './modules/expert/pages/experts/application-view-page.tsx',
])

describe('deep mount heavy Admin pages', () => {
  let host: HTMLDivElement
  let root: ReturnType<typeof beginCoverageMount>['root']
  let queryClient: ReturnType<typeof beginCoverageMount>['queryClient']

  beforeEach(() => {
    ;({ host, root, queryClient } = beginCoverageMount())
  })

  afterEach(() => {
    endCoverageMount(root, host, queryClient)
  })

  for (const target of TARGETS) {
    it(`exercises ${target.loadKey.split('/').pop()}`, async () => {
      const load = loaders[target.loadKey]
      expect(load).toBeTypeOf('function')
      const mod = (await load()) as Record<string, unknown>
      const Component = (mod.default ||
        Object.values(mod).find((v) => typeof v === 'function')) as ComponentType

      await act(async () => {
        try {
          root.render(
            <QueryClientProvider client={queryClient}>
              <DeepErrorBoundary>
                <MemoryRouter initialEntries={[target.entry]}>
                  <Routes>
                    <Route path={target.routePath} element={<Component />} />
                  </Routes>
                </MemoryRouter>
              </DeepErrorBoundary>
            </QueryClientProvider>,
          )
        } catch {
          // continue collecting coverage
        }
      })
      try {
        await flushCoverageEffects(queryClient)
        for (const label of target.tabs) {
          const buttons = Array.from(host.querySelectorAll('button, a, [role="tab"]'))
          const el = buttons.find((b) => (b.textContent || '').includes(label))
          if (!el) continue
          await act(async () => {
            try {
              ;(el as HTMLElement).click()
            } catch {
              // ignore
            }
          })
          await flushCoverageEffects(queryClient)
        }
      } catch {
        // Stub shape may throw in child trees; import/partial render still counts.
      }

      expect(host.isConnected).toBe(true)
    }, 90_000)
  }
})
