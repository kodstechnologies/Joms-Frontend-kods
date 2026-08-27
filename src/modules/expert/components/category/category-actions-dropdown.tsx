import { useState } from 'react'
import { Pencil, Pause, PlusSquare, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'
import { MODERATION_CATEGORY_SLUGS } from '@/modules/settings/api/templates-api'

import type { Category } from './category-table-columns'
import { CATEGORY_ACTION_ITEM_CLASS } from './category-list-shared'
import { categoryPath, useCategoryManagementScope } from './category-management-scope'
import { PauseCategoryModal } from './pause-category-modal'
import {
  usePauseServiceCategory,
  useSoftDeleteServiceCategory,
} from '../../hooks/use-category-management'
import { getErrorMessage } from '../../utils/category-mapper'

interface Props {
  category: Category
}

export function CategoryActionsDropdown({ category }: Props) {
  const [open, setOpen] = useState(false)
  const [pauseModalOpen, setPauseModalOpen] = useState(false)
  const navigate = useNavigate()
  const scope = useCategoryManagementScope()
  const pauseMutation = usePauseServiceCategory()
  const softDeleteMutation = useSoftDeleteServiceCategory()

  return (
    <>
      <TableActionsDropdown
        label={`Open actions for ${category.name}`}
        isOpen={open}
        onOpenChange={setOpen}
        menuWidth={220}
      >
        <TableActionsItem
          className={CATEGORY_ACTION_ITEM_CLASS}
          onClick={() => {
            navigate(categoryPath(scope, `create-subcategory/${category.id}`))
            setOpen(false)
          }}
          icon={<PlusSquare className="size-3.5 text-slate-700" aria-hidden="true" />}
        >
          Add Sub Category
        </TableActionsItem>

        <TableActionsItem
          className={CATEGORY_ACTION_ITEM_CLASS}
          onClick={() => {
            navigate(categoryPath(scope, `rename/${category.id}`))
            setOpen(false)
          }}
          icon={<Pencil className="size-3.5 text-slate-700" aria-hidden="true" />}
        >
          Rename Category
        </TableActionsItem>

        <TableActionsItem
          className={CATEGORY_ACTION_ITEM_CLASS}
          onClick={() => {
            setOpen(false)
            setPauseModalOpen(true)
          }}
          icon={<Pause className="size-3.5 text-slate-700" aria-hidden="true" />}
        >
          Pause Category
        </TableActionsItem>

        <TableActionsItem
          className="text-red-500 hover:bg-red-50 hover:text-red-600"
          onClick={() => {
            softDeleteMutation.mutate(category.id, {
              onSuccess: () => {
                toast.success('Category moved to deleted')
                setOpen(false)
              },
              onError: (error) => {
                toast.error(getErrorMessage(error, 'Failed to remove category'))
              },
            })
          }}
          icon={<X className="size-3.5 text-red-500" aria-hidden="true" />}
        >
          <span className="text-red-500">Remove Category</span>
        </TableActionsItem>
      </TableActionsDropdown>

      <PauseCategoryModal
        open={pauseModalOpen}
        onClose={() => setPauseModalOpen(false)}
        reasonCategorySlug={MODERATION_CATEGORY_SLUGS.pauseCategory}
        submitLabel="Pause Category"
        isSubmitting={pauseMutation.isPending}
        onConfirm={() => {
          pauseMutation.mutate(category.id, {
            onSuccess: () => {
              toast.success('Category paused successfully')
              setPauseModalOpen(false)
            },
            onError: (error) => {
              toast.error(getErrorMessage(error, 'Failed to pause category'))
            },
          })
        }}
      />
    </>
  )
}
