import type { PropsWithChildren } from 'react'

import { cn } from '@/shared/lib/cn'

export function PageContainer({ className, children }: PropsWithChildren<{ className?: string }>) {
  return (
    <div className={cn('mx-auto w-full max-w-[1440px] min-w-0 px-4 sm:px-6 lg:px-8', className)}>
      {children}
    </div>
  )
}
