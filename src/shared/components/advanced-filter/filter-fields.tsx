import calendarIcon from '@/assets/JOMS_ICONS-2/icons8-calendar.svg'

import { Input } from '@/shared/components/ui/input'
import { cn } from '@/shared/lib/cn'

type RangeFieldProps = {
  from: string
  to: string
  onFromChange: (value: string) => void
  onToChange: (value: string) => void
  fromPlaceholder?: string
  toPlaceholder?: string
  fromLabel?: string
  toLabel?: string
  inputType?: 'text' | 'number' | 'date'
}

export function RangeField({
  from,
  to,
  onFromChange,
  onToChange,
  fromPlaceholder = 'From',
  toPlaceholder = 'To',
  fromLabel = 'From',
  toLabel = 'To',
  inputType = 'text',
}: RangeFieldProps) {
  const showCalendar = inputType === 'date'

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <label className="text-body-sm text-muted">{fromLabel}</label>
        <div className="relative">
          <Input
            type={inputType}
            value={from}
            onChange={(event) => onFromChange(event.target.value)}
            placeholder={fromPlaceholder}
            className={cn(showCalendar && 'pr-9')}
          />
          {showCalendar ? (
            <img
              src={calendarIcon}
              alt="calendar"
              className="icon-sm text-muted pointer-events-none absolute top-1/2 right-3 -translate-y-1/2"
              style={{ filter: 'brightness(0) invert(1)' }}
              aria-hidden="true"
            />
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-body-sm text-muted">{toLabel}</label>
        <div className="relative">
          <Input
            type={inputType}
            value={to}
            onChange={(event) => onToChange(event.target.value)}
            placeholder={toPlaceholder}
            className={cn(showCalendar && 'pr-9')}
          />
          {showCalendar ? (
            <img
              src={calendarIcon}
              alt="calendar"
              className="icon-sm text-muted pointer-events-none absolute top-1/2 right-3 -translate-y-1/2"
              style={{ filter: 'brightness(0) invert(1)' }}
              aria-hidden="true"
            />
          ) : null}
        </div>
      </div>
    </div>
  )
}

type CheckboxGroupFieldProps = {
  options: { label: string; value: string }[]
  value: string[]
  onChange: (value: string[]) => void
}

export function CheckboxGroupField({ options, value, onChange }: CheckboxGroupFieldProps) {
  const toggleOption = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((item) => item !== optionValue))
      return
    }

    onChange([...value, optionValue])
  }

  return (
    <div className="flex flex-wrap gap-x-8 gap-y-3">
      {options.map((option) => {
        const isChecked = value.includes(option.value)

        return (
          <label
            key={option.value}
            className="text-body-md text-brand-text flex cursor-pointer items-center gap-2"
          >
            <input
              type="checkbox"
              checked={isChecked}
              onChange={() => toggleOption(option.value)}
              className="bg-brand-bg size-4 rounded border-white/20 accent-white"
            />
            <span className={cn(isChecked && 'text-brand-text')}>{option.label}</span>
          </label>
        )
      })}
    </div>
  )
}

type SearchFieldProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  selectedItems?: string[]
  onRemoveItem?: (item: string) => void
}

export function SearchField({
  value,
  onChange,
  placeholder = 'Search by name',
  selectedItems = [],
  onRemoveItem,
}: SearchFieldProps) {
  return (
    <div className="space-y-2">
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />

      {selectedItems.length > 0 ? (
        <div className="flex flex-wrap gap-2 pt-1">
          {selectedItems.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => onRemoveItem?.(item)}
              className="text-body-sm text-brand-text rounded-full bg-white/10 px-3 py-1 transition-colors hover:bg-white/15"
            >
              {item} ×
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}

type LocationFieldProps = {
  value: { state: string; city: string }
  onChange: (value: { state: string; city: string }) => void
  statePlaceholder?: string
  cityPlaceholder?: string
}

export function LocationField({
  value,
  onChange,
  statePlaceholder = 'State/Region',
  cityPlaceholder = 'City',
}: LocationFieldProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Input
        value={value.state}
        onChange={(event) => onChange({ ...value, state: event.target.value })}
        placeholder={statePlaceholder}
      />
      <Input
        value={value.city}
        onChange={(event) => onChange({ ...value, city: event.target.value })}
        placeholder={cityPlaceholder}
      />
    </div>
  )
}
