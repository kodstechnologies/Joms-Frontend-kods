import type { PropsWithChildren } from 'react'

import { cn } from '@/shared/lib/cn'

type BaseModalProps = PropsWithChildren<{
  open: boolean
  title: string
  onClose: () => void
}>

export function BaseModal({ open, title, onClose, children }: BaseModalProps) {
  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className={cn(
          'w-full max-w-lg rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900',
        )}
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="mb-4 text-lg font-semibold">{title}</h2>
        {children}
      </div>
    </div>
  )
}
