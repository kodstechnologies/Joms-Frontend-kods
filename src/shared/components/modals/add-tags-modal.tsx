import { Tag, X } from 'lucide-react'
import { useCallback, useState } from 'react'
import { createPortal } from 'react-dom'
import { toast } from 'sonner'

import { PLATFORM_TAGS } from '@/shared/constants/platform-tags'
import { useMountedDialog } from '@/shared/hooks/use-mounted-dialog'
import { cn } from '@/shared/lib/cn'

type AddTagsModalProps = {
  open: boolean
  title?: string
  entityLabel?: string
  initialTags?: string[]
  onClose: () => void
  onSubmit?: (payload: { tags: string[]; adminNotes: string }) => void | Promise<void>
}

export function AddTagsModal(props: AddTagsModalProps) {
  if (!props.open) return null
  return <AddTagsModalInner {...props} />
}

function AddTagsModalInner({
  title = 'Add a tag',
  entityLabel = 'record',
  initialTags = [],
  onClose,
  onSubmit,
}: AddTagsModalProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>(() =>
    initialTags.length ? initialTags : [],
  )
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleClose = useCallback(() => {
    onClose()
  }, [onClose])
  const dialogRef = useMountedDialog(handleClose)

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag],
    )
  }

  const handleSubmit = async () => {
    if (selectedTags.length === 0) {
      toast.error('Select at least one tag')
      return
    }
    if (!notes.trim()) {
      toast.error('Admin notes are required')
      return
    }

    setSubmitting(true)
    try {
      await onSubmit?.({ tags: selectedTags, adminNotes: notes.trim() })
      if (!onSubmit) toast.success('Tags added')
      handleClose()
    } catch {
      // Parent surfaces API errors
    } finally {
      setSubmitting(false)
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#050505]/80 p-3 sm:p-4"
      onClick={handleClose}
      role="presentation"
    >
      <div
        ref={dialogRef}
        className="ui-modal-shell max-h-[92dvh] max-w-xl"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-tags-title"
      >
        <div className="ui-modal-header">
          <h2 id="add-tags-title" className="text-h2 text-brand-text">
            {title}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close add tags modal"
            className="text-muted hover:text-brand-text grid size-9 place-items-center rounded-lg transition-colors hover:bg-white/5"
          >
            <X className="icon-md" />
          </button>
        </div>

        <div className="ui-modal-body space-y-6 text-center">
          <div className="bg-brand-accent/10 text-brand-accent mx-auto grid size-14 place-items-center rounded-full">
            <Tag className="icon-lg" />
          </div>
          <p className="text-body-md text-muted">
            You are adding a tag for this {entityLabel}. Choose tags used for internal tracking and
            filtering.
          </p>

          <div className="flex flex-wrap justify-center gap-[10px]">
            {PLATFORM_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={cn(
                  'ui-modal-reason-chip',
                  selectedTags.includes(tag)
                    ? 'ui-modal-reason-chip-selected'
                    : 'ui-modal-reason-chip-idle',
                )}
              >
                {tag}
              </button>
            ))}
          </div>

          <label className="block space-y-2 text-left">
            <span className="text-body-sm-medium text-brand-text">
              Admin notes <span className="text-brand-danger">*</span>
            </span>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Enter here"
              className="ui-textarea"
              rows={3}
            />
          </label>
        </div>

        <div className="ui-modal-footer">
          <button
            type="button"
            onClick={handleClose}
            disabled={submitting}
            className="ui-modal-btn ui-modal-btn-cancel"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={submitting}
            className="ui-modal-btn ui-modal-btn-gold"
          >
            {submitting ? 'Saving…' : 'Add tag'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
