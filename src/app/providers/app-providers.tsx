import type { PropsWithChildren } from 'react'
import { Toaster } from 'sonner'

import { QueryProvider } from '@/app/providers/query-provider'
import { ThemeProvider } from '@/app/providers/theme-provider'

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
      <QueryProvider>
        {children}
        <Toaster richColors position="top-right" />
      </QueryProvider>
    </ThemeProvider>
  )
}
