import type { PropsWithChildren } from 'react'
import { Toaster } from 'sonner'

import { BrandingProvider } from '@/app/providers/branding-provider'
import { MaintenanceProvider } from '@/app/providers/maintenance-provider'
import { useMaintenance } from '@/app/providers/use-maintenance'
import { MaintenanceScreen } from '@/app/providers/maintenance-screen'
import { QueryProvider } from '@/app/providers/query-provider'
import { ThemeProvider } from '@/app/providers/theme-provider'

function MaintenanceGate({ children }: PropsWithChildren) {
  const { isBlocked } = useMaintenance()
  if (isBlocked) return <MaintenanceScreen />
  return children
}

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      <QueryProvider>
        <MaintenanceProvider>
          <BrandingProvider>
            <MaintenanceGate>
              {children}
              <Toaster richColors position="top-right" />
            </MaintenanceGate>
          </BrandingProvider>
        </MaintenanceProvider>
      </QueryProvider>
    </ThemeProvider>
  )
}
