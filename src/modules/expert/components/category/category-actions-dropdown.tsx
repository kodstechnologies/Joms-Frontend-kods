import { useCallback, useState } from 'react'
import { Ban, Eye, FolderTree, Pencil, PlusSquare, X } from 'lucide-react'
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

import type { Category } from './category-table-columns'
import { CATEGORY_ACTION_ITEM_CLASS } from './category-list-shared'
import { categoryPath, useCategoryManagementScope } from './category-management-scope'
import { PauseCategoryModal } from './pause-category-modal'
import { EditCategoryGroupModal } from './edit-category-group-modal'
import {
  usePauseServiceCategory,
  useSoftDeleteServiceCategory,
} from '../../hooks/use-category-management'
import { getErrorMessage } from '../../utils/category-mapper'
import { SERVICE_CATEGORY_EXPORT_COLUMN_MAP } from '../../utils/table-export-column-maps'
import {
  DEFAULT_SERVICE_CATEGORY_MANAGEMENT_VISIBLE_COLUMN_IDS,
  SERVICE_CATEGORY_MANAGEMENT_TABLE_COLUMNS_CATALOG,
} from '../../config/service-category-management-table-columns.config'

interface Props {
  category: Category
}

export function CategoryActionsDropdown({ category }: Props) {
  const [open, setOpen] = useState(false)
  const [disableModalOpen, setDisableModalOpen] = useState(false)
  const [editGroupModalOpen, setEditGroupModalOpen] = useState(false)
  const navigate = useNavigate()
  const scope = useCategoryManagementScope()
  const pauseMutation = usePauseServiceCategory()
  const softDeleteMutation = useSoftDeleteServiceCategory()
  const { fileFormat } = useDefaultExportFormat()

  const handleExportData = useCallback(async () => {
    try {
      await exportMappedItemsToFile(
        SERVICE_CATEGORY_EXPORT_COLUMN_MAP,
        [category],
        fileFormat,
        `${scope.exportFilePrefix}_${category.categoryId || category.id}`,
        {
          columnIds: DEFAULT_SERVICE_CATEGORY_MANAGEMENT_VISIBLE_COLUMN_IDS,
          catalogOrder: SERVICE_CATEGORY_MANAGEMENT_TABLE_COLUMNS_CATALOG.map((c) => c.id),
        },
      )
      toast.success('Category exported')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to export category'))
    }
  }, [category, fileFormat, scope.exportFilePrefix])

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
            navigate(scope.relatedListPath)
            setOpen(false)
          }}
          icon={<Eye className="size-3.5 text-slate-700" aria-hidden="true" />}
        >
          {scope.relatedListLabel}
        </TableActionsItem>

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
            navigate(categoryPath(scope, `view/${category.id}`))
            setOpen(false)
          }}
          icon={<FolderTree className="size-3.5 text-slate-700" aria-hidden="true" />}
        >
          Edit Group
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

      <EditCategoryGroupModal
        open={editGroupModalOpen}
        onClose={() => setEditGroupModalOpen(false)}
        category={category}
        isVenue={false}
      />

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
