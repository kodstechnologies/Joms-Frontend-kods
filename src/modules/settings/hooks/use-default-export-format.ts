import {
  getExportFormatLabel,
  getPlatformExportFormat,
  toExportFileFormat,
} from '../utils/export-format'
import { useSettingsModule } from './use-settings'

export function useDefaultExportFormat() {
  const query = useSettingsModule('platform')
  const option = getPlatformExportFormat(query.data?.config)

  return {
    option,
    fileFormat: toExportFileFormat(option),
    label: getExportFormatLabel(option),
  }
}
