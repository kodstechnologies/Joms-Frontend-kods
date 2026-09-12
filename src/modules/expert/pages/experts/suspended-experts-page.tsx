import { useCallback, useMemo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Eye, PlayCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import {
  DEFAULT_EXPERT_SUSPENDED_VISIBLE_COLUMN_IDS,
  EXPERT_SUSPENDED_MODULE_KEY,
  EXPERT_SUSPENDED_TABLE_COLUMNS_CATALOG,
} from '../../config/expert-management-table-columns.config'
import { useActivateExpert } from '../../hooks/use-expert'
import { useExpertStatusList } from '../../hooks/use-expert-status-list'
import type { Expert } from '../../type/expert'
import {
  buildExpertDataColumnsById,
  pickPreferenceColumns,
} from '../../utils/expert-preference-columns'
import { createExpertSelectColumn } from './expert-list-columns'
import { ExpertListHeader } from './expert-list-shared'
import { DataTable } from '@/shared/components/table/data-table'
import { EXPERT_SUSPENDED_SEARCH_COLUMNS } from '@/shared/components/table/search-configs'
import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'
import { withServerSortMeta } from '@/shared/utils/table-sort'
import { EXPERT_COLUMN_SORT_FIELDS } from '@/shared/utils/table-sort-field-maps'

export function ExpertSuspendedExpertsPage() {
  const navigate = useNavigate()
  const activateExpertMutation = useActivateExpert()
  const catalogColumnIds = useMemo(
    () => EXPERT_SUSPENDED_TABLE_COLUMNS_CATALOG.map((column) => column.id),
    [],
  )

  const list = useExpertStatusList({
    moduleKey: EXPERT_SUSPENDED_MODULE_KEY,
    status: 'suspended',
    defaultVisibleColumnIds: DEFAULT_EXPERT_SUSPENDED_VISIBLE_COLUMN_IDS,
    catalogColumnIds,
    exportFileName: 'suspended_experts_export',
    filterExperts: (experts) => experts.filter((expert) => expert.status === 'suspended'),
  })

  const handleActivate = useCallback(
    (expert: Expert) => {
      activateExpertMutation.mutate(expert.id, {
        onSuccess: () => toast.success('Expert activated successfully'),
        onError: (error: unknown) => {
          const err = error as { response?: { data?: { message?: string } } }
          toast.error(
            err?.response?.data?.message || 'Failed to activate expert. Please try again.',
          )
        },
      })
    },
    [activateExpertMutation],
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
          DEFAULT_EXPERT_SUSPENDED_VISIBLE_COLUMN_IDS,
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
                  icon={<PlayCircle className="size-3.5" aria-hidden="true" />}
                  onClick={() => {
                    list.setActiveDropdownId(null)
                    handleActivate(expert)
                  }}
                >
                  Activate Expert
                </TableActionsItem>
              </TableActionsDropdown>
            )
          },
        },
      ],
      EXPERT_COLUMN_SORT_FIELDS,
    )
  }, [handleActivate, list, navigate])

  return (
    <div className="flex flex-col gap-5 md:gap-6">
      <ExpertListHeader
        title="Suspended Experts"
        breadcrumbItems={[
          { label: 'Expert Management', to: '/experts/management' },
          { label: 'Suspended Experts', isActive: true },
        ]}
        metricsPath="/metrics/expert-suspended?returnTo=/experts/suspended"
      />

      <DataTable
        columns={columns}
        data={list.experts}
        getRowId={(expert) => expert.expertId}
        isLoading={list.isLoading}
        searchValue={list.enhancedSearch.globalSearch}
        onSearchChange={list.enhancedSearch.setGlobalSearch}
        searchableColumns={EXPERT_SUSPENDED_SEARCH_COLUMNS}
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
        emptyMessage="No suspended experts found."
      />
      {list.exportFilterModals}
    </div>
  )
}
