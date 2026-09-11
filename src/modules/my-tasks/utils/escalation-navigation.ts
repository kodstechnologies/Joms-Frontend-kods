import type { AdminEscalationEntityType } from '../api/escalation-api'

export type EscalationNavigationTarget = {
  entityType?: AdminEscalationEntityType | string
  entityId?: string
  venueId?: string
  serviceType?: string
  applicationUrl?: string
}

const APPLICATION_ID_FROM_URL = /\/application\/([^/?#]+)/

export const getVenueKycIdFromUrl = (url?: string) => {
  if (!url || !url.includes('source=venue_kyc')) return ''
  return url.match(APPLICATION_ID_FROM_URL)?.[1] || ''
}

const buildFallbackUrl = ({
  entityType,
  entityId,
  venueId,
  serviceType,
}: EscalationNavigationTarget) => {
  if (!entityId) return null

  switch (entityType) {
    case 'partner':
      return serviceType === 'venue'
        ? `/experts/management/application/${entityId}?source=venue_kyc`
        : `/experts/management/application/${entityId}`
    case 'service':
      return `/services/management/view/${entityId}`
    case 'consultation':
      return `/services/management/view/${entityId}?type=consultation`
    case 'venue_space':
      return venueId ? `/venues/management/profile/${venueId}/space/${entityId}` : null
    case 'refund':
      return `/settings/refund-details/${entityId}`
    case 'membership_upgrade':
      return `/settings/membership-upgrade-details/${entityId}`
    default:
      return null
  }
}

export const resolveEscalationUrl = (target: EscalationNavigationTarget) => {
  const canonical = buildFallbackUrl(target)
  const stored = target.applicationUrl?.trim()
  const storedOrEmpty = stored && stored !== '/' ? stored : ''

  if (target.entityType === 'venue_space') {
    if (canonical) return canonical
    if (storedOrEmpty.includes('/space/')) return storedOrEmpty
    return null
  }

  if (target.entityType === 'consultation' || target.entityType === 'service') {
    return canonical || storedOrEmpty || null
  }

  if (target.entityType === 'partner' && target.serviceType === 'venue') {
    const storedKycId = getVenueKycIdFromUrl(storedOrEmpty)
    if (storedKycId && storedKycId !== target.entityId) return storedOrEmpty
    return canonical
  }

  return canonical || storedOrEmpty || null
}
