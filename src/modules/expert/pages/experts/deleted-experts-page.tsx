import { useCallback, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Eye, RotateCcw, Upload } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import type { FilterValues } from '@/shared/types/data-filter'
import { useModuleExportFilters } from '@/shared/components/advanced-filter/use-module-export-filters'
import { exportDisplayValue } from '@/shared/utils/export-utils'
import {
  buildExpertListQueryParams,
  createFilteredExportHandler,
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
import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'

const formatExportDateTime = (value?: string | null) =>
  value
    ? new Date(value).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : ''

const EXPORT_COLUMN_MAP: Record<string, { header: string; accessor: (e: Expert) => string }> = {
  expertId: { header: 'Expert ID', accessor: (e) => exportDisplayValue(e.expertId) },
  name: { header: 'Name', accessor: (e) => exportDisplayValue(e.name) },
  email: { header: 'Email ID', accessor: (e) => exportDisplayValue(e.email) },
  profession: { header: 'Profession', accessor: (e) => exportDisplayValue(e.profession) },
  serviceType: { header: 'Service Type', accessor: (e) => exportDisplayValue(e.serviceType) },
  reason: { header: 'Reason', accessor: (e) => exportDisplayValue(e.reason) },
  deletedAt: { header: 'Deleted At', accessor: (e) => formatExportDateTime(e.deletedAt) },
}

const fetchDeletedExpertsForExport = async (params: Record<string, unknown>) => {
  const response = await fetchExperts({ ...params, status: 'deactivated' })
  return {
    data: response.data || [],
    meta: response.meta,
  }
}

export function ExpertDeletedExpertsPage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [appliedFilters, setAppliedFilters] = useState<FilterValues>({})
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null)

  const expertQueryParams = useMemo(
    () =>
      buildExpertListQueryParams(appliedFilters, {
        page: currentPage,
        limit: 10,
        search: searchQuery,
        status: 'deactivated',
      }),
    [appliedFilters, currentPage, searchQuery],
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

  const handleExportData = useMemo(
    () =>
      createFilteredExportHandler(
        fetchDeletedExpertsForExport,
        EXPORT_COLUMN_MAP,
        'deleted_experts_export',
        {
          search: searchQuery.trim() || undefined,
        },
      ),
    [searchQuery],
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

  const tableColumnPreferencesQuery = useTableColumnPreferences(EXPERT_DELETED_MODULE_KEY)

  const columns = useMemo<ColumnDef<Expert>[]>(() => {
    const dataColumnsById = buildExpertDataColumnsById()
    const visibleIds = tableColumnPreferencesQuery.data?.visibleColumnIds?.length
      ? tableColumnPreferencesQuery.data.visibleColumnIds
      : DEFAULT_EXPERT_DELETED_VISIBLE_COLUMN_IDS

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
                icon={<Upload className="size-3.5" aria-hidden="true" />}
                onClick={() => {
                  setActiveDropdownId(null)
                  toast.message('Export Data is coming soon')
                }}
              >
                Export Data
              </TableActionsItem>
            </TableActionsDropdown>
          )
        },
      },
    ]
  }, [
    activeDropdownId,
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
        searchValue={searchQuery}
        onSearchChange={(value) => {
          setSearchQuery(value)
          setCurrentPage(1)
        }}
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
        emptyMessage="No deleted experts found."
      />
      {exportFilterModals}
    </div>
  )
}
