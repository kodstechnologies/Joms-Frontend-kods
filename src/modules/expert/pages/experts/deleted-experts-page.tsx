import { useCallback, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Eye, RotateCcw, Upload } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import type { FilterValues } from '@/shared/types/data-filter'
import { useModuleExportFilters } from '@/shared/components/advanced-filter/use-module-export-filters'
import { exportDisplayValue } from '@/shared/utils/export-utils'
import { buildFilterParams, createFilteredExportHandler } from '@/shared/utils/export-filter-utils'
import { fetchExperts } from '../../api/expert-api'
import { useExperts, useRestoreExpert } from '../../hooks/use-expert'
import type { Expert } from '../../type/expert'
import {
  createExpertBaseColumns,
  createExpertDeletedAtColumn,
  createExpertReasonColumn,
  createExpertSelectColumn,
  createExpertServiceTypeColumn,
} from './expert-list-columns'
import { ExpertListHeader } from './expert-list-shared'
import { useExpertListSelection } from './use-expert-list-selection'
import { DataTable } from '@/shared/components/table/data-table'
import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'

const EXPORT_COLUMN_MAP: Record<string, { header: string; accessor: (e: Expert) => string }> = {
  expertId: { header: 'ID', accessor: (e) => exportDisplayValue(e.id || e.expertId) },
  name: { header: 'Name', accessor: (e) => exportDisplayValue(e.name) },
  email: { header: 'Email', accessor: (e) => exportDisplayValue(e.email) },
  phone: {
    header: 'Phone Number',
    accessor: (e) => exportDisplayValue((e as Expert & { phone?: string }).phone),
  },
  profession: { header: 'Profession', accessor: (e) => exportDisplayValue(e.profession) },
  tier: {
    header: 'Tier',
    accessor: (e) => exportDisplayValue((e as Expert & { tier?: string }).tier),
  },
  serviceType: { header: 'Service Type', accessor: (e) => exportDisplayValue(e.serviceType) },
  reason: { header: 'Reason', accessor: (e) => exportDisplayValue(e.reason) },
  status: { header: 'Status', accessor: (e) => exportDisplayValue(e.status) },
  createdAt: {
    header: 'Created At',
    accessor: (e) =>
      exportDisplayValue(e.createdAt ? new Date(e.createdAt).toLocaleDateString() : undefined),
  },
  deletedAt: {
    header: 'Deleted At',
    accessor: (e) =>
      exportDisplayValue(e.deletedAt ? new Date(e.deletedAt).toLocaleDateString() : undefined),
  },
}

export function ExpertDeletedExpertsPage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [appliedFilters, setAppliedFilters] = useState<FilterValues>({})

  const apiFilterParams = useMemo(() => buildFilterParams(appliedFilters), [appliedFilters])
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null)

  const { data, isLoading } = useExperts({
    page: currentPage,
    limit: 10,
    status: 'deactivated',
    search: searchQuery,
    ...apiFilterParams,
  })
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
      createFilteredExportHandler(fetchExperts, EXPORT_COLUMN_MAP, 'deleted_experts_export', {
        status: 'deactivated',
      }),
    [],
  )

  const {
    onAdvancedFilter,
    onExport,
    modals: exportFilterModals,
  } = useModuleExportFilters({
    moduleKey: 'expert-management',
    onApplyFilters: handleApplyFilters,
    onExportData: handleExportData,
  })

  const columns = useMemo<ColumnDef<Expert>[]>(
    () => [
      createExpertSelectColumn({
        allVisibleSelected: selection.allVisibleSelected,
        someVisibleSelected: selection.someVisibleSelected,
        selectedExpertIds: selection.selectedExpertIds,
        toggleVisible: selection.toggleVisible,
        toggleOne: selection.toggleOne,
      }),
      ...createExpertBaseColumns(),
      createExpertServiceTypeColumn(),
      createExpertReasonColumn(),
      createExpertDeletedAtColumn(),
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
    ],
    [activeDropdownId, navigate, restoreExpertMutation, selection],
  )

  return (
    <div className="flex flex-col gap-5 md:gap-6">
      <ExpertListHeader title="Deleted Experts" breadcrumb="User Management / Deleted Experts" />

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
