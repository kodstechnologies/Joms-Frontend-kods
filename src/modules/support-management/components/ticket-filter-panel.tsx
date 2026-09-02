import { ChevronDown } from 'lucide-react'

import {
  PRIORITY_SELECT_OPTIONS,
  SUPPORT_MODULE_OPTIONS,
  type SelectOption,
} from '../utils/support-format'

export type WorkspaceQueueFilters = {
  status: string
  module: string
  priority: string
}

export const EMPTY_WORKSPACE_QUEUE_FILTERS: WorkspaceQueueFilters = {
  status: '',
  module: '',
  priority: '',
}

const STATUS_OPTIONS: SelectOption[] = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
]

const MODULE_OPTIONS: SelectOption[] = SUPPORT_MODULE_OPTIONS.map((value) => ({
  value,
  label: value,
}))

type TicketFilterPanelProps = {
  values: WorkspaceQueueFilters
  onChange: (field: keyof WorkspaceQueueFilters, value: string) => void
  onApply: () => void
  onClear: () => void
}

export function TicketFilterPanel({ values, onChange, onApply, onClear }: TicketFilterPanelProps) {
  return (
    <div className="space-y-4 border-b border-white/[0.06] px-4 py-4">
      <FilterSelect
        label="Ticket Status"
        value={values.status}
        placeholder="All statuses"
        options={STATUS_OPTIONS}
        onChange={(value) => onChange('status', value)}
      />
      <FilterSelect
        label="Module"
        value={values.module}
        placeholder="All modules"
        options={MODULE_OPTIONS}
        onChange={(value) => onChange('module', value)}
      />
      <FilterSelect
        label="Priority"
        value={values.priority}
        placeholder="All priorities"
        options={PRIORITY_SELECT_OPTIONS}
        onChange={(value) => onChange('priority', value)}
      />
      <div className="flex gap-2 pt-1">
        <button type="button" onClick={onApply} className="ui-cta ui-cta-primary flex-1">
          Apply Filters
        </button>
        <button type="button" onClick={onClear} className="ui-cta ui-cta-ghost flex-1">
          Clear All
        </button>
      </div>
    </div>
  )
}

function FilterSelect({
  label,
  value,
  placeholder,
  options,
  onChange,
}: {
  label: string
  value: string
  placeholder: string
  options: SelectOption[]
  onChange: (value: string) => void
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-body-xs text-muted font-semibold tracking-wide uppercase">{label}</span>
      <div className="relative flex h-10 items-center rounded-lg border border-white/[0.08] bg-[#18181A] px-3">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="text-body-sm text-brand-text absolute inset-0 h-full w-full cursor-pointer appearance-none bg-transparent px-3 pr-8 outline-none"
        >
          <option value="" className="text-brand-text bg-[#18181A]">
            {placeholder}
          </option>
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              className="text-brand-text bg-[#18181A]"
            >
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="text-muted pointer-events-none relative ml-auto size-4 shrink-0" />
      </div>
    </label>
  )
}
