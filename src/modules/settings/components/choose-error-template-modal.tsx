import { useState } from 'react'
import { X } from 'lucide-react'
import { createPortal } from 'react-dom'
import { toast } from 'sonner'

import { errorMessageTemplatesMock } from '../mock/platform-options.mock'
import { cn } from '@/shared/lib/cn'

type ChooseErrorTemplateModalProps = {
  open: boolean
  currentMessage: string
  onClose: () => void
  onApply: (message: string) => void
}

export function ChooseErrorTemplateModal({
  open,
  currentMessage,
  onClose,
  onApply,
}: ChooseErrorTemplateModalProps) {
  const [selected, setSelected] = useState(currentMessage)
  const [newTemplate, setNewTemplate] = useState('')
  const [showAdd, setShowAdd] = useState(false)

  if (!open) return null

  const templates = errorMessageTemplatesMock

  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-[520px] rounded-2xl border border-white/10 bg-[#141414] p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-[18px] font-bold text-white">Choose Error Message Template</h2>
            <p className="mt-1 text-[12px] text-[#888888]">
              Select a pre-defined error message template
            </p>
          </div>
          <button type="button" onClick={onClose} className="text-[#888888] hover:text-white">
            <X className="size-5" />
          </button>
        </div>

        <div className="mt-5 space-y-2">
          {templates.map((template) => (
            <label
              key={template}
              className={cn(
                'flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition-colors',
                selected === template
                  ? 'border-[#F0C27B] bg-[#F0C27B]/10'
                  : 'border-white/10 bg-black/20 hover:border-white/20',
              )}
            >
              <input
                type="radio"
                name="error-template"
                checked={selected === template}
                onChange={() => setSelected(template)}
                className="mt-1"
              />
              <span className="text-sm text-slate-300">{template}</span>
            </label>
          ))}
        </div>

        {showAdd ? (
          <div className="mt-4 space-y-2">
            <p className="text-sm font-medium text-white">Add New Template</p>
            <textarea
              value={newTemplate}
              onChange={(event) => setNewTemplate(event.target.value)}
              placeholder="Text here"
              rows={4}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-[#666666]"
            />
          </div>
        ) : null}

        <div className="mt-5 flex flex-col gap-3">
          <button
            type="button"
            onClick={() => setShowAdd((current) => !current)}
            className="w-full rounded-xl border border-white/15 py-2.5 text-sm font-semibold text-white hover:bg-white/5"
          >
            Add Template +
          </button>
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/20 px-5 py-2.5 text-sm font-semibold text-white"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                if (showAdd && newTemplate.trim()) {
                  onApply(newTemplate.trim())
                  toast.success('Template added (static preview)')
                  return
                }
                onApply(selected)
              }}
              className="rounded-xl bg-[#F0C27B] px-5 py-2.5 text-sm font-semibold text-[#050505]"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
