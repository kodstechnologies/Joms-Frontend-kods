import { AddTagsModal as SharedAddTagsModal } from '@/shared/components/modals/add-tags-modal'

type AddTagsModalProps = {
  open?: boolean
  isOpen?: boolean
  onClose: () => void
  onSubmit?: (payload: { tags: string[]; adminNotes: string }) => void | Promise<void>
  initialTags?: string[]
  entityLabel?: string
  title?: string
}

export function AddTagsModal({
  open,
  isOpen,
  onClose,
  onSubmit,
  initialTags,
  entityLabel,
  title,
}: AddTagsModalProps) {
  return (
    <SharedAddTagsModal
      open={open ?? isOpen ?? false}
      onClose={onClose}
      onSubmit={onSubmit}
      initialTags={initialTags}
      entityLabel={entityLabel}
      title={title}
    />
  )
}

export default AddTagsModal
