import { Tag, X } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { PLATFORM_TAGS } from '@/shared/constants/platform-tags'
import { cn } from '@/shared/lib/cn'

type AddTagModalProps = {
  open: boolean
  onClose: () => void
}

export function AddTagModal({ open, onClose }: AddTagModalProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [notes, setNotes] = useState('')

  if (!open) return null

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6">
      <div className="ui-modal-shell">
        <div className="ui-modal-header">
          <h2 className="text-h2 text-brand-text">Add a tag</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-brand-muted rounded-full p-1.5 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="icon-lg" aria-hidden="true" />
          </button>
        </div>

        <div className="ui-modal-body space-y-6 text-center">
          <div className="bg-brand-accent/10 text-brand-accent mx-auto grid size-14 place-items-center rounded-full">
            <Tag className="icon-lg" />
          </div>
          <p className="text-body-md text-muted">
            You are adding a tag for this ticket. Choose tags used for internal tracking and
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
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add admin notes"
              className="ui-textarea"
            />
          </label>
        </div>

        <div className="ui-modal-footer">
          <button type="button" onClick={onClose} className="ui-modal-btn ui-modal-btn-cancel">
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              if (selectedTags.length === 0) {
                toast.error('Select at least one tag')
                return
              }
              if (!notes.trim()) {
                toast.error('Admin notes are required')
                return
              }
              toast.success('Tag added')
              setSelectedTags([])
              setNotes('')
              onClose()
            }}
            className="ui-modal-btn ui-modal-btn-gold"
          >
            Add tag
          </button>
        </div>
      </div>
    </div>
  )
}
