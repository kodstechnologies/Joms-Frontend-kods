import { useCallback, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { ArrowLeft, Eye, PlayCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ManageMetricsIcon } from '@/shared/components/icons/action-button-icons'

import { navigateBackOrFallback } from '@/shared/lib/navigation'
import { toast } from 'sonner'
import type { FilterValues } from '@/shared/types/data-filter'
import { useModuleExportFilters } from '@/shared/components/advanced-filter/use-module-export-filters'
import { useTableExportColumnIds } from '@/shared/hooks/use-table-export-column-ids'
import { SERVICE_EXPORT_COLUMN_MAP } from '../../utils/table-export-column-maps'
import {
  buildServiceListQueryParams,
  createServiceFilteredExportHandler,
} from '@/shared/utils/export-filter-utils'
import { fetchServices } from '../../api/service-api'
import { SERVICE_SUSPENDED_MODULE_KEY } from '../../api/ui-preferences-api'
import {
  DEFAULT_SERVICE_SUSPENDED_VISIBLE_COLUMN_IDS,
  SERVICE_SUSPENDED_TABLE_COLUMNS_CATALOG,
} from '../../config/service-management-table-columns.config'
import { useTableColumnPreferences } from '../../hooks/use-ui-preferences'

import { useActivateService, useServices } from '../../hooks/use-services'
import { getServiceManagementViewPath } from '../../lib/service-navigation'
import type { Service } from '../../type/service'
import {
  buildServiceDataColumnsById,
  pickServicePreferenceColumns,
} from '../../utils/service-preference-columns'
import { DataTable } from '@/shared/components/table/data-table'
import { useServerTableSort } from '@/shared/hooks/use-server-table-sort'
import { useEnhancedSearch } from '@/shared/hooks/use-enhanced-search'
import { withServerSortMeta } from '@/shared/utils/table-sort'
import { SERVICE_COLUMN_SORT_FIELDS } from '@/shared/utils/table-sort-field-maps'
import { SERVICE_SUSPENDED_SEARCH_COLUMNS } from '@/shared/components/table/search-configs'
import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'
import { Button } from '@/shared/components/ui/button'

export function SuspendedServicesPage() {
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState(1)
  const serverSort = useServerTableSort({
    sortFieldMap: SERVICE_COLUMN_SORT_FIELDS,
    onPageReset: () => setCurrentPage(1),
  })
  const enhancedSearch = useEnhancedSearch({ onSearchChange: () => setCurrentPage(1) })
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null)
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([])
  const [appliedFilters, setAppliedFilters] = useState<FilterValues>({})
  const tableColumnPreferencesQuery = useTableColumnPreferences(SERVICE_SUSPENDED_MODULE_KEY)
  const catalogColumnIds = useMemo(
    () => SERVICE_SUSPENDED_TABLE_COLUMNS_CATALOG.map((column) => column.id),
    [],
  )
  const exportColumnIds = useTableExportColumnIds({
    visibleColumnIds: tableColumnPreferencesQuery.data?.visibleColumnIds,
    defaultColumnIds: DEFAULT_SERVICE_SUSPENDED_VISIBLE_COLUMN_IDS,
    catalogColumnIds,
  })

  const serviceQueryParams = useMemo(
    () =>
      buildServiceListQueryParams(appliedFilters, {
        page: currentPage,
        limit: 10,
        ...serverSort.sortParams,
        ...enhancedSearch.buildSearchParams(),
        status: 'suspended',
      }),
    [appliedFilters, currentPage, enhancedSearch, serverSort.sortParams],
  )

  const { data, isLoading } = useServices(serviceQueryParams)

  const activateServiceMutation = useActivateService()

  const services = useMemo(() => data?.data ?? [], [data?.data])
  const meta = data?.meta
  const visibleServiceIds = useMemo(() => services.map((service) => service._id), [services])
  const allVisibleServicesSelected =
    visibleServiceIds.length > 0 && visibleServiceIds.every((id) => selectedServiceIds.includes(id))
  const someVisibleServicesSelected = visibleServiceIds.some((id) =>
    selectedServiceIds.includes(id),
  )

  const handleApplyFilters = useCallback((values: FilterValues) => {
    setAppliedFilters(values)
    setCurrentPage(1)
  }, [])

  const handleExportData = useMemo(
    () =>
      createServiceFilteredExportHandler(
        fetchServices,
        SERVICE_EXPORT_COLUMN_MAP,
        'suspended_services_export',
        {
          status: 'suspended',
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
    moduleKey: SERVICE_SUSPENDED_MODULE_KEY,
    onApplyFilters: handleApplyFilters,
    onExportData: handleExportData,
  })

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

  const handleActivate = useCallback(
    (service: Service) => {
      activateServiceMutation.mutate(service._id, {
        onSuccess: () => {
          toast.success('Service activated successfully')
        },
        onError: (error: unknown) => {
          const err = error as { response?: { data?: { message?: string } } }
          toast.error(
            err?.response?.data?.message || 'Failed to activate service. Please try again.',
          )
        },
      })
    },
    [activateServiceMutation],
  )

  const columns = useMemo<ColumnDef<Service>[]>(() => {
    const dataColumnsById = buildServiceDataColumnsById()
    const visibleIds = tableColumnPreferencesQuery.data?.visibleColumnIds?.length
      ? tableColumnPreferencesQuery.data.visibleColumnIds
      : DEFAULT_SERVICE_SUSPENDED_VISIBLE_COLUMN_IDS

    return withServerSortMeta(
      [
        {
          id: 'select',
          header: () => (
            <input
              type="checkbox"
              aria-label="Select all suspended services"
              checked={allVisibleServicesSelected}
              ref={(input) => {
                if (input)
                  input.indeterminate = someVisibleServicesSelected && !allVisibleServicesSelected
              }}
              onChange={toggleVisibleServices}
              className="rounded border-slate-700 bg-transparent"
            />
          ),
          cell: ({ row }) => (
            <input
              type="checkbox"
              aria-label={`Select ${row.original.title}`}
              checked={selectedServiceIds.includes(row.original._id)}
              onChange={() => toggleServiceSelection(row.original._id)}
              onClick={(event) => event.stopPropagation()}
              className="rounded border-slate-700 bg-transparent"
            />
          ),
          meta: {
            headerClassName: 'pl-5',
            cellClassName: 'pl-5',
          },
        },
        ...pickServicePreferenceColumns(
          dataColumnsById,
          visibleIds,
          DEFAULT_SERVICE_SUSPENDED_VISIBLE_COLUMN_IDS,
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
                menuWidth={180}
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
                  icon={<PlayCircle className="size-3.5" aria-hidden="true" />}
                  onClick={() => {
                    setActiveDropdownId(null)
                    handleActivate(service)
                  }}
                >
                  Activate Service
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
    handleActivate,
    navigate,
    selectedServiceIds,
    someVisibleServicesSelected,
    tableColumnPreferencesQuery.data,
    toggleServiceSelection,
    toggleVisibleServices,
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
            <span>Suspended Services</span>
          </button>

          <div className="text-body-sm-medium text-muted flex items-center gap-1.5 pl-7">
            <button
              type="button"
              onClick={() => navigateBackOrFallback(navigate, '/services/management')}
              className="transition-colors hover:text-white"
            >
              Service Management
            </button>
            <span className="text-[#333333]">/</span>
            <span className="font-bold text-white">Suspended Services</span>
          </div>
        </header>
        <Button
          className="ui-manage-metrics h-9 w-full md:w-auto"
          onClick={() =>
            navigate(
              '/metrics/service-suspended?returnTo=/services/management/suspended&section=table',
            )
          }
        >
          <ManageMetricsIcon className="size-4 shrink-0" />
          Manage Metrics
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={services}
        isLoading={isLoading}
        searchValue={enhancedSearch.globalSearch}
        onSearchChange={enhancedSearch.setGlobalSearch}
        searchableColumns={SERVICE_SUSPENDED_SEARCH_COLUMNS}
        columnSearches={enhancedSearch.columnSearches}
        onColumnSearchChange={enhancedSearch.setColumnSearch}
        onColumnSearchRemove={enhancedSearch.removeColumnSearch}
        onClearAllSearches={enhancedSearch.clearAll}
        onAdvancedFilter={onAdvancedFilter}
        onExport={onExport}
        {...serverSort.dataTableSortProps}
        searchPlaceholder="Search by name, ID or profession"
        pagination={{
          page: currentPage,
          pageSize: meta?.pagination.limit || 10,
          totalItems: meta?.pagination.total || 0,
          totalPages: meta?.pagination.pages || 1,
          onPageChange: setCurrentPage,
        }}
        resourceLabel="services"
        emptyMessage="No suspended services found."
      />
      {exportFilterModals}
    </div>
  )
}
