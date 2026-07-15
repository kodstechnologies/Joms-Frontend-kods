import { Hourglass, Trash2 } from 'lucide-react'

import { categoryManagementTheme } from './category/category-management.theme'

type SummaryCardProps = {
  title: string
  value: string
  color: 'yellow' | 'red'
  onClick?: () => void
}

export function SummaryCard({ title, value, color, onClick }: SummaryCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-11 w-full items-center justify-center gap-2.5 rounded-xl border px-4 transition-opacity hover:opacity-90 ${
        color === 'yellow' ? categoryManagementTheme.pausedBar : categoryManagementTheme.deletedBar
      }`}
    >
      {color === 'yellow' ? (
        <Hourglass className="size-4 text-white" aria-hidden="true" />
      ) : (
        <Trash2 className="size-4 text-white" aria-hidden="true" />
      )}

      <span className="text-[13px] text-white">{title}</span>

      <span className="text-[13px] font-semibold text-white">{value.padStart(2, '0')}</span>
    </button>
  )
}
