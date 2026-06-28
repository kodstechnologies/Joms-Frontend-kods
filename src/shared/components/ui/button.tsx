import type { ButtonHTMLAttributes } from 'react'

import { cn } from '@/shared/lib/cn'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'secondary' | 'ghost'
}

export function Button({ className, variant = 'default', ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors duration-200 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/30',
        variant === 'default' &&
          'bg-[#F0C27B] text-black shadow-[0_10px_30px_rgba(0,0,0,0.35)] hover:bg-[#f4cc91] active:bg-[#eebf73]',
        variant === 'secondary' &&
          'border border-white/10 bg-white/5 text-slate-100 hover:border-white/15 hover:bg-white/7 active:bg-white/10',
        variant === 'ghost' &&
          'text-slate-200 hover:bg-white/5 active:bg-white/7',
        className,
      )}
      {...props}
    />
  )
}
