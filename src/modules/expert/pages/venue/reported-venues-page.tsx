import { useCallback, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { ArrowLeft, Eye, Ban, Plus, SlidersHorizontal } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { navigateBackOrFallback } from '@/shared/lib/navigation'
import { toast } from 'sonner'
import type { FilterValues } from '@/shared/types/data-filter'
import { useModuleExportFilters } from '@/shared/components/advanced-filter/use-module-export-filters'
import { exportDataToFile } from '@/shared/utils/export-utils'

import { useVenues } from '../../hooks/use-venues'
import type { Venue } from '../../type/venue'
type ReportedVenue = Venue & {
  reportId?: string
  reportedBy?: string
  issueType?: string
  reportedAt?: string
}
import { getVenueDisplayId } from '../../utils/venue-list'
import { DataTable } from '@/shared/components/table/data-table'
import { TableDateTimeCell } from '@/shared/components/table/table-datetime-cell'
import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'
import { Button } from '@/shared/components/ui/button'

export function VenueReportedPage() {
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
        if (loc.state?.trim()) params.cityState = loc.state.trim()
        if (loc.city?.trim()) params.cityCity = loc.city.trim()
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

  const { data, isLoading } = useVenues({
    page: currentPage,
    limit: 10,
    status: 'reported',
    search: searchQuery,
    ...apiFilterParams,
  })

  const venues = useMemo(() => data?.data ?? [], [data?.data])
  const meta = data?.meta

  const handleApplyFilters = useCallback((values: FilterValues) => {
    setAppliedFilters(values)
    setCurrentPage(1)
  }, [])

  const handleExportData = useCallback(
    (values: FilterValues, format: string) => {
      const headers = [
        'Report ID',
        'Reported Venue',
        'Reported By',
        'Issue Type',
        'Reason',
        'Status',
        'Reported At',
      ]
      const rows = venues.map((v) => [
        (v as ReportedVenue).reportId || getVenueDisplayId(v) || '-',
        v.venueName || '-',
        (v as ReportedVenue).reportedBy || v.partnerName || '-',
        (v as ReportedVenue).issueType || '-',
        v.reason || '-',
        'Reported',
        (v as ReportedVenue).reportedAt || v.createdAt
          ? new Date(
              ((v as ReportedVenue).reportedAt || v.createdAt) as string,
            ).toLocaleDateString()
          : 'N/A',
      ])
      exportDataToFile(headers, rows, format, 'reported_venues_export')
    },
    [venues],
  )

  const {
    onAdvancedFilter,
    onExport,
    modals: exportFilterModals,
  } = useModuleExportFilters({
    moduleKey: 'venue-management',
    onApplyFilters: handleApplyFilters,
    onExportData: handleExportData,
  })

  const columns = useMemo<ColumnDef<Venue>[]>(
    () => [
      {
        id: 'reportId',
        accessorFn: () => null,
        header: 'Report ID',
        cell: ({ row }) => (
          <span className="ui-table-id uppercase">
            {(row.original as ReportedVenue).reportId || getVenueDisplayId(row.original)}
          </span>
        ),
      },
      {
        accessorKey: 'venueName',
        header: 'Reported Venue',
        cell: ({ row }) => <span className="font-medium text-white">{row.original.venueName}</span>,
      },
      {
        id: 'reportedBy',
        accessorFn: () => null,
        header: 'Reported By',
        cell: ({ row }) => (
          <span className="text-[#e2e2e2]">
            {(row.original as ReportedVenue).reportedBy || row.original.partnerName || 'Unknown'}
          </span>
        ),
      },
      {
        id: 'issueType',
        accessorFn: () => null,
        header: 'Issue Type',
        cell: ({ row }) => (
          <span className="text-[#e2e2e2]">{(row.original as ReportedVenue).issueType || '—'}</span>
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
            value={(row.original as ReportedVenue).reportedAt || row.original.createdAt}
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
          const venue = row.original
          const isOpen = activeDropdownId === venue._id

          return (
            <TableActionsDropdown
              label={`Open actions for ${venue.venueName}`}
              isOpen={isOpen}
              onOpenChange={(open) => setActiveDropdownId(open ? venue._id : null)}
              menuWidth={160}
            >
              <TableActionsItem
                icon={<Eye className="size-3.5" aria-hidden="true" />}
                onClick={() => {
                  setActiveDropdownId(null)
                  navigate(`/venues/management/profile/${venue._id}`)
                }}
              >
                View Venue
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
            onClick={() => navigateBackOrFallback(navigate, '/venues/management')}
            className="group font-heading hover:text-brand-accent flex w-fit items-center gap-2 text-[20px] font-bold tracking-tight text-white transition-colors"
          >
            <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-1" />
            <span>Reported Venues</span>
          </button>

          <div className="text-body-sm-medium text-muted flex items-center gap-1.5 pl-7">
            <button
              type="button"
              onClick={() => navigateBackOrFallback(navigate, '/venues/management')}
              className="transition-colors hover:text-white"
            >
              Venue Management
            </button>
            <span className="text-[#333333]">/</span>
            <span className="font-bold text-white">Reported Venues</span>
          </div>
        </header>

        <div className="flex w-full flex-col items-center gap-3 md:w-auto md:flex-row">
          <Button
            className="ui-manage-metrics h-9 w-full md:w-auto"
            onClick={() => navigate('/venues/management/metrics?section=table')}
          >
            <SlidersHorizontal className="size-4" />
            Manage Metrics
          </Button>
          <Button
            type="button"
            className="h-9 w-full md:w-auto"
            onClick={() => navigate('/venues/management/onboarding')}
          >
            <Plus className="size-4" />
            Create Account
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={venues}
        getRowId={(venue) => venue._id}
        isLoading={isLoading}
        searchValue={searchQuery}
        onSearchChange={(value) => {
          setSearchQuery(value)
          setCurrentPage(1)
        }}
        searchPlaceholder="Search by report ID, venue name, or reporter"
        onAdvancedFilter={onAdvancedFilter}
        onExport={onExport}
        pagination={{
          page: currentPage,
          pageSize: meta?.pagination.limit || 10,
          totalItems: meta?.pagination.total || 0,
          totalPages: meta?.pagination.pages || 1,
          onPageChange: setCurrentPage,
        }}
        resourceLabel="reports"
        emptyMessage="No reported venues found."
      />
      {exportFilterModals}
    </div>
  )
}
