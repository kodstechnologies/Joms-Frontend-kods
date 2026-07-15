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
          'flex max-h-[92vh] w-full flex-col overflow-hidden rounded-2xl border border-[#2A2A2A] bg-black shadow-[0_18px_60px_rgba(0,0,0,0.55)]',
          sizeClasses[size],
        )}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex shrink-0 items-center justify-between border-b border-[#2A2A2A] px-6 py-5">
          <h2 className="text-lg font-semibold text-white sm:text-xl">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex size-9 items-center justify-center rounded-lg text-white transition-colors hover:bg-white/10"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">{children}</div>

        {footer ? (
          <footer className="shrink-0 border-t border-[#2A2A2A] bg-black px-6 py-5">
            {footer}
          </footer>
        ) : null}
      </div>
    </div>
  )
}
