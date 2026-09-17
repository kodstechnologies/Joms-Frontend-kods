import { useCallback, useMemo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Eye, RotateCcw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ExportDataIcon } from '@/shared/components/icons/action-button-icons'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/shared/lib/api-error'

import {
  DEFAULT_EXPERT_DELETED_VISIBLE_COLUMN_IDS,
  EXPERT_DELETED_MODULE_KEY,
} from '../../config/expert-management-table-columns.config'
import { useRestoreExpert } from '../../hooks/use-expert'
import { useExpertStatusList } from '../../hooks/use-expert-status-list'
import type { Expert } from '../../type/expert'
import {
  buildExpertDataColumnsById,
  pickPreferenceColumns,
} from '../../utils/expert-preference-columns'
import { createExpertSelectColumn } from './expert-list-columns'
import { ExpertListHeader } from './expert-list-shared'
import { DataTable } from '@/shared/components/table/data-table'
import { EXPERT_DELETED_SEARCH_COLUMNS } from '@/shared/components/table/search-configs'
import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'
import { exportMappedItemsToFile } from '@/shared/utils/export-filter-utils'
import { withServerSortMeta } from '@/shared/utils/table-sort'
import { EXPERT_COLUMN_SORT_FIELDS } from '@/shared/utils/table-sort-field-maps'
import { EXPERT_EXPORT_COLUMN_MAP } from '../../utils/table-export-column-maps'
import { useDefaultExportFormat } from '@/modules/settings/hooks/use-default-export-format'

export function ExpertDeletedExpertsPage() {
  const navigate = useNavigate()
  const restoreExpertMutation = useRestoreExpert()
  const catalogColumnIds = DEFAULT_EXPERT_DELETED_VISIBLE_COLUMN_IDS
  const { fileFormat } = useDefaultExportFormat()

  const list = useExpertStatusList({
    moduleKey: EXPERT_DELETED_MODULE_KEY,
    status: 'deactivated',
    defaultVisibleColumnIds: DEFAULT_EXPERT_DELETED_VISIBLE_COLUMN_IDS,
    catalogColumnIds,
    exportFileName: 'deleted_experts_export',
  })

  const handleExportExpertRow = useCallback(
    async (expert: Expert) => {
      try {
        await exportMappedItemsToFile(
          EXPERT_EXPORT_COLUMN_MAP,
          [expert],
          fileFormat,
          `deleted_expert_${expert.expertId || expert.id}`,
          {
            columnIds: list.visibleColumnIds,
            catalogOrder: DEFAULT_EXPERT_DELETED_VISIBLE_COLUMN_IDS,
          },
        )
        toast.success('Expert exported')
      } catch (error) {
        toast.error(getApiErrorMessage(error, 'Failed to export expert'))
      }
    },
    [fileFormat, list.visibleColumnIds],
  )

  const columns = useMemo<ColumnDef<Expert>[]>(() => {
    const dataColumnsById = buildExpertDataColumnsById()

    return withServerSortMeta(
      [
        createExpertSelectColumn({
          allVisibleSelected: list.selection.allVisibleSelected,
          someVisibleSelected: list.selection.someVisibleSelected,
          selectedExpertIds: list.selection.selectedExpertIds,
          toggleVisible: list.selection.toggleVisible,
          toggleOne: list.selection.toggleOne,
        }),
        ...pickPreferenceColumns(
          dataColumnsById,
          list.visibleColumnIds,
          DEFAULT_EXPERT_DELETED_VISIBLE_COLUMN_IDS,
        ),
        {
          id: 'actions',
          header: 'Actions',
          meta: {
            headerClassName: 'pr-5 text-right',
            cellClassName: 'relative pr-5 text-right',
          },
          cell: ({ row }) => {
            const expert = row.original
            const isOpen = list.activeDropdownId === expert.expertId

            return (
              <TableActionsDropdown
                label={`Open actions for ${expert.name}`}
                isOpen={isOpen}
                onOpenChange={(open) => list.setActiveDropdownId(open ? expert.expertId : null)}
                menuWidth={192}
              >
                <TableActionsItem
                  icon={<Eye className="size-3.5" aria-hidden="true" />}
                  onClick={() => {
                    list.setActiveDropdownId(null)
                    navigate(`/experts/management/profile/${expert.id}`)
                  }}
                >
                  View Expert
                </TableActionsItem>
                <TableActionsItem
                  icon={<RotateCcw className="size-3.5" aria-hidden="true" />}
                  onClick={() => {
                    list.setActiveDropdownId(null)
                    restoreExpertMutation.mutate(expert.id, {
                      onSuccess: () => toast.success('Expert account restored successfully'),
                      onError: (error: unknown) => {
                        const err = error as { response?: { data?: { message?: string } } }
                        toast.error(
                          getApiErrorMessage(err, 'Failed to restore expert. Please try again.'),
                        )
                      },
                    })
                  }}
                >
                  Retrieve Account
                </TableActionsItem>
                <TableActionsItem
                  icon={<ExportDataIcon className="size-3.5" />}
                  onClick={() => {
                    list.setActiveDropdownId(null)
                    void handleExportExpertRow(expert)
                  }}
                >
                  Export Data
                </TableActionsItem>
              </TableActionsDropdown>
            )
          },
        },
      ],
      EXPERT_COLUMN_SORT_FIELDS,
    )
  }, [handleExportExpertRow, list, navigate, restoreExpertMutation])

  return (
    <div className="flex flex-col gap-5 md:gap-6">
      <ExpertListHeader
        title="Deleted Experts"
        breadcrumbItems={[
          { label: 'Expert Management', to: '/experts/management' },
          { label: 'Deleted Experts', isActive: true },
        ]}
        metricsPath="/metrics/expert-deleted?returnTo=/experts/deleted"
      />

      <DataTable
        columns={columns}
        data={list.experts}
        getRowId={(expert) => expert.expertId}
        isLoading={list.isLoading}
        searchValue={list.enhancedSearch.globalSearch}
        onSearchChange={list.enhancedSearch.setGlobalSearch}
        searchableColumns={EXPERT_DELETED_SEARCH_COLUMNS}
        columnSearches={list.enhancedSearch.columnSearches}
        onColumnSearchChange={list.enhancedSearch.setColumnSearch}
        onColumnSearchRemove={list.enhancedSearch.removeColumnSearch}
        onClearAllSearches={list.enhancedSearch.clearAll}
        searchPlaceholder="Search by name or ID"
        onAdvancedFilter={list.onAdvancedFilter}
        onExport={list.onExport}
        {...list.serverSort.dataTableSortProps}
        pagination={{
          page: list.currentPage,
          pageSize: list.meta?.pagination.limit || 10,
          totalItems: list.meta?.pagination.total || 0,
          totalPages: list.meta?.pagination.pages || 1,
          onPageChange: list.setCurrentPage,
        }}
        resourceLabel="users"
        emptyMessage="No deleted experts found."
      />
      {list.exportFilterModals}
    </div>
  )
}
