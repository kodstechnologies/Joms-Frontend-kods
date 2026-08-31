import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { exportDataToFile, exportDisplayValue } from './export-utils'

describe('export-utils', () => {
  const clicks: string[] = []

  beforeEach(() => {
    clicks.length = 0
    vi.stubGlobal(
      'URL',
      Object.assign(URL, {
        createObjectURL: () => 'blob:export',
        revokeObjectURL: () => undefined,
      }),
    )
    vi.spyOn(document.body, 'appendChild').mockImplementation((node) => node)
    vi.spyOn(document.body, 'removeChild').mockImplementation((node) => node)
    HTMLAnchorElement.prototype.click = function click() {
      clicks.push(this.getAttribute('download') || '')
    }
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('formats display values and exports csv', async () => {
    expect(exportDisplayValue(null)).toBe('')
    expect(exportDisplayValue('  ')).toBe('')
    expect(exportDisplayValue(true)).toBe('Yes')
    expect(exportDisplayValue(false)).toBe('No')
    expect(exportDisplayValue(12)).toBe('12')
    await expect(exportDataToFile(['A'], [], 'csv', 'empty')).rejects.toThrow('NO_RECORDS')
    await exportDataToFile(['Name'], [['Ada']], 'csv', 'people')
    expect(clicks.some((name) => name.endsWith('.csv'))).toBe(true)
  })
})
