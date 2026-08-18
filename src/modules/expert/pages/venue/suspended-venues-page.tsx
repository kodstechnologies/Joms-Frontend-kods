import { useCallback, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { ArrowLeft, PlayCircle, Plus, SlidersHorizontal } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

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
import { getVenueApiId, getVenueDisplayId, getVenueDisplaySpaceId } from '../../utils/venue-list'
import { DataTable } from '@/shared/components/table/data-table'
import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'
import { Button } from '@/shared/components/ui/button'

const EXPORT_COLUMN_MAP: Record<string, { header: string; accessor: (v: Venue) => string }> = {
  venueId: { header: 'Venue ID', accessor: (v) => exportDisplayValue(getVenueDisplayId(v)) },
  venueName: { header: 'Name', accessor: (v) => exportDisplayValue(v.venueName) },
  partnerName: { header: 'Expert Name', accessor: (v) => exportDisplayValue(v.partnerName) },
  city: { header: 'Location', accessor: (v) => exportDisplayValue(v.city) },
  eventType: { header: 'Venue Type', accessor: (v) => exportDisplayValue(v.eventType) },
  spaceId: { header: 'Space ID', accessor: (v) => exportDisplayValue(getVenueDisplaySpaceId(v)) },
  spaceName: { header: 'Space Name', accessor: (v) => exportDisplayValue(v.spaceName) },
  venueCategory: { header: 'Event Type', accessor: (v) => exportDisplayValue(v.venueCategory) },
  status: { header: 'Status', accessor: (v) => exportDisplayValue(v.status) },
  createdAt: {
    header: 'Created At',
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
}

export function VenueSuspendedPage() {
  const navigate = useNavigate()
  const { allowAddVenues } = useVenueManagementControls()
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null)
  const [selectedVenueIds, setSelectedVenueIds] = useState<string[]>([])
  const [appliedFilters, setAppliedFilters] = useState<FilterValues>({})

  const venueQueryParams = useMemo(
    () =>
      buildVenueListQueryParams(appliedFilters, {
        page: currentPage,
        limit: 10,
        search: searchQuery,
        status: 'suspended',
      }),
    [appliedFilters, currentPage, searchQuery],
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

  const columns = useMemo<ColumnDef<Venue>[]>(
    () => [
      {
        id: 'select',
        header: () => (
          <input
            type="checkbox"
            aria-label="Select all suspended venues"
            checked={allVisibleVenuesSelected}
            ref={(input) => {
              if (input)
                input.indeterminate = someVisibleVenuesSelected && !allVisibleVenuesSelected
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
        cell: ({ row }) => <span className="font-medium text-white">{row.original.venueName}</span>,
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
      },
    ],
    [
      activeDropdownId,
      allVisibleVenuesSelected,
      handleActivate,
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
            onClick={() => navigate('/venues/management/metrics?section=table')}
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
        searchPlaceholder="Search by name, ID or profession"
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
        emptyMessage="No suspended venues found."
      />
      {exportFilterModals}
    </div>
  )
}
