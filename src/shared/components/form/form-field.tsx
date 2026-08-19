import {
  cloneElement,
  isValidElement,
  useId,
  type PropsWithChildren,
  type ReactElement,
} from 'react'

import { requiredLabel } from './required-label'

type FormFieldProps = PropsWithChildren<{
  label: string
  error?: string
  htmlFor?: string
}>

export function FormField({ label, error, htmlFor, children }: FormFieldProps) {
  const generatedId = useId()
  const fieldId = htmlFor || generatedId
  const labelledChild =
    isValidElement(children)
      ? cloneElement(children as ReactElement<{ id?: string }>, {
          id: (children as ReactElement<{ id?: string }>).props.id || fieldId,
        })
      : children

  return (
    <div className="space-y-2">
      <label htmlFor={fieldId} className="text-body-sm-medium text-muted">
        {requiredLabel(label)}
      </label>
      {labelledChild}
      {error ? <p className="text-body-sm text-brand-danger">{error}</p> : null}
    </div>
  )
}
