import { useState } from 'react'
import { Eye, Play, Trash2, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'

import type { VenueCategory } from './venue-category-table-columns'
import {
  useHardDeleteVenueCategory,
  useResumeVenueCategory,
  useSoftDeleteVenueCategory,
} from '../../hooks/use-venue-category-management'
import { getErrorMessage } from '../../utils/category-mapper'

interface Props {
  category: VenueCategory
}

const VenueCategoryTableActions = ({ category }: Props) => {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const resumeMutation = useResumeVenueCategory()
  const softDeleteMutation = useSoftDeleteVenueCategory()
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
        icon={<Play className="size-4 text-slate-700" />}
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
        tone="light"
        icon={<X className="size-4 text-slate-700" />}
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

export default VenueCategoryTableActions
