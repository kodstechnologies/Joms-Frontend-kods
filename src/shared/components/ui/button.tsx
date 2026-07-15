import type { ButtonHTMLAttributes } from 'react'

import { cn } from '@/shared/lib/cn'
import { uiTokens } from '@/shared/lib/design-tokens'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'secondary' | 'ghost'
}

export function Button({ className, variant = 'default', ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold transition-colors duration-200 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
        uiTokens.radiusSoft,
        uiTokens.focusRing,
        variant === 'default' &&
          'bg-brand-accent text-brand-text-dark hover:bg-brand-gold-from active:bg-brand-gold-to shadow-[0_10px_30px_rgba(0,0,0,0.35)]',
        variant === 'secondary' &&
          'bg-brand-surface text-brand-text hover:border-brand-accent-muted border border-white/10 hover:bg-white/7 active:bg-white/10',
        variant === 'ghost' && 'text-brand-text hover:bg-white/5 active:bg-white/7',
        className,
      )}
      {...props}
    />
  )
}
