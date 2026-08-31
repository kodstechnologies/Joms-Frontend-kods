import { useCallback, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { ArrowLeft, CheckCircle2, ClipboardCheck, Eye, SlidersHorizontal } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import createIcon from '@/assets/JOMS_ICONS-2/icons8-create.svg'

import { navigateBackOrFallback } from '@/shared/lib/navigation'
import type { FilterValues } from '@/shared/types/data-filter'
import { useModuleExportFilters } from '@/shared/components/advanced-filter/use-module-export-filters'
import { useVenueManagementControls } from '@/modules/settings/hooks/use-venue-public-settings'
import { exportDisplayValue } from '@/shared/utils/export-utils'
import {
  buildVenueListQueryParams,
  createVenueFilteredExportHandler,
} from '@/shared/utils/export-filter-utils'
import { fetchVenues } from '../../api/venue-api'

import { useVenues } from '../../hooks/use-venues'
import type { Venue } from '../../type/venue'
import { getVenueApiId, getVenueDisplayId, getVenueDisplaySpaceId } from '../../utils/venue-list'
import { DataTable } from '@/shared/components/table/data-table'
import { useServerTableSort } from '@/shared/hooks/use-server-table-sort'
import { useEnhancedSearch } from '@/shared/hooks/use-enhanced-search'
import { withServerSortMeta } from '@/shared/utils/table-sort'
import { VENUE_PENDING_SORT_FIELDS } from '@/shared/utils/table-sort-field-maps'
import { VENUE_PENDING_SEARCH_COLUMNS } from '@/shared/components/table/search-configs'
import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'
import { Button } from '@/shared/components/ui/button'

import { useTableColumnPreferences } from '../../hooks/use-ui-preferences'
import {
  VENUE_PENDING_APPROVALS_MODULE_KEY,
  DEFAULT_VENUE_PENDING_APPROVALS_VISIBLE_COLUMN_IDS,
} from '@/modules/expert/config/venue-management-table-columns.config'
import { TableDateTimeCell } from '@/shared/components/table/table-datetime-cell'
import { getManagementStatusDisplay } from '../../utils/management-status'

const EXPORT_COLUMN_MAP: Record<string, { header: string; accessor: (v: Venue) => string }> = {
  'venue-id': { header: 'Venue ID', accessor: (v) => exportDisplayValue(getVenueDisplayId(v)) },
  'venue-name': { header: 'Venue Name', accessor: (v) => exportDisplayValue(v.venueName) },
  'venue-category': {
    header: 'Venue Category',
    accessor: (v) => exportDisplayValue(v.venueCategory),
  },
  'venue-type': {
    header: 'Venue Type',
    accessor: (v) => exportDisplayValue(v.venueType || v.eventType),
  },
  'venue-location': {
    header: 'Venue Location',
    accessor: (v) => exportDisplayValue(v.venueLocation),
  },
  'venue-status': { header: 'Venue Status', accessor: (v) => exportDisplayValue(v.status) },
  'space-id': {
    header: 'Space ID',
    accessor: (v) => exportDisplayValue(getVenueDisplaySpaceId(v)),
  },
  'space-name': { header: 'Space Name', accessor: (v) => exportDisplayValue(v.spaceName) },
  'space-category': {
    header: 'Space Category',
    accessor: (v) => exportDisplayValue(v.spaceCategory),
  },
  'space-location': {
    header: 'Space Location',
    accessor: (v) => exportDisplayValue(v.spaceLocation),
  },
  'space-type': { header: 'Space Type', accessor: (v) => exportDisplayValue(v.spaceType) },
  'space-status': { header: 'Space Status', accessor: (v) => exportDisplayValue(v.spaceStatus) },
  city: { header: 'City', accessor: (v) => exportDisplayValue(v.city) },
  'submitted-at': {
    header: 'Submitted At',
    accessor: (v) =>
      v.createdAt
        ? new Date(v.createdAt).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
        : '',
  },
  'submitted-by': {
    header: 'Submitted By',
    accessor: (v) => exportDisplayValue(v.submittedBy || (v.ownerId ? 'Host' : 'Admin')),
  },
}

export function VenuePendingApprovalsPage() {
  const navigate = useNavigate()
  const { allowAddVenues } = useVenueManagementControls()
  const [currentPage, setCurrentPage] = useState(1)
  const serverSort = useServerTableSort({
    sortFieldMap: VENUE_PENDING_SORT_FIELDS,
    onPageReset: () => setCurrentPage(1),
  })
  const enhancedSearch = useEnhancedSearch({ onSearchChange: () => setCurrentPage(1) })
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null)
  const [selectedVenueIds, setSelectedVenueIds] = useState<string[]>([])
  const [appliedFilters, setAppliedFilters] = useState<FilterValues>({})

  const tableColumnPreferencesQuery = useTableColumnPreferences(VENUE_PENDING_APPROVALS_MODULE_KEY)

  const venueQueryParams = useMemo(
    () =>
      buildVenueListQueryParams(appliedFilters, {
        page: currentPage,
        limit: 10,
        ...serverSort.sortParams,
        ...enhancedSearch.buildSearchParams(),
        status: 'in_review',
      }),
    [appliedFilters, currentPage, enhancedSearch, serverSort.sortParams],
  )

  const { data, isLoading } = useVenues(venueQueryParams)

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
      createVenueFilteredExportHandler(fetchVenues, EXPORT_COLUMN_MAP, 'pending_venues_export', {
        status: 'in_review',
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

  const columns = useMemo<ColumnDef<Venue>[]>(() => {
    const selectColumn: ColumnDef<Venue> = {
      id: 'select',
      header: () => (
        <input
          type="checkbox"
          aria-label="Select all pending venues"
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
      'venue-category': {
        id: 'venue-category',
        accessorKey: 'venueCategory',
        header: 'Venue Category',
        cell: ({ row }) => (
          <span className="text-slate-300">{row.original.venueCategory || '—'}</span>
        ),
      },
      'venue-type': {
        id: 'venue-type',
        accessorKey: 'venueType',
        header: 'Venue Type',
        cell: ({ row }) => (
          <span className="text-slate-300">
            {row.original.venueType || row.original.eventType || '—'}
          </span>
        ),
      },
      'venue-location': {
        id: 'venue-location',
        accessorKey: 'venueLocation',
        header: 'Venue Location',
        cell: ({ row }) => (
          <span
            className="block max-w-[200px] truncate text-slate-300"
            title={row.original.venueLocation}
          >
            {row.original.venueLocation || '—'}
          </span>
        ),
      },
      'venue-status': {
        id: 'venue-status',
        accessorKey: 'status',
        header: 'Venue Status',
        cell: ({ row }) => {
          const { label, className } = getManagementStatusDisplay(row.original.status, {
            isSuspend: row.original.isSuspend,
          })
          return <span className={className}>{label}</span>
        },
      },
      'space-id': {
        id: 'space-id',
        accessorKey: 'spaceid',
        header: 'Space ID',
        cell: ({ row }) => (
          <span className="ui-table-id">{getVenueDisplaySpaceId(row.original)}</span>
        ),
      },
      'space-name': {
        id: 'space-name',
        accessorKey: 'spaceName',
        header: 'Space Name',
        cell: ({ row }) => row.original.spaceName || '—',
      },
      'space-category': {
        id: 'space-category',
        accessorKey: 'spaceCategory',
        header: 'Space Category',
        cell: ({ row }) => (
          <span className="text-slate-300">{row.original.spaceCategory || '—'}</span>
        ),
      },
      'space-location': {
        id: 'space-location',
        accessorKey: 'spaceLocation',
        header: 'Space Location',
        cell: ({ row }) => (
          <span
            className="block max-w-[180px] truncate text-slate-300"
            title={row.original.spaceLocation}
          >
            {row.original.spaceLocation || '—'}
          </span>
        ),
      },
      'space-type': {
        id: 'space-type',
        accessorKey: 'spaceType',
        header: 'Space Type',
        cell: ({ row }) => <span className="text-slate-300">{row.original.spaceType || '—'}</span>,
      },
      'space-status': {
        id: 'space-status',
        accessorKey: 'spaceStatus',
        header: 'Space Status',
        cell: ({ row }) => {
          const status = row.original.spaceStatus || 'submitted'
          const { label, className } = getManagementStatusDisplay(status, {})
          return <span className={className}>{label}</span>
        },
      },
      city: {
        id: 'city',
        accessorKey: 'city',
        header: 'City',
        cell: ({ row }) => row.original.city || '—',
      },
      'submitted-at': {
        id: 'submitted-at',
        accessorKey: 'submittedAt',
        header: 'Submitted At',
        cell: ({ row }) => <TableDateTimeCell value={row.original.createdAt} />,
      },
      'submitted-by': {
        id: 'submitted-by',
        accessorKey: 'submittedBy',
        header: 'Submitted By',
        cell: ({ row }) => (
          <span className="text-slate-300">
            {row.original.submittedBy || (row.original.ownerId ? 'Host' : 'Admin')}
          </span>
        ),
      },
    }

    const visibleIds = tableColumnPreferencesQuery.data?.visibleColumnIds?.length
      ? tableColumnPreferencesQuery.data.visibleColumnIds
      : DEFAULT_VENUE_PENDING_APPROVALS_VISIBLE_COLUMN_IDS

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
            menuWidth={190}
          >
            <TableActionsItem
              icon={<Eye className="size-3.5" aria-hidden="true" />}
              onClick={() => {
                setActiveDropdownId(null)
                navigate(`/venues/management/create?venueId=${getVenueApiId(venue)}&view=true`)
              }}
            >
              View Details
            </TableActionsItem>

            <TableActionsItem
              icon={<ClipboardCheck className="size-3.5" aria-hidden="true" />}
              onClick={() => {
                setActiveDropdownId(null)
                navigate(`/venues/management/application/${getVenueApiId(venue)}`)
              }}
            >
              View Application
            </TableActionsItem>
            <TableActionsItem
              icon={<CheckCircle2 className="size-3.5 text-emerald-400" aria-hidden="true" />}
              onClick={() => {
                setActiveDropdownId(null)
                navigate(`/venues/management/application/${getVenueApiId(venue)}`)
              }}
            >
              Approve Application
            </TableActionsItem>
          </TableActionsDropdown>
        )
      },
    }

    return withServerSortMeta(
      [selectColumn, ...preferenceColumns, actionsColumn],
      VENUE_PENDING_SORT_FIELDS,
    )
  }, [
    activeDropdownId,
    allVisibleVenuesSelected,
    navigate,
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
            <span>Pending Approvals</span>
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
            <span className="font-bold text-white">Pending Approvals</span>
          </div>
        </header>

        <div className="flex w-full flex-col items-center gap-3 md:w-auto md:flex-row">
          <Button
            className="ui-manage-metrics h-9 w-full md:w-auto"
            onClick={() =>
              navigate('/metrics/venue-pending-approvals?returnTo=/venues/management/pending')
            }
          >
            <SlidersHorizontal className="size-4" />
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
            <img src={createIcon} alt="create" className="size-4" />
            Create Account
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={venues}
        getRowId={(venue) => venue._id}
        {...serverSort.dataTableSortProps}
        isLoading={isLoading}
        searchValue={enhancedSearch.globalSearch}
        onSearchChange={enhancedSearch.setGlobalSearch}
        searchableColumns={VENUE_PENDING_SEARCH_COLUMNS}
        columnSearches={enhancedSearch.columnSearches}
        onColumnSearchChange={enhancedSearch.setColumnSearch}
        onColumnSearchRemove={enhancedSearch.removeColumnSearch}
        onClearAllSearches={enhancedSearch.clearAll}
        searchPlaceholder="Search by venue name or ID"
        onAdvancedFilter={onAdvancedFilter}
        onExport={onExport}
        pagination={{
          page: currentPage,
          pageSize: meta?.pagination.limit || 10,
          totalItems: meta?.pagination.total || 0,
          totalPages: meta?.pagination.pages || 1,
          onPageChange: setCurrentPage,
        }}
        resourceLabel="venues"
        emptyMessage="No pending venues found."
      />
      {exportFilterModals}
    </div>
  )
}
