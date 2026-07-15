import { useState } from 'react'
import { Eye, Pause, Trash2 } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'

import { categoryPath, useCategoryManagementScope } from './category-management-scope'
import {
  usePauseServiceSubCategory,
  useSoftDeleteServiceSubCategory,
} from '../../hooks/use-category-management'
import { getErrorMessage } from '../../utils/category-mapper'

interface Props {
  id: string
}

const CategoryViewSubCategoryActions = ({ id: subCategoryId }: Props) => {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { id: categoryId } = useParams()
  const scope = useCategoryManagementScope()
  const pauseMutation = usePauseServiceSubCategory()
  const softDeleteMutation = useSoftDeleteServiceSubCategory()

  return (
    <TableActionsDropdown
      label="Sub Category Actions"
      isOpen={open}
      onOpenChange={setOpen}
      tone="light"
      menuWidth={200}
    >
      <TableActionsItem
        tone="light"
        icon={<Eye className="size-4 text-slate-700" />}
        onClick={() => {
          navigate(categoryPath(scope, `${categoryId}/subcategory/${subCategoryId}`))
          setOpen(false)
        }}
      >
        View Details
      </TableActionsItem>

      <TableActionsItem
        tone="light"
        icon={<Pause className="size-4 text-slate-700" />}
        onClick={() => {
          if (!categoryId) return
          pauseMutation.mutate(
            { categoryId, subCategoryId },
            {
              onSuccess: () => {
                toast.success('Sub-category paused successfully')
                setOpen(false)
              },
              onError: (error) => {
                toast.error(getErrorMessage(error, 'Failed to pause sub-category'))
              },
            },
          )
        }}
      >
        Pause sub-category
      </TableActionsItem>

      <TableActionsItem
        tone="light"
        icon={<Trash2 className="size-4 text-red-500" />}
        className="text-red-500 hover:bg-red-50 hover:text-red-600"
        onClick={() => {
          if (!categoryId) return
          softDeleteMutation.mutate(
            { categoryId, subCategoryId },
            {
              onSuccess: () => {
                toast.success('Sub-category deleted successfully')
                setOpen(false)
              },
              onError: (error) => {
                toast.error(getErrorMessage(error, 'Failed to delete sub-category'))
              },
            },
          )
        }}
      >
        <span className="text-red-500">Delete</span>
      </TableActionsItem>
    </TableActionsDropdown>
  )
}

export default CategoryViewSubCategoryActions
