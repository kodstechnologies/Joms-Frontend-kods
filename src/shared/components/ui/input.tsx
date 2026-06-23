// import type { InputHTMLAttributes } from 'react'

// import { cn } from '@/shared/lib/cn'

// type InputProps = InputHTMLAttributes<HTMLInputElement>

// export function Input({ className, ...props }: InputProps) {
//   return (
//     <input
//       className={cn(
//         'flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-offset-white placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-slate-900 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:ring-offset-slate-950 dark:placeholder:text-slate-500 dark:focus-visible:ring-slate-100',
//         className,
//       )}
//       {...props}
//     />
//   )
// }
import * as React from 'react'
import type { InputHTMLAttributes } from 'react'

import { cn } from '@/shared/lib/cn'

type InputProps = InputHTMLAttributes<HTMLInputElement>

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-offset-white placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-slate-900 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:ring-offset-slate-950 dark:placeholder:text-slate-500 dark:focus-visible:ring-slate-100',
          className,
        )}
        {...props}
      />
    )
  },
)

Input.displayName = 'Input'