import { useCallback, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { ArrowLeft, RotateCcw, Upload } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { formatDeletedAt } from '../../constants/soft-delete'
import { useRestoreVenue, useVenues } from '../../hooks/use-venues'
import type { Venue } from '../../type/venue'
import {
  getVenueApiId,
  getVenueDisplayId,
  getVenueDisplaySpaceId,
} from '../../utils/venue-list'
import { DataTable } from '@/shared/components/table/data-table'
import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'

export function VenueDeletedPage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null)
  const [selectedVenueIds, setSelectedVenueIds] = useState<string[]>([])

  const { data, isLoading } = useVenues({
    page: currentPage,
    limit: 10,
    status: 'deleted',
    search: searchQuery,
  })
  const restoreVenueMutation = useRestoreVenue()

  const venues = data?.data || []
  const meta = data?.meta
  const visibleVenueIds = useMemo(() => venues.map((venue) => venue._id), [venues])
  const allVisibleVenuesSelected =
    visibleVenueIds.length > 0 && visibleVenueIds.every((id) => selectedVenueIds.includes(id))
  const someVisibleVenuesSelected = visibleVenueIds.some((id) => selectedVenueIds.includes(id))

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

  const handleRestore = useCallback(
    (venue: Venue) => {
      restoreVenueMutation.mutate(getVenueApiId(venue), {
        onSuccess: () => toast.success('Venue restored successfully'),
        onError: (error: unknown) => {
          const err = error as { response?: { data?: { message?: string } } }
          toast.error(err?.response?.data?.message || 'Failed to restore venue.')
        },
      })
    },
    [restoreVenueMutation],
  )

  const columns = useMemo<ColumnDef<Venue>[]>(
    () => [
      {
        id: 'select',
        header: () => (
          <input
            type="checkbox"
            aria-label="Select all deleted venues"
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
        meta: { headerClassName: 'pl-5', cellClassName: 'pl-5' },
      },
      {
        accessorKey: 'venueid',
        header: 'Venue ID',
        cell: ({ row }) => (
          <span className="font-mono text-xs uppercase">{getVenueDisplayId(row.original)}</span>
        ),
      },
      { accessorKey: 'venueName', header: 'Name' },
      {
        accessorKey: 'eventType',
        header: 'Venue Type',
        cell: ({ row }) => row.original.eventType || '—',
      },
      {
        accessorKey: 'spaceid',
        header: 'Space ID',
        cell: ({ row }) => (
          <span className="font-mono text-xs">{getVenueDisplaySpaceId(row.original)}</span>
        ),
      },
      { accessorKey: 'spaceName', header: 'Space Name', cell: ({ row }) => row.original.spaceName || '—' },
      {
        accessorKey: 'reason',
        header: 'Reason',
        cell: ({ row }) => row.original.reason || '—',
      },
      {
        accessorKey: 'venueCategory',
        header: 'Event Type',
        cell: ({ row }) => row.original.venueCategory || '—',
      },
      {
        accessorKey: 'deletedAt',
        header: 'Deleted At',
        cell: ({ row }) => formatDeletedAt(row.original.deletedAt),
      },
      {
        id: 'actions',
        header: 'Actions',
        meta: { headerClassName: 'pr-5 text-right', cellClassName: 'relative pr-5 text-right' },
        cell: ({ row }) => {
          const venue = row.original
          const isOpen = activeDropdownId === venue._id

          return (
            <TableActionsDropdown
              label={`Open actions for ${venue.venueName}`}
              isOpen={isOpen}
              onOpenChange={(open) => setActiveDropdownId(open ? venue._id : null)}
              menuWidth={192}
            >
              <TableActionsItem
                icon={<RotateCcw className="size-3.5" />}
                onClick={() => {
                  setActiveDropdownId(null)
                  handleRestore(venue)
                }}
              >
                Restore Venue
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
    [
      activeDropdownId,
      allVisibleVenuesSelected,
      handleRestore,
      selectedVenueIds,
      someVisibleVenuesSelected,
      toggleVenueSelection,
      toggleVisibleVenues,
    ],
  )

  return (
    <div className="flex flex-col gap-5 md:gap-6">
      <header className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => navigate('/venues/management')}
          className="group flex w-fit items-center gap-2 font-heading text-[20px] font-bold tracking-tight text-white transition-colors hover:text-[#FBC078]"
        >
          <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-1" />
          <span>Deleted Venues</span>
        </button>
        <div className="flex items-center gap-1.5 pl-7 text-[12px] font-medium text-[#777777]">
          <span>Venue Management</span>
          <span className="text-[#333333]">/</span>
          <span className="font-bold text-white">Deleted Venues</span>
        </div>
      </header>

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
        onAdvancedFilter={() => toast.message('Advanced filters are coming soon')}
        onExport={() => toast.message('Venue export is coming soon')}
        pagination={{
          page: currentPage,
          pageSize: meta?.pagination.limit || 10,
          totalItems: meta?.pagination.total || 0,
          totalPages: meta?.pagination.pages || 1,
          onPageChange: setCurrentPage,
        }}
        resourceLabel="venues"
        emptyMessage="No deleted venues found."
      />
    </div>
  )
}
