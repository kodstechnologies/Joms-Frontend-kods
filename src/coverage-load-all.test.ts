import { describe, expect, it } from 'vitest'

const modules = import.meta.glob(
  [
    './**/*.{ts,tsx}',
    '!**/*.test.ts',
    '!**/*.test.tsx',
    '!**/main.tsx',
    '!**/mock/**',
    '!**/*.mock.ts',
    '!**/chat-test/**',
  ],
  { eager: true },
)

describe('load all Admin source modules', () => {
  it('imports the Admin UI graph without throwing', () => {
    const keys = Object.keys(modules)
    expect(keys.length).toBeGreaterThan(200)
    for (const key of keys) {
      expect(modules[key]).toBeTruthy()
    }
  })
})
