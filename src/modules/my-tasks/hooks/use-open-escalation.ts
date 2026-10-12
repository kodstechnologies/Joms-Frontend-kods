import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { fetchVenueKycByPartnerId } from '@/modules/expert/api/venue-kyc-api'
import { getVenueKycApplicationPath } from '@/modules/expert/utils/expert-application-navigation'
import { startAdminEscalationReview, type AdminEscalationEntityType } from '../api/escalation-api'
import {
  getVenueKycIdFromUrl,
  resolveEscalationUrl,
  type EscalationNavigationTarget,
} from '../utils/escalation-navigation'

const readKycId = (payload: unknown): string => {
  if (!payload || typeof payload !== 'object') return ''
  const record = payload as { _id?: string; data?: { _id?: string } | null }
  return String(record.data?._id || record._id || '').trim()
}

// A venue partner looks up KYC unless the link is already a venue profile.
const needsVenueKycLookup = (target: EscalationNavigationTarget) => {
  if (target.entityType !== 'partner' || !target.entityId) return false
  if (target.applicationUrl?.includes('/venues/management/profile/')) return false
  if (target.serviceType === 'venue') return true
  return Boolean(target.applicationUrl?.includes('source=venue_kyc'))
}

// Opening the review starts it. A failure to start still opens the screen. A venue KYC id that is only the partner id is looked up again.
export const useOpenEscalation = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return (target: EscalationNavigationTarget) => {
    void (async () => {
      let url = resolveEscalationUrl(target)

      if (needsVenueKycLookup(target)) {
        const storedKycId = getVenueKycIdFromUrl(target.applicationUrl)
        if (!storedKycId || storedKycId === target.entityId) {
          try {
            const response = await fetchVenueKycByPartnerId(target.entityId as string)
            const kycId = readKycId(response)
            if (kycId) {
              url = getVenueKycApplicationPath(kycId)
            }
          } catch {
            // Keep the resolved fallback URL.
          }
        }
      }

      if (!url) {
        toast.error('Review screen is not available for this escalation.')
        return
      }

      const { entityType, entityId } = target
      if (entityType && entityId) {
        void startAdminEscalationReview(entityType as AdminEscalationEntityType, entityId)
          .then(() => {
            void queryClient.invalidateQueries({ queryKey: ['my-tasks'] })
            void queryClient.invalidateQueries({ queryKey: ['all-escalations'] })
            void queryClient.invalidateQueries({ queryKey: ['escalation-metrics'] })
            void queryClient.invalidateQueries({
              queryKey: ['admin-escalation', entityType, entityId],
            })
          })
          .catch(() => undefined)
      }

      navigate(url)
    })()
  }
}
