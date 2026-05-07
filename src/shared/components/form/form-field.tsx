import type { PropsWithChildren } from 'react'

type FormFieldProps = PropsWithChildren<{
  label: string
  error?: string
}>

export function FormField({ label, error, children }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-700 dark:text-slate-200">{label}</label>
      {children}
      {error ? <p className="text-xs text-red-500">{error}</p> : null}
    </div>
  )
}
