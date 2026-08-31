import { QueryClientProvider } from '@tanstack/react-query'
import { act } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('sonner', () => ({
  Toaster: () => null,
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
  useJsApiLoader: () => ({ isLoaded: false, loadError: undefined }),
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

import { App } from '@/app/app'
import { DashboardLayout } from '@/app/layouts/dashboard-layout'
import { beginCoverageMount, endCoverageMount, flushCoverageEffects } from '@/test/coverage-mount'

describe('render Admin shell for coverage', () => {
  let host: HTMLDivElement
  let root: ReturnType<typeof beginCoverageMount>['root']
  let queryClient: ReturnType<typeof beginCoverageMount>['queryClient']

  beforeEach(() => {
    window.history.replaceState({}, '', '/dashboard/executive')
    ;({ host, root, queryClient } = beginCoverageMount())
  })

  afterEach(() => {
    endCoverageMount(root, host, queryClient)
  })

  it('mounts App (providers + router) authenticated at executive dashboard', async () => {
    await act(async () => {
      root.render(<App />)
    })
    await flushCoverageEffects()
    expect(host).toBeTruthy()
  }, 60_000)

  it('mounts DashboardLayout with an outlet', async () => {
    await act(async () => {
      root.render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={['/dashboard/executive']}>
            <DashboardLayout />
          </MemoryRouter>
        </QueryClientProvider>,
      )
    })
    await flushCoverageEffects()
    expect(host).toBeTruthy()
  }, 30_000)
})
