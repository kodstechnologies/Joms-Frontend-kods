import { useCallback, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { getApiErrorMessage } from '@/shared/lib/api-error'
import {
  fetchExpertCustomLink,
  updateExpertCustomLinkVisibility,
  type ExpertCustomLinkDetails,
} from '../api/expert-api'
import { CustomUrlModal } from '../components/custom-url-modal'
import { useExpertCustomLink, useUpdateExpertCustomLinkVisibility } from './use-expert-profile'

type MicrositeTarget = {
  partnerId: string
  expertName: string
}

type MicrositeIntent = 'suspend' | 'reinstate'

const invalidateMicrositeQueries = (
  queryClient: ReturnType<typeof useQueryClient>,
  partnerId: string,
) => {
  void queryClient.invalidateQueries({ queryKey: ['expert-custom-link', partnerId] })
  void queryClient.invalidateQueries({ queryKey: ['expert-profile', partnerId] })
  void queryClient.invalidateQueries({ queryKey: ['expert-analytics', partnerId] })
  void queryClient.invalidateQueries({ queryKey: ['experts'] })
}

export function useExpertMicrositeActions() {
  const queryClient = useQueryClient()
  const [target, setTarget] = useState<MicrositeTarget | null>(null)
  const [detailsOverride, setDetailsOverride] = useState<ExpertCustomLinkDetails | null>(null)
  const [isOpening, setIsOpening] = useState(false)

  const partnerId = target?.partnerId
  const customLinkQuery = useExpertCustomLink(partnerId, Boolean(partnerId))
  const updateMutation = useUpdateExpertCustomLinkVisibility(partnerId)

  const closeMicrositeModal = useCallback(() => {
    setTarget(null)
    setDetailsOverride(null)
    setIsOpening(false)
  }, [])

  const openAndApply = useCallback(
    async (rawPartnerId: string, expertName: string, intent: MicrositeIntent) => {
      const id = String(rawPartnerId || '').trim()
      if (!id) {
        toast.error('Expert partner ID is missing.')
        return
      }

      setTarget({ partnerId: id, expertName: expertName || '—' })
      setDetailsOverride(null)
      setIsOpening(true)

      try {
        const details = await queryClient.fetchQuery({
          queryKey: ['expert-custom-link', id],
          queryFn: () => fetchExpertCustomLink(id),
        })
        setDetailsOverride(details)

        if (!details?.link) {
          toast.error('This expert does not have a custom URL yet')
          return
        }

        const isActive = details.visible !== false

        if (intent === 'suspend') {
          if (!isActive) {
            toast.error('Microsite is already suspended')
            return
          }
          const updated = await updateExpertCustomLinkVisibility(id, false)
          setDetailsOverride(updated)
          invalidateMicrositeQueries(queryClient, id)
          toast.success('Microsite suspended')
          return
        }

        if (isActive) {
          toast.error('Microsite is already active')
          return
        }
        const updated = await updateExpertCustomLinkVisibility(id, true)
        setDetailsOverride(updated)
        invalidateMicrositeQueries(queryClient, id)
        toast.success('Microsite reinstated')
      } catch (error) {
        toast.error(getApiErrorMessage(error, 'Failed to update microsite.'))
      } finally {
        setIsOpening(false)
      }
    },
    [queryClient],
  )

  const openSuspendMicrosite = useCallback(
    (rawPartnerId: string, expertName?: string) =>
      void openAndApply(rawPartnerId, expertName || '', 'suspend'),
    [openAndApply],
  )

  const openReinstateMicrosite = useCallback(
    (rawPartnerId: string, expertName?: string) =>
      void openAndApply(rawPartnerId, expertName || '', 'reinstate'),
    [openAndApply],
  )

  const details = detailsOverride ?? customLinkQuery.data ?? null

  const micrositeModal = (
    <CustomUrlModal
      open={Boolean(target)}
      expertName={target?.expertName || ''}
      details={details}
      isLoading={isOpening || (Boolean(target) && customLinkQuery.isLoading && !detailsOverride)}
      isSaving={updateMutation.isPending}
      onClose={closeMicrositeModal}
      onToggleVisible={(visible) => {
        if (!partnerId) return
        if (!details?.link) {
          toast.error('This expert does not have a custom URL yet')
          return
        }
        const currentlyActive = details.visible !== false
        if (!visible && !currentlyActive) {
          toast.error('Microsite is already suspended')
          return
        }
        if (visible && currentlyActive) {
          toast.error('Microsite is already active')
          return
        }
        updateMutation.mutate(visible, {
          onSuccess: (data) => {
            setDetailsOverride(data)
            toast.success(visible ? 'Microsite reinstated' : 'Microsite suspended')
          },
          onError: (error) => {
            toast.error(getApiErrorMessage(error, 'Failed to update microsite.'))
          },
        })
      }}
    />
  )

  return {
    openSuspendMicrosite,
    openReinstateMicrosite,
    closeMicrositeModal,
    micrositeModal,
  }
}
