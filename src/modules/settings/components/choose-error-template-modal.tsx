import { useState } from 'react'
import { Pencil, Trash2, X } from 'lucide-react'
import { createPortal } from 'react-dom'
import { toast } from 'sonner'

import { cn } from '@/shared/lib/cn'

type ChooseErrorTemplateModalProps = {
  open: boolean
  currentMessage: string
  templates: string[]
  onClose: () => void
  onApply: (message: string) => void
  onCreateTemplate: (message: string) => Promise<string[]>
  onUpdateTemplate: (index: number, message: string) => Promise<string[]>
  onDeleteTemplate: (index: number) => Promise<string[]>
  onTemplatesChange: (templates: string[]) => void
}

function ChooseErrorTemplateModalContent({
  currentMessage,
  templates,
  onClose,
  onApply,
  onCreateTemplate,
  onUpdateTemplate,
  onDeleteTemplate,
  onTemplatesChange,
}: Omit<ChooseErrorTemplateModalProps, 'open'>) {
  const [selected, setSelected] = useState(currentMessage || templates[0] || '')
  const [showAdd, setShowAdd] = useState(false)
  const [draftText, setDraftText] = useState('')
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const handleSubmitAddOrEdit = async () => {
    const next = draftText.trim()
    if (!next) {
      toast.error('Please enter a template message')
      return
    }

    setIsSaving(true)
    try {
      let updated: string[]
      if (editingIndex != null) {
        updated = await onUpdateTemplate(editingIndex, next)
        toast.success('Template updated')
      } else {
        updated = await onCreateTemplate(next)
        toast.success('Template added')
      }
      onTemplatesChange(updated)
      setSelected(next)
      setShowAdd(false)
      setDraftText('')
      setEditingIndex(null)
    } catch {
      toast.error('Failed to save template')
    } finally {
      setIsSaving(false)
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 p-4">
      <div className="ui-modal-shell max-w-[520px]">
        <div className="ui-modal-header">
          <div>
            <h2 className="text-h4 text-brand-text">
              {showAdd
                ? editingIndex != null
                  ? 'Edit Error Message Template'
                  : 'Add Error Message Template'
                : 'Choose Error Message Template'}
            </h2>
            <p className="text-body-sm text-muted mt-1">
              Select a pre-defined error message template
            </p>
          </div>
          <button type="button" onClick={onClose} className="text-muted hover:text-brand-text">
            <X className="icon-md" />
          </button>
        </div>

        <div className="ui-modal-body space-y-2">
          {showAdd ? (
            <div className="space-y-2">
              <p className="text-body-md-medium text-brand-text">
                {editingIndex != null ? 'Edit Template' : 'Add New Template'}
              </p>
              <textarea
                value={draftText}
                onChange={(event) => setDraftText(event.target.value)}
                placeholder="Text here"
                rows={4}
                className="ui-textarea placeholder:text-muted"
              />
            </div>
          ) : (
            templates.map((template, index) => (
              <div
                key={`${template}-${index}`}
                className={cn(
                  'radius-lg flex items-start gap-3 border px-4 py-3 transition-colors',
                  selected === template
                    ? 'border-brand-accent bg-brand-accent/10'
                    : 'border-white/10 bg-black/20 hover:border-white/20',
                )}
              >
                <label className="flex min-w-0 flex-1 cursor-pointer items-start gap-3">
                  <input
                    type="radio"
                    name="error-template"
                    checked={selected === template}
                    onChange={() => setSelected(template)}
                    className="mt-1"
                  />
                  <span className="text-body-md text-brand-text/80">{template}</span>
                </label>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    className="text-muted hover:text-brand-text rounded p-1"
                    aria-label="Edit template"
                    onClick={() => {
                      setEditingIndex(index)
                      setDraftText(template)
                      setShowAdd(true)
                    }}
                  >
                    <Pencil className="size-4" />
                  </button>
                  <button
                    type="button"
                    disabled={isSaving}
                    className="text-muted hover:text-brand-danger rounded p-1"
                    aria-label="Delete template"
                    onClick={async () => {
                      if (templates.length <= 1) {
                        toast.error('Keep at least one template')
                        return
                      }
                      setIsSaving(true)
                      try {
                        const updated = await onDeleteTemplate(index)
                        onTemplatesChange(updated)
                        if (selected === template) {
                          setSelected(updated[0] || '')
                        }
                      } catch {
                        toast.error('Failed to delete template')
                      } finally {
                        setIsSaving(false)
                      }
                    }}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            ))
          )}

          {!showAdd ? (
            <button
              type="button"
              onClick={() => {
                setEditingIndex(null)
                setDraftText('')
                setShowAdd(true)
              }}
              className="ui-cta ui-cta-secondary mt-3 w-full"
            >
              Add Template +
            </button>
          ) : null}
        </div>

        <div className="ui-modal-footer">
          <button
            type="button"
            disabled={isSaving}
            onClick={() => {
              if (showAdd) {
                setShowAdd(false)
                setDraftText('')
                setEditingIndex(null)
                return
              }
              onClose()
            }}
            className="ui-modal-btn ui-modal-btn-cancel"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isSaving}
            onClick={() => {
              if (showAdd) {
                void handleSubmitAddOrEdit()
                return
              }
              onApply(selected)
            }}
            className="ui-modal-btn ui-modal-btn-gold"
          >
            {showAdd ? 'Submit' : 'Apply'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

export function ChooseErrorTemplateModal({
  open,
  currentMessage,
  templates,
  onClose,
  onApply,
  onCreateTemplate,
  onUpdateTemplate,
  onDeleteTemplate,
  onTemplatesChange,
}: ChooseErrorTemplateModalProps) {
  if (!open) return null

  return (
    <ChooseErrorTemplateModalContent
      currentMessage={currentMessage}
      templates={templates}
      onClose={onClose}
      onApply={onApply}
      onCreateTemplate={onCreateTemplate}
      onUpdateTemplate={onUpdateTemplate}
      onDeleteTemplate={onDeleteTemplate}
      onTemplatesChange={onTemplatesChange}
    />
  )
}
