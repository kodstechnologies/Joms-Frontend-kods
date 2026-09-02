import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'
import { FINANCE_TABLE_CELL_CLASS } from '@/modules/payments/constants/finance-table-styles'

export function FinanceTableCellText({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  const content = children === null || children === undefined || children === '' ? '—' : children

  return <span className={cn(FINANCE_TABLE_CELL_CLASS, className)}>{content}</span>
}

export function financeTableCellValue(value: unknown, className?: string) {
  return <FinanceTableCellText className={className}>{value as ReactNode}</FinanceTableCellText>
}
