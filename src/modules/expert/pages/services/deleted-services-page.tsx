import { useCallback, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { ArrowLeft, Eye, RotateCcw, Upload } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { navigateBackOrFallback } from '@/shared/lib/navigation'
import { toast } from 'sonner'
import type { FilterValues } from '@/shared/types/data-filter'
import { useModuleExportFilters } from '@/shared/components/advanced-filter/use-module-export-filters'
import { exportDisplayValue } from '@/shared/utils/export-utils'
import { buildFilterParams, createFilteredExportHandler } from '@/shared/utils/export-filter-utils'
import { fetchServices } from '../../api/service-api'

import { formatDeletedAt } from '../../constants/soft-delete'
import { useRestoreService, useServices } from '../../hooks/use-services'
import { getServiceManagementViewPath } from '../../lib/service-navigation'
import type { Service } from '../../type/service'
import { DataTable } from '@/shared/components/table/data-table'
import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'

const EXPORT_COLUMN_MAP: Record<string, { header: string; accessor: (s: Service) => string }> = {
  serviceId: { header: 'Service ID', accessor: (s) => exportDisplayValue(s.serviceid || s._id) },
  title: { header: 'Service Name', accessor: (s) => exportDisplayValue(s.title) },
  serviceType: { header: 'Type', accessor: (s) => exportDisplayValue(s.serviceType) },
  expertName: { header: 'Expert Name', accessor: (s) => exportDisplayValue(s.expertName) },
  reason: { header: 'Reason', accessor: (s) => exportDisplayValue(s.reason) },
  deletedAt: {
    header: 'Deleted At',
    accessor: (s) =>
      exportDisplayValue(s.deletedAt ? new Date(s.deletedAt).toLocaleDateString() : undefined),
  },
}

export function DeletedServicesPage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null)
  const [appliedFilters, setAppliedFilters] = useState<FilterValues>({})

  const apiFilterParams = useMemo(() => buildFilterParams(appliedFilters), [appliedFilters])

  const { data, isLoading } = useServices({
    page: currentPage,
    limit: 10,
    status: 'deleted',
    search: searchQuery,
    ...apiFilterParams,
  })
  const restoreServiceMutation = useRestoreService()

  const services = useMemo(() => data?.data || [], [data?.data])
  const meta = data?.meta

  const handleApplyFilters = useCallback((values: FilterValues) => {
    setAppliedFilters(values)
    setCurrentPage(1)
  }, [])

  const handleExportData = useMemo(
    () =>
      createFilteredExportHandler(fetchServices, EXPORT_COLUMN_MAP, 'deleted_services_export', {
        status: 'deleted',
      }),
    [],
  )

  const {
    onAdvancedFilter,
    onExport,
    modals: exportFilterModals,
  } = useModuleExportFilters({
    moduleKey: 'service-management',
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

  const columns = useMemo<ColumnDef<Service>[]>(
    () => [
      {
        accessorKey: 'serviceid',
        header: 'Service ID',
        cell: ({ row }) => (
          <span className="ui-table-id uppercase">{row.original.serviceid || '—'}</span>
        ),
      },
      { accessorKey: 'title', header: 'Service Name' },
      { accessorKey: 'serviceType', header: 'Type' },
      { accessorKey: 'expertName', header: 'Expert Name' },
      {
        accessorKey: 'reason',
        header: 'Reason',
        cell: ({ row }) => row.original.reason || '—',
      },
      {
        accessorKey: 'deletedAt',
        header: 'Deleted At',
        cell: ({ row }) => formatDeletedAt(row.original.deletedAt),
      },
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
    ],
    [activeDropdownId, handleRestore, navigate],
  )

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
      </div>

      <DataTable
        columns={columns}
        data={services}
        getRowId={(service) => service._id}
        isLoading={isLoading}
        searchValue={searchQuery}
        onSearchChange={(value) => {
          setSearchQuery(value)
          setCurrentPage(1)
        }}
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
