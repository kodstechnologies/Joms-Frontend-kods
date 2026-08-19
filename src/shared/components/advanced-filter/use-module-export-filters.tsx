import { useCallback, useMemo, useState } from 'react'
import { toast } from 'sonner'

import type { FilterValues, ModuleFilterKey } from '@/shared/types/data-filter'

import { getModuleFilterConfig } from './configs'
import { AdvancedFilterSheet, ExportDataModal } from './module-filter-modals'
import { createEmptyFilterValuesForConfig } from './filter-utils'

type UseModuleExportFiltersOptions = {
  moduleKey: ModuleFilterKey
  initialValues?: FilterValues
  onApplyFilters?: (values: FilterValues) => void | Promise<void>
  onExportData?: (values: FilterValues, format: string) => void | Promise<void>
}

export function useModuleExportFilters({
  moduleKey,
  initialValues,
  onApplyFilters,
  onExportData,
}: UseModuleExportFiltersOptions) {
  const config = useMemo(() => getModuleFilterConfig(moduleKey), [moduleKey])
  const [filterValues, setFilterValues] = useState<FilterValues>(
    () => initialValues ?? createEmptyFilterValuesForConfig(config),
  )
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [isApplying, setIsApplying] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const handleFieldChange = useCallback((fieldId: string, value: FilterValues[string]) => {
    setFilterValues((current) => ({
      ...current,
      [fieldId]: value,
    }))
  }, [])

  const handleResetFilters = useCallback(() => {
    const empty = createEmptyFilterValuesForConfig(config)
    setFilterValues(empty)
    if (onApplyFilters) {
      onApplyFilters(empty)
    }
    toast.message('Filters reset')
  }, [config, onApplyFilters])

  const handleApplyFilters = useCallback(async () => {
    setIsApplying(true)

    try {
      if (onApplyFilters) {
        await onApplyFilters(filterValues)
      } else {
        toast.success('Filters applied')
      }

      setIsAdvancedFilterOpen(false)
    } catch {
      toast.error('Failed to apply filters')
    } finally {
      setIsApplying(false)
    }
  }, [filterValues, onApplyFilters])

  const handleExportData = useCallback(
    async (format: string) => {
      setIsExporting(true)

      try {
        if (onExportData) {
          await onExportData(filterValues, format)
          toast.success(`Exported ${config.moduleName} as ${format.toUpperCase()}`)
        } else {
          toast.success(`Export started for ${config.moduleName} in ${format.toUpperCase()} format`)
        }

        setIsExportModalOpen(false)
      } catch (error) {
        if (error instanceof Error && error.message === 'NO_RECORDS') {
          toast.error('No records found to export')
        } else {
          toast.error('Failed to export data')
        }
      } finally {
        setIsExporting(false)
      }
    },
    [config.moduleName, filterValues, onExportData],
  )

  const modals = (
    <>
      <AdvancedFilterSheet
        open={isAdvancedFilterOpen}
        config={config}
        values={filterValues}
        onChange={handleFieldChange}
        onClose={() => setIsAdvancedFilterOpen(false)}
        onReset={handleResetFilters}
        onApply={handleApplyFilters}
        isApplying={isApplying}
      />

      <ExportDataModal
        open={isExportModalOpen}
        config={config}
        values={filterValues}
        onChange={handleFieldChange}
        onClose={() => setIsExportModalOpen(false)}
        onExport={handleExportData}
        isExporting={isExporting}
      />
    </>
  )

  return {
    config,
    filterValues,
    setFilterValues,
    onAdvancedFilter: () => setIsAdvancedFilterOpen(true),
    onExport: () => setIsExportModalOpen(true),
    isExporting,
    modals,
  }
}
