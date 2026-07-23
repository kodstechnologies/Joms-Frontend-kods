import { useState } from 'react'
import { RotateCcw, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'

import { CATEGORY_ACTION_ITEM_CLASS } from './category-list-shared'
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
  const revokeMutation = useRevokeVenueCategory()
  const hardDeleteMutation = useHardDeleteVenueCategory()

  return (
    <TableActionsDropdown
      label={`Open actions for ${category.name}`}
      isOpen={open}
      onOpenChange={setOpen}
      menuWidth={220}
    >
      <TableActionsItem
        className={CATEGORY_ACTION_ITEM_CLASS}
        icon={<RotateCcw className="size-3.5 text-slate-700" aria-hidden="true" />}
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
        className="text-red-500 hover:bg-red-50 hover:text-red-600"
        icon={<Trash2 className="size-3.5 text-red-500" aria-hidden="true" />}
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
