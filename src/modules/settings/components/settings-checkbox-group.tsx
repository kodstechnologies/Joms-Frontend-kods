import type { ReactNode } from 'react'

import { cn } from '@/shared/lib/cn'

type SettingsCheckboxGroupProps = {
  label?: string
  options: { key: string; label: string }[]
  values: Record<string, boolean>
  onChange: (key: string, checked: boolean) => void
  className?: string
  trailing?: ReactNode
}

export function SettingsCheckboxGroup({
  label,
  options,
  values,
  onChange,
  className,
  trailing,
}: SettingsCheckboxGroupProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {label ? <p className="text-sm font-medium text-white">{label}</p> : null}
      <div className="security-checkbox-row">
        {options.map((option) => (
          <label key={option.key} className="security-checkbox-item">
            <input
              type="checkbox"
              checked={values[option.key] ?? false}
              onChange={(event) => onChange(option.key, event.target.checked)}
              className="security-checkbox-input"
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
      {trailing}
    </div>
  )
}
