import { useEffect, useMemo, type PropsWithChildren } from 'react'
import { useQuery } from '@tanstack/react-query'

import { BrandingContext } from '@/app/providers/use-branding'
import { fetchAdminBranding } from '@/modules/settings/api/settings-api'
import { settingsKeys } from '@/modules/settings/hooks/use-settings'
import {
  DEFAULT_BRANDING,
  resolveBranding,
  type BrandingState,
} from '@/modules/settings/utils/branding-config'
import { useAuthStore } from '@/modules/auth/store/auth-store'

function upsertFavicon(href: string) {
  const existing = document.querySelector<HTMLLinkElement>("link[rel*='icon']")
  if (existing) {
    existing.href = href
    return
  }

  const link = document.createElement('link')
  link.rel = 'icon'
  link.href = href
  document.head.appendChild(link)
}

export function BrandingProvider({ children }: PropsWithChildren) {
  const token = useAuthStore((state) => state.token)
  const brandingQuery = useQuery({
    queryKey: settingsKeys.branding(),
    queryFn: fetchAdminBranding,
    enabled: Boolean(token),
    retry: 1,
  })

  const branding = useMemo<BrandingState>(() => {
    // On error / empty payload, keep the general branding defaults.
    if (brandingQuery.isError || !brandingQuery.data) {
      return DEFAULT_BRANDING
    }

    return resolveBranding(brandingQuery.data)
  }, [brandingQuery.data, brandingQuery.isError])

  useEffect(() => {
    document.title = branding.applicationName || DEFAULT_BRANDING.applicationName
  }, [branding.applicationName])

  useEffect(() => {
    upsertFavicon(branding.faviconUrl || DEFAULT_BRANDING.faviconUrl)
  }, [branding.faviconUrl])

  return <BrandingContext.Provider value={branding}>{children}</BrandingContext.Provider>
}
