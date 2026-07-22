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
      <div className="ui-modal-shell max-w-[520px]">
        <div className="ui-modal-header">
          <div>
            <h2 className="text-h4 text-brand-text">Choose Error Message Template</h2>
            <p className="text-body-sm text-muted mt-1">
              Select a pre-defined error message template
            </p>
          </div>
          <button type="button" onClick={onClose} className="text-muted hover:text-brand-text">
            <X className="icon-md" />
          </button>
        </div>

        <div className="ui-modal-body space-y-2">
          {templates.map((template) => (
            <label
              key={template}
              className={cn(
                'radius-lg flex cursor-pointer items-start gap-3 border px-4 py-3 transition-colors',
                selected === template
                  ? 'border-brand-accent bg-brand-accent/10'
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
              <span className="text-body-md text-brand-text/80">{template}</span>
            </label>
          ))}

          {showAdd ? (
            <div className="mt-2 space-y-2">
              <p className="text-body-md-medium text-brand-text">Add New Template</p>
              <textarea
                value={newTemplate}
                onChange={(event) => setNewTemplate(event.target.value)}
                placeholder="Text here"
                rows={4}
                className="ui-textarea placeholder:text-muted"
              />
            </div>
          ) : null}

          <button
            type="button"
            onClick={() => setShowAdd((current) => !current)}
            className="ui-cta ui-cta-secondary mt-3 w-full"
          >
            Add Template +
          </button>
        </div>

        <div className="ui-modal-footer">
          <button type="button" onClick={onClose} className="ui-modal-btn ui-modal-btn-cancel">
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
            className="ui-modal-btn ui-modal-btn-gold"
          >
            Apply
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
