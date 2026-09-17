import { describe, expect, it } from 'vitest'

import {
  getExportFormatLabel,
  getPlatformExportFormat,
  resolveDefaultExportFormat,
  toExportFileFormat,
} from './export-format'

describe('export-format', () => {
  it('resolves CSV, Excel, and PDF from stored or file-format values', () => {
    expect(resolveDefaultExportFormat('CSV')).toBe('CSV')
    expect(resolveDefaultExportFormat('excel')).toBe('Excel')
    expect(resolveDefaultExportFormat('xlsx')).toBe('Excel')
    expect(resolveDefaultExportFormat('PDF')).toBe('PDF')
    expect(resolveDefaultExportFormat('unknown')).toBe('CSV')
  })

  it('maps settings options to download file formats', () => {
    expect(toExportFileFormat('CSV')).toBe('csv')
    expect(toExportFileFormat('Excel')).toBe('excel')
    expect(toExportFileFormat('PDF')).toBe('pdf')
  })

  it('reads the platform default and labels', () => {
    expect(getPlatformExportFormat(null)).toBe('CSV')
    expect(
      getPlatformExportFormat({
        generalSettings: { defaultExportFormat: 'Excel' },
      } as never),
    ).toBe('Excel')
    expect(getExportFormatLabel('pdf')).toBe('PDF Document (.pdf)')
  })
})
