import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  buildExportPdf,
  chunkPdfColumns,
  computePdfColumnWidths,
  layoutForPdfColumnCount,
  maxPdfColumnsForLayout,
  toPdfExportText,
} from './export-pdf'
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

  it('keeps rupee amounts readable in PDF text', () => {
    expect(toPdfExportText('₹1150.5K')).toBe('Rs.1150.5K')
    expect(toPdfExportText('Revenue (₹)')).toBe('Revenue (Rs.)')
  })

  it('breaks long unspaced PDF tokens so they can wrap', () => {
    const longUrl = 'https://joms.example.com/experts/aarav-sharma-legal-consultant-profile'
    expect(toPdfExportText('aarav.sharma.verylongemail@example.com')).toContain('@ ')
    expect(toPdfExportText(longUrl)).toContain('https://')
    expect(toPdfExportText(longUrl)).not.toContain('https:/ /')
    expect(toPdfExportText(longUrl)).toContain('/ ')
  })

  it('uses landscape and splits extra columns so wide tables stay on the page', () => {
    const layout = layoutForPdfColumnCount(16)
    expect(layout.orientation).toBe('landscape')
    const maxColumns = maxPdfColumnsForLayout(layout)
    expect(maxColumns).toBeLessThan(16)

    const headers = Array.from({ length: 16 }, (_, index) => `Column ${index + 1}`)
    const rows = [headers.map((header) => `${header} value`)]
    const chunks = chunkPdfColumns(headers, rows, maxColumns)

    expect(chunks.length).toBeGreaterThan(1)
    expect(chunks.every((chunk) => chunk.headers.length <= maxColumns)).toBe(true)
    expect(chunks.every((chunk) => chunk.headers[0] === 'Column 1')).toBe(true)
    expect(new Set(chunks.flatMap((chunk) => chunk.headers)).size).toBe(16)

    const widths = computePdfColumnWidths(chunks[0].headers, chunks[0].rows, 273)
    expect(widths.reduce((sum, width) => sum + width, 0)).toBeCloseTo(273, 1)
    expect(Math.min(...widths)).toBeGreaterThanOrEqual(18)

    const doc = buildExportPdf({
      fileNamePrefix: 'wide_table',
      sheets: [{ name: 'Experts', headers, rows }],
    })
    expect(doc.getNumberOfPages()).toBeGreaterThan(1)
    expect(doc.output('arraybuffer').byteLength).toBeGreaterThan(1000)
  })
})
