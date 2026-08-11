import { useMemo, useState } from 'react'
import { Pencil, Trash2, X } from 'lucide-react'
import { createPortal } from 'react-dom'
import { toast } from 'sonner'

import type { SecurityQuestion, SecuritySettings } from '../types/settings'
import { cn } from '@/shared/lib/cn'

type SecurityQuestionsConfig = SecuritySettings['securityQuestionsConfig']

type SecurityQuestionsModalProps = {
  open: boolean
  config: SecurityQuestionsConfig
  onClose: () => void
  onSubmit: (config: SecurityQuestionsConfig) => void
}

const MAX_QUESTIONS = 20
const MIN_QUESTION_LENGTH = 3

const createQuestionId = () => `sq-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

export function SecurityQuestionsModal({
  open,
  config,
  onClose,
  onSubmit,
}: SecurityQuestionsModalProps) {
  if (!open) return null

  return createPortal(
    <SecurityQuestionsModalContent
      key={`${config.questions.map((q) => q.id).join('|')}-${config.questions.length}`}
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
  const initialQuestions = useMemo(
    () =>
      (config.questions || [])
        .map((item) => ({
          id: String(item.id || createQuestionId()),
          question: String(item.question || '').trim(),
        }))
        .filter((item) => item.question.length > 0),
    [config.questions],
  )

  const [draft, setDraft] = useState<SecurityQuestionsConfig>(() => ({
    ...config,
    questions: initialQuestions,
  }))
  const [selectedId, setSelectedId] = useState<string | null>(initialQuestions[0]?.id ?? null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingText, setEditingText] = useState('')

  const effectiveSelectedId =
    selectedId && draft.questions.some((q) => q.id === selectedId)
      ? selectedId
      : (draft.questions[0]?.id ?? null)

  const startEdit = (question: SecurityQuestion) => {
    setSelectedId(question.id)
    setEditingId(question.id)
    setEditingText(question.question)
  }

  const cancelEdit = () => {
    // Drop brand-new empty rows if user cancels edit
    if (editingId) {
      const current = draft.questions.find((q) => q.id === editingId)
      if (current && !current.question.trim() && !editingText.trim()) {
        setDraft({
          ...draft,
          questions: draft.questions.filter((q) => q.id !== editingId),
        })
        if (selectedId === editingId) {
          setSelectedId(draft.questions.find((q) => q.id !== editingId)?.id ?? null)
        }
      }
    }
    setEditingId(null)
    setEditingText('')
  }

  const saveEdit = () => {
    if (!editingId) return
    const text = editingText.trim()
    if (text.length < MIN_QUESTION_LENGTH) {
      toast.error(`Question must be at least ${MIN_QUESTION_LENGTH} characters`)
      return
    }
    const duplicate = draft.questions.some(
      (q) => q.id !== editingId && q.question.toLowerCase() === text.toLowerCase(),
    )
    if (duplicate) {
      toast.error('This question already exists')
      return
    }

    setDraft({
      ...draft,
      questions: draft.questions.map((q) => (q.id === editingId ? { ...q, question: text } : q)),
    })
    setEditingId(null)
    setEditingText('')
  }

  const handleAddQuestion = () => {
    if (draft.questions.length >= MAX_QUESTIONS) {
      toast.error(`You can add up to ${MAX_QUESTIONS} questions`)
      return
    }
    if (editingId) {
      toast.message('Finish editing the current question first')
      return
    }

    const id = createQuestionId()
    setDraft({
      ...draft,
      questions: [...draft.questions, { id, question: '' }],
    })
    setSelectedId(id)
    setEditingId(id)
    setEditingText('')
  }

  const handleDelete = (id: string) => {
    if (draft.questions.length <= 1) {
      toast.error('At least one security question is required')
      return
    }
    const nextQuestions = draft.questions.filter((q) => q.id !== id)
    setDraft({ ...draft, questions: nextQuestions })
    if (selectedId === id) setSelectedId(nextQuestions[0]?.id ?? null)
    if (editingId === id) {
      setEditingId(null)
      setEditingText('')
    }
  }

  const handleSubmit = () => {
    if (editingId) {
      toast.message('Save or cancel the question you are editing')
      return
    }

    const cleaned = draft.questions
      .map((q) => ({ ...q, question: q.question.trim() }))
      .filter((q) => q.question.length > 0)

    if (cleaned.length === 0) {
      toast.error('Add at least one security question')
      return
    }

    const tooShort = cleaned.find((q) => q.question.length < MIN_QUESTION_LENGTH)
    if (tooShort) {
      toast.error(`Each question must be at least ${MIN_QUESTION_LENGTH} characters`)
      return
    }

    const seen = new Set<string>()
    for (const item of cleaned) {
      const key = item.question.toLowerCase()
      if (seen.has(key)) {
        toast.error('Duplicate security questions are not allowed')
        return
      }
      seen.add(key)
    }

    onSubmit({
      ...draft,
      questions: cleaned,
    })
  }

  return (
    <div className="sq-modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="sq-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="security-questions-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="sq-modal-header">
          <div className="sq-modal-heading">
            <h2 id="security-questions-title" className="sq-modal-title">
              Security Questions
            </h2>
            <p className="sq-modal-desc">
              Configure security questions for super admin account recovery and verification. These
              questions add an extra layer of protection for critical system operations.
            </p>
          </div>
          <button type="button" className="sq-modal-close" onClick={onClose} aria-label="Close">
            <X className="size-5" />
          </button>
        </header>

        <div className="sq-modal-body">
          <div className="sq-questions-list">
            {draft.questions.length === 0 ? (
              <p className="sq-empty">No security questions yet. Add one below.</p>
            ) : (
              draft.questions.map((question) => {
                const isSelected = effectiveSelectedId === question.id
                const isEditing = editingId === question.id

                return (
                  <div
                    key={question.id}
                    className={cn('sq-question-row', isSelected && 'is-selected')}
                  >
                    <label className="sq-radio-wrap">
                      <input
                        type="radio"
                        name="security-question-selected"
                        checked={isSelected}
                        onChange={() => setSelectedId(question.id)}
                        className="sq-radio"
                      />
                    </label>

                    {isEditing ? (
                      <input
                        autoFocus
                        value={editingText}
                        onChange={(event) => setEditingText(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            event.preventDefault()
                            saveEdit()
                          }
                          if (event.key === 'Escape') {
                            event.preventDefault()
                            cancelEdit()
                          }
                        }}
                        placeholder="Enter security question"
                        className="sq-question-input"
                      />
                    ) : (
                      <button
                        type="button"
                        className="sq-question-text"
                        onClick={() => setSelectedId(question.id)}
                      >
                        {question.question || 'Untitled question'}
                      </button>
                    )}

                    <div className="sq-question-actions">
                      {isEditing ? (
                        <>
                          <button type="button" className="sq-action-link" onClick={saveEdit}>
                            Save
                          </button>
                          <button type="button" className="sq-action-link" onClick={cancelEdit}>
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            className="sq-icon-btn"
                            aria-label="Edit question"
                            onClick={() => startEdit(question)}
                          >
                            <Pencil className="size-4" />
                          </button>
                          <button
                            type="button"
                            className="sq-icon-btn sq-icon-btn-danger"
                            aria-label="Delete question"
                            onClick={() => handleDelete(question.id)}
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>

          <button type="button" className="sq-add-btn" onClick={handleAddQuestion}>
            Add Questions +
          </button>

          <section className="sq-settings-block">
            <h3 className="sq-settings-title">Additional Security Settings</h3>

            <SecuritySettingToggle
              label="Require security questions for password reset"
              description="Users must answer security questions before resetting password"
              checked={draft.requireForPasswordReset}
              onChange={(requireForPasswordReset) =>
                setDraft({ ...draft, requireForPasswordReset })
              }
            />
            <SecuritySettingToggle
              label="Require security questions for critical operations"
              description="Ask security questions before deleting data or changing permissions"
              checked={draft.requireForCriticalOperations}
              onChange={(requireForCriticalOperations) =>
                setDraft({ ...draft, requireForCriticalOperations })
              }
            />
            <SecuritySettingToggle
              label="Lock account after failed attempts"
              description="Lock account after 3 consecutive wrong answers"
              checked={draft.lockAccountAfterFailedAttempts}
              onChange={(lockAccountAfterFailedAttempts) =>
                setDraft({ ...draft, lockAccountAfterFailedAttempts })
              }
            />
          </section>
        </div>

        <footer className="sq-modal-footer">
          <button type="button" className="sq-btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="sq-btn-submit" onClick={handleSubmit}>
            Submit
          </button>
        </footer>
      </div>
    </div>
  )
}

function SecuritySettingToggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <div className="sq-toggle-row">
      <div className="sq-toggle-copy">
        <p className="sq-toggle-label">{label}</p>
        <p className="sq-toggle-desc">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn('sq-toggle', checked && 'is-on')}
      >
        <span className="sq-toggle-thumb" />
      </button>
    </div>
  )
}
