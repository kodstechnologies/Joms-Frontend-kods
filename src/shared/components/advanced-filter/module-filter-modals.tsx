import { Filter, RotateCcw, Upload } from 'lucide-react'

import type { FilterValues, ModuleFilterConfig } from '@/shared/types/data-filter'
import { Button } from '@/shared/components/ui/button'

import { FilterPanelShell } from './filter-panel-shell'
import { FilterSectionAccordion } from './filter-section-accordion'

type AdvancedFilterSheetProps = {
  open: boolean
  config: ModuleFilterConfig
  values: FilterValues
  onChange: (fieldId: string, value: FilterValues[string]) => void
  onClose: () => void
  onReset: () => void
  onApply: () => void
  isApplying?: boolean
}

export function AdvancedFilterSheet({
  open,
  config,
  values,
  onChange,
  onClose,
  onReset,
  onApply,
  isApplying = false,
}: AdvancedFilterSheetProps) {
  return (
    <FilterPanelShell
      open={open}
      title={`Advanced Filters - ${config.moduleName}`}
      onClose={onClose}
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button
            type="button"
            variant="secondary"
            onClick={onReset}
            className="h-11 w-full border border-white/20 bg-transparent text-white hover:bg-white/5 sm:w-auto"
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            Reset Filters
          </Button>

          <Button
            type="button"
            onClick={onApply}
            disabled={isApplying}
            className="h-11 w-full bg-[#FFC16B] text-black hover:bg-[#F5C27B] sm:w-auto"
          >
            <Filter className="size-4" aria-hidden="true" />
            {isApplying ? 'Applying...' : 'Apply Filters'}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {config.sections.map((section) => (
          <FilterSectionAccordion
            key={section.id}
            section={section}
            values={values}
            onChange={onChange}
            variant="card"
            defaultExpanded={section.defaultExpanded}
          />
        ))}
      </div>
    </FilterPanelShell>
  )
}

type ExportDataModalProps = {
  open: boolean
  config: ModuleFilterConfig
  values: FilterValues
  onChange: (fieldId: string, value: FilterValues[string]) => void
  onClose: () => void
  onExport: () => void
  isExporting?: boolean
}

export function ExportDataModal({
  open,
  config,
  values,
  onChange,
  onClose,
  onExport,
  isExporting = false,
}: ExportDataModalProps) {
  const exportSections = config.exportSections ?? config.sections

  return (
    <FilterPanelShell
      open={open}
      title={`Export Data - ${config.moduleName}`}
      onClose={onClose}
      size="lg"
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="h-11 w-full border border-white/20 bg-transparent text-white hover:bg-white/5 sm:w-auto"
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={onExport}
            disabled={isExporting}
            className="h-11 w-full bg-[#FFC16B] text-black hover:bg-[#F5C27B] sm:w-auto"
          >
            <Upload className="size-4" aria-hidden="true" />
            {isExporting ? 'Exporting...' : 'Export Data'}
          </Button>
        </div>
      }
    >
      <div className="space-y-3">
        <p className="text-sm text-[#888888]">
          Select the data dimensions to include in your export. Expand each section to configure
          filters.
        </p>

        {exportSections.map((section) => (
          <FilterSectionAccordion
            key={section.id}
            section={section}
            values={values}
            onChange={onChange}
            variant="bar"
          />
        ))}
      </div>
    </FilterPanelShell>
  )
}
