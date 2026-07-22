import type { ButtonHTMLAttributes } from 'react'

import { cn } from '@/shared/lib/cn'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'primary' | 'secondary' | 'outline' | 'positive' | 'negative' | 'ghost'
}

export function Button({ className, variant = 'default', ...props }: ButtonProps) {
  const resolved = variant === 'default' ? 'primary' : variant

  return (
    <button
      className={cn(
        'ui-cta',
        resolved === 'primary' && 'ui-cta-primary',
        resolved === 'secondary' && 'ui-cta-outline',
        resolved === 'outline' && 'ui-cta-outline',
        resolved === 'positive' && 'ui-cta-positive',
        resolved === 'negative' && 'ui-cta-negative',
        resolved === 'ghost' &&
          'text-brand-text border-transparent bg-transparent hover:bg-white/5',
        className,
      )}
      {...props}
    />
  )
}
