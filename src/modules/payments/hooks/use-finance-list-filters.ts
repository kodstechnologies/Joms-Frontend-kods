import { useCallback, useMemo, useState } from 'react'

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

export function useFinanceListFilters(onExportData: (values: FilterValues, format: string) => void | Promise<void>) {
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

export function downloadKeyValueReport(fileName: string, pairs: Array<[string, unknown]>) {
  exportDataToFile(
    ['Field', 'Value'],
    pairs.map(([key, value]) => [key, exportDisplayValue(value)]),
    'csv',
    fileName,
  )
}
