import { useState } from 'react'
import { Pencil, Plus, Trash2, X } from 'lucide-react'
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
      <div className="ui-modal-shell error-template-modal-shell">
        <div className="ui-modal-header error-template-modal-header">
          <div>
            <h2 className="error-template-modal-title">
              {showAdd
                ? editingIndex != null
                  ? 'Edit Error Message Template'
                  : 'Add Error Message Template'
                : 'Choose Error Message Template'}
            </h2>
            <p className="error-template-modal-subtitle">
              Select a pre-defined error message template
            </p>
          </div>
          <button type="button" onClick={onClose} className="error-template-modal-close">
            <X className="icon-md" />
          </button>
        </div>

        <div className="ui-modal-body error-template-modal-body">
          {showAdd ? (
            <div className="error-template-form-stack">
              <p className="error-template-form-label">
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
            <>
              <div className="error-template-list">
                {templates.map((template, index) => {
                  const isSelected = selected === template

                  return (
                    <div
                      key={`${template}-${index}`}
                      className={cn(
                        'error-template-row',
                        isSelected && 'error-template-row-selected',
                      )}
                    >
                      <label className="error-template-row-main">
                        <input
                          type="radio"
                          name="error-template"
                          checked={isSelected}
                          onChange={() => setSelected(template)}
                          className="sr-only"
                        />
                        <span className="error-template-radio" aria-hidden />
                        <span className="error-template-row-text">{template}</span>
                      </label>
                      <div className="error-template-row-actions">
                        <button
                          type="button"
                          className="error-template-icon-btn"
                          aria-label="Edit template"
                          onClick={() => {
                            setEditingIndex(index)
                            setDraftText(template)
                            setShowAdd(true)
                          }}
                        >
                          <Pencil className="size-4" strokeWidth={1.5} />
                        </button>
                        <button
                          type="button"
                          disabled={isSaving}
                          className="error-template-icon-btn"
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
                          <Trash2 className="size-4" strokeWidth={1.5} />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditingIndex(null)
                  setDraftText('')
                  setShowAdd(true)
                }}
                className="error-template-add-btn"
              >
                <span>Add Template</span>
                <Plus className="size-4" strokeWidth={2} />
              </button>
            </>
          )}
        </div>

        <div className="ui-modal-footer error-template-modal-footer">
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
