import { useCallback, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { ArrowLeft, Eye, PlayCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import createIcon from '@/assets/JOMS_ICONS-2/icons8-create.svg'
import { ManageMetricsIcon } from '@/shared/components/icons/action-button-icons'
import { getApiErrorMessage } from '@/shared/lib/api-error'

import { navigateBackOrFallback } from '@/shared/lib/navigation'
import { PageBreadcrumb } from '@/shared/components/navigation/page-breadcrumb'
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
import { getVenueApiId, getVenueDisplayId, getVenueDisplaySpaceId } from '../../utils/venue-list'
import { DataTable } from '@/shared/components/table/data-table'
import { useServerTableSort } from '@/shared/hooks/use-server-table-sort'
import { useEnhancedSearch } from '@/shared/hooks/use-enhanced-search'
import { withServerSortMeta } from '@/shared/utils/table-sort'
import { VENUE_REJECTED_SORT_FIELDS } from '@/shared/utils/table-sort-field-maps'
import { VENUE_REJECTED_SEARCH_COLUMNS } from '@/shared/components/table/search-configs'
import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'
import { Button } from '@/shared/components/ui/button'

const EXPORT_COLUMN_MAP: Record<string, { header: string; accessor: (v: Venue) => string }> = {
  venueId: { header: 'Venue ID', accessor: (v) => exportDisplayValue(getVenueDisplayId(v)) },
  venueName: { header: 'Name', accessor: (v) => exportDisplayValue(v.venueName) },
  eventType: { header: 'Venue Type', accessor: (v) => exportDisplayValue(v.eventType) },
  spaceId: { header: 'Space ID', accessor: (v) => exportDisplayValue(getVenueDisplaySpaceId(v)) },
  spaceName: { header: 'Space Name', accessor: (v) => exportDisplayValue(v.spaceName) },
  venueCategory: { header: 'Event Type', accessor: (v) => exportDisplayValue(v.venueCategory) },
}

export function RejectedVenuesPage() {
  const navigate = useNavigate()
  const { allowAddVenues } = useVenueManagementControls()
  const [currentPage, setCurrentPage] = useState(1)
  const serverSort = useServerTableSort({
    sortFieldMap: VENUE_REJECTED_SORT_FIELDS,
    onPageReset: () => setCurrentPage(1),
  })
  const enhancedSearch = useEnhancedSearch({ onSearchChange: () => setCurrentPage(1) })
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null)
  const [selectedVenueIds, setSelectedVenueIds] = useState<string[]>([])
  const [appliedFilters, setAppliedFilters] = useState<FilterValues>({})

  const venueQueryParams = useMemo(
    () =>
      buildVenueListQueryParams(appliedFilters, {
        page: currentPage,
        limit: 10,
        ...serverSort.sortParams,
        ...enhancedSearch.buildSearchParams(),
        status: 'rejected',
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
      createVenueFilteredExportHandler(fetchVenues, EXPORT_COLUMN_MAP, 'rejected_venues_export', {
        status: 'rejected',
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
          toast.error(getApiErrorMessage(err, 'Failed to activate venue. Please try again.'))
        },
      })
    },
    [activateVenueMutation],
  )

  const columns = useMemo<ColumnDef<Venue>[]>(
    () =>
      withServerSortMeta(
        [
          {
            id: 'select',
            header: () => (
              <input
                type="checkbox"
                aria-label="Select all rejected venues"
                checked={allVisibleVenuesSelected}
                ref={(input) => {
                  if (input)
                    input.indeterminate = someVisibleVenuesSelected && !allVisibleVenuesSelected
                }}
                onChange={toggleVisibleVenues}
                className="ui-table-checkbox"
              />
            ),
            cell: ({ row }) => (
              <input
                type="checkbox"
                aria-label={`Select ${row.original.venueName}`}
                checked={selectedVenueIds.includes(row.original._id)}
                onChange={() => toggleVenueSelection(row.original._id)}
                onClick={(event) => event.stopPropagation()}
                className="ui-table-checkbox"
              />
            ),
            meta: {
              headerClassName: 'pl-5',
              cellClassName: 'pl-5',
            },
          },
          {
            accessorKey: 'venueid',
            header: 'Venue ID',
            cell: ({ row }) => (
              <span className="ui-table-id uppercase">{getVenueDisplayId(row.original)}</span>
            ),
          },
          {
            accessorKey: 'venueName',
            header: 'Name',
            cell: ({ row }) => (
              <span className="font-medium text-white">{row.original.venueName}</span>
            ),
          },
          {
            accessorKey: 'eventType',
            header: 'Venue Type',
            cell: ({ row }) => row.original.eventType || '—',
          },
          {
            accessorKey: 'spaceid',
            header: 'Space ID',
            cell: ({ row }) => (
              <span className="ui-table-id">{getVenueDisplaySpaceId(row.original)}</span>
            ),
          },
          {
            accessorKey: 'spaceName',
            header: 'Space Name',
            cell: ({ row }) => row.original.spaceName || '—',
          },
          {
            accessorKey: 'venueCategory',
            header: 'Event Type',
            cell: ({ row }) => row.original.venueCategory || '—',
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
                  menuWidth={176}
                >
                  <TableActionsItem
                    icon={<Eye className="size-3.5" aria-hidden="true" />}
                    onClick={() => {
                      setActiveDropdownId(null)
                      navigate(`/venues/management/profile/${getVenueApiId(venue)}`)
                    }}
                  >
                    View Profile
                  </TableActionsItem>
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
          },
        ],
        VENUE_REJECTED_SORT_FIELDS,
      ),
    [
      activeDropdownId,
      allVisibleVenuesSelected,
      handleActivate,
      navigate,
      selectedVenueIds,
      someVisibleVenuesSelected,
      toggleVenueSelection,
      toggleVisibleVenues,
    ],
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
            <span>rejected venues</span>
          </button>

          <div className="pl-7">
            <PageBreadcrumb
              items={[
                { label: 'Venue Management', to: '/venues/management' },
                { label: 'Rejected Venues', isActive: true },
              ]}
            />
          </div>
        </header>

        <div className="flex w-full flex-col items-center gap-3 md:w-auto md:flex-row">
          <Button
            className="ui-manage-metrics h-9 w-full md:w-auto"
            onClick={() => navigate('/venues/management/metrics?section=table')}
          >
            <ManageMetricsIcon />
            Manage Metrics
          </Button>
          {allowAddVenues ? (
            <Button
              type="button"
              className="h-9 w-full md:w-auto"
              onClick={() => navigate('/venues/management/onboarding')}
            >
              <img src={createIcon} alt="create" className="size-4" />
              Create Account
            </Button>
          ) : null}
        </div>
      </div>

      <DataTable
        columns={columns}
        data={venues}
        getRowId={(venue) => venue._id}
        isLoading={isLoading}
        searchValue={enhancedSearch.globalSearch}
        onSearchChange={enhancedSearch.setGlobalSearch}
        searchableColumns={VENUE_REJECTED_SEARCH_COLUMNS}
        columnSearches={enhancedSearch.columnSearches}
        onColumnSearchChange={enhancedSearch.setColumnSearch}
        onColumnSearchRemove={enhancedSearch.removeColumnSearch}
        onClearAllSearches={enhancedSearch.clearAll}
        searchPlaceholder="Search by venue name or ID"
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
        emptyMessage="No rejected venues found."
      />
      {exportFilterModals}
    </div>
  )
}
