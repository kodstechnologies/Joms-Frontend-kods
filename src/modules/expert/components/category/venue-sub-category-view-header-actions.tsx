import { useState } from 'react'
import { Eye, Pause, Trash2, Pencil } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { Button } from '@/shared/components/ui/button'

import { DeleteCategoryModal } from './delete-category-modal'
import { PauseCategoryModal } from './pause-category-modal'
import {
  usePauseVenueSubCategory,
  useSoftDeleteVenueSubCategory,
  useVenueCategory,
} from '../../hooks/use-venue-category-management'
import { getErrorMessage } from '../../utils/category-mapper'
import { buildVenueManagementCategoryUrl } from '../../utils/venue-management-category-link'
import { MODERATION_CATEGORY_SLUGS } from '@/modules/settings/api/templates-api'

export const VenueSubCategoryViewHeaderActions = () => {
  const navigate = useNavigate()
  const { id: categoryId, subCategoryId } = useParams()
  const [pauseModalOpen, setPauseModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const pauseMutation = usePauseVenueSubCategory()
  const softDeleteMutation = useSoftDeleteVenueSubCategory()
  const { data: category } = useVenueCategory(categoryId)
  const subCategory = category?.subCategories?.find((item) => item.id === subCategoryId)

  return (
    <>
      <div className="flex flex-wrap items-center justify-end gap-3">
        <Button
          variant="secondary"
          onClick={() =>
            navigate(
              buildVenueManagementCategoryUrl({
                categoryId,
                categoryName: category?.name,
                subCategoryName: subCategory?.name,
              }),
            )
          }
        >
          <Eye className="size-4" aria-hidden="true" />
          View Venues
        </Button>

        <Button
          variant="secondary"
          onClick={() =>
            navigate(
              `/venues/categories/management/rename-subcategory/${categoryId}/${subCategoryId}`,
            )
          }
        >
          <Pencil className="size-4" />
          Edit Sub-Category
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
        title="Pause Sub-Category"
        heading="Are you sure you want  Pause this Sub-Category."
        submitLabel="Pause Sub-Category"
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
