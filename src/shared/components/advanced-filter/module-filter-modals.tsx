import { Link } from 'react-router-dom'
import { Filter, RotateCcw } from 'lucide-react'
import { ExportDataIcon } from '@/shared/components/icons/action-button-icons'
import { useDefaultExportFormat } from '@/modules/settings/hooks/use-default-export-format'

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
  const { fileFormat, label } = useDefaultExportFormat()

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
            onClick={() => onExport(fileFormat)}
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

        <div className="mb-4 rounded-md border border-white/10 bg-slate-900/50 px-3 py-2">
          <p className="text-sm font-medium text-white">Export Format</p>
          <p className="mt-1 text-sm text-white/80">{label}</p>
          <p className="mt-1 text-xs text-white/55">
            Uses Default Export Format from{' '}
            <Link to="/settings/main" className="text-blue-400 hover:underline">
              Main Settings
            </Link>
            .
          </p>
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
