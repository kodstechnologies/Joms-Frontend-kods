import { useCallback, useState } from 'react'
import { Ban, Pencil, PlusSquare, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { ExportDataIcon } from '@/shared/components/icons/action-button-icons'
import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'
import { MODERATION_CATEGORY_SLUGS } from '@/modules/settings/api/templates-api'
import { useDefaultExportFormat } from '@/modules/settings/hooks/use-default-export-format'
import { exportMappedItemsToFile } from '@/shared/utils/export-filter-utils'
import { getApiErrorMessage } from '@/shared/lib/api-error'

import type { VenueCategory } from './venue-category-table-columns'
import { CATEGORY_ACTION_ITEM_CLASS } from './category-list-shared'
import { PauseCategoryModal } from './pause-category-modal'
import {
  usePauseVenueCategory,
  useSoftDeleteVenueCategory,
} from '../../hooks/use-venue-category-management'
import { getErrorMessage } from '../../utils/category-mapper'
import { VENUE_CATEGORY_EXPORT_COLUMN_MAP } from '../../utils/table-export-column-maps'
import {
  DEFAULT_VENUE_CATEGORY_MANAGEMENT_VISIBLE_COLUMN_IDS,
  VENUE_CATEGORY_MANAGEMENT_TABLE_COLUMNS_CATALOG,
} from '../../config/venue-category-management-table-columns.config'

interface Props {
  category: VenueCategory
}

export function VenueCategoryActionsDropdown({ category }: Props) {
  const [open, setOpen] = useState(false)
  const [disableModalOpen, setDisableModalOpen] = useState(false)
  const navigate = useNavigate()
  const pauseMutation = usePauseVenueCategory()
  const softDeleteMutation = useSoftDeleteVenueCategory()
  const { fileFormat } = useDefaultExportFormat()

  const handleExportData = useCallback(async () => {
    try {
      await exportMappedItemsToFile(
        VENUE_CATEGORY_EXPORT_COLUMN_MAP,
        [category],
        fileFormat,
        `venue_category_${category.categoryId || category.id}`,
        {
          columnIds: DEFAULT_VENUE_CATEGORY_MANAGEMENT_VISIBLE_COLUMN_IDS,
          catalogOrder: VENUE_CATEGORY_MANAGEMENT_TABLE_COLUMNS_CATALOG.map((c) => c.id),
        },
      )
      toast.success('Category exported')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to export category'))
    }
  }, [category, fileFormat])

  return (
    <>
      <TableActionsDropdown
        label={`Open actions for ${category.name}`}
        isOpen={open}
        onOpenChange={setOpen}
        menuWidth={220}
        maxVisibleItems={8}
      >
        <TableActionsItem
          className={CATEGORY_ACTION_ITEM_CLASS}
          onClick={() => {
            navigate(`/venues/categories/management/create-subcategory/${category.id}`)
            setOpen(false)
          }}
          icon={<PlusSquare className="size-3.5 text-slate-700" aria-hidden="true" />}
        >
          Add Sub Category
        </TableActionsItem>

        <TableActionsItem
          className={CATEGORY_ACTION_ITEM_CLASS}
          onClick={() => {
            navigate(`/venues/categories/management/rename/${category.id}`)
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
            setDisableModalOpen(true)
          }}
          icon={<Ban className="size-3.5 text-slate-700" aria-hidden="true" />}
        >
          Disable
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

        <TableActionsItem
          className={CATEGORY_ACTION_ITEM_CLASS}
          onClick={() => {
            setOpen(false)
            void handleExportData()
          }}
          icon={<ExportDataIcon className="size-3.5" />}
        >
          Export Data
        </TableActionsItem>
      </TableActionsDropdown>

      <PauseCategoryModal
        open={disableModalOpen}
        onClose={() => setDisableModalOpen(false)}
        reasonCategorySlug={MODERATION_CATEGORY_SLUGS.pauseCategory}
        title="Disable Category"
        description="Disabling this category will temporarily stop all new requests."
        submitLabel="Disable"
        isSubmitting={pauseMutation.isPending}
        onConfirm={() => {
          pauseMutation.mutate(category.id, {
            onSuccess: () => {
              toast.success('Category disabled successfully')
              setDisableModalOpen(false)
            },
            onError: (error) => {
              toast.error(getErrorMessage(error, 'Failed to disable category'))
            },
          })
        }}
      />
    </>
  )
}
