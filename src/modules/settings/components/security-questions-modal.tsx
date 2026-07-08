import { useEffect, useState } from 'react'
import { Pencil, Trash2, X } from 'lucide-react'
import { createPortal } from 'react-dom'

import { SettingsToggleRow } from './settings-toggle-row'
import type { SecurityQuestion, SecuritySettings } from '../types/settings'

type SecurityQuestionsModalProps = {
  open: boolean
  config: SecuritySettings['securityQuestionsConfig']
  onClose: () => void
  onSubmit: (config: SecuritySettings['securityQuestionsConfig']) => void
}

export function SecurityQuestionsModal({
  open,
  config,
  onClose,
  onSubmit,
}: SecurityQuestionsModalProps) {
  const [draft, setDraft] = useState(config)
  const [newQuestion, setNewQuestion] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingText, setEditingText] = useState('')

  useEffect(() => {
    if (open) setDraft(config)
  }, [open, config])

  if (!open) return null

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

  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 p-4">
      <div className="max-h-[90vh] w-full max-w-[560px] overflow-y-auto rounded-2xl border border-white/10 bg-[#141414] p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white">Security Questions</h2>
            <p className="mt-1 text-xs text-slate-500">Manage security verification questions</p>
          </div>
          <button type="button" onClick={onClose} className="text-slate-500 hover:text-white">
            <X className="size-5" />
          </button>
        </div>

        <div className="mt-5 space-y-3">
          <p className="text-sm font-medium text-white">Security Questions</p>
          {draft.questions.map((question: SecurityQuestion) => (
            <div
              key={question.id}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2"
            >
              {editingId === question.id ? (
                <input
                  value={editingText}
                  onChange={(event) => setEditingText(event.target.value)}
                  className="flex-1 rounded-lg border border-white/10 bg-[#1a1a1a] px-2 py-1 text-sm text-white"
                />
              ) : (
                <span className="flex-1 text-sm text-slate-300">{question.question}</span>
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
                className="rounded p-1 text-slate-500 hover:text-white"
              >
                <Pencil className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => handleDelete(question.id)}
                className="rounded p-1 text-slate-500 hover:text-rose-400"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
          <div className="flex gap-2">
            <input
              value={newQuestion}
              onChange={(event) => setNewQuestion(event.target.value)}
              placeholder="New security question"
              className="h-10 flex-1 rounded-lg border border-white/10 bg-[#1a1a1a] px-3 text-sm text-white"
            />
            <button
              type="button"
              onClick={handleAddQuestion}
              className="rounded-lg border border-white/15 px-4 text-sm font-medium text-white hover:bg-white/5"
            >
              + Add New Question
            </button>
          </div>
        </div>

        <div className="mt-6 space-y-1 rounded-xl border border-white/10 bg-black/20 p-4">
          <p className="mb-2 text-sm font-medium text-white">Additional Security Settings</p>
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
            onChange={(checked) => setDraft({ ...draft, lockAccountAfterFailedAttempts: checked })}
          />
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/20 px-5 py-2.5 text-sm font-semibold text-white"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={() => onSubmit(draft)}
            className="rounded-xl bg-[#F0C27B] px-5 py-2.5 text-sm font-semibold text-[#050505]"
          >
            Submit
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
