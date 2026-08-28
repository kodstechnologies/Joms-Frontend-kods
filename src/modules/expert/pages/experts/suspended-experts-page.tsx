import { useCallback, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Eye, PlayCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import type { FilterValues } from '@/shared/types/data-filter'
import { useModuleExportFilters } from '@/shared/components/advanced-filter/use-module-export-filters'
import { EXPERT_EXPORT_COLUMN_MAP } from '../../utils/table-export-column-maps'
import {
  buildExpertListQueryParams,
  createFilteredExportHandler,
} from '@/shared/utils/export-filter-utils'
import { fetchExperts } from '../../api/expert-api'
import {
  DEFAULT_EXPERT_SUSPENDED_VISIBLE_COLUMN_IDS,
  EXPERT_SUSPENDED_MODULE_KEY,
  EXPERT_SUSPENDED_TABLE_COLUMNS_CATALOG,
} from '../../config/expert-management-table-columns.config'
import { useTableExportColumnIds } from '@/shared/hooks/use-table-export-column-ids'
import { useActivateExpert, useExperts } from '../../hooks/use-expert'
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
import { useEnhancedSearch } from '@/shared/hooks/use-enhanced-search'
import { EXPERT_SUSPENDED_SEARCH_COLUMNS } from '@/shared/components/table/search-configs'
import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'

const fetchSuspendedExpertsForExport = async (params: Record<string, unknown>) => {
  const response = await fetchExperts({ ...params, status: 'suspended' })
  return {
    data: (response.data || []).filter((expert) => expert.status === 'suspended'),
    meta: response.meta,
  }
}

export function ExpertSuspendedExpertsPage() {
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState(1)
  const enhancedSearch = useEnhancedSearch({ onSearchChange: () => setCurrentPage(1) })
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null)
  const [appliedFilters, setAppliedFilters] = useState<FilterValues>({})

  const expertQueryParams = useMemo(
    () =>
      buildExpertListQueryParams(appliedFilters, {
        page: currentPage,
        limit: 10,
        ...enhancedSearch.buildSearchParams(),
        status: 'suspended',
      }),
    [appliedFilters, currentPage, enhancedSearch],
  )

  const { data, isLoading } = useExperts(expertQueryParams)

  const experts = useMemo(() => data?.data || [], [data?.data])
  const meta = data?.meta
  const selection = useExpertListSelection(experts)
  const activateExpertMutation = useActivateExpert()
  const tableColumnPreferencesQuery = useTableColumnPreferences(EXPERT_SUSPENDED_MODULE_KEY)
  const catalogColumnIds = useMemo(
    () => EXPERT_SUSPENDED_TABLE_COLUMNS_CATALOG.map((column) => column.id),
    [],
  )
  const exportColumnIds = useTableExportColumnIds({
    visibleColumnIds: tableColumnPreferencesQuery.data?.visibleColumnIds,
    defaultColumnIds: DEFAULT_EXPERT_SUSPENDED_VISIBLE_COLUMN_IDS,
    catalogColumnIds,
  })

  const handleApplyFilters = useCallback((values: FilterValues) => {
    setAppliedFilters(values)
    setCurrentPage(1)
  }, [])

  const handleExportData = useMemo(
    () =>
      createFilteredExportHandler(
        fetchSuspendedExpertsForExport,
        EXPERT_EXPORT_COLUMN_MAP,
        'suspended_experts_export',
        {
          ...enhancedSearch.buildSearchParams(),
        },
        { columnIds: exportColumnIds, catalogOrder: catalogColumnIds },
      ),
    [catalogColumnIds, enhancedSearch, exportColumnIds],
  )

  const {
    onAdvancedFilter,
    onExport,
    modals: exportFilterModals,
  } = useModuleExportFilters({
    moduleKey: EXPERT_SUSPENDED_MODULE_KEY,
    onApplyFilters: handleApplyFilters,
    onExportData: handleExportData,
  })

  const handleActivate = useCallback(
    (expert: Expert) => {
      activateExpertMutation.mutate(expert.id, {
        onSuccess: () => {
          toast.success('Expert activated successfully')
        },
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
    const visibleIds = tableColumnPreferencesQuery.data?.visibleColumnIds?.length
      ? tableColumnPreferencesQuery.data.visibleColumnIds
      : DEFAULT_EXPERT_SUSPENDED_VISIBLE_COLUMN_IDS

    return [
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
                icon={<PlayCircle className="size-3.5" aria-hidden="true" />}
                onClick={() => {
                  setActiveDropdownId(null)
                  handleActivate(expert)
                }}
              >
                Activate Expert
              </TableActionsItem>
            </TableActionsDropdown>
          )
        },
      },
    ]
  }, [activeDropdownId, handleActivate, navigate, selection, tableColumnPreferencesQuery.data])

  return (
    <div className="flex flex-col gap-5 md:gap-6">
      <ExpertListHeader
        title="Suspended Experts"
        breadcrumb="User Management / Suspended Users"
        metricsPath="/metrics/expert-suspended?returnTo=/experts/suspended"
      />

      <DataTable
        columns={columns}
        data={experts}
        getRowId={(expert) => expert.expertId}
        isLoading={isLoading}
        searchValue={enhancedSearch.globalSearch}
        onSearchChange={enhancedSearch.setGlobalSearch}
        searchableColumns={EXPERT_SUSPENDED_SEARCH_COLUMNS}
        columnSearches={enhancedSearch.columnSearches}
        onColumnSearchChange={enhancedSearch.setColumnSearch}
        onColumnSearchRemove={enhancedSearch.removeColumnSearch}
        onClearAllSearches={enhancedSearch.clearAll}
        searchPlaceholder="Search by name or ID"
        onAdvancedFilter={onAdvancedFilter}
        onExport={onExport}
        pagination={{
          page: currentPage,
          pageSize: meta?.pagination.limit || 10,
          totalItems: meta?.pagination.total || 0,
          totalPages: meta?.pagination.pages || 1,
          onPageChange: setCurrentPage,
        }}
        resourceLabel="users"
        emptyMessage="No suspended experts found."
      />
      {exportFilterModals}
    </div>
  )
}
