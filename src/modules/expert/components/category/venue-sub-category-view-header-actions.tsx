import { useState } from 'react'
import { Eye, Pause, Trash2 } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { Button } from '@/shared/components/ui/button'

import { categoryViewTheme } from './category-view.theme'
import { DeleteCategoryModal } from './delete-category-modal'
import { PauseCategoryModal } from './pause-category-modal'
import {
  usePauseVenueSubCategory,
  useSoftDeleteVenueSubCategory,
} from '../../hooks/use-venue-category-management'
import { getErrorMessage } from '../../utils/category-mapper'

export const VenueSubCategoryViewHeaderActions = () => {
  const navigate = useNavigate()
  const { id: categoryId, subCategoryId } = useParams()
  const [pauseModalOpen, setPauseModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const pauseMutation = usePauseVenueSubCategory()
  const softDeleteMutation = useSoftDeleteVenueSubCategory()

  return (
    <>
      <div className="flex flex-wrap items-center justify-end gap-3">
        <Button
          variant="secondary"
          className={categoryViewTheme.outlineButtonClass}
          onClick={() => navigate('/venues/management')}
        >
          <Eye className="size-4" aria-hidden="true" />
          View Venues
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
                navigate(`/venues/categories/management/view/${categoryId}`)
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
                navigate(`/venues/categories/management/view/${categoryId}`)
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
