import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react'
import { ChevronDown } from 'lucide-react'

import { cn } from '@/shared/lib/cn'

import { requiredLabel } from '@/shared/components/form/required-label'

type SettingsFieldRowProps = {
  label: string
  description?: string
  children: ReactNode
}

export function SettingsFieldRow({ label, description, children }: SettingsFieldRowProps) {
  return (
    <div className="grid gap-2 border-b border-white/5 py-3 last:border-b-0 sm:grid-cols-[minmax(220px,1fr)_minmax(320px,1fr)] sm:items-center sm:gap-4">
      <div className="space-y-1">
        <p className="text-sm font-medium text-white">{requiredLabel(label)}</p>
        {description ? <p className="text-xs text-slate-500">{description}</p> : null}
      </div>
      <div className="w-full">{children}</div>
    </div>
  )
}

export function SettingsStackedField({
  label,
  htmlFor,
  children,
}: {
  label: string
  htmlFor?: string
  children: ReactNode
}) {
  return (
    <div className="settings-field-stack">
      <label className="settings-field-label" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
    </div>
  )
}

export function SettingsSelectField({
  label,
  id,
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & {
  label: string
  children: ReactNode
}) {
  return (
    <SettingsStackedField label={label} htmlFor={id}>
      <div className="settings-field-select-wrap">
        <select
          id={id}
          className={cn('settings-field-input settings-field-select', className)}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="settings-field-select-icon" aria-hidden />
      </div>
    </SettingsStackedField>
  )
}

export function SettingsInputField({
  label,
  id,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <SettingsStackedField label={label} htmlFor={id}>
      <input id={id} className={cn('settings-field-input', className)} {...props} />
    </SettingsStackedField>
  )
}

export const settingsControlClass =
  'h-10 w-full rounded-lg border border-white/10 bg-brand-surface px-3 pr-9 text-sm text-white outline-none focus:ring-1 focus:ring-white/20'
