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
    <div className="settings-field-row">
      <div className="settings-field-row-copy">
        <p className="settings-toggle-title">{requiredLabel(label)}</p>
        {description ? <p className="settings-toggle-description">{description}</p> : null}
      </div>
      <div className="settings-field-row-control">{children}</div>
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
          className={cn('settings-control settings-field-input settings-field-select', className)}
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
      <input
        id={id}
        className={cn('settings-control settings-field-input', className)}
        {...props}
      />
    </SettingsStackedField>
  )
}
