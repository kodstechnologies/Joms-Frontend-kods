import { Tag, X } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { MODULE_TAG_OPTIONS } from '@/shared/constants/module-tags'
import { cn } from '@/shared/lib/cn'

type AddTagModalProps = {
  open: boolean
  onClose: () => void
  initialTags?: string[]
  onSubmit?: (tags: string[], notes: string) => void | Promise<void>
}

const formatTagLabel = (tag: string, selected: boolean) => {
  if (!selected) return tag
  const trimmed = tag.trim()
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) return trimmed
  return `[${trimmed}]`
}

export function AddTagModal({ open, onClose, initialTags, onSubmit }: AddTagModalProps) {
  if (!open) return null

  return <AddTagModalBody onClose={onClose} initialTags={initialTags} onSubmit={onSubmit} />
}

function AddTagModalBody({ onClose, initialTags, onSubmit }: Omit<AddTagModalProps, 'open'>) {
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTags?.length ? initialTags : [])
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  const canSubmit = selectedTags.length > 0 && notes.trim().length > 0 && !submitting

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-tag-modal-title"
        className="ui-modal-shell w-full max-w-[680px]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="ui-modal-header">
          <h2 id="add-tag-modal-title" className="text-h2 text-brand-text">
            Add a tag
          </h2>
          <button
            type="button"
            aria-label="Close modal"
            onClick={onClose}
            className="text-brand-muted grid size-6 shrink-0 place-items-center rounded-full transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        <div className="ui-modal-body space-y-5">
          <div className="flex justify-center">
            <span className="flex size-[70px] items-center justify-center rounded-full bg-white/10">
              <Tag className="size-7 text-white" strokeWidth={1.75} aria-hidden="true" />
            </span>
          </div>

          <p className="text-body-md text-brand-text mx-auto max-w-[420px] text-center">
            You are adding a &apos;Tag&apos; for this user make sure you choose a right tag which
            can be used for internal purpose.
          </p>

          <div>
            <span className="text-body-sm-medium text-brand-text mb-[10px] block">Tags</span>
            <div className="flex flex-wrap gap-[10px]">
              {MODULE_TAG_OPTIONS.map((tag) => {
                const isSelected = selectedTags.includes(tag)

                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={cn(
                      'ui-modal-reason-chip px-4',
                      isSelected ? 'ui-modal-reason-chip-selected' : 'ui-modal-reason-chip-idle',
                    )}
                  >
                    {formatTagLabel(tag, isSelected)}
                  </button>
                )
              })}
            </div>
          </div>

          <label className="block">
            <span className="text-body-sm-medium text-brand-text mb-2 block">
              Admin notes <span className="text-[#D3191C]">*</span>
            </span>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Enter here"
              className="ui-textarea min-h-[119px]"
            />
          </label>
        </div>

        <div className="ui-modal-footer px-6 pb-6">
          <button
            type="button"
            onClick={onClose}
            className="ui-modal-btn ui-modal-btn-cancel h-10 max-w-[239px] flex-1"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!canSubmit}
            onClick={async () => {
              try {
                setSubmitting(true)
                if (onSubmit) {
                  await onSubmit(selectedTags, notes.trim())
                } else {
                  toast.success('Tag added (static preview)')
                }
                onClose()
              } catch {
                // Parent handles toast
              } finally {
                setSubmitting(false)
              }
            }}
            className="ui-modal-btn ui-modal-btn-gold h-10 max-w-[238px] flex-1"
          >
            Add Tag
          </button>
        </div>
      </div>
    </div>
  )
}
