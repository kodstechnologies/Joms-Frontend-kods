import { useCallback, useState } from 'react'
import { toast } from 'sonner'

import { DecisionActionModal } from '@/shared/components/modal/decision-action-modal'
import { getApiErrorMessage } from '@/shared/lib/api-error'
import { MODERATION_CATEGORY_SLUGS } from '@/modules/settings/api/templates-api'
import {
  useModerationReasonOptions,
  useRecordModerationReasonUsage,
} from '@/modules/settings/hooks/use-templates'
import { useReinviteSubAdmin, useRevokeSubAdminInvite } from '../hooks/use-rbac'
import type { InviteActionPayload, SubAdminInvite } from '../types/rbac'

type InviteActionMode = 'revoke' | 'reinvite'

type InviteActionModalsProps = {
  invite: SubAdminInvite | null
  mode: InviteActionMode | null
  onClose: () => void
}

export function InviteActionModals({ invite, mode, onClose }: InviteActionModalsProps) {
  const [selectedReasons, setSelectedReasons] = useState<string[]>([])
  const [adminNotes, setAdminNotes] = useState('')
  const [confirmed, setConfirmed] = useState(false)

  const reinviteMutation = useReinviteSubAdmin()
  const revokeMutation = useRevokeSubAdminInvite()
  const recordReasonUsage = useRecordModerationReasonUsage()

  const { options: revokeReasonOptions, buildPayload: buildRevokePayload } =
    useModerationReasonOptions(MODERATION_CATEGORY_SLUGS.revokeInvite, mode === 'revoke')
  const { options: reinviteReasonOptions, buildPayload: buildReinvitePayload } =
    useModerationReasonOptions(MODERATION_CATEGORY_SLUGS.reinviteUser, mode === 'reinvite')

  const resetAndClose = useCallback(() => {
    setSelectedReasons([])
    setAdminNotes('')
    setConfirmed(false)
    onClose()
  }, [onClose])

  const toggleReason = useCallback((value: string) => {
    setSelectedReasons((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
    )
  }, [])

  const submitAction = useCallback(
    async (action: InviteActionMode) => {
      if (!invite) return

      if (selectedReasons.length === 0) {
        toast.error('Please select at least one reason.')
        return
      }
      if (!confirmed) {
        toast.error('Please confirm before continuing.')
        return
      }
      if (!adminNotes.trim()) {
        toast.error('Admin notes are required.')
        return
      }

      const reasonPayload =
        action === 'revoke'
          ? buildRevokePayload(selectedReasons)
          : buildReinvitePayload(selectedReasons)

      if (reasonPayload.selectedReasons.length === 0) {
        toast.error('Selected reasons are no longer available. Please refresh and try again.')
        return
      }

      const payload: InviteActionPayload = {
        reasonIds: reasonPayload.reasonIds,
        selectedReasons: reasonPayload.selectedReasons,
        reasonDetails: reasonPayload.reasonDetails,
        adminNotes: adminNotes.trim(),
        confirmed: true,
      }

      try {
        if (action === 'revoke') {
          await revokeMutation.mutateAsync({ inviteId: invite.id, payload })
          toast.success('Invite revoked and user access removed')
        } else {
          await reinviteMutation.mutateAsync({ inviteId: invite.id, payload })
          toast.success('Invite resent successfully')
        }

        if (reasonPayload.reasonIds.length > 0) {
          recordReasonUsage.mutate(reasonPayload.reasonIds)
        }
        resetAndClose()
      } catch (error) {
        toast.error(
          getApiErrorMessage(
            error,
            action === 'revoke' ? 'Failed to revoke invite' : 'Failed to resend invite',
          ),
        )
      }
    },
    [
      adminNotes,
      buildReinvitePayload,
      buildRevokePayload,
      confirmed,
      invite,
      recordReasonUsage,
      reinviteMutation,
      resetAndClose,
      revokeMutation,
      selectedReasons,
    ],
  )

  return (
    <>
      <DecisionActionModal
        open={Boolean(invite) && mode === 'revoke'}
        variant="warn"
        title="Revoke Invite"
        description={`Are you sure you want Revoke Invite from '${invite?.username || 'this user'}' for '${invite?.roleName || 'this'}' role? This will immediately deactivate the invite link.`}
        submitLabel="Revoke Invite"
        reasonOptions={revokeReasonOptions}
        selectedReasons={selectedReasons}
        onReasonToggle={toggleReason}
        showReasonsLabel
        confirmationLabel="I confirm the documents are not approved due to above reasons."
        confirmationChecked={confirmed}
        onConfirmationChange={setConfirmed}
        adminNotes={adminNotes}
        onAdminNotesChange={setAdminNotes}
        onClose={resetAndClose}
        onSubmit={() => void submitAction('revoke')}
        isSubmitting={revokeMutation.isPending}
      />

      <DecisionActionModal
        open={Boolean(invite) && mode === 'reinvite'}
        variant="warn"
        title="Re-Invite"
        description={`Are you sure you want Re-Invite '${invite?.username || 'this user'}' for '${invite?.roleName || 'this'}' role? They will get a new link to access the system.`}
        submitLabel="Re-Invite"
        reasonOptions={reinviteReasonOptions}
        selectedReasons={selectedReasons}
        onReasonToggle={toggleReason}
        showReasonsLabel
        confirmationLabel="I confirm the documents are not approved due to above reasons."
        confirmationChecked={confirmed}
        onConfirmationChange={setConfirmed}
        adminNotes={adminNotes}
        onAdminNotesChange={setAdminNotes}
        onClose={resetAndClose}
        onSubmit={() => void submitAction('reinvite')}
        isSubmitting={reinviteMutation.isPending}
      />
    </>
  )
}
