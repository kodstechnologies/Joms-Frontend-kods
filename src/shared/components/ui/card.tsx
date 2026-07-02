import type { HTMLAttributes } from 'react'

import { cn } from '@/shared/lib/cn'
import { uiTokens } from '@/shared/lib/design-tokens'

type CardProps = HTMLAttributes<HTMLDivElement>

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        uiTokens.radiusCard,
        'border border-white/10 bg-brand-surface p-4 text-brand-text shadow-sm',
        className,
      )}
      {...props}
    />
  )
}
