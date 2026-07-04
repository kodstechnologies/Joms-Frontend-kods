import { useState } from 'react'
import { Eye, RotateCcw, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'

import {
  categoryPath,
  useCategoryManagementScope,
} from './category-management-scope'
import type { Category } from './category-table-columns'
import {
  usePermanentDeleteServiceCategory,
  useRevokeServiceCategory,
} from '../../hooks/use-category-management'
import { getErrorMessage } from '../../utils/category-mapper'

interface Props {
  category: Category
}

const DeletedCategoryActions = ({ category }: Props) => {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const scope = useCategoryManagementScope()
  const revokeMutation = useRevokeServiceCategory()
  const permanentDeleteMutation = usePermanentDeleteServiceCategory()

  return (
    <TableActionsDropdown
      label="Category Actions"
      isOpen={open}
      onOpenChange={setOpen}
      tone="light"
      menuWidth={210}
    >
      <TableActionsItem
        tone="light"
        icon={<Eye className="size-4 text-slate-700" />}
        onClick={() => {
          navigate(categoryPath(scope, `view/${category.id}`))
          setOpen(false)
        }}
      >
        View Category
      </TableActionsItem>

      <TableActionsItem
        tone="light"
        icon={<RotateCcw className="size-4 text-slate-700" />}
        onClick={() => {
          revokeMutation.mutate(category.id, {
            onSuccess: () => {
              toast.success('Category restored successfully')
              setOpen(false)
            },
            onError: (error) => {
              toast.error(getErrorMessage(error, 'Failed to restore category'))
            },
          })
        }}
      >
        Revoke Category
      </TableActionsItem>

      <TableActionsItem
        tone="light"
        icon={<Trash2 className="size-4 text-red-500" />}
        className="text-red-500 hover:bg-red-50 hover:text-red-600"
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

export default DeletedCategoryActions
