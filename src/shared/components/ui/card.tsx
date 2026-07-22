import type { HTMLAttributes } from 'react'

import { cn } from '@/shared/lib/cn'

type CardProps = HTMLAttributes<HTMLDivElement>

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'radius-lg bg-brand-surface text-brand-text border border-white/10 p-4 shadow-sm',
        className,
      )}
      {...props}
    />
  )
}
