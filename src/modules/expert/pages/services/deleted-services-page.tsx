import { useCallback, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { ArrowLeft, Eye, RotateCcw, Upload } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ManageMetricsIcon } from '@/shared/components/icons/action-button-icons'

import { navigateBackOrFallback } from '@/shared/lib/navigation'
import { toast } from 'sonner'
import type { FilterValues } from '@/shared/types/data-filter'
import { useModuleExportFilters } from '@/shared/components/advanced-filter/use-module-export-filters'
import { exportDisplayValue } from '@/shared/utils/export-utils'
import {
  buildServiceListQueryParams,
  createServiceFilteredExportHandler,
} from '@/shared/utils/export-filter-utils'
import { fetchServices } from '../../api/service-api'
import { SERVICE_DELETED_MODULE_KEY } from '../../api/ui-preferences-api'
import { DEFAULT_SERVICE_DELETED_VISIBLE_COLUMN_IDS } from '../../config/service-management-table-columns.config'
import { useTableColumnPreferences } from '../../hooks/use-ui-preferences'

import { useRestoreService, useServices } from '../../hooks/use-services'
import { getServiceManagementViewPath } from '../../lib/service-navigation'
import type { Service } from '../../type/service'
import {
  buildServiceDataColumnsById,
  pickServicePreferenceColumns,
} from '../../utils/service-preference-columns'
import { DataTable } from '@/shared/components/table/data-table'
import { useEnhancedSearch } from '@/shared/hooks/use-enhanced-search'
import { SERVICE_DELETED_SEARCH_COLUMNS } from '@/shared/components/table/search-configs'
import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'
import { Button } from '@/shared/components/ui/button'

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

const EXPORT_COLUMN_MAP: Record<string, { header: string; accessor: (s: Service) => string }> = {
  serviceId: { header: 'Listing ID', accessor: (s) => exportDisplayValue(s.serviceid || s._id) },
  title: { header: 'Listing Name', accessor: (s) => exportDisplayValue(s.title) },
  deletedBy: { header: 'Deleted By', accessor: (s) => exportDisplayValue(s.deletedBy) },
  deletedById: { header: 'Deleted By ID', accessor: (s) => exportDisplayValue(s.deletedById) },
  deletionReason: {
    header: 'Deletion Reason',
    accessor: (s) => exportDisplayValue(s.deletionReason || s.reason),
  },
  deletedAt: { header: 'Deleted At', accessor: (s) => formatExportDateTime(s.deletedAt) },
  restoreEligible: {
    header: 'Restore Eligible',
    accessor: (s) => exportDisplayValue(s.restoreEligible),
  },
  lastUpdatedAt: {
    header: 'Last Updated At',
    accessor: (s) => formatExportDateTime(s.lastUpdatedAt),
  },
}

export function DeletedServicesPage() {
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState(1)
  const enhancedSearch = useEnhancedSearch({ onSearchChange: () => setCurrentPage(1) })
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null)
  const [appliedFilters, setAppliedFilters] = useState<FilterValues>({})
  const tableColumnPreferencesQuery = useTableColumnPreferences(SERVICE_DELETED_MODULE_KEY)

  const serviceQueryParams = useMemo(
    () =>
      buildServiceListQueryParams(appliedFilters, {
        page: currentPage,
        limit: 10,
        ...enhancedSearch.buildSearchParams(),
        status: 'deleted',
      }),
    [appliedFilters, currentPage, enhancedSearch],
  )

  const { data, isLoading } = useServices(serviceQueryParams)
  const restoreServiceMutation = useRestoreService()

  const services = useMemo(() => data?.data || [], [data?.data])
  const meta = data?.meta

  const handleApplyFilters = useCallback((values: FilterValues) => {
    setAppliedFilters(values)
    setCurrentPage(1)
  }, [])

  const handleExportData = useMemo(
    () =>
      createServiceFilteredExportHandler(
        fetchServices,
        EXPORT_COLUMN_MAP,
        'deleted_services_export',
        {
          status: 'deleted',
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
    moduleKey: SERVICE_DELETED_MODULE_KEY,
    onApplyFilters: handleApplyFilters,
    onExportData: handleExportData,
  })

  const handleRestore = useCallback(
    (service: Service) => {
      restoreServiceMutation.mutate(service._id, {
        onSuccess: () => toast.success('Service restored successfully'),
        onError: (error: unknown) => {
          const err = error as { response?: { data?: { message?: string } } }
          toast.error(err?.response?.data?.message || 'Failed to restore service.')
        },
      })
    },
    [restoreServiceMutation],
  )

  const columns = useMemo<ColumnDef<Service>[]>(() => {
    const dataColumnsById = buildServiceDataColumnsById()
    const visibleIds = tableColumnPreferencesQuery.data?.visibleColumnIds?.length
      ? tableColumnPreferencesQuery.data.visibleColumnIds
      : DEFAULT_SERVICE_DELETED_VISIBLE_COLUMN_IDS

    return [
      ...pickServicePreferenceColumns(
        dataColumnsById,
        visibleIds,
        DEFAULT_SERVICE_DELETED_VISIBLE_COLUMN_IDS,
      ),
      {
        id: 'actions',
        accessorFn: () => null,
        header: 'Actions',
        meta: { headerClassName: 'pr-5 text-right', cellClassName: 'relative pr-5 text-right' },
        cell: ({ row }) => {
          const service = row.original
          const isOpen = activeDropdownId === service._id

          return (
            <TableActionsDropdown
              label={`Open actions for ${service.title}`}
              isOpen={isOpen}
              onOpenChange={(open) => setActiveDropdownId(open ? service._id : null)}
              menuWidth={192}
            >
              <TableActionsItem
                icon={<Eye className="size-3.5" />}
                onClick={() => {
                  setActiveDropdownId(null)
                  navigate(getServiceManagementViewPath(service))
                }}
              >
                View Details
              </TableActionsItem>
              <TableActionsItem
                icon={<RotateCcw className="size-3.5" />}
                onClick={() => {
                  setActiveDropdownId(null)
                  handleRestore(service)
                }}
              >
                Restore Service
              </TableActionsItem>
              <TableActionsItem
                icon={<Upload className="size-3.5" />}
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
  }, [activeDropdownId, handleRestore, navigate, tableColumnPreferencesQuery.data])

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
            <span>Deleted Services</span>
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
            <span className="font-bold text-white">Deleted Services</span>
          </div>
        </header>
        <Button
          className="ui-manage-metrics h-9 w-full md:w-auto"
          onClick={() =>
            navigate('/metrics/service-deleted?returnTo=/services/management/deleted&section=table')
          }
        >
          <ManageMetricsIcon className="size-5" />
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
        searchableColumns={SERVICE_DELETED_SEARCH_COLUMNS}
        columnSearches={enhancedSearch.columnSearches}
        onColumnSearchChange={enhancedSearch.setColumnSearch}
        onColumnSearchRemove={enhancedSearch.removeColumnSearch}
        onClearAllSearches={enhancedSearch.clearAll}
        onAdvancedFilter={onAdvancedFilter}
        onExport={onExport}
        searchPlaceholder="Search by name, ID or profession"
        pagination={{
          page: currentPage,
          pageSize: meta?.pagination.limit || 10,
          totalItems: meta?.pagination.total || 0,
          totalPages: meta?.pagination.pages || 1,
          onPageChange: setCurrentPage,
        }}
        resourceLabel="services"
        emptyMessage="No deleted services found."
      />
      {exportFilterModals}
    </div>
  )
}
