import type { PropsWithChildren } from 'react'

import { cn } from '@/shared/lib/cn'
import { uiTokens } from '@/shared/lib/design-tokens'

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
          'w-full max-w-lg border border-white/10 bg-brand-surface p-5 text-brand-text',
          uiTokens.radiusCard,
          uiTokens.shadowElevated,
        )}
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="mb-4 text-lg font-semibold">{title}</h2>
        {children}
      </div>
    </div>
  )
}
