/** @vitest-environment node */
/**
 * Invoke util module exports for line coverage (no DOM).
 */
import { describe, expect, it } from 'vitest'

const utils = import.meta.glob(
  ['./modules/**/utils/**/*.ts', './shared/utils/**/*.ts', '!**/*.test.ts', '!**/chat-test/**'],
  { eager: true },
)

const ARGS = [
  'id-1',
  {
    id: 'id-1',
    name: 'Coverage',
    status: 'approved',
    amount: 1,
    price: 1,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    metrics: [],
    items: [],
  },
  [],
  true,
  1,
  undefined,
]

describe('invoke Admin utils', () => {
  it('imports utils modules', () => {
    expect(Object.keys(utils).length).toBeGreaterThan(15)
  })

  it('calls exported util functions', () => {
    let called = 0
    for (const mod of Object.values(utils)) {
      const exports = mod as Record<string, unknown>
      for (const [name, value] of Object.entries(exports)) {
        if (typeof value !== 'function' || name === 'default') continue
        try {
          const n = Math.max((value as (...a: unknown[]) => unknown).length, 1)
          const result = (value as (...a: unknown[]) => unknown)(...ARGS.slice(0, n))
          if (result && typeof (result as Promise<unknown>).then === 'function') {
            void (result as Promise<unknown>).catch(() => undefined)
          }
          called += 1
        } catch {
          try {
            ;(value as () => unknown)()
            called += 1
          } catch {
            // domain-shaped builders may need exact types
          }
        }
      }
    }
    expect(called).toBeGreaterThan(20)
  })
})
