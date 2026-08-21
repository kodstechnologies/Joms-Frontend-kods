import type { AdminEscalationEntityType } from '../api/escalation-api'

export type EscalationNavigationTarget = {
  entityType?: AdminEscalationEntityType | string
  entityId?: string
  venueId?: string
  serviceType?: string
  applicationUrl?: string
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

/** Older escalations were stored without an applicationUrl, so rebuild it from the entity. */
export const resolveEscalationUrl = (target: EscalationNavigationTarget) => {
  const stored = target.applicationUrl?.trim()
  if (stored && stored !== '/') return stored
  return buildFallbackUrl(target)
}
