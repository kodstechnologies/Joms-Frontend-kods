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
      <div className="flex flex-wrap gap-x-6 gap-y-3">
        {options.map((option) => (
          <label
            key={option.key}
            className="flex cursor-pointer items-center gap-2 text-sm text-slate-300"
          >
            <input
              type="checkbox"
              checked={values[option.key] ?? false}
              onChange={(event) => onChange(option.key, event.target.checked)}
              className="size-4 rounded border-white/20 bg-transparent accent-[#F0C27B]"
            />
            {option.label}
          </label>
        ))}
      </div>
      {trailing}
    </div>
  )
}
