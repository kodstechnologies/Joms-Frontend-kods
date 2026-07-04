import { useState } from 'react'
import { Pencil, Pause, PlusSquare, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'

import type { VenueCategory } from './venue-category-table-columns'
import {
  usePauseVenueCategory,
  useSoftDeleteVenueCategory,
} from '../../hooks/use-venue-category-management'
import { getErrorMessage } from '../../utils/category-mapper'

interface Props {
  category: VenueCategory
}

export function VenueCategoryActionsDropdown({ category }: Props) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const pauseMutation = usePauseVenueCategory()
  const softDeleteMutation = useSoftDeleteVenueCategory()

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
        onClick={() => {
          navigate(`/venues/categories/management/create-subcategory/${category.id}`)
          setOpen(false)
        }}
        icon={<PlusSquare className="size-4 text-slate-700" />}
      >
        Add Sub Category
      </TableActionsItem>

      <TableActionsItem
        tone="light"
        onClick={() => {
          navigate(`/venues/categories/management/rename/${category.id}`)
          setOpen(false)
        }}
        icon={<Pencil className="size-4 text-slate-700" />}
      >
        Rename Category
      </TableActionsItem>

      <TableActionsItem
        tone="light"
        onClick={() => {
          pauseMutation.mutate(category.id, {
            onSuccess: () => {
              toast.success('Category paused successfully')
              setOpen(false)
            },
            onError: (error) => {
              toast.error(getErrorMessage(error, 'Failed to pause category'))
            },
          })
        }}
        icon={<Pause className="size-4 text-slate-700" />}
      >
        Pause Category
      </TableActionsItem>

      <TableActionsItem
        tone="light"
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
        icon={<X className="size-4 text-red-500" />}
        className="text-red-500 hover:bg-red-50 hover:text-red-600"
      >
        <span className="text-red-500">Remove Category</span>
      </TableActionsItem>
    </TableActionsDropdown>
  )
}
