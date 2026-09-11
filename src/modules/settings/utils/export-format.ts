import type { ExportFormatOption } from '../config/platform-options'
import type { PlatformSettings } from '../types/settings'
import { platformDefaults } from '../config/settings.config'

export function resolveDefaultExportFormat(value?: string | null): ExportFormatOption {
  const normalized = String(value || '')
    .trim()
    .toUpperCase()
  if (normalized === 'PDF') return 'PDF'
  return 'CSV'
}

export function getPlatformExportFormat(config?: PlatformSettings | null): ExportFormatOption {
  return resolveDefaultExportFormat(
    config?.generalSettings?.defaultExportFormat ||
      platformDefaults.generalSettings.defaultExportFormat,
  )
}
