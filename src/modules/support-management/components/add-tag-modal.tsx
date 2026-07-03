import { Tag, X } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { tagOptions } from '../mock/support.mock'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'

type AddTagModalProps = {
  open: boolean
  onClose: () => void
}

export function AddTagModal({ open, onClose }: AddTagModalProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>(['Tag Title'])
  const [notes, setNotes] = useState('')

  if (!open) return null

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#111111] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <h2 className="text-lg font-semibold text-white">Add a tag</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:text-white">
            <X className="size-5" />
          </button>
        </div>

        <div className="space-y-6 px-6 py-6 text-center">
          <div className="mx-auto grid size-14 place-items-center rounded-full bg-amber-500/10 text-amber-400">
            <Tag className="size-6" />
          </div>
          <p className="text-sm leading-relaxed text-slate-400">
            You are adding a &apos;Tag&apos; for this user make sure you choose a right tag which can be used for
            internal purpose.
          </p>

          <div className="flex flex-wrap justify-center gap-2">
            {tagOptions.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={cn(
                  'rounded-lg border px-4 py-2 text-xs font-semibold transition-colors',
                  selectedTags.includes(tag)
                    ? 'border-amber-500/50 bg-amber-500/20 text-amber-300'
                    : 'border-white/10 bg-[#1a1a1a] text-slate-400 hover:text-white',
                )}
              >
                {tag}
              </button>
            ))}
          </div>

          <label className="block space-y-2.5 text-left">
            <span className="text-sm font-medium text-white">Admin notes *</span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter here"
              className="h-28 w-full resize-none rounded-lg border-0 bg-[#1a1a1a] px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-white/20"
            />
          </label>
        </div>

        <div className="flex justify-end gap-3 border-t border-white/10 px-6 py-5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/20 bg-transparent px-6 py-2.5 text-sm font-medium text-white hover:bg-white/5"
          >
            Cancel
          </button>
          <Button
            onClick={() => {
              toast.success('Tag added (static preview)')
              onClose()
            }}
          >
            Add tag
          </Button>
        </div>
      </div>
    </div>
  )
}
