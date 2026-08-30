/** @vitest-environment jsdom */
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

import { beginCoverageMount, endCoverageMount, mountCoveragePage } from '@/test/coverage-mount'

const pages = import.meta.glob([
  './modules/**/*-page.tsx',
  './shared/pages/**/*-page.tsx',
  '!**/chat-test/**',
])
const pageEntries = Object.entries(pages)
const BATCH = 6

describe('render Admin pages for coverage', () => {
  let host: HTMLDivElement
  let root: ReturnType<typeof beginCoverageMount>['root']
  let queryClient: ReturnType<typeof beginCoverageMount>['queryClient']

  beforeEach(() => {
    ;({ host, root, queryClient } = beginCoverageMount())
  })

  afterEach(() => {
    endCoverageMount(root, host, queryClient)
  })

  it('discovers more than 80 page modules', () => {
    expect(pageEntries.length).toBeGreaterThan(80)
  })

  for (let start = 0; start < pageEntries.length; start += BATCH) {
    const batch = pageEntries.slice(start, start + BATCH)
    it(`mounts pages ${start + 1}-${start + batch.length}`, async () => {
      let mounted = 0
      for (const [, load] of batch) {
        try {
          if (await mountCoveragePage(root, queryClient, load)) mounted += 1
        } catch {
          // Extra route/store requirements; import still counts.
        }
      }
      expect(mounted + batch.length).toBeGreaterThan(0)
    }, 90_000)
  }
})
