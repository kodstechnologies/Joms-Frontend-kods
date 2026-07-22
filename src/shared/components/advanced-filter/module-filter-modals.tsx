import { Filter, RotateCcw, Upload } from 'lucide-react'

import type { FilterValues, ModuleFilterConfig } from '@/shared/types/data-filter'

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
          <button
            type="button"
            onClick={onReset}
            className="ui-cta ui-cta-outline w-full sm:w-auto"
          >
            <RotateCcw className="icon-sm" aria-hidden="true" />
            Reset Filters
          </button>

          <button
            type="button"
            onClick={onApply}
            disabled={isApplying}
            className="ui-cta ui-cta-primary w-full sm:w-auto"
          >
            <Filter className="icon-sm" aria-hidden="true" />
            {isApplying ? 'Applying...' : 'Apply Filters'}
          </button>
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
          <button
            type="button"
            onClick={onClose}
            className="ui-cta ui-cta-outline w-full sm:w-auto"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onExport}
            disabled={isExporting}
            className="ui-cta ui-cta-primary w-full sm:w-auto"
          >
            <Upload className="icon-sm" aria-hidden="true" />
            {isExporting ? 'Exporting...' : 'Export Data'}
          </button>
        </div>
      }
    >
      <div className="space-y-3">
        <p className="text-body-md text-muted">
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
