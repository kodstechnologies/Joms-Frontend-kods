import { useState } from 'react'
import { Eye, Pencil, Pause, Plus, Trash2 } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { Button } from '@/shared/components/ui/button'

import { DeleteCategoryModal } from './delete-category-modal'
import { PauseCategoryModal } from './pause-category-modal'
import {
  usePauseVenueCategory,
  useSoftDeleteVenueCategory,
} from '../../hooks/use-venue-category-management'
import { getErrorMessage } from '../../utils/category-mapper'

export const VenueCategoryViewHeaderActions = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [pauseModalOpen, setPauseModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const pauseMutation = usePauseVenueCategory()
  const softDeleteMutation = useSoftDeleteVenueCategory()

  return (
    <>
      <div className="flex flex-wrap items-center justify-end gap-3">
        <Button
          className="h-10 bg-[#FBC078] px-5 text-black hover:bg-[#eeb46a]"
          onClick={() =>
            navigate(`/venues/categories/management/create-subcategory/${id}`)
          }
        >
          <Plus className="mr-2 size-4" aria-hidden="true" />
          Add Sub-Category
        </Button>

        <Button variant="secondary" onClick={() => navigate('/venues/management')}>
          <Eye className="size-4" aria-hidden="true" />
          View Venues
        </Button>

        <Button
          variant="secondary"
          onClick={() => navigate(`/venues/categories/management/rename/${id}`)}
        >
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
        onConfirm={() => {
          if (!id) return
          pauseMutation.mutate(id, {
            onSuccess: () => {
              toast.success('Category paused successfully')
              setPauseModalOpen(false)
              navigate('/venues/categories/management/paused')
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
              navigate('/venues/categories/management/deleted')
            },
            onError: (error) => {
              toast.error(getErrorMessage(error, 'Failed to delete category'))
            },
          })
        }}
      />
    </>
  )
}
