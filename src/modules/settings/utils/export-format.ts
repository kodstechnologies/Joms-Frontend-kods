import {
  exportFormatOptionLabels,
  type ExportFileFormat,
  type ExportFormatOption,
} from '../config/platform-options'
import type { PlatformSettings } from '../types/settings'
import { platformDefaults } from '../config/settings.config'

// PDF stays PDF. Excel, XLSX, and XLS become Excel. A blank value and anything else become CSV.
export function resolveDefaultExportFormat(value?: string | null): ExportFormatOption {
  const normalized = String(value || '')
    .trim()
    .toUpperCase()
  if (normalized === 'PDF') return 'PDF'
  if (normalized === 'EXCEL' || normalized === 'XLSX' || normalized === 'XLS') return 'Excel'
  return 'CSV'
}

export function toExportFileFormat(value?: string | null): ExportFileFormat {
  const option = resolveDefaultExportFormat(value)
  if (option === 'PDF') return 'pdf'
  if (option === 'Excel') return 'excel'
  return 'csv'
}

export function getPlatformExportFormat(config?: PlatformSettings | null): ExportFormatOption {
  return resolveDefaultExportFormat(
    config?.generalSettings?.defaultExportFormat ||
      platformDefaults.generalSettings.defaultExportFormat,
  )
}

export function getExportFormatLabel(value?: string | null): string {
  return exportFormatOptionLabels[resolveDefaultExportFormat(value)]
}
