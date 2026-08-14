import { useCallback, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { ArrowLeft, Eye, Ban } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { navigateBackOrFallback } from '@/shared/lib/navigation'
import { toast } from 'sonner'
import type { FilterValues } from '@/shared/types/data-filter'
import { useModuleExportFilters } from '@/shared/components/advanced-filter/use-module-export-filters'
import { exportDataToFile } from '@/shared/utils/export-utils'

import { useServices } from '../../hooks/use-services'
import { getServiceManagementViewPath } from '../../lib/service-navigation'
import type { Service } from '../../type/service'
type ReportedService = Service & {
  reportId?: string
  reportedBy?: string
  issueType?: string
  reportedAt?: string
}
import { DataTable } from '@/shared/components/table/data-table'
import { TableDateTimeCell } from '@/shared/components/table/table-datetime-cell'
import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'

export function ReportedServicesPage() {
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
        if (loc.state?.trim()) params.titleState = loc.state.trim()
        if (loc.city?.trim()) params.titleCity = loc.city.trim()
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

  const { data, isLoading } = useServices({
    page: currentPage,
    limit: 10,
    status: 'reported',
    search: searchQuery,
    ...apiFilterParams,
  })

  const services = useMemo(() => data?.data ?? [], [data?.data])
  const meta = data?.meta

  const handleApplyFilters = useCallback((values: FilterValues) => {
    setAppliedFilters(values)
    setCurrentPage(1)
  }, [])

  const handleExportData = useCallback(
    (values: FilterValues, format: string) => {
      const headers = [
        'Report ID',
        'Reported Service',
        'Reported By',
        'Issue Type',
        'Reason',
        'Status',
        'Reported At',
      ]
      const rows = services.map((s) => [
        (s as ReportedService).reportId || s.serviceid || s._id.substring(0, 8),
        s.title || '-',
        (s as ReportedService).reportedBy || s.partnerName || '-',
        (s as ReportedService).issueType || '-',
        s.reason || '-',
        'Reported',
        (s as ReportedService).reportedAt || s.createdAt
          ? new Date(
              ((s as ReportedService).reportedAt || s.createdAt) as string,
            ).toLocaleDateString()
          : 'N/A',
      ])
      exportDataToFile(headers, rows, format, 'reported_services_export')
    },
    [services],
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

  const columns = useMemo<ColumnDef<Service>[]>(
    () => [
      {
        id: 'reportId',
        accessorFn: () => null,
        header: 'Report ID',
        cell: ({ row }) => (
          <span className="ui-table-id uppercase">
            {(row.original as ReportedService).reportId ||
              row.original.serviceid ||
              row.original._id.substring(0, 8)}
          </span>
        ),
      },
      {
        accessorKey: 'title',
        header: 'Reported Service',
        cell: ({ row }) => <span className="font-medium text-white">{row.original.title}</span>,
      },
      {
        id: 'reportedBy',
        accessorFn: () => null,
        header: 'Reported By',
        cell: ({ row }) => (
          <span className="text-[#e2e2e2]">
            {(row.original as ReportedService).reportedBy || row.original.partnerName || 'Unknown'}
          </span>
        ),
      },
      {
        id: 'issueType',
        accessorFn: () => null,
        header: 'Issue Type',
        cell: ({ row }) => (
          <span className="text-[#e2e2e2]">
            {(row.original as ReportedService).issueType || '—'}
          </span>
        ),
      },
      {
        id: 'reason',
        accessorFn: () => null,
        header: 'Reason',
        cell: ({ row }) => <span className="text-[#e2e2e2]">{row.original.reason || '—'}</span>,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: () => (
          <span className="rounded-full bg-red-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-red-400 uppercase">
            Reported
          </span>
        ),
      },
      {
        id: 'reportedAt',
        accessorFn: () => null,
        header: 'Reported At',
        cell: ({ row }) => (
          <TableDateTimeCell
            value={(row.original as ReportedService).reportedAt || row.original.createdAt}
          />
        ),
      },
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
                icon={<Ban className="size-3.5 text-red-400" aria-hidden="true" />}
                onClick={() => {
                  setActiveDropdownId(null)
                  toast.message('View Report is coming soon')
                }}
              >
                <span className="text-red-400">View Report</span>
              </TableActionsItem>
            </TableActionsDropdown>
          )
        },
      },
    ],
    [activeDropdownId, navigate],
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
            <span>Reported Services</span>
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
            <span className="font-bold text-white">Reported Services</span>
          </div>
        </header>
      </div>

      <DataTable
        columns={columns}
        data={services}
        isLoading={isLoading}
        searchValue={searchQuery}
        onSearchChange={(value) => {
          setSearchQuery(value)
          setCurrentPage(1)
        }}
        onAdvancedFilter={onAdvancedFilter}
        onExport={onExport}
        searchPlaceholder="Search by report ID, service title, or reporter"
        pagination={{
          page: currentPage,
          pageSize: meta?.pagination.limit || 10,
          totalItems: meta?.pagination.total || 0,
          totalPages: meta?.pagination.pages || 1,
          onPageChange: setCurrentPage,
        }}
        resourceLabel="reports"
        emptyMessage="No reported services found."
      />
      {exportFilterModals}
    </div>
  )
}
