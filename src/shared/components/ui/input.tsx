import * as React from 'react'
import type { InputHTMLAttributes } from 'react'

import { cn } from '@/shared/lib/cn'
import { uiTokens } from '@/shared/lib/design-tokens'

type InputProps = InputHTMLAttributes<HTMLInputElement>

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'flex h-10 w-full border border-white/10 bg-brand-surface px-3 py-2 text-sm text-brand-text outline-none ring-offset-brand-bg placeholder:text-brand-muted disabled:cursor-not-allowed disabled:opacity-50',
          uiTokens.radiusSoft,
          uiTokens.focusRing,
          className,
        )}
        {...props}
      />
    )
  },
)

Input.displayName = 'Input'