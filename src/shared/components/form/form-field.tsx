import type { PropsWithChildren } from 'react'

type FormFieldProps = PropsWithChildren<{
  label: string
  error?: string
}>

export function FormField({ label, error, children }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-brand-stroke">{label}</label>
      {children}
      {error ? <p className="text-xs text-brand-danger">{error}</p> : null}
    </div>
  )
}
