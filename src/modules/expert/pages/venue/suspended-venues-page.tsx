import { useCallback, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { ArrowLeft, PlayCircle, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ManageMetricsIcon } from '@/shared/components/icons/action-button-icons'

import { navigateBackOrFallback } from '@/shared/lib/navigation'
import { toast } from 'sonner'
import type { FilterValues } from '@/shared/types/data-filter'
import { useModuleExportFilters } from '@/shared/components/advanced-filter/use-module-export-filters'
import { exportDisplayValue } from '@/shared/utils/export-utils'
import {
  buildVenueListQueryParams,
  createVenueFilteredExportHandler,
} from '@/shared/utils/export-filter-utils'
import { fetchVenues } from '../../api/venue-api'

import { useActivateVenue, useVenues } from '../../hooks/use-venues'
import { useVenueManagementControls } from '@/modules/settings/hooks/use-venue-public-settings'
import type { Venue } from '../../type/venue'
import { getVenueApiId, getVenueDisplayId } from '../../utils/venue-list'
import { DataTable } from '@/shared/components/table/data-table'
import { useServerTableSort } from '@/shared/hooks/use-server-table-sort'
import { useEnhancedSearch } from '@/shared/hooks/use-enhanced-search'
import { withServerSortMeta } from '@/shared/utils/table-sort'
import { VENUE_SUSPENDED_SORT_FIELDS } from '@/shared/utils/table-sort-field-maps'
import { VENUE_SUSPENDED_SEARCH_COLUMNS } from '@/shared/components/table/search-configs'
import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'
import { Button } from '@/shared/components/ui/button'

import { useTableColumnPreferences } from '../../hooks/use-ui-preferences'
import {
  VENUE_SUSPENDED_MODULE_KEY,
  DEFAULT_VENUE_SUSPENDED_VISIBLE_COLUMN_IDS,
} from '@/modules/expert/config/venue-management-table-columns.config'
import { TableDateTimeCell } from '@/shared/components/table/table-datetime-cell'

const EXPORT_COLUMN_MAP: Record<string, { header: string; accessor: (v: Venue) => string }> = {
  'suspension-id': {
    header: 'Suspension ID',
    accessor: (v) => exportDisplayValue(v.suspensionId || `SUS-${getVenueDisplayId(v)}`),
  },
  'venue-id': { header: 'Venue ID', accessor: (v) => exportDisplayValue(getVenueDisplayId(v)) },
  'venue-name': { header: 'Venue Name', accessor: (v) => exportDisplayValue(v.venueName) },
  'suspension-reason': {
    header: 'Suspension Reason',
    accessor: (v) => exportDisplayValue(v.suspensionReason || v.reason || 'Policy Violation'),
  },
  'suspended-by': {
    header: 'Suspended By',
    accessor: (v) => exportDisplayValue(v.suspendedBy || 'Admin'),
  },
  'admin-id': { header: 'Admin ID', accessor: (v) => exportDisplayValue(v.adminId || 'ADM-001') },
  'suspended-at': {
    header: 'Suspended At',
    accessor: (v) => {
      const d = v.suspendedAt || v.updatedAt
      return d
        ? new Date(d).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
        : ''
    },
  },
  'suspension-until': {
    header: 'Suspension Until',
    accessor: (v) => {
      const d = v.suspensionUntil
      return d && d !== 'Permanent'
        ? new Date(d).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
        : 'Permanent'
    },
  },
  'escalated-by': {
    header: 'Escalated By',
    accessor: (v) => exportDisplayValue(v.escalatedBy || 'Admin'),
  },
  'escalation-reason': {
    header: 'Escalation Reason',
    accessor: (v) => exportDisplayValue(v.escalationReason || '—'),
  },
  'escalated-at': {
    header: 'Escalated At',
    accessor: (v) => {
      const d = v.escalatedAt
      return d
        ? new Date(d).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
        : ''
    },
  },
  'compliance-status': {
    header: 'Compliance Status',
    accessor: (v) => exportDisplayValue(v.complianceStatus || 'Pending Review'),
  },
}

export function VenueSuspendedPage() {
  const navigate = useNavigate()
  const { allowAddVenues } = useVenueManagementControls()
  const [currentPage, setCurrentPage] = useState(1)
  const serverSort = useServerTableSort({
    sortFieldMap: VENUE_SUSPENDED_SORT_FIELDS,
    onPageReset: () => setCurrentPage(1),
  })
  const enhancedSearch = useEnhancedSearch({ onSearchChange: () => setCurrentPage(1) })
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null)
  const [selectedVenueIds, setSelectedVenueIds] = useState<string[]>([])
  const [appliedFilters, setAppliedFilters] = useState<FilterValues>({})

  const tableColumnPreferencesQuery = useTableColumnPreferences(VENUE_SUSPENDED_MODULE_KEY)

  const venueQueryParams = useMemo(
    () =>
      buildVenueListQueryParams(appliedFilters, {
        page: currentPage,
        limit: 10,
        ...serverSort.sortParams,
        ...enhancedSearch.buildSearchParams(),
        status: 'suspended',
      }),
    [appliedFilters, currentPage, enhancedSearch, serverSort.sortParams],
  )

  const { data, isLoading } = useVenues(venueQueryParams)

  const activateVenueMutation = useActivateVenue()

  const venues = useMemo(() => data?.data ?? [], [data?.data])
  const meta = data?.meta
  const visibleVenueIds = useMemo(() => venues.map((venue) => venue._id), [venues])
  const allVisibleVenuesSelected =
    visibleVenueIds.length > 0 && visibleVenueIds.every((id) => selectedVenueIds.includes(id))
  const someVisibleVenuesSelected = visibleVenueIds.some((id) => selectedVenueIds.includes(id))

  const handleApplyFilters = useCallback((values: FilterValues) => {
    setAppliedFilters(values)
    setCurrentPage(1)
  }, [])

  const handleExportData = useMemo(
    () =>
      createVenueFilteredExportHandler(fetchVenues, EXPORT_COLUMN_MAP, 'suspended_venues_export', {
        status: 'suspended',
      }),
    [],
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

  const toggleVisibleVenues = useCallback(() => {
    setSelectedVenueIds((currentIds) => {
      if (allVisibleVenuesSelected) {
        return currentIds.filter((id) => !visibleVenueIds.includes(id))
      }

      return Array.from(new Set([...currentIds, ...visibleVenueIds]))
    })
  }, [allVisibleVenuesSelected, visibleVenueIds])

  const toggleVenueSelection = useCallback((venueId: string) => {
    setSelectedVenueIds((currentIds) =>
      currentIds.includes(venueId)
        ? currentIds.filter((id) => id !== venueId)
        : [...currentIds, venueId],
    )
  }, [])

  const handleActivate = useCallback(
    (venue: Venue) => {
      activateVenueMutation.mutate(getVenueApiId(venue), {
        onSuccess: () => {
          toast.success('Venue activated successfully')
        },
        onError: (error: unknown) => {
          const err = error as { response?: { data?: { message?: string } } }
          toast.error(err?.response?.data?.message || 'Failed to activate venue. Please try again.')
        },
      })
    },
    [activateVenueMutation],
  )

  const columns = useMemo<ColumnDef<Venue>[]>(() => {
    const selectColumn: ColumnDef<Venue> = {
      id: 'select',
      header: () => (
        <input
          type="checkbox"
          aria-label="Select all suspended venues"
          checked={allVisibleVenuesSelected}
          ref={(input) => {
            if (input) input.indeterminate = someVisibleVenuesSelected && !allVisibleVenuesSelected
          }}
          onChange={toggleVisibleVenues}
          className="rounded border-slate-700 bg-transparent"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          aria-label={`Select ${row.original.venueName}`}
          checked={selectedVenueIds.includes(row.original._id)}
          onChange={() => toggleVenueSelection(row.original._id)}
          onClick={(event) => event.stopPropagation()}
          className="rounded border-slate-700 bg-transparent"
        />
      ),
      meta: {
        headerClassName: 'pl-5',
        cellClassName: 'pl-5',
      },
    }

    const dataColumnsById: Record<string, ColumnDef<Venue>> = {
      'suspension-id': {
        id: 'suspension-id',
        accessorKey: 'suspensionId',
        header: 'Suspension ID',
        cell: ({ row }) => (
          <span className="font-mono font-semibold text-[#E5B54E]">
            {row.original.suspensionId || `SUS-${getVenueDisplayId(row.original)}`}
          </span>
        ),
      },
      'venue-id': {
        id: 'venue-id',
        accessorKey: 'venueid',
        header: 'Venue ID',
        cell: ({ row }) => (
          <span className="ui-table-id uppercase">{getVenueDisplayId(row.original)}</span>
        ),
      },
      'venue-name': {
        id: 'venue-name',
        accessorKey: 'venueName',
        header: 'Venue Name',
        cell: ({ row }) => (
          <span className="font-medium text-white">{row.original.venueName || '—'}</span>
        ),
      },
      'suspension-reason': {
        id: 'suspension-reason',
        accessorKey: 'suspensionReason',
        header: 'Suspension Reason',
        cell: ({ row }) => (
          <span
            className="block max-w-[200px] truncate text-slate-300"
            title={row.original.suspensionReason || 'Policy Violation'}
          >
            {row.original.suspensionReason || row.original.reason || 'Policy Violation'}
          </span>
        ),
      },
      'suspended-by': {
        id: 'suspended-by',
        accessorKey: 'suspendedBy',
        header: 'Suspended By',
        cell: ({ row }) => (
          <span className="text-slate-300">{row.original.suspendedBy || 'Admin'}</span>
        ),
      },
      'admin-id': {
        id: 'admin-id',
        accessorKey: 'adminId',
        header: 'Admin ID',
        cell: ({ row }) => <span className="ui-table-id">{row.original.adminId || 'ADM-001'}</span>,
      },
      'suspended-at': {
        id: 'suspended-at',
        accessorKey: 'suspendedAt',
        header: 'Suspended At',
        cell: ({ row }) => (
          <TableDateTimeCell value={row.original.suspendedAt || row.original.updatedAt} />
        ),
      },
      'suspension-until': {
        id: 'suspension-until',
        accessorKey: 'suspensionUntil',
        header: 'Suspension Until',
        cell: ({ row }) => {
          const until = row.original.suspensionUntil
          return until && until !== 'Permanent' ? (
            <TableDateTimeCell value={until} />
          ) : (
            <span className="text-slate-400">Permanent</span>
          )
        },
      },
      'escalated-by': {
        id: 'escalated-by',
        accessorKey: 'escalatedBy',
        header: 'Escalated By',
        cell: ({ row }) => (
          <span className="text-slate-300">{row.original.escalatedBy || 'Admin'}</span>
        ),
      },
      'escalation-reason': {
        id: 'escalation-reason',
        accessorKey: 'escalationReason',
        header: 'Escalation Reason',
        cell: ({ row }) => (
          <span className="text-slate-300">{row.original.escalationReason || '—'}</span>
        ),
      },
      'escalated-at': {
        id: 'escalated-at',
        accessorKey: 'escalatedAt',
        header: 'Escalated At',
        cell: ({ row }) =>
          row.original.escalatedAt ? <TableDateTimeCell value={row.original.escalatedAt} /> : '—',
      },
      'compliance-status': {
        id: 'compliance-status',
        accessorKey: 'complianceStatus',
        header: 'Compliance Status',
        cell: ({ row }) => {
          const status = row.original.complianceStatus || 'Pending Review'
          const isResolved = status === 'Resolved'
          return (
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                isResolved ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'
              }`}
            >
              {status}
            </span>
          )
        },
      },
    }

    const visibleIds = tableColumnPreferencesQuery.data?.visibleColumnIds?.length
      ? tableColumnPreferencesQuery.data.visibleColumnIds
      : DEFAULT_VENUE_SUSPENDED_VISIBLE_COLUMN_IDS

    const preferenceColumns = visibleIds.map((id) => dataColumnsById[id]).filter(Boolean)

    const actionsColumn: ColumnDef<Venue> = {
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
              icon={<PlayCircle className="size-3.5" aria-hidden="true" />}
              onClick={() => {
                setActiveDropdownId(null)
                handleActivate(venue)
              }}
            >
              Active Venue
            </TableActionsItem>
          </TableActionsDropdown>
        )
      },
    }

    return withServerSortMeta(
      [selectColumn, ...preferenceColumns, actionsColumn],
      VENUE_SUSPENDED_SORT_FIELDS,
    )
  }, [
    activeDropdownId,
    allVisibleVenuesSelected,
    handleActivate,
    selectedVenueIds,
    someVisibleVenuesSelected,
    tableColumnPreferencesQuery.data,
    toggleVenueSelection,
    toggleVisibleVenues,
  ])

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
            <span>Suspended Venues</span>
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
            <span className="font-bold text-white">Suspended Venues</span>
          </div>
        </header>

        <div className="flex w-full flex-col items-center gap-3 md:w-auto md:flex-row">
          <Button
            className="ui-manage-metrics h-9 w-full md:w-auto"
            onClick={() =>
              navigate('/metrics/venue-suspended?returnTo=/venues/management/suspended')
            }
          >
            <ManageMetricsIcon className="size-4 shrink-0" />
            Manage Metrics
          </Button>
          <Button
            type="button"
            className="h-9 w-full md:w-auto"
            disabled={!allowAddVenues}
            onClick={() => {
              if (!allowAddVenues) {
                toast.error('Creating venues is turned off in Venue Management settings')
                return
              }
              navigate('/venues/management/onboarding')
            }}
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
        searchValue={enhancedSearch.globalSearch}
        onSearchChange={enhancedSearch.setGlobalSearch}
        searchableColumns={VENUE_SUSPENDED_SEARCH_COLUMNS}
        columnSearches={enhancedSearch.columnSearches}
        onColumnSearchChange={enhancedSearch.setColumnSearch}
        onColumnSearchRemove={enhancedSearch.removeColumnSearch}
        onClearAllSearches={enhancedSearch.clearAll}
        searchPlaceholder="Search by name, ID or profession"
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
        resourceLabel="venues"
        emptyMessage="No suspended venues found."
      />
      {exportFilterModals}
    </div>
  )
}
