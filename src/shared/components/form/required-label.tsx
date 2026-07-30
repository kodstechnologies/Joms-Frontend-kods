import type { ReactNode } from 'react'

import { RequiredMark } from './required-mark'

export function requiredLabel(label: string): ReactNode {
  const trimmed = label.trimEnd()
  if (!trimmed.endsWith('*')) return label
  const base = trimmed.replace(/\s*\*$/, '')
  return (
    <>
      {base} <RequiredMark />
    </>
  )
}
