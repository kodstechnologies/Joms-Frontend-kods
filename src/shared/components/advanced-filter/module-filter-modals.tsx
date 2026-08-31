import React from 'react'
import { Filter, RotateCcw } from 'lucide-react'
import { ExportDataIcon } from '@/shared/components/icons/action-button-icons'

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
  onExport: (format: string) => void
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
  const [selectedFormat, setSelectedFormat] = React.useState('csv')

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
            onClick={() => onExport(selectedFormat)}
            disabled={isExporting}
            className="ui-export-data ui-cta ui-cta-primary w-full sm:w-auto"
          >
            <ExportDataIcon className="size-5 shrink-0" />
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

        <div className="mb-4">
          <label className="mb-1.5 block text-sm font-medium text-white">Export Format</label>
          <select
            value={selectedFormat}
            onChange={(e) => setSelectedFormat(e.target.value)}
            className="w-full rounded-md border border-white/10 bg-slate-900/50 px-3 py-2 text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          >
            <option value="csv">CSV Document (.csv)</option>
            <option value="excel">Excel Document (.xlsx)</option>
            <option value="pdf">PDF Document (.pdf)</option>
          </select>
        </div>

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
