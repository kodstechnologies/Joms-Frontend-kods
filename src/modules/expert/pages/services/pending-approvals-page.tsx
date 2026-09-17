import { useCallback, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { ArrowLeft, CheckCircle2, Eye } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ManageMetricsIcon } from '@/shared/components/icons/action-button-icons'

import { navigateBackOrFallback } from '@/shared/lib/navigation'
import { PageBreadcrumb } from '@/shared/components/navigation/page-breadcrumb'
import { DataTable } from '@/shared/components/table/data-table'
import {
  DEFAULT_SERVICE_PENDING_VISIBLE_COLUMN_IDS,
  SERVICE_PENDING_APPROVALS_MODULE_KEY,
  SERVICE_PENDING_APPROVALS_TABLE_COLUMNS_CATALOG,
} from '../../config/service-management-table-columns.config'
import { useServiceStatusList } from '../../hooks/use-service-status-list'
import { getServiceManagementViewPath } from '../../lib/service-navigation'
import type { Service } from '../../type/service'
import {
  buildServiceDataColumnsById,
  pickServicePreferenceColumns,
} from '../../utils/service-preference-columns'
import { SERVICE_PENDING_EXPORT_COLUMN_MAP } from '../../utils/table-export-column-maps'
import { withServerSortMeta } from '@/shared/utils/table-sort'
import { SERVICE_COLUMN_SORT_FIELDS } from '@/shared/utils/table-sort-field-maps'
import { SERVICE_PENDING_SEARCH_COLUMNS } from '@/shared/components/table/search-configs'
import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'
import { Button } from '@/shared/components/ui/button'

export function PendingApprovalsPage() {
  const navigate = useNavigate()
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([])
  const catalogColumnIds = useMemo(
    () => SERVICE_PENDING_APPROVALS_TABLE_COLUMNS_CATALOG.map((column) => column.id),
    [],
  )

  const list = useServiceStatusList({
    moduleKey: SERVICE_PENDING_APPROVALS_MODULE_KEY,
    status: 'pending',
    defaultVisibleColumnIds: DEFAULT_SERVICE_PENDING_VISIBLE_COLUMN_IDS,
    catalogColumnIds,
    exportFileName: 'pending_services_export',
    exportColumnMap: SERVICE_PENDING_EXPORT_COLUMN_MAP,
  })

  const {
    currentPage,
    setCurrentPage,
    activeDropdownId,
    setActiveDropdownId,
    serverSort,
    enhancedSearch,
    services,
    meta,
    isLoading,
    visibleColumnIds,
    onAdvancedFilter,
    onExport,
    exportFilterModals,
  } = list

  const visibleServiceIds = useMemo(() => services.map((service) => service._id), [services])
  const allVisibleServicesSelected =
    visibleServiceIds.length > 0 && visibleServiceIds.every((id) => selectedServiceIds.includes(id))
  const someVisibleServicesSelected = visibleServiceIds.some((id) =>
    selectedServiceIds.includes(id),
  )

  const toggleVisibleServices = useCallback(() => {
    setSelectedServiceIds((currentIds) => {
      if (allVisibleServicesSelected) {
        return currentIds.filter((id) => !visibleServiceIds.includes(id))
      }

      return Array.from(new Set([...currentIds, ...visibleServiceIds]))
    })
  }, [allVisibleServicesSelected, visibleServiceIds])

  const toggleServiceSelection = useCallback((serviceId: string) => {
    setSelectedServiceIds((currentIds) =>
      currentIds.includes(serviceId)
        ? currentIds.filter((id) => id !== serviceId)
        : [...currentIds, serviceId],
    )
  }, [])

  const columns = useMemo<ColumnDef<Service>[]>(() => {
    const dataColumnsById = buildServiceDataColumnsById()

    return withServerSortMeta(
      [
        {
          id: 'select',
          header: () => (
            <input
              type="checkbox"
              aria-label="Select all pending services"
              checked={allVisibleServicesSelected}
              ref={(input) => {
                if (input)
                  input.indeterminate = someVisibleServicesSelected && !allVisibleServicesSelected
              }}
              onChange={toggleVisibleServices}
              className="ui-table-checkbox"
            />
          ),
          cell: ({ row }) => (
            <input
              type="checkbox"
              aria-label={`Select ${row.original.title}`}
              checked={selectedServiceIds.includes(row.original._id)}
              onChange={() => toggleServiceSelection(row.original._id)}
              onClick={(event) => event.stopPropagation()}
              className="ui-table-checkbox"
            />
          ),
          meta: {
            headerClassName: 'pl-5',
            cellClassName: 'pl-5',
          },
        },
        ...pickServicePreferenceColumns(
          dataColumnsById,
          visibleColumnIds,
          DEFAULT_SERVICE_PENDING_VISIBLE_COLUMN_IDS,
        ),
        {
          id: 'actions',
          accessorFn: () => null,
          header: 'Actions',
          meta: {
            headerClassName: 'pr-5 text-right',
            cellClassName: 'relative pr-5 text-right',
          },
          cell: ({ row }) => {
            const service = row.original
            const isOpen = activeDropdownId === service._id

            return (
              <TableActionsDropdown
                label={`Open actions for ${service.title}`}
                isOpen={isOpen}
                onOpenChange={(open) => setActiveDropdownId(open ? service._id : null)}
                menuWidth={190}
              >
                <TableActionsItem
                  icon={<Eye className="size-3.5" aria-hidden="true" />}
                  onClick={() => {
                    setActiveDropdownId(null)
                    navigate(getServiceManagementViewPath(service))
                  }}
                >
                  View Details
                </TableActionsItem>
                <TableActionsItem
                  icon={<CheckCircle2 className="size-3.5 text-emerald-400" aria-hidden="true" />}
                  onClick={() => {
                    setActiveDropdownId(null)
                    navigate(getServiceManagementViewPath(service))
                  }}
                >
                  Approve Application
                </TableActionsItem>
              </TableActionsDropdown>
            )
          },
        },
      ],
      SERVICE_COLUMN_SORT_FIELDS,
    )
  }, [
    activeDropdownId,
    allVisibleServicesSelected,
    navigate,
    selectedServiceIds,
    someVisibleServicesSelected,
    toggleServiceSelection,
    toggleVisibleServices,
    visibleColumnIds,
  ])

  return (
    <div className="flex flex-col gap-5 md:gap-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <header className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => navigateBackOrFallback(navigate, '/services/management')}
            className="group font-heading hover:text-brand-accent flex w-fit items-center gap-2 text-[20px] font-bold tracking-tight text-white transition-colors"
          >
            <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-1" />
            <span>Pending Approvals</span>
          </button>

          <div className="pl-7">
            <PageBreadcrumb
              items={[
                { label: 'Service Management', to: '/services/management' },
                { label: 'Pending Approvals', isActive: true },
              ]}
            />
          </div>
        </header>
        <Button
          className="ui-manage-metrics h-9 w-full md:w-auto"
          onClick={() =>
            navigate(
              '/metrics/service-pending-approvals?returnTo=/services/management/pending&section=table',
            )
          }
        >
          <ManageMetricsIcon />
          Manage Metrics
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={services}
        getRowId={(service) => service._id}
        isLoading={isLoading}
        searchValue={enhancedSearch.globalSearch}
        onSearchChange={enhancedSearch.setGlobalSearch}
        searchableColumns={SERVICE_PENDING_SEARCH_COLUMNS}
        columnSearches={enhancedSearch.columnSearches}
        onColumnSearchChange={enhancedSearch.setColumnSearch}
        onColumnSearchRemove={enhancedSearch.removeColumnSearch}
        onClearAllSearches={enhancedSearch.clearAll}
        searchPlaceholder="Search by service name or ID"
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
        resourceLabel="services"
        emptyMessage="No pending approvals found."
      />
      {exportFilterModals}
    </div>
  )
}
