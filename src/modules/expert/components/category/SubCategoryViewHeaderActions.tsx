import { useState } from 'react'
import { Eye, Pause, Trash2 } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { Button } from '@/shared/components/ui/button'

import { categoryViewTheme } from './category-view.theme'
import {
  categoryPath,
  useCategoryManagementScope,
} from './category-management-scope'
import { DeleteCategoryModal } from './delete-category-modal'
import { PauseCategoryModal } from './pause-category-modal'
import {
  usePauseServiceSubCategory,
  useSoftDeleteServiceSubCategory,
} from '../../hooks/use-category-management'
import { getErrorMessage } from '../../utils/category-mapper'

export const SubCategoryViewHeaderActions = () => {
  const navigate = useNavigate()
  const { id: categoryId, subCategoryId } = useParams()
  const scope = useCategoryManagementScope()
  const [pauseModalOpen, setPauseModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const pauseMutation = usePauseServiceSubCategory()
  const softDeleteMutation = useSoftDeleteServiceSubCategory()

  return (
    <>
      <div className="flex flex-wrap items-center justify-end gap-3">
        <Button
          variant="secondary"
          className={categoryViewTheme.outlineButtonClass}
          onClick={() => navigate(scope.relatedListPath)}
        >
          <Eye className="size-4" aria-hidden="true" />
          {scope.relatedListLabel}
        </Button>

        <Button
          variant="secondary"
          className={categoryViewTheme.outlineButtonClass}
          onClick={() => setPauseModalOpen(true)}
        >
          <Pause className="size-4" aria-hidden="true" />
          Pause
        </Button>

        <Button
          className={categoryViewTheme.deleteButtonClass}
          onClick={() => setDeleteModalOpen(true)}
        >
          <Trash2 className="size-4" aria-hidden="true" />
          Delete
        </Button>
      </div>

      <PauseCategoryModal
        open={pauseModalOpen}
        onClose={() => setPauseModalOpen(false)}
        onConfirm={() => {
          if (!categoryId || !subCategoryId) return
          pauseMutation.mutate(
            { categoryId, subCategoryId },
            {
              onSuccess: () => {
                toast.success('Sub-category paused successfully')
                setPauseModalOpen(false)
                navigate(categoryPath(scope, `view/${categoryId}`))
              },
              onError: (error) => {
                toast.error(getErrorMessage(error, 'Failed to pause sub-category'))
              },
            },
          )
        }}
      />

      <DeleteCategoryModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={() => {
          if (!categoryId || !subCategoryId) return
          softDeleteMutation.mutate(
            { categoryId, subCategoryId },
            {
              onSuccess: () => {
                toast.success('Sub-category deleted successfully')
                setDeleteModalOpen(false)
                navigate(categoryPath(scope, `view/${categoryId}`))
              },
              onError: (error) => {
                toast.error(getErrorMessage(error, 'Failed to delete sub-category'))
              },
            },
          )
        }}
      />
    </>
  )
}
