import { useState } from 'react'
import { Pencil, Trash2, X } from 'lucide-react'
import { createPortal } from 'react-dom'

import { SettingsToggleRow } from './settings-toggle-row'
import type { SecurityQuestion, SecuritySettings } from '../types/settings'

type SecurityQuestionsConfig = SecuritySettings['securityQuestionsConfig']

type SecurityQuestionsModalProps = {
  open: boolean
  config: SecurityQuestionsConfig
  onClose: () => void
  onSubmit: (config: SecurityQuestionsConfig) => void
}

export function SecurityQuestionsModal({
  open,
  config,
  onClose,
  onSubmit,
}: SecurityQuestionsModalProps) {
  if (!open) return null

  return createPortal(
    <SecurityQuestionsModalContent
      key={JSON.stringify(config)}
      config={config}
      onClose={onClose}
      onSubmit={onSubmit}
    />,
    document.body,
  )
}

function SecurityQuestionsModalContent({
  config,
  onClose,
  onSubmit,
}: {
  config: SecurityQuestionsConfig
  onClose: () => void
  onSubmit: (config: SecurityQuestionsConfig) => void
}) {
  const [draft, setDraft] = useState(config)
  const [newQuestion, setNewQuestion] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingText, setEditingText] = useState('')

  const handleAddQuestion = () => {
    const text = newQuestion.trim()
    if (!text) return
    setDraft({
      ...draft,
      questions: [...draft.questions, { id: `sq-${Date.now()}`, question: text }],
    })
    setNewQuestion('')
  }

  const handleSaveEdit = (id: string) => {
    const text = editingText.trim()
    if (!text) return
    setDraft({
      ...draft,
      questions: draft.questions.map((q) => (q.id === id ? { ...q, question: text } : q)),
    })
    setEditingId(null)
    setEditingText('')
  }

  const handleDelete = (id: string) => {
    setDraft({
      ...draft,
      questions: draft.questions.filter((q) => q.id !== id),
    })
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 p-4">
      <div className="ui-modal-shell max-h-[90vh] max-w-[560px] overflow-y-auto">
        <div className="ui-modal-header">
          <div>
            <h2 className="text-h2 text-brand-text">Security Questions</h2>
            <p className="text-body-sm text-muted mt-1">Manage security verification questions</p>
          </div>
          <button type="button" onClick={onClose} className="text-muted hover:text-brand-text">
            <X className="icon-md" />
          </button>
        </div>

        <div className="ui-modal-body space-y-3">
          <p className="text-body-md-medium text-brand-text">Security Questions</p>
          {draft.questions.map((question: SecurityQuestion) => (
            <div
              key={question.id}
              className="radius-lg flex items-center gap-2 border border-white/10 bg-black/20 px-3 py-2"
            >
              {editingId === question.id ? (
                <input
                  value={editingText}
                  onChange={(event) => setEditingText(event.target.value)}
                  className="ui-input flex-1"
                />
              ) : (
                <span className="text-body-md text-brand-text/80 flex-1">{question.question}</span>
              )}
              <button
                type="button"
                onClick={() => {
                  if (editingId === question.id) {
                    handleSaveEdit(question.id)
                  } else {
                    setEditingId(question.id)
                    setEditingText(question.question)
                  }
                }}
                className="text-muted hover:text-brand-text rounded p-1"
              >
                <Pencil className="icon-sm" />
              </button>
              <button
                type="button"
                onClick={() => handleDelete(question.id)}
                className="text-muted hover:text-brand-danger rounded p-1"
              >
                <Trash2 className="icon-sm" />
              </button>
            </div>
          ))}
          <div className="flex gap-2">
            <input
              value={newQuestion}
              onChange={(event) => setNewQuestion(event.target.value)}
              placeholder="New security question"
              className="ui-input flex-1"
            />
            <button
              type="button"
              onClick={handleAddQuestion}
              className="ui-cta ui-cta-secondary shrink-0"
            >
              + Add New Question
            </button>
          </div>

          <div className="radius-lg space-y-1 border border-white/10 bg-black/20 p-4">
            <p className="text-body-md-medium text-brand-text mb-2">Additional Security Settings</p>
            <SettingsToggleRow
              label="Require security questions for password reset"
              checked={draft.requireForPasswordReset}
              onChange={(checked) => setDraft({ ...draft, requireForPasswordReset: checked })}
            />
            <SettingsToggleRow
              label="Require security questions for critical operations"
              checked={draft.requireForCriticalOperations}
              onChange={(checked) => setDraft({ ...draft, requireForCriticalOperations: checked })}
            />
            <SettingsToggleRow
              label="Lock account after failed attempts"
              checked={draft.lockAccountAfterFailedAttempts}
              onChange={(checked) =>
                setDraft({ ...draft, lockAccountAfterFailedAttempts: checked })
              }
            />
          </div>
        </div>

        <div className="ui-modal-footer">
          <button type="button" onClick={onClose} className="ui-modal-btn ui-modal-btn-cancel">
            Reset
          </button>
          <button
            type="button"
            onClick={() => onSubmit(draft)}
            className="ui-modal-btn ui-modal-btn-gold"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  )
}
