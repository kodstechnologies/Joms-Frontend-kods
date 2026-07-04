import { useState } from 'react'
import { Eye, RotateCcw, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'

import type { VenueCategory } from './venue-category-table-columns'
import {
  useHardDeleteVenueCategory,
  useRevokeVenueCategory,
} from '../../hooks/use-venue-category-management'
import { getErrorMessage } from '../../utils/category-mapper'

interface Props {
  category: VenueCategory
}

const DeletedVenueCategoryActions = ({ category }: Props) => {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const revokeMutation = useRevokeVenueCategory()
  const hardDeleteMutation = useHardDeleteVenueCategory()

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
          navigate(`/venues/categories/management/view/${category.id}`)
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
          hardDeleteMutation.mutate(category.id, {
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

export default DeletedVenueCategoryActions
