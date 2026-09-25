import { useCallback, useMemo, useState } from 'react'
import { AlertTriangle, Ban, Eye, FolderTree, Layers, Pencil, PlusSquare, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { ExportDataIcon } from '@/shared/components/icons/action-button-icons'
import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'
import {
  DecisionActionModal,
  type DecisionActionModalOption,
} from '@/shared/components/modal/decision-action-modal'
import { MODERATION_CATEGORY_SLUGS } from '@/modules/settings/api/templates-api'
import { useDefaultExportFormat } from '@/modules/settings/hooks/use-default-export-format'
import { useEscalationAssignees } from '@/modules/my-tasks/hooks/use-admin-escalation'
import { escalateCategoryApplication } from '@/modules/my-tasks/api/escalation-api'
import { exportMappedItemsToFile } from '@/shared/utils/export-filter-utils'
import { getApiErrorMessage } from '@/shared/lib/api-error'

import type { VenueCategory } from './venue-category-table-columns'
import { CATEGORY_ACTION_ITEM_CLASS } from './category-list-shared'
import { PauseCategoryModal } from './pause-category-modal'
import { EditCategoryGroupModal } from './edit-category-group-modal'
import {
  usePauseVenueCategory,
  useSoftDeleteVenueCategory,
} from '../../hooks/use-venue-category-management'
import { getErrorMessage } from '../../utils/category-mapper'
import { VENUE_CATEGORY_EXPORT_COLUMN_MAP } from '../../utils/table-export-column-maps'
import { buildVenueManagementCategoryUrl } from '../../utils/venue-management-category-link'
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
  const [editGroupModalOpen, setEditGroupModalOpen] = useState(false)
  const [escalateOpen, setEscalateOpen] = useState(false)
  const [escalateAdminNotes, setEscalateAdminNotes] = useState('')
  const [selectedEscalationOption, setSelectedEscalationOption] = useState('')
  const [isEscalating, setIsEscalating] = useState(false)
  const navigate = useNavigate()
  const pauseMutation = usePauseVenueCategory()
  const softDeleteMutation = useSoftDeleteVenueCategory()
  const { fileFormat } = useDefaultExportFormat()

  const { data: assigneesData } = useEscalationAssignees('venues.*')
  const escalationOptions = useMemo<DecisionActionModalOption[]>(
    () =>
      (assigneesData?.data ?? []).map((assignee) => ({
        label: assignee.fullname,
        value: assignee.id,
      })),
    [assigneesData?.data],
  )

  const detailsUrl = `/venues/categories/management/view/${category.id}`

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

  const closeEscalateModal = useCallback(() => {
    setEscalateOpen(false)
    setEscalateAdminNotes('')
    setSelectedEscalationOption('')
  }, [])

  const handleEscalateSubmit = useCallback(async () => {
    const categoryId = String(category.id || '').trim()
    if (!categoryId) {
      toast.error('Category ID is missing.')
      return
    }
    if (!selectedEscalationOption) {
      toast.error('Please select a sub-admin to assign.')
      return
    }
    if (!escalateAdminNotes.trim()) {
      toast.error('Admin notes are required.')
      return
    }

    const selectedAssignee = (assigneesData?.data ?? []).find(
      (item) => item.id === selectedEscalationOption,
    )

    setIsEscalating(true)
    try {
      await escalateCategoryApplication(categoryId, {
        assigneeSubAdminId: selectedEscalationOption,
        assigneeName: selectedAssignee?.fullname || '',
        adminNote: escalateAdminNotes.trim(),
        entityTitle: `${category.name || categoryId} — Venue Category`,
        applicationUrl: detailsUrl,
        escalationTarget: 'application',
        metadata: {
          source: 'venue_category_management',
          categoryType: 'venue',
          categoryId: category.categoryId || categoryId,
        },
      })
      toast.success('Escalated — assigned admin will see this in My Tasks')
      closeEscalateModal()
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to escalate category.'))
    } finally {
      setIsEscalating(false)
    }
  }, [
    assigneesData?.data,
    category.categoryId,
    category.id,
    category.name,
    closeEscalateModal,
    detailsUrl,
    escalateAdminNotes,
    selectedEscalationOption,
  ])

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
            navigate(
              buildVenueManagementCategoryUrl({
                categoryId: category.id,
                categoryName: category.name,
              }),
            )
            setOpen(false)
          }}
          icon={<Eye className="size-3.5 text-slate-700" aria-hidden="true" />}
        >
          View Venues
        </TableActionsItem>

        <TableActionsItem
          className={CATEGORY_ACTION_ITEM_CLASS}
          onClick={() => {
            navigate(
              buildVenueManagementCategoryUrl({
                categoryId: category.id,
                categoryName: category.name,
                view: 'spaces',
              }),
            )
            setOpen(false)
          }}
          icon={<Layers className="size-3.5 text-slate-700" aria-hidden="true" />}
        >
          View Spaces
        </TableActionsItem>

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
            navigate(detailsUrl)
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

        <TableActionsItem
          className={CATEGORY_ACTION_ITEM_CLASS}
          onClick={() => {
            setOpen(false)
            setEscalateOpen(true)
          }}
          icon={<AlertTriangle className="size-3.5 text-slate-700" aria-hidden="true" />}
        >
          Escalate
        </TableActionsItem>
      </TableActionsDropdown>

      <EditCategoryGroupModal
        open={editGroupModalOpen}
        onClose={() => setEditGroupModalOpen(false)}
        category={category}
        isVenue={true}
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

      <DecisionActionModal
        open={escalateOpen}
        variant="escalate"
        title="Escalate"
        description="Are you sure you want to escalate this category? It will be reviewed by the selected sub-admin."
        submitLabel="Escalate"
        escalationOptions={escalationOptions}
        selectedEscalationOption={selectedEscalationOption}
        onEscalationOptionChange={setSelectedEscalationOption}
        adminNotes={escalateAdminNotes}
        onAdminNotesChange={setEscalateAdminNotes}
        onClose={closeEscalateModal}
        onSubmit={() => {
          void handleEscalateSubmit()
        }}
        isSubmitting={isEscalating}
      />
    </>
  )
}
