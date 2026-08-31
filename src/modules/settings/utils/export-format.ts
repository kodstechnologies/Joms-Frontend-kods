import type { ExportFormatOption } from '../mock/platform-options.mock'
import type { PlatformSettings } from '../types/settings'
import { platformDefaults } from '../mock/settings.defaults'

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
