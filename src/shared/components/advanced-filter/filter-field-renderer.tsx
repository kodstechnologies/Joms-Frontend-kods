import type { FilterFieldConfig, FilterValues } from '@/shared/types/data-filter'

import {
  CheckboxGroupField,
  LocationField,
  RangeField,
  SearchField,
} from './filter-fields'
import { Input } from '@/shared/components/ui/input'

type FilterFieldRendererProps = {
  field: FilterFieldConfig
  values: FilterValues
  onChange: (fieldId: string, value: FilterValues[string]) => void
}

export function FilterFieldRenderer({ field, values, onChange }: FilterFieldRendererProps) {
  const value = values[field.id]

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-white">{field.label}</h3>

      {field.type === 'text' ? (
        <Input
          value={typeof value === 'string' ? value : ''}
          onChange={(event) => onChange(field.id, event.target.value)}
          placeholder={field.placeholder}
          className="border-[#2A2A2A] bg-[#0F0F0F]"
        />
      ) : null}

      {field.type === 'checkbox-group' && field.options ? (
        <CheckboxGroupField
          options={field.options}
          value={Array.isArray(value) ? value : []}
          onChange={(nextValue) => onChange(field.id, nextValue)}
        />
      ) : null}

      {field.type === 'number-range' ? (
        <RangeField
          from={typeof value === 'object' && value && 'from' in value ? value.from : ''}
          to={typeof value === 'object' && value && 'to' in value ? value.to : ''}
          onFromChange={(from) =>
            onChange(field.id, {
              from,
              to: typeof value === 'object' && value && 'to' in value ? value.to : '',
            })
          }
          onToChange={(to) =>
            onChange(field.id, {
              from: typeof value === 'object' && value && 'from' in value ? value.from : '',
              to,
            })
          }
          fromPlaceholder={field.fromPlaceholder}
          toPlaceholder={field.toPlaceholder}
          fromLabel={field.fromLabel}
          toLabel={field.toLabel}
          inputType="number"
        />
      ) : null}

      {field.type === 'date-range' ? (
        <RangeField
          from={typeof value === 'object' && value && 'from' in value ? value.from : ''}
          to={typeof value === 'object' && value && 'to' in value ? value.to : ''}
          onFromChange={(from) =>
            onChange(field.id, {
              from,
              to: typeof value === 'object' && value && 'to' in value ? value.to : '',
            })
          }
          onToChange={(to) =>
            onChange(field.id, {
              from: typeof value === 'object' && value && 'from' in value ? value.from : '',
              to,
            })
          }
          fromPlaceholder={field.fromPlaceholder}
          toPlaceholder={field.toPlaceholder}
          fromLabel={field.fromLabel}
          toLabel={field.toLabel}
          inputType="date"
        />
      ) : null}

      {field.type === 'search' ? (
        <SearchField
          value={typeof value === 'string' ? value : ''}
          onChange={(nextValue) => onChange(field.id, nextValue)}
          placeholder={field.placeholder}
        />
      ) : null}

      {field.type === 'location' ? (
        <LocationField
          value={
            typeof value === 'object' && value && 'state' in value
              ? value
              : { state: '', city: '' }
          }
          onChange={(nextValue) => onChange(field.id, nextValue)}
          statePlaceholder={field.statePlaceholder}
          cityPlaceholder={field.cityPlaceholder}
        />
      ) : null}
    </div>
  )
}
