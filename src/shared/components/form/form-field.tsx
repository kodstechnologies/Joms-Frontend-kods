import type { PropsWithChildren } from 'react'

import { requiredLabel } from './required-label'

type FormFieldProps = PropsWithChildren<{
  label: string
  error?: string
}>

export function FormField({ label, error, children }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <label className="text-body-sm-medium text-muted">{requiredLabel(label)}</label>
      {children}
      {error ? <p className="text-body-sm text-brand-danger">{error}</p> : null}
    </div>
  )
}
