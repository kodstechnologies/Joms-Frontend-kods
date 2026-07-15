import type { PropsWithChildren } from 'react'

type FormFieldProps = PropsWithChildren<{
  label: string
  error?: string
}>

export function FormField({ label, error, children }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <label className="text-brand-stroke text-sm font-medium">{label}</label>
      {children}
      {error ? <p className="text-brand-danger text-xs">{error}</p> : null}
    </div>
  )
}
