import type { PropsWithChildren } from 'react'
import { X } from 'lucide-react'

import { cn } from '@/shared/lib/cn'

type BaseModalProps = PropsWithChildren<{
  open: boolean
  title: string
  onClose: () => void
  className?: string
  showClose?: boolean
}>

export function BaseModal({
  open,
  title,
  onClose,
  children,
  className,
  showClose = true,
}: BaseModalProps) {
  if (!open) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 py-6"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="base-modal-title"
        className={cn(
          'w-full max-w-[440px] overflow-hidden rounded-2xl border border-white/10 bg-[#121212] text-white shadow-[0_24px_80px_rgba(0,0,0,0.65)]',
          className,
        )}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <h2 id="base-modal-title" className="text-xl font-semibold tracking-tight text-white">
            {title}
          </h2>
          {showClose ? (
            <button
              type="button"
              aria-label="Close modal"
              onClick={onClose}
              className="rounded-full p-1.5 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          ) : null}
        </div>
        <div className="px-6 py-6">{children}</div>
      </div>
    </div>
  )
}
