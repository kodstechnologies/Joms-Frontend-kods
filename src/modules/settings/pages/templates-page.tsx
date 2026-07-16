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
import { cn } from '@/shared/lib/cn'
import { navigateBackOrFallback } from '@/shared/lib/navigation'
import { uiTokens } from '@/shared/lib/design-tokens'

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
        checked ? 'bg-emerald-500' : 'bg-white/20',
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 left-0.5 size-4 rounded-full bg-white transition-transform',
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
      <div className="w-full max-w-[560px] rounded-2xl border border-white/10 bg-[#141414] p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-lg font-bold text-white">
            {mode === 'create' ? 'New Reason' : 'Edit Reason'}
          </h2>
          <button type="button" onClick={onClose} className="text-slate-500 hover:text-white">
            <X className="size-5" />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <label className="block space-y-2 text-sm">
            <span className="font-medium text-white">
              Reason title<span className="text-[#F0C27B]">*</span>
            </span>
            <input
              value={form.title}
              onChange={(event) =>
                setForm((current) => ({ ...current, title: event.target.value }))
              }
              placeholder="e.g. Harassment or Bullying"
              className="h-10 w-full rounded-lg border border-white/10 bg-[#0C0C0C] px-3 text-sm text-white"
            />
          </label>

          <label className="block space-y-2 text-sm">
            <span className="font-medium text-white">
              Description<span className="text-[#F0C27B]">*</span>
            </span>
            <textarea
              rows={3}
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({ ...current, description: event.target.value }))
              }
              placeholder="Brief description of this moderation reason"
              className="w-full rounded-lg border border-white/10 bg-[#0C0C0C] px-3 py-2 text-sm text-white"
            />
          </label>

          <label className="block space-y-2 text-sm">
            <span className="font-medium text-white">
              Default Message Template<span className="text-[#F0C27B]">*</span>
              <span className="ml-1 font-normal text-slate-500">(Shown to the user)</span>
            </span>
            <textarea
              rows={5}
              value={form.defaultMessageTemplate}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  defaultMessageTemplate: event.target.value,
                }))
              }
              placeholder="Template message will be sent to the user when this reason is applied"
              className="w-full rounded-lg border border-white/10 bg-[#0C0C0C] px-3 py-2 text-sm text-white"
            />
          </label>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/20 px-5 py-2.5 text-sm font-semibold text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!canSubmit || isSubmitting}
            onClick={() => onSubmit(form)}
            className="rounded-xl bg-[#F0C27B] px-5 py-2.5 text-sm font-semibold text-[#050505] disabled:opacity-50"
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
      <div className="w-full max-w-[480px] rounded-2xl border border-white/10 bg-[#141414] p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-lg font-bold text-white">Edit Category</h2>
          <button type="button" onClick={onClose} className="text-slate-500 hover:text-white">
            <X className="size-5" />
          </button>
        </div>
        <div className="mt-5 space-y-4">
          <label className="block space-y-2 text-sm">
            <span className="font-medium text-white">Title</span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="h-10 w-full rounded-lg border border-white/10 bg-[#0C0C0C] px-3 text-sm text-white"
            />
          </label>
          <label className="block space-y-2 text-sm">
            <span className="font-medium text-white">Description</span>
            <textarea
              rows={3}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#0C0C0C] px-3 py-2 text-sm text-white"
            />
          </label>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/20 px-5 py-2.5 text-sm font-semibold text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!title.trim() || isSubmitting}
            onClick={() => onSubmit({ title: title.trim(), description: description.trim() })}
            className="rounded-xl bg-[#F0C27B] px-5 py-2.5 text-sm font-semibold text-[#050505] disabled:opacity-50"
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
        ...values,
      },
      {
        onSuccess: () => {
          toast.success('Reason created')
          setReasonModalOpen(false)
        },
        onError: () => toast.error('Failed to create reason'),
      },
    )
  }

  return (
    <div className="space-y-6">
      {!embedded ? (
        <button
          type="button"
          onClick={() =>
            navigateBackOrFallback(navigate, '/settings/main', {
              state: { settingsTab: 'templates' },
            })
          }
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"
        >
          <ArrowLeft className="size-4" />
          Settings / Templates
        </button>
      ) : null}

      <div>
        <h1
          className={cn(
            'font-semibold tracking-tight text-white',
            embedded ? 'text-lg' : 'text-3xl sm:text-4xl',
          )}
        >
          Moderation Reason Manager
        </h1>
        <p className="mt-1 text-sm text-slate-400">Manage action categories and reasons.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className={cn(uiTokens.radiusCard, 'border border-white/10 bg-[#111111] p-4')}>
          <p className="text-sm font-semibold text-white">Categories</p>
          <div className="relative mt-3">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-500" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search Categories"
              className="h-10 w-full rounded-lg border border-white/10 bg-[#0B0B0B] pr-3 pl-10 text-sm text-white"
            />
          </div>

          <div className="mt-4 space-y-2">
            {categoriesLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-20 animate-pulse rounded-xl bg-white/5" />
              ))
            ) : categories.length === 0 ? (
              <p className="px-2 py-6 text-center text-sm text-slate-500">No categories found</p>
            ) : (
              categories.map((category) => {
                const selected = category.id === activeCategoryId
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setSelectedCategoryId(category.id)}
                    className={cn(
                      'w-full rounded-xl border px-3 py-3 text-left transition-colors',
                      selected
                        ? 'border-[#F0C27B]/40 bg-[#F0C27B]/10'
                        : 'border-white/10 bg-[#0B0B0B] hover:border-white/20',
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-white">{category.title}</p>
                      <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-slate-300">
                        {category.reasonCount}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{category.description}</p>
                  </button>
                )
              })
            )}
          </div>
        </aside>

        <section
          className={cn(uiTokens.radiusCard, 'border border-white/10 bg-[#111111] p-4 sm:p-5')}
        >
          {selectedCategory ? (
            <>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold text-white">{selectedCategory.title}</h2>
                    <button
                      type="button"
                      onClick={() => setCategoryEditOpen(true)}
                      className="rounded p-1 text-slate-400 hover:bg-white/5 hover:text-white"
                      aria-label="Edit category"
                    >
                      <Pencil className="size-4" />
                    </button>
                    <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-400">
                      active
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-400">{selectedCategory.description}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingReason(null)
                    setReasonModalOpen(true)
                  }}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#F0C27B] px-4 py-2.5 text-sm font-semibold text-[#050505] hover:bg-[#E6B46C]"
                >
                  <Plus className="size-4" />
                  New Reason
                </button>
              </div>

              <div className="mt-5 space-y-3">
                {reasonsLoading ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="h-24 animate-pulse rounded-xl bg-white/5" />
                  ))
                ) : reasons.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-white/10 px-4 py-10 text-center text-sm text-slate-500">
                    No reasons in this category yet. Create the first one.
                  </div>
                ) : (
                  reasons.map((reason) => (
                    <article
                      key={reason.id}
                      className="rounded-xl border border-white/10 bg-[#0B0B0B] px-4 py-4"
                    >
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm font-semibold text-white">{reason.title}</h3>
                            <span className="rounded-full border border-[#F0C27B]/25 bg-[#F0C27B]/10 px-2.5 py-0.5 text-[10px] font-medium text-[#F0C27B]">
                              Used in {reason.usageCount} actions
                            </span>
                          </div>
                          <p className="text-sm text-slate-400">{reason.description}</p>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2 text-xs text-slate-300">
                            <span>Active</span>
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
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingReason(reason)
                              setReasonModalOpen(true)
                            }}
                            className="rounded p-1.5 text-slate-400 hover:bg-white/5 hover:text-white"
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
                            className="rounded p-1.5 text-slate-400 hover:bg-white/5 hover:text-rose-300"
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
            <div className="py-16 text-center text-sm text-slate-500">
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
