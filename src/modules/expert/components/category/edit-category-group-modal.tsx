import { useCallback, useEffect, useMemo, useState } from 'react'
import { FolderTree, Pause, Play, Search, X } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/shared/components/ui/button'
import { getApiErrorMessage } from '@/shared/lib/api-error'

import type { Category } from './category-table-columns'
import type { VenueCategory } from './venue-category-table-columns'
import {
  usePauseServiceSubCategory,
  useResumeServiceSubCategory,
  useUpdateServiceSubCategory,
} from '../../hooks/use-category-management'
import {
  usePauseVenueSubCategory,
  useResumeVenueSubCategory,
  useUpdateVenueSubCategory,
} from '../../hooks/use-venue-category-management'

export type SubCategoryItem = {
  id: string
  subCategoryId?: string
  name: string
  description?: string
  status?: string
}

type EditCategoryGroupModalProps = {
  open: boolean
  onClose: () => void
  category: Category | VenueCategory | null
  isVenue?: boolean
  onSuccess?: () => void
}

type EditableSubCategory = {
  id: string
  originalName: string
  originalDescription: string
  originalStatus: 'Active' | 'Paused'
  name: string
  description: string
  status: 'Active' | 'Paused'
}

export function EditCategoryGroupModal({
  open,
  onClose,
  category,
  isVenue = false,
  onSuccess,
}: EditCategoryGroupModalProps) {
  useEffect(() => {
    if (!open) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prevOverflow
    }
  }, [open])

  if (!open || !category) return null

  return (
    <EditCategoryGroupModalDialog
      category={category}
      isVenue={isVenue}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  )
}

function EditCategoryGroupModalDialog({
  category,
  isVenue,
  onClose,
  onSuccess,
}: {
  category: Category | VenueCategory
  isVenue: boolean
  onClose: () => void
  onSuccess?: () => void
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSubIds, setSelectedSubIds] = useState<Set<string>>(new Set())
  const [isSubmitting, setIsSubmitting] = useState(false)

  const updateServiceSubMutation = useUpdateServiceSubCategory()
  const pauseServiceSubMutation = usePauseServiceSubCategory()
  const resumeServiceSubMutation = useResumeServiceSubCategory()

  const updateVenueSubMutation = useUpdateVenueSubCategory()
  const pauseVenueSubMutation = usePauseVenueSubCategory()
  const resumeVenueSubMutation = useResumeVenueSubCategory()

  const initialItems: EditableSubCategory[] = useMemo(() => {
    const subs = category.subCategories || []
    return subs.map((sub) => {
      const status: 'Active' | 'Paused' =
        String(sub.status || '').toLowerCase() === 'paused' ? 'Paused' : 'Active'
      return {
        id: String(sub.subCategoryId || sub.id || ''),
        originalName: sub.name || '',
        originalDescription: sub.description || '',
        originalStatus: status,
        name: sub.name || '',
        description: sub.description || '',
        status,
      }
    })
  }, [category.subCategories])

  const [items, setItems] = useState<EditableSubCategory[]>(initialItems)

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items
    const q = searchQuery.toLowerCase().trim()
    return items.filter(
      (item) => item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q),
    )
  }, [items, searchQuery])

  const toggleSelectSub = useCallback((id: string) => {
    setSelectedSubIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const selectAll = useCallback(() => {
    setSelectedSubIds(new Set(items.map((item) => item.id)))
  }, [items])

  const deselectAll = useCallback(() => {
    setSelectedSubIds(new Set())
  }, [])

  const handleUpdateItem = useCallback(
    (id: string, field: 'name' | 'description' | 'status', value: string) => {
      setItems((prev) =>
        prev.map((item) => {
          if (item.id !== id) return item
          return {
            ...item,
            [field]: value,
          }
        }),
      )
      setSelectedSubIds((prev) => {
        if (!prev.has(id)) {
          const next = new Set(prev)
          next.add(id)
          return next
        }
        return prev
      })
    },
    [],
  )

  const handleSaveGroup = async () => {
    const selectedItems = items.filter((item) => selectedSubIds.has(item.id))
    if (selectedItems.length === 0) {
      toast.error('Please select at least one sub-category to edit.')
      return
    }

    const invalid = selectedItems.find((item) => !item.name.trim())
    if (invalid) {
      toast.error('Sub-category name cannot be empty.')
      return
    }

    setIsSubmitting(true)
    const categoryId = category.id

    try {
      for (const item of selectedItems) {
        const hasContentChanged =
          item.name !== item.originalName || item.description !== item.originalDescription
        const hasStatusChanged = item.status !== item.originalStatus

        if (isVenue) {
          if (hasContentChanged) {
            await updateVenueSubMutation.mutateAsync({
              categoryId,
              subCategoryId: item.id,
              payload: {
                name: item.name.trim(),
                description: item.description.trim(),
              },
            })
          }
          if (hasStatusChanged) {
            if (item.status === 'Paused') {
              await pauseVenueSubMutation.mutateAsync({ categoryId, subCategoryId: item.id })
            } else {
              await resumeVenueSubMutation.mutateAsync({ categoryId, subCategoryId: item.id })
            }
          }
        } else {
          if (hasContentChanged) {
            await updateServiceSubMutation.mutateAsync({
              categoryId,
              subCategoryId: item.id,
              payload: {
                name: item.name.trim(),
                description: item.description.trim(),
              },
            })
          }
          if (hasStatusChanged) {
            if (item.status === 'Paused') {
              await pauseServiceSubMutation.mutateAsync({ categoryId, subCategoryId: item.id })
            } else {
              await resumeServiceSubMutation.mutateAsync({ categoryId, subCategoryId: item.id })
            }
          }
        }
      }

      toast.success(
        `Updated ${selectedItems.length} sub-categor${selectedItems.length > 1 ? 'ies' : 'y'} in group successfully`,
      )
      onSuccess?.()
      onClose()
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to update category group'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-[#050505]/80 px-4 py-6"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-group-modal-title"
        className="ui-modal-shell flex max-h-[90vh] w-full max-w-[680px] flex-col text-left"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="ui-modal-header flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
              <FolderTree className="size-5" />
            </div>
            <div>
              <h2 id="edit-group-modal-title" className="text-base font-semibold text-white">
                Edit Category Group
              </h2>
              <p className="text-xs text-slate-400">
                Category: <span className="font-medium text-white">{category.name}</span> &bull;{' '}
                {items.length} sub-categories
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-white"
            aria-label="Close dialog"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="space-y-3 px-6 pt-4 pb-2">
          <p className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-xs text-amber-300/90">
            Select particular sub-categories in this group to edit. Only selected sub-categories
            will have their modifications saved.
          </p>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="relative min-w-[200px] flex-1">
              <Search className="absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search sub-categories in group..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-[#171717] py-1.5 pr-3 pl-8 text-xs text-white placeholder-slate-500 focus:border-amber-500/50 focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={selectAll}
                className="text-xs text-amber-400 hover:underline"
              >
                Select All ({items.length})
              </button>
              <span className="text-slate-600">&bull;</span>
              <button
                type="button"
                onClick={deselectAll}
                className="text-xs text-slate-400 hover:underline"
              >
                Deselect All
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto px-6 py-3 [scrollbar-width:thin]">
          {filteredItems.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No sub-categories match your search filter.
            </div>
          ) : (
            filteredItems.map((item) => {
              const isSelected = selectedSubIds.has(item.id)
              return (
                <div
                  key={item.id}
                  className={`rounded-xl border p-3.5 transition-all ${
                    isSelected
                      ? 'border-amber-500/40 bg-[#161616]'
                      : 'border-white/5 bg-[#121212] opacity-85 hover:border-white/10'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id={`sub-select-${item.id}`}
                      checked={isSelected}
                      onChange={() => toggleSelectSub(item.id)}
                      className="mt-1 size-4 rounded border-white/20 bg-[#1c1c1c] text-amber-500 focus:ring-amber-500/30"
                    />
                    <div className="flex-1 space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <label
                          htmlFor={`sub-select-${item.id}`}
                          className="cursor-pointer text-xs font-semibold text-white"
                        >
                          {isSelected ? 'Editing Sub-Category' : item.name}
                        </label>
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                              item.status === 'Active'
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : 'bg-amber-500/10 text-amber-400'
                            }`}
                          >
                            {item.status}
                          </span>
                          {isSelected && (
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateItem(
                                  item.id,
                                  'status',
                                  item.status === 'Active' ? 'Paused' : 'Active',
                                )
                              }
                              className="inline-flex items-center gap-1 rounded border border-white/10 bg-[#222] px-2 py-0.5 text-[10px] text-slate-300 hover:bg-[#333]"
                            >
                              {item.status === 'Active' ? (
                                <>
                                  <Pause className="size-2.5 text-amber-400" /> Pause
                                </>
                              ) : (
                                <>
                                  <Play className="size-2.5 text-emerald-400" /> Resume
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>

                      {isSelected ? (
                        <div className="space-y-2 pt-1">
                          <div>
                            <label className="mb-1 block text-[10px] text-slate-400">
                              Sub-Category Name
                            </label>
                            <input
                              type="text"
                              value={item.name}
                              onChange={(e) => handleUpdateItem(item.id, 'name', e.target.value)}
                              className="w-full rounded-md border border-white/10 bg-[#1c1c1c] px-2.5 py-1 text-xs text-white focus:border-amber-500/60 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-[10px] text-slate-400">
                              Description
                            </label>
                            <textarea
                              rows={2}
                              value={item.description}
                              onChange={(e) =>
                                handleUpdateItem(item.id, 'description', e.target.value)
                              }
                              className="w-full rounded-md border border-white/10 bg-[#1c1c1c] px-2.5 py-1 text-xs text-white focus:border-amber-500/60 focus:outline-none"
                            />
                          </div>
                        </div>
                      ) : (
                        <p className="line-clamp-2 text-xs text-slate-400">
                          {item.description || 'No description provided.'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        <div className="ui-modal-footer flex items-center justify-between border-t border-white/10 px-6 py-4">
          <span className="text-xs text-slate-400">
            {selectedSubIds.size} of {items.length} sub-categories selected
          </span>
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              className="bg-amber-500 font-semibold text-black hover:bg-amber-400"
              onClick={() => void handleSaveGroup()}
              disabled={isSubmitting || selectedSubIds.size === 0}
            >
              {isSubmitting ? 'Saving Changes...' : `Save Group Changes (${selectedSubIds.size})`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
