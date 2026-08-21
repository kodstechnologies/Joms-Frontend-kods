import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { startAdminEscalationReview, type AdminEscalationEntityType } from '../api/escalation-api'
import {
  resolveEscalationUrl,
  type EscalationNavigationTarget,
} from '../utils/escalation-navigation'

/**
 * Opens the review screen for an escalation and flips it to In-Progress for the
 * assignee (the API is a no-op for super admins and non-assigned escalations).
 */
export const useOpenEscalation = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return (target: EscalationNavigationTarget) => {
    const url = resolveEscalationUrl(target)
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
  }
}
