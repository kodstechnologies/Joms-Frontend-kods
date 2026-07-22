import * as React from 'react'
import type { InputHTMLAttributes } from 'react'

import { cn } from '@/shared/lib/cn'

type InputProps = InputHTMLAttributes<HTMLInputElement>

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return <input ref={ref} className={cn('ui-input', className)} {...props} />
  },
)

Input.displayName = 'Input'
