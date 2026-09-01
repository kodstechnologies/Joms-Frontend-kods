import type { ReactNode } from 'react'

import { cn } from '@/shared/lib/cn'

const financeDetailShellClass = 'flex flex-col gap-5 rounded-2xl bg-[#181818] p-5 sm:p-6'

export const financeDetailCardClass = 'rounded-lg bg-[#050505] p-4 sm:p-5'

const sectionTitleClass = 'text-body-md-semibold text-brand-text leading-[20px]'
const labelClass = 'text-body-sm text-muted'
const valueClass = 'text-body-sm-medium text-brand-text'

export function FinanceDetailShell({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={cn(financeDetailShellClass, className)}>{children}</div>
}

export function FinanceDetailCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className={cn(financeDetailCardClass, 'p-5')}>
      <h2 className={cn(sectionTitleClass, 'mb-4')}>{title}</h2>
      {children}
    </section>
  )
}

export function FinanceDetailRow({
  label,
  value,
  valueClassName,
  compact,
  constrainValue,
}: {
  label: string
  value: ReactNode
  valueClassName?: string
  compact?: boolean
  constrainValue?: boolean
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 border-b border-white/5 last:border-b-0',
        compact ? 'py-2.5' : 'py-3',
      )}
    >
      <span className={compact ? 'text-body-md text-muted' : labelClass}>{label}</span>
      <span
        className={cn(
          compact
            ? 'text-body-md text-brand-text block shrink-0 text-right'
            : cn(constrainValue ? 'max-w-[60%] text-right' : 'text-right', valueClass),
          valueClassName,
        )}
      >
        {value}
      </span>
    </div>
  )
}
