import { useState } from 'react'
import { Play, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'

import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'

import { CATEGORY_ACTION_ITEM_CLASS, CATEGORY_ACTION_MENU_CLASS } from './category-list-shared'
import type { Category } from './category-table-columns'
import {
  usePermanentDeleteServiceCategory,
  useResumeServiceCategory,
  useSoftDeleteServiceCategory,
} from '../../hooks/use-category-management'
import { getErrorMessage } from '../../utils/category-mapper'

interface Props {
  category: Category
}

const CategoryTableActions = ({ category }: Props) => {
  const [open, setOpen] = useState(false)
  const resumeMutation = useResumeServiceCategory()
  const softDeleteMutation = useSoftDeleteServiceCategory()
  const permanentDeleteMutation = usePermanentDeleteServiceCategory()

  return (
    <TableActionsDropdown
      label={`Open actions for ${category.name}`}
      isOpen={open}
      onOpenChange={setOpen}
      menuWidth={220}
      menuClassName={CATEGORY_ACTION_MENU_CLASS}
    >
      <TableActionsItem
        className={CATEGORY_ACTION_ITEM_CLASS}
        icon={<Play className="size-3.5 text-slate-700" aria-hidden="true" />}
        onClick={() => {
          resumeMutation.mutate(category.id, {
            onSuccess: () => {
              toast.success('Category resumed successfully')
              setOpen(false)
            },
            onError: (error) => {
              toast.error(getErrorMessage(error, 'Failed to resume category'))
            },
          })
        }}
      >
        Resume Category
      </TableActionsItem>

      <TableActionsItem
        className={CATEGORY_ACTION_ITEM_CLASS}
        icon={<X className="size-3.5 text-slate-700" aria-hidden="true" />}
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
      >
        Remove Category
      </TableActionsItem>

      <TableActionsItem
        className="text-red-500 hover:bg-red-50 hover:text-red-600"
        icon={<Trash2 className="size-3.5 text-red-500" aria-hidden="true" />}
        onClick={() => {
          permanentDeleteMutation.mutate(category.id, {
            onSuccess: () => {
              toast.success('Category permanently deleted')
              setOpen(false)
            },
            onError: (error) => {
              toast.error(getErrorMessage(error, 'Failed to delete category'))
            },
          })
        }}
      >
        <span className="text-red-500">Delete Category</span>
      </TableActionsItem>
    </TableActionsDropdown>
  )
}

export default CategoryTableActions
