import { useCallback, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/shared/lib/api-error'
import { useDefaultExportFormat } from '@/modules/settings/hooks/use-default-export-format'
import { getExportFormatLabel } from '@/modules/settings/utils/export-format'

import type { FinanceListParams } from '@/modules/payments/types/finance-api'
import { useModuleExportFilters } from '@/shared/components/advanced-filter/use-module-export-filters'
import type { FilterValues } from '@/shared/types/data-filter'
import { buildFilterParams } from '@/shared/utils/export-filter-utils'
import { exportDataToFile, exportDisplayValue } from '@/shared/utils/export-utils'

export function toFinanceListFilterParams(values: FilterValues): FinanceListParams {
  const params = buildFilterParams(values)
  const next: FinanceListParams = {}
  if (params.status) next.status = params.status
  if (params.module) next.module = params.module
  if (params.partnerId) next.partnerId = params.partnerId
  if (params.pricingType) next.pricingType = params.pricingType
  return next
}

export function createFinanceRowsExportHandler<T>(options: {
  fetchRows: (params: FinanceListParams) => Promise<T[]>
  headers: string[]
  mapRow: (row: T) => string[]
  fileName: string
}) {
  return async (values: FilterValues, format: string) => {
    const rows = await options.fetchRows({
      ...toFinanceListFilterParams(values),
      page: 1,
      limit: 1000,
    })
    if (!rows.length) throw new Error('NO_RECORDS')
    exportDataToFile(options.headers, rows.map(options.mapRow), format, options.fileName)
  }
}

export function useFinanceListFilters(
  onExportData: (values: FilterValues, format: string) => void | Promise<void>,
) {
  const [appliedFilters, setAppliedFilters] = useState<FilterValues>({})
  const apiFilterParams = useMemo(() => toFinanceListFilterParams(appliedFilters), [appliedFilters])

  const handleApplyFilters = useCallback((values: FilterValues) => {
    setAppliedFilters(values)
  }, [])

  const filters = useModuleExportFilters({
    moduleKey: 'finance-revenue',
    onApplyFilters: handleApplyFilters,
    onExportData,
  })

  return { apiFilterParams, ...filters }
}

export function flattenExportPairs(
  sections: Record<string, Record<string, unknown> | undefined | null>,
): Array<[string, unknown]> {
  const pairs: Array<[string, unknown]> = []
  for (const [section, fields] of Object.entries(sections)) {
    if (!fields) continue
    for (const [label, value] of Object.entries(fields)) {
      if (typeof value === 'object' && value !== null) continue
      pairs.push([`${section} — ${label}`, value])
    }
  }
  return pairs
}

export async function downloadKeyValueReport(
  fileName: string,
  pairs: Array<[string, unknown]>,
  format = 'csv',
) {
  const label = getExportFormatLabel(format)
  try {
    await exportDataToFile(
      ['Field', 'Value'],
      pairs.map(([key, value]) => [key, exportDisplayValue(value)]),
      format,
      fileName,
    )
    toast.success(`${label} report downloaded`)
  } catch (error) {
    if (error instanceof Error && error.message === 'NO_RECORDS') {
      toast.error('No records found to export')
      return
    }
    toast.error(getApiErrorMessage(error, `Failed to export ${label}`))
  }
}

export function useDownloadKeyValueReport() {
  const { fileFormat } = useDefaultExportFormat()
  return useCallback(
    (fileName: string, pairs: Array<[string, unknown]>) =>
      downloadKeyValueReport(fileName, pairs, fileFormat),
    [fileFormat],
  )
}
