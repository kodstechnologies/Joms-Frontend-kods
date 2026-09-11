import { useMemo, useState } from 'react'
import { ArrowLeft, Pencil, Plus, Search, Trash2, X } from 'lucide-react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import {
  useCreateModerationReason,
  useDeleteModerationReason,
  useModerationCategories,
  useModerationReasons,
  useToggleModerationReason,
  useUpdateModerationCategory,
  useUpdateModerationReason,
} from '../hooks/use-templates'
import type { ModerationCategory, ModerationReason } from '../api/templates-api'
import { RequiredMark } from '@/shared/components/form/required-mark'
import { cn } from '@/shared/lib/cn'
import { navigateBackOrFallback } from '@/shared/lib/navigation'

type ReasonFormState = {
  title: string
  description: string
  defaultMessageTemplate: string
}

const emptyForm: ReasonFormState = {
  title: '',
  description: '',
  defaultMessageTemplate: '',
}

function ToggleSwitch({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean
  onChange: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={onChange}
      className={cn(
        'relative h-5 w-9 rounded-full transition-colors disabled:opacity-50',
        checked ? 'bg-[#F6CB86]' : 'bg-white/20',
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 left-0.5 size-4 rounded-full bg-black transition-transform',
          checked && 'translate-x-4',
        )}
      />
    </button>
  )
}

function ReasonFormModal({
  open,
  mode,
  initial,
  onClose,
  onSubmit,
  isSubmitting,
}: {
  open: boolean
  mode: 'create' | 'edit'
  initial: ReasonFormState
  onClose: () => void
  onSubmit: (values: ReasonFormState) => void
  isSubmitting: boolean
}) {
  const [form, setForm] = useState(initial)
  const [wasOpen, setWasOpen] = useState(open)

  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) setForm(initial)
  }

  if (!open) return null

  const canSubmit =
    form.title.trim().length > 0 &&
    form.description.trim().length > 0 &&
    form.defaultMessageTemplate.trim().length > 0

  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 p-4">
      <div
        className="radius-popup bg-brand-surface flex flex-col overflow-hidden border border-white/10"
        style={{ width: '514px', maxWidth: 'calc(100vw - 32px)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h2 className="invite-modal-title">{mode === 'create' ? 'New Reason' : 'Edit Reason'}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-muted hover:text-brand-text grid size-6 place-items-center rounded transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4 overflow-y-auto px-5 py-5">
          <div>
            <label className="invite-modal-field-label mb-1.5 block">
              Reason title <RequiredMark />
            </label>
            <input
              value={form.title}
              onChange={(e) => setForm((c) => ({ ...c, title: e.target.value }))}
              placeholder="e.g User Suspension"
              className="ui-input"
            />
          </div>

          <div>
            <label className="invite-modal-field-label mb-1.5 block">
              Description <RequiredMark />
            </label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm((c) => ({ ...c, description: e.target.value }))}
              placeholder="Brief description of this moderation reason"
              className="ui-textarea"
              style={{ minHeight: '73px', width: '463px' }}
            />
          </div>

          <div>
            <label className="invite-modal-field-label mb-1.5 block">
              Default Message Template <RequiredMark />
              <span className="text-body-sm text-muted ml-1 font-normal italic">
                (Shown to the user)
              </span>
            </label>
            <textarea
              rows={3}
              value={form.defaultMessageTemplate}
              onChange={(e) => setForm((c) => ({ ...c, defaultMessageTemplate: e.target.value }))}
              placeholder="Template message will be sent to the user when this reason is applied"
              className="ui-textarea"
              style={{ minHeight: '73px', width: '463px' }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 border-t border-white/10 px-5 py-4">
          <button type="button" onClick={onClose} className="ui-cta ui-cta-ghost flex-1">
            Cancel
          </button>
          <button
            type="button"
            disabled={!canSubmit || isSubmitting}
            onClick={() => onSubmit(form)}
            className="ui-cta ui-cta-primary flex-1"
          >
            {isSubmitting
              ? mode === 'create'
                ? 'Creating…'
                : 'Saving…'
              : mode === 'create'
                ? 'Create Reason'
                : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

function CategoryEditModal({
  open,
  category,
  onClose,
  onSubmit,
  isSubmitting,
}: {
  open: boolean
  category: ModerationCategory | null
  onClose: () => void
  onSubmit: (payload: { title: string; description: string }) => void
  isSubmitting: boolean
}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [wasOpen, setWasOpen] = useState(open)

  if (open !== wasOpen) {
    setWasOpen(open)
    if (open && category) {
      setTitle(category.title)
      setDescription(category.description)
    }
  }

  if (!open || !category) return null

  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 p-4">
      <div className="ui-modal-shell max-w-[480px]">
        <div className="ui-modal-header">
          <h2 className="text-h4 text-brand-text">Edit Category</h2>
          <button type="button" onClick={onClose} className="text-muted hover:text-brand-text">
            <X className="icon-md" />
          </button>
        </div>
        <div className="ui-modal-body space-y-4">
          <label className="text-body-md block space-y-2">
            <span className="text-body-md-medium text-brand-text">Title</span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="ui-input"
            />
          </label>
          <label className="text-body-md block space-y-2">
            <span className="text-body-md-medium text-brand-text">Description</span>
            <textarea
              rows={3}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
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
            disabled={!title.trim() || isSubmitting}
            onClick={() => onSubmit({ title: title.trim(), description: description.trim() })}
            className="ui-modal-btn ui-modal-btn-gold"
          >
            {isSubmitting ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

export function TemplatesPage({ embedded = false }: { embedded?: boolean }) {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState('')
  const [reasonModalOpen, setReasonModalOpen] = useState(false)
  const [editingReason, setEditingReason] = useState<ModerationReason | null>(null)
  const [categoryEditOpen, setCategoryEditOpen] = useState(false)

  const { data: categories = [], isLoading: categoriesLoading } = useModerationCategories(search)
  const selectedCategory =
    categories.find((item) => item.id === selectedCategoryId) ?? categories[0] ?? null
  const activeCategoryId = selectedCategory?.id ?? ''

  const { data: reasons = [], isLoading: reasonsLoading } = useModerationReasons(activeCategoryId)
  const createReasonMutation = useCreateModerationReason()
  const updateReasonMutation = useUpdateModerationReason()
  const toggleReasonMutation = useToggleModerationReason()
  const deleteReasonMutation = useDeleteModerationReason(activeCategoryId)
  const updateCategoryMutation = useUpdateModerationCategory()

  if (!selectedCategoryId && categories[0]?.id) {
    setSelectedCategoryId(categories[0].id)
  }

  const reasonFormInitial = useMemo<ReasonFormState>(() => {
    if (!editingReason) return emptyForm
    return {
      title: editingReason.title,
      description: editingReason.description,
      defaultMessageTemplate: editingReason.defaultMessageTemplate,
    }
  }, [editingReason])

  const handleSaveReason = (values: ReasonFormState) => {
    if (!activeCategoryId) return

    if (editingReason) {
      updateReasonMutation.mutate(
        {
          id: editingReason.id,
          payload: values,
        },
        {
          onSuccess: () => {
            toast.success('Reason updated')
            setReasonModalOpen(false)
            setEditingReason(null)
          },
          onError: () => toast.error('Failed to update reason'),
        },
      )
      return
    }

    createReasonMutation.mutate(
      {
        categoryId: activeCategoryId,
        slug: selectedCategory?.slug,
        ...values,
      },
      {
        onSuccess: () => {
          toast.success('Reason created')
          setReasonModalOpen(false)
        },
        onError: (error) => {
          const apiMessage = (error as { response?: { data?: { message?: string } } }).response
            ?.data?.message
          toast.error(apiMessage || 'Failed to create reason')
        },
      },
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 border-b border-white/10 pb-4">
        {embedded ? (
          <button
            type="button"
            onClick={() => navigateBackOrFallback(navigate, '/settings')}
            className="text-muted hover:text-brand-text grid size-9 place-items-center rounded-lg border border-white/10 transition-colors hover:bg-white/5"
            aria-label="Go back"
          >
            <ArrowLeft className="size-4" />
          </button>
        ) : null}
        <div>
          <h1
            className={cn(
              'text-brand-text tracking-tight',
              embedded ? 'text-h4 font-semibold' : 'text-h2',
            )}
          >
            Moderation Reason Manager
          </h1>
          <p className="ui-page-subtitle mt-1 text-[16px] leading-5 font-medium tracking-normal text-[#FFFFFF80]">
            Manage action categories and reasons
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        {/* Left: Categories */}
        <aside className="border-white/10 lg:border-r lg:pr-6">
          <p className="text-body-md-semibold text-brand-text">Categories</p>
          <div className="bg-brand-surface mt-3 flex h-10 items-center gap-3 rounded-lg border border-white/[0.08] px-3">
            <Search className="text-muted size-4 shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Categories"
              className="text-brand-text placeholder:text-muted h-full flex-1 bg-transparent text-sm outline-none"
            />
          </div>

          <div className="mt-4 divide-y divide-white/[0.08]">
            {categoriesLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-[55px] animate-pulse py-3" />
              ))
            ) : categories.length === 0 ? (
              <p className="text-body-md text-muted px-2 py-6 text-center">No categories found</p>
            ) : (
              categories.map((category) => {
                const selected = category.id === activeCategoryId
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setSelectedCategoryId(category.id)}
                    className="w-full py-4 text-left transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <p
                        className={cn(
                          'text-body-md-semibold transition-colors',
                          selected ? 'text-white' : 'text-white/90 hover:text-white',
                        )}
                      >
                        {category.title}
                      </p>
                      <span className="rounded-md bg-[#1C1C1E] px-2 py-0.5 text-xs font-semibold text-white">
                        {category.reasonCount}
                      </span>
                    </div>
                    <p className="text-body-sm text-muted mt-1.5 line-clamp-2">
                      {category.description}
                    </p>
                  </button>
                )
              })
            )}
          </div>
        </aside>

        {/* Right: Reasons */}
        <section className="min-w-0">
          {selectedCategory ? (
            <>
              <div className="border-b border-white/10 pb-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h2 className="text-xl font-bold text-white">{selectedCategory.title}</h2>
                      <button
                        type="button"
                        onClick={() => setCategoryEditOpen(true)}
                        className="text-muted hover:text-brand-text rounded p-1 hover:bg-white/5"
                        aria-label="Edit category"
                      >
                        <Pencil className="size-4" />
                      </button>
                      <span className="inline-flex h-5 items-center rounded-full bg-[#00A63E]/20 px-2.5 text-xs font-semibold text-[#00D062]">
                        Active
                      </span>
                    </div>
                    <p className="text-body-sm text-muted mt-1.5">{selectedCategory.description}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingReason(null)
                      setReasonModalOpen(true)
                    }}
                    className="ui-cta ui-cta-primary shrink-0"
                  >
                    <Plus className="size-4" />
                    New Reason
                  </button>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {reasonsLoading ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="h-[88px] animate-pulse rounded-xl bg-white/5" />
                  ))
                ) : reasons.length === 0 ? (
                  <div className="text-body-md text-muted rounded-xl border border-dashed border-white/10 px-4 py-10 text-center">
                    No reasons in this category yet. Create the first one.
                  </div>
                ) : (
                  reasons.map((reason) => (
                    <article
                      key={reason.id}
                      className="bg-brand-surface rounded-xl border border-white/[0.04] p-4 sm:p-5"
                    >
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0 flex-1 space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <h3 className="text-base font-semibold text-white">{reason.title}</h3>
                            <span className="inline-flex h-5 items-center rounded-full border border-[#F6CB86]/20 bg-[#3D2E14] px-2.5 text-xs font-medium text-[#F6CB86]">
                              Used in {reason.usageCount} actions
                            </span>
                          </div>
                          <p className="text-body-sm text-muted leading-relaxed">
                            {reason.description}
                          </p>
                        </div>

                        <div className="flex shrink-0 items-center gap-3">
                          <div className="text-body-sm text-brand-text flex items-center gap-2">
                            <ToggleSwitch
                              checked={reason.isActive}
                              disabled={toggleReasonMutation.isPending}
                              onChange={() =>
                                toggleReasonMutation.mutate(reason.id, {
                                  onSuccess: (data) =>
                                    toast.success(
                                      data.isActive ? 'Reason activated' : 'Reason disabled',
                                    ),
                                  onError: () => toast.error('Failed to update status'),
                                })
                              }
                            />
                            <span>Active</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingReason(reason)
                              setReasonModalOpen(true)
                            }}
                            className="text-muted hover:text-brand-text rounded p-1.5 hover:bg-white/5"
                            aria-label="Edit reason"
                          >
                            <Pencil className="size-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              deleteReasonMutation.mutate(reason.id, {
                                onSuccess: () => toast.success('Reason deleted'),
                                onError: () => toast.error('Failed to delete reason'),
                              })
                            }
                            className="text-brand-danger hover:bg-brand-danger/10 rounded p-1.5"
                            aria-label="Delete reason"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </>
          ) : (
            <div className="text-body-md text-muted py-16 text-center">
              Select a category to manage reasons.
            </div>
          )}
        </section>
      </div>

      <ReasonFormModal
        open={reasonModalOpen}
        mode={editingReason ? 'edit' : 'create'}
        initial={reasonFormInitial}
        onClose={() => {
          setReasonModalOpen(false)
          setEditingReason(null)
        }}
        onSubmit={handleSaveReason}
        isSubmitting={createReasonMutation.isPending || updateReasonMutation.isPending}
      />

      <CategoryEditModal
        open={categoryEditOpen}
        category={selectedCategory}
        onClose={() => setCategoryEditOpen(false)}
        isSubmitting={updateCategoryMutation.isPending}
        onSubmit={(payload) => {
          if (!selectedCategory) return
          updateCategoryMutation.mutate(
            { id: selectedCategory.id, payload },
            {
              onSuccess: () => {
                toast.success('Category updated')
                setCategoryEditOpen(false)
              },
              onError: () => toast.error('Failed to update category'),
            },
          )
        }}
      />
    </div>
  )
}
