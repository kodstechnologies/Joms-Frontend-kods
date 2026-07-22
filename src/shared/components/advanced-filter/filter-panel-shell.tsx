import type { PropsWithChildren, ReactNode } from 'react'
import { X } from 'lucide-react'

import { cn } from '@/shared/lib/cn'

type FilterPanelShellProps = PropsWithChildren<{
  open: boolean
  title: string
  onClose: () => void
  footer?: ReactNode
  size?: 'md' | 'lg' | 'xl'
}>

const sizeClasses = {
  md: 'max-w-md',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
}

export function FilterPanelShell({
  open,
  title,
  onClose,
  footer,
  size = 'xl',
  children,
}: FilterPanelShellProps) {
  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 sm:p-6">
      <div
        className={cn(
          'bg-brand-surface text-brand-text radius-popup flex max-h-[92vh] w-full flex-col overflow-hidden border border-white/10 shadow-[0_24px_80px_rgba(0,0,0,0.65)]',
          sizeClasses[size],
        )}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 px-6 py-4">
          <h2 className="text-h2 text-brand-text">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-brand-text flex size-9 items-center justify-center rounded-lg transition-colors hover:bg-white/10"
            aria-label="Close"
          >
            <X className="icon-lg" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">{children}</div>

        {footer ? (
          <footer className="bg-brand-surface shrink-0 border-t border-white/10 px-6 py-5">
            {footer}
          </footer>
        ) : null}
      </div>
    </div>
  )
}
