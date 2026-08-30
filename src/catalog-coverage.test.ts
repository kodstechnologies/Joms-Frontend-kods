import { describe, expect, it } from 'vitest'

const catalogs = import.meta.glob(
  [
    './modules/**/config/*.ts',
    './modules/**/*.config.ts',
    './shared/components/advanced-filter/configs/*.ts',
    './shared/constants/*.ts',
    './shared/types/*.ts',
    './modules/**/types/*.ts',
    './modules/**/utils/*.ts',
    './shared/utils/*.ts',
    '!**/*.test.ts',
    '!**/*.test.tsx',
  ],
  { eager: true },
)

describe('catalog and util module load', () => {
  it('imports static catalogs and utils without throwing', () => {
    const keys = Object.keys(catalogs)
    expect(keys.length).toBeGreaterThan(40)
    for (const key of keys) {
      expect(catalogs[key]).toBeTruthy()
    }
  })
})
