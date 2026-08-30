import { toast } from 'sonner'

import { AddFinanceNoteModal } from '@/modules/payments/components/add-finance-note-modal'
import { apiErrorMessage } from '@/modules/payments/utils/finance-mappers'

export type FinanceEscalateDeleteAction = {
  kind: 'escalate' | 'delete'
  id: string
  resourceType: string
}

type MutationLike = {
  isPending: boolean
  mutate: (
    vars: { id: string; resourceType: string; adminNote: string },
    options?: {
      onSuccess?: () => void
      onError?: (err: unknown) => void
    },
  ) => void
}

type FinanceEscalateDeleteModalProps = {
  action: FinanceEscalateDeleteAction | null
  onClose: () => void
  escalate: MutationLike
  softDelete: MutationLike
}

export function FinanceEscalateDeleteModal({
  action,
  onClose,
  escalate,
  softDelete,
}: FinanceEscalateDeleteModalProps) {
  const isEscalate = action?.kind === 'escalate'
  const mutation = isEscalate ? escalate : softDelete

  return (
    <AddFinanceNoteModal
      open={!!action}
      title={isEscalate ? 'Escalate' : 'Delete record'}
      description={
        isEscalate
          ? 'This records an escalation for admin review and audit history.'
          : 'This hides the record from finance lists. An admin note is required.'
      }
      placeholder={isEscalate ? 'Enter escalation note' : 'Enter delete reason'}
      submitLabel={isEscalate ? 'Escalate' : 'Delete'}
      submittingLabel={isEscalate ? 'Escalating...' : 'Deleting...'}
      isSubmitting={mutation.isPending}
      onClose={onClose}
      onSubmit={(adminNote) => {
        if (!action) return
        mutation.mutate(
          { id: action.id, resourceType: action.resourceType, adminNote },
          {
            onSuccess: () => {
              toast.success(isEscalate ? 'Escalated' : 'Record deleted')
              onClose()
            },
            onError: (err) => {
              toast.error(
                apiErrorMessage(err, isEscalate ? 'Failed to escalate' : 'Failed to delete'),
              )
            },
          },
        )
      }}
    />
  )
}
