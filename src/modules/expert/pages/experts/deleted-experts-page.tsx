import { useCallback, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Eye, RotateCcw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ExportDataIcon } from '@/shared/components/icons/action-button-icons'
import { toast } from 'sonner'
import type { FilterValues } from '@/shared/types/data-filter'
import { useModuleExportFilters } from '@/shared/components/advanced-filter/use-module-export-filters'
import { EXPERT_EXPORT_COLUMN_MAP } from '../../utils/table-export-column-maps'
import {
  buildExpertListQueryParams,
  createFilteredExportHandler,
  exportMappedItemsToFile,
} from '@/shared/utils/export-filter-utils'
import { fetchExperts } from '../../api/expert-api'
import {
  DEFAULT_EXPERT_DELETED_VISIBLE_COLUMN_IDS,
  EXPERT_DELETED_MODULE_KEY,
} from '../../config/expert-management-table-columns.config'
import { useExperts, useRestoreExpert } from '../../hooks/use-expert'
import { useTableColumnPreferences } from '../../hooks/use-ui-preferences'
import type { Expert } from '../../type/expert'
import {
  buildExpertDataColumnsById,
  pickPreferenceColumns,
} from '../../utils/expert-preference-columns'
import { createExpertSelectColumn } from './expert-list-columns'
import { ExpertListHeader } from './expert-list-shared'
import { useExpertListSelection } from './use-expert-list-selection'
import { DataTable } from '@/shared/components/table/data-table'
import { useServerTableSort } from '@/shared/hooks/use-server-table-sort'
import { useEnhancedSearch } from '@/shared/hooks/use-enhanced-search'
import { withServerSortMeta } from '@/shared/utils/table-sort'
import { EXPERT_COLUMN_SORT_FIELDS } from '@/shared/utils/table-sort-field-maps'
import { EXPERT_DELETED_SEARCH_COLUMNS } from '@/shared/components/table/search-configs'
import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'

const fetchDeletedExpertsForExport = async (params: Record<string, unknown>) => {
  const response = await fetchExperts({ ...params, status: 'deactivated' })
  return {
    data: response.data || [],
    meta: response.meta,
  }
}

export function ExpertDeletedExpertsPage() {
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState(1)
  const serverSort = useServerTableSort({
    sortFieldMap: EXPERT_COLUMN_SORT_FIELDS,
    onPageReset: () => setCurrentPage(1),
  })
  const enhancedSearch = useEnhancedSearch({ onSearchChange: () => setCurrentPage(1) })
  const [appliedFilters, setAppliedFilters] = useState<FilterValues>({})
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null)

  const expertQueryParams = useMemo(
    () =>
      buildExpertListQueryParams(appliedFilters, {
        page: currentPage,
        limit: 10,
        ...serverSort.sortParams,
        ...enhancedSearch.buildSearchParams(),
        status: 'deactivated',
      }),
    [appliedFilters, currentPage, enhancedSearch, serverSort.sortParams],
  )

  const { data, isLoading } = useExperts(expertQueryParams)
  const restoreExpertMutation = useRestoreExpert()

  const experts = useMemo(() => data?.data || [], [data?.data])
  const meta = data?.meta
  const selection = useExpertListSelection(experts)

  const handleApplyFilters = useCallback((values: FilterValues) => {
    setAppliedFilters(values)
    setCurrentPage(1)
  }, [])

  const tableColumnPreferencesQuery = useTableColumnPreferences(EXPERT_DELETED_MODULE_KEY)

  const handleExportExpertRow = useCallback(
    async (expert: Expert) => {
      const visibleIds = tableColumnPreferencesQuery.data?.visibleColumnIds?.length
        ? tableColumnPreferencesQuery.data.visibleColumnIds
        : DEFAULT_EXPERT_DELETED_VISIBLE_COLUMN_IDS

      try {
        await exportMappedItemsToFile(
          EXPERT_EXPORT_COLUMN_MAP,
          [expert],
          'excel',
          `deleted_expert_${expert.expertId || expert.id}`,
          {
            columnIds: visibleIds,
            catalogOrder: DEFAULT_EXPERT_DELETED_VISIBLE_COLUMN_IDS,
          },
        )
        toast.success('Expert exported')
      } catch {
        toast.error('Failed to export expert')
      }
    },
    [tableColumnPreferencesQuery.data],
  )

  const handleExportData = useMemo(
    () =>
      createFilteredExportHandler(
        fetchDeletedExpertsForExport,
        EXPERT_EXPORT_COLUMN_MAP,
        'deleted_experts_export',
        {
          ...enhancedSearch.buildSearchParams(),
        },
      ),
    [enhancedSearch],
  )

  const {
    onAdvancedFilter,
    onExport,
    modals: exportFilterModals,
  } = useModuleExportFilters({
    moduleKey: EXPERT_DELETED_MODULE_KEY,
    onApplyFilters: handleApplyFilters,
    onExportData: handleExportData,
  })

  const columns = useMemo<ColumnDef<Expert>[]>(() => {
    const dataColumnsById = buildExpertDataColumnsById()
    const visibleIds = tableColumnPreferencesQuery.data?.visibleColumnIds?.length
      ? tableColumnPreferencesQuery.data.visibleColumnIds
      : DEFAULT_EXPERT_DELETED_VISIBLE_COLUMN_IDS

    return withServerSortMeta(
      [
        createExpertSelectColumn({
          allVisibleSelected: selection.allVisibleSelected,
          someVisibleSelected: selection.someVisibleSelected,
          selectedExpertIds: selection.selectedExpertIds,
          toggleVisible: selection.toggleVisible,
          toggleOne: selection.toggleOne,
        }),
        ...pickPreferenceColumns(
          dataColumnsById,
          visibleIds,
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
            const isOpen = activeDropdownId === expert.expertId

            return (
              <TableActionsDropdown
                label={`Open actions for ${expert.name}`}
                isOpen={isOpen}
                onOpenChange={(open) => setActiveDropdownId(open ? expert.expertId : null)}
                menuWidth={192}
              >
                <TableActionsItem
                  icon={<Eye className="size-3.5" aria-hidden="true" />}
                  onClick={() => {
                    setActiveDropdownId(null)
                    navigate(`/experts/management/profile/${expert.id}`)
                  }}
                >
                  View Expert
                </TableActionsItem>
                <TableActionsItem
                  icon={<RotateCcw className="size-3.5" aria-hidden="true" />}
                  onClick={() => {
                    setActiveDropdownId(null)
                    restoreExpertMutation.mutate(expert.id, {
                      onSuccess: () => toast.success('Expert account restored successfully'),
                      onError: (error: unknown) => {
                        const err = error as { response?: { data?: { message?: string } } }
                        toast.error(
                          err?.response?.data?.message ||
                            'Failed to restore expert. Please try again.',
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
                    setActiveDropdownId(null)
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
  }, [
    activeDropdownId,
    handleExportExpertRow,
    navigate,
    restoreExpertMutation,
    selection,
    tableColumnPreferencesQuery.data,
  ])

  return (
    <div className="flex flex-col gap-5 md:gap-6">
      <ExpertListHeader
        title="Deleted Experts"
        breadcrumb="User Management / Deleted Experts"
        metricsPath="/metrics/expert-deleted?returnTo=/experts/deleted"
      />

      <DataTable
        columns={columns}
        data={experts}
        getRowId={(expert) => expert.expertId}
        isLoading={isLoading}
        searchValue={enhancedSearch.globalSearch}
        onSearchChange={enhancedSearch.setGlobalSearch}
        searchableColumns={EXPERT_DELETED_SEARCH_COLUMNS}
        columnSearches={enhancedSearch.columnSearches}
        onColumnSearchChange={enhancedSearch.setColumnSearch}
        onColumnSearchRemove={enhancedSearch.removeColumnSearch}
        onClearAllSearches={enhancedSearch.clearAll}
        searchPlaceholder="Search by name or ID"
        onAdvancedFilter={onAdvancedFilter}
        onExport={onExport}
        {...serverSort.dataTableSortProps}
        pagination={{
          page: currentPage,
          pageSize: meta?.pagination.limit || 10,
          totalItems: meta?.pagination.total || 0,
          totalPages: meta?.pagination.pages || 1,
          onPageChange: setCurrentPage,
        }}
        resourceLabel="users"
        emptyMessage="No deleted experts found."
      />
      {exportFilterModals}
    </div>
  )
}
