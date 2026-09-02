import { createContext, useContext } from 'react'

import { DEFAULT_BRANDING, type BrandingState } from '@/modules/settings/utils/branding-config'

export const BrandingContext = createContext<BrandingState>(DEFAULT_BRANDING)

export function useBranding() {
  return useContext(BrandingContext)
}
