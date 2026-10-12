import type { AdminEscalationEntityType } from '../api/escalation-api'

export type EscalationNavigationTarget = {
  entityType?: AdminEscalationEntityType | string
  entityId?: string
  venueId?: string
  serviceType?: string
  applicationUrl?: string
  escalationTarget?: string
  metadata?: Record<string, unknown>
}

// Banking and KYC open those tabs. Any other target does not add a tab.
const partnerReviewTab = (escalationTarget?: string) => {
  if (escalationTarget === 'banking') return 'banking'
  if (escalationTarget === 'kyc') return 'kyc'
  return null
}

// The review tab is added only on an expert application link, and only when the link does not already have one.
const withPartnerReviewTab = (url: string, escalationTarget?: string) => {
  const tab = partnerReviewTab(escalationTarget)
  if (!tab || !url.includes('/experts/management/application/')) return url

  const [path, query = ''] = url.split('?')
  const params = new URLSearchParams(query)
  if (!params.get('tab')) params.set('tab', tab)
  const nextQuery = params.toString()
  return nextQuery ? `${path}?${nextQuery}` : path
}

const APPLICATION_ID_FROM_URL = /\/application\/([^/?#]+)/

// Only a link marked as venue KYC yields an application id.
export const getVenueKycIdFromUrl = (url?: string) => {
  if (!url || !url.includes('source=venue_kyc')) return ''
  return url.match(APPLICATION_ID_FROM_URL)?.[1] || ''
}

const buildFallbackUrl = ({
  entityType,
  entityId,
  venueId,
  serviceType,
  escalationTarget,
}: EscalationNavigationTarget) => {
  if (!entityId) return null

  switch (entityType) {
    case 'partner': {
      const base =
        serviceType === 'venue'
          ? `/experts/management/application/${entityId}?source=venue_kyc`
          : `/experts/management/application/${entityId}`
      return withPartnerReviewTab(base, escalationTarget)
    }
    case 'service':
      return `/services/management/view/${entityId}`
    case 'consultation':
      return `/services/management/view/${entityId}?type=consultation`
    case 'venue_space':
      return venueId ? `/venues/management/profile/${venueId}/space/${entityId}` : null
    case 'refund':
      return `/settings/refund-details/${entityId}`
    case 'finance':
      return `/finance/escalations/${entityId}?kind=resource`
    case 'membership_upgrade':
      return `/settings/membership-upgrade-details/${entityId}`
    case 'support_ticket':
      return `/support/tickets/${entityId}`
    case 'settings_log':
      return `/settings/logs?logId=${encodeURIComponent(entityId)}`
    case 'incident':
      return `/settings/main?tab=incident&incidentId=${encodeURIComponent(entityId)}`
    case 'category':
      return `/categories/management/view/${entityId}`
    case 'referral':
      return `/referrals/management?referralId=${encodeURIComponent(entityId)}`
    default:
      return null
  }
}

// A stored profile, order, booking, or category link is kept. An incident uses the id from its metadata when the stored link is not the settings page. A venue space with no venue id is not opened.
export const resolveEscalationUrl = (target: EscalationNavigationTarget) => {
  const canonical = buildFallbackUrl(target)
  const stored = target.applicationUrl?.trim()
  const storedOrEmpty = stored && stored !== '/' ? stored : ''
  const metadataIncidentId = String(target.metadata?.incidentId || '').trim()

  if (
    storedOrEmpty.includes('/orders/') ||
    storedOrEmpty.includes('/bookings/') ||
    storedOrEmpty.includes('/venues/management/profile/') ||
    storedOrEmpty.includes('/categories/management/view/') ||
    storedOrEmpty.includes('/venues/categories/management/view/') ||
    storedOrEmpty.includes('/experts/categories/management/view/') ||
    (storedOrEmpty.includes('/referrals/management') && storedOrEmpty.includes('referralId=')) ||
    /\/experts\/management\/profile\/[^/]+\/(service|consultation)\//.test(storedOrEmpty)
  ) {
    return withPartnerReviewTab(storedOrEmpty, target.escalationTarget)
  }

  if (target.entityType === 'incident') {
    if (storedOrEmpty.includes('/settings/main') && storedOrEmpty.includes('incidentId=')) {
      return storedOrEmpty
    }
    if (metadataIncidentId) {
      return `/settings/main?tab=incident&incidentId=${encodeURIComponent(metadataIncidentId)}`
    }
    return canonical
  }

  let resolved: string | null = null

  if (target.entityType === 'venue_space') {
    if (canonical) resolved = canonical
    else if (storedOrEmpty.includes('/space/')) resolved = storedOrEmpty
    else return null
  } else if (target.entityType === 'consultation' || target.entityType === 'service') {
    resolved = storedOrEmpty || canonical || null
  } else if (target.entityType === 'finance') {
    resolved = storedOrEmpty || canonical || null
  } else if (target.entityType === 'partner' && target.serviceType === 'venue') {
    const storedKycId = getVenueKycIdFromUrl(storedOrEmpty)
    if (storedOrEmpty.includes('/venues/management/profile/')) resolved = storedOrEmpty
    else if (storedOrEmpty.includes('/experts/management/profile/')) resolved = storedOrEmpty
    else if (storedKycId && storedKycId !== target.entityId) resolved = storedOrEmpty
    else resolved = canonical
  } else if (target.entityType === 'partner') {
    if (storedOrEmpty.includes('/venues/management/profile/')) resolved = storedOrEmpty
    else if (storedOrEmpty.includes('/experts/management/profile/')) resolved = storedOrEmpty
    else resolved = storedOrEmpty || canonical || null
  } else {
    resolved = storedOrEmpty || canonical || null
  }

  if (!resolved) return null
  return withPartnerReviewTab(resolved, target.escalationTarget)
}
