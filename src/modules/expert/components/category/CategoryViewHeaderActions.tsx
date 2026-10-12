import { useState } from 'react'
import { Eye, FolderTree, Pencil, Pause, Plus, Trash2 } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { Button } from '@/shared/components/ui/button'

import { categoryPath, useCategoryManagementScope } from './category-management-scope'
import { DeleteCategoryModal } from './delete-category-modal'
import { PauseCategoryModal } from './pause-category-modal'
import { EditCategoryGroupModal } from './edit-category-group-modal'
import {
  usePauseServiceCategory,
  useSoftDeleteServiceCategory,
} from '../../hooks/use-category-management'
import { getErrorMessage } from '../../utils/category-mapper'
import { buildRelatedListCategoryUrl } from '../../utils/related-list-category-link'
import { MODERATION_CATEGORY_SLUGS } from '@/modules/settings/api/templates-api'
import type { Category } from './category-table-columns'

type CategoryViewHeaderActionsProps = {
  category?: Category | null
}

export const CategoryViewHeaderActions = ({ category = null }: CategoryViewHeaderActionsProps) => {
  const navigate = useNavigate()
  const { id } = useParams()
  const scope = useCategoryManagementScope()
  const [pauseModalOpen, setPauseModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [editGroupModalOpen, setEditGroupModalOpen] = useState(false)
  const pauseMutation = usePauseServiceCategory()
  const softDeleteMutation = useSoftDeleteServiceCategory()

  const categoryId = String(id || category?.id || '').trim()
  const categoryName = String(category?.name || '').trim()

  const handleViewRelatedList = () => {
    navigate(
      buildRelatedListCategoryUrl(scope.relatedListPath, {
        categoryId,
        categoryName,
      }),
    )
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-end gap-3">
        <Button onClick={() => navigate(categoryPath(scope, `create-subcategory/${id}`))}>
          <Plus className="size-4" aria-hidden="true" />
          Add Sub-Category
        </Button>

        <Button variant="secondary" onClick={handleViewRelatedList}>
          <Eye className="size-4" aria-hidden="true" />
          {scope.relatedListLabel}
        </Button>

        <Button
          variant="secondary"
          onClick={() => {
            const el = document.getElementById('sub-categories-section')
            if (el) {
              el.scrollIntoView({ behavior: 'smooth' })
            }
          }}
        >
          <FolderTree className="size-4" aria-hidden="true" />
          Edit Group
        </Button>

        <Button variant="secondary" onClick={() => navigate(categoryPath(scope, `rename/${id}`))}>
          <Pencil className="size-4" aria-hidden="true" />
          Edit Category
        </Button>

        <Button variant="secondary" onClick={() => setPauseModalOpen(true)}>
          <Pause className="size-4" aria-hidden="true" />
          Pause
        </Button>

        <Button
          className="border-0 bg-red-600 text-white hover:bg-red-700 active:bg-red-800"
          onClick={() => setDeleteModalOpen(true)}
        >
          <Trash2 className="size-4" aria-hidden="true" />
          Delete
        </Button>
      </div>

      <PauseCategoryModal
        open={pauseModalOpen}
        onClose={() => setPauseModalOpen(false)}
        reasonCategorySlug={MODERATION_CATEGORY_SLUGS.pauseCategory}
        submitLabel="Pause Category"
        onConfirm={() => {
          if (!id) return
          pauseMutation.mutate(id, {
            onSuccess: () => {
              toast.success('Category paused successfully')
              setPauseModalOpen(false)
              navigate(categoryPath(scope, 'paused'))
            },
            onError: (error) => {
              toast.error(getErrorMessage(error, 'Failed to pause category'))
            },
          })
        }}
      />

      <DeleteCategoryModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={() => {
          if (!id) return
          softDeleteMutation.mutate(id, {
            onSuccess: () => {
              toast.success('Category moved to deleted')
              setDeleteModalOpen(false)
              navigate(categoryPath(scope, 'deleted'))
            },
            onError: (error) => {
              toast.error(getErrorMessage(error, 'Failed to delete category'))
            },
          })
        }}
      />

      <EditCategoryGroupModal
        open={editGroupModalOpen}
        onClose={() => setEditGroupModalOpen(false)}
        category={category || null}
        isVenue={false}
      />
    </>
  )
}
