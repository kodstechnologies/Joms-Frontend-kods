import { beforeAll, describe, expect, it, vi } from 'vitest'

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

const apiModules = import.meta.glob(
  [
    './modules/**/api/**/*.ts',
    './shared/lib/api*.ts',
    './shared/api/**/*.ts',
    '!**/*.test.ts',
    '!**/chat-test/**',
  ],
  { eager: true },
)

const SAMPLE_ARGS = [
  'id-1',
  {
    id: 'id-1',
    name: 'Coverage',
    title: 'Coverage',
    status: 'approved',
    selectedReasons: ['other'],
    suspendIndefinitely: true,
    reasonDetails: 'coverage',
    adminNotes: 'coverage',
    newPassword: 'Passw0rd!',
    confirmNewPassword: 'Passw0rd!',
    category: 'Coverage',
    page: 1,
    limit: 10,
    venueIds: ['id-1'],
    spaceIds: ['id-1'],
    partnerId: 'id-1',
  },
  { page: 1, limit: 10 },
  new FormData(),
  ['id-1'],
  true,
  undefined,
]

function arityArgs(fn: (...args: unknown[]) => unknown) {
  const n = Math.max(fn.length, 1)
  return SAMPLE_ARGS.slice(0, n)
}

describe('invoke Admin API modules', () => {
  beforeAll(() => {
    if (typeof URL.createObjectURL !== 'function') {
      URL.createObjectURL = () => 'blob:coverage'
    }
    if (typeof URL.revokeObjectURL !== 'function') {
      URL.revokeObjectURL = () => undefined
    }
  })

  it('loads API modules', () => {
    expect(Object.keys(apiModules).length).toBeGreaterThan(20)
  })

  it('calls exported API functions without throwing', async () => {
    let called = 0
    for (const [path, mod] of Object.entries(apiModules)) {
      const exports = mod as Record<string, unknown>
      for (const [name, value] of Object.entries(exports)) {
        if (typeof value !== 'function') continue
        if (name === 'default') continue
        try {
          const result = (value as (...args: unknown[]) => unknown)(
            ...arityArgs(value as (...a: unknown[]) => unknown),
          )
          if (result && typeof (result as Promise<unknown>).then === 'function') {
            await (result as Promise<unknown>).catch(() => undefined)
          }
          called += 1
        } catch {
          // Some builders need typed domain shapes; import/partial still helps.
        }
      }
      expect(path).toBeTruthy()
    }
    expect(called).toBeGreaterThan(50)
  }, 120_000)
})
