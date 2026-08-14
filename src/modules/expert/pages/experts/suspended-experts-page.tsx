import { useCallback, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Eye, PlayCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import type { FilterValues } from '@/shared/types/data-filter'
import { useModuleExportFilters } from '@/shared/components/advanced-filter/use-module-export-filters'
import { exportDataToFile } from '@/shared/utils/export-utils'

import { useActivateExpert, useExperts } from '../../hooks/use-expert'
import type { Expert } from '../../type/expert'
import {
  createExpertBaseColumns,
  createExpertCreatedAtColumn,
  createExpertLastActiveColumn,
  createExpertSelectColumn,
  createExpertServiceTypeColumn,
  createExpertStatusColumn,
} from './expert-list-columns'
import { ExpertListHeader } from './expert-list-shared'
import { useExpertListSelection } from './use-expert-list-selection'
import { DataTable } from '@/shared/components/table/data-table'
import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'

export function ExpertSuspendedExpertsPage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null)
  const [appliedFilters, setAppliedFilters] = useState<FilterValues>({})

  const apiFilterParams = useMemo(() => {
    const params: Record<string, string> = {}

    Object.entries(appliedFilters).forEach(([rawKey, val]) => {
      if (val === undefined || val === null || val === '') return

      const parts = rawKey.split('.')
      const fieldId = parts.length > 1 ? parts.slice(1).join('.') : rawKey

      if (fieldId === 'location' && typeof val === 'object' && val !== null) {
        const loc = val as { state?: string; city?: string }
        if (loc.state?.trim()) params.locationState = loc.state.trim()
        if (loc.city?.trim()) params.locationCity = loc.city.trim()
        return
      }

      if (Array.isArray(val)) {
        if (val.length > 0) {
          params[fieldId] = val.join(',')
        }
        return
      }

      if (typeof val === 'object' && val !== null) {
        const range = val as { from?: string | number; to?: string | number }
        if (range.from !== undefined && range.from !== '') {
          params[`${fieldId}Min`] = String(range.from).trim()
        }
        if (range.to !== undefined && range.to !== '') {
          params[`${fieldId}Max`] = String(range.to).trim()
        }
        return
      }

      if (typeof val === 'string' && val.trim()) {
        params[fieldId] = val.trim()
        return
      }

      if (typeof val === 'number' || typeof val === 'boolean') {
        params[fieldId] = String(val)
      }
    })

    return params
  }, [appliedFilters])

  const { data, isLoading } = useExperts({
    page: currentPage,
    limit: 10,
    status: 'suspended',
    search: searchQuery,
    ...apiFilterParams,
  })

  const experts = useMemo(() => data?.data || [], [data?.data])
  const meta = data?.meta
  const selection = useExpertListSelection(experts)
  const activateExpertMutation = useActivateExpert()

  const handleApplyFilters = useCallback((values: FilterValues) => {
    setAppliedFilters(values)
    setCurrentPage(1)
  }, [])

  const handleExportData = useCallback(
    (values: FilterValues, format: string) => {
      const headers = [
        'Expert ID',
        'Name',
        'Email ID',
        'Profession',
        'Status',
        'Service Type',
        'Created At',
      ]
      const rows = experts.map((e) => [
        e.expertId || '-',
        e.name || '-',
        e.email || '-',
        e.profession || '-',
        e.status || '-',
        e.serviceType || '-',
        e.createdAt ? new Date(e.createdAt).toLocaleDateString() : 'N/A',
      ])
      exportDataToFile(headers, rows, format, 'suspended_experts_export')
    },
    [experts],
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
      createExpertStatusColumn(),
      createExpertServiceTypeColumn(),
      createExpertCreatedAtColumn(),
      createExpertLastActiveColumn(),
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
    ],
    [activeDropdownId, handleActivate, navigate, selection],
  )

  return (
    <div className="flex flex-col gap-5 md:gap-6">
      <ExpertListHeader title="Suspended Experts" breadcrumb="User Management / Suspended Users" />

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
        emptyMessage="No suspended experts found."
      />
      {exportFilterModals}
    </div>
  )
}
