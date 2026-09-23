import { useCallback, useMemo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Eye, MessageSquare, PlayCircle, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/shared/lib/api-error'

import { useActivateVenue } from '../../hooks/use-venues'
import { useVenueStatusList } from '../../hooks/use-venue-status-list'
import { useVenueManagementControls } from '@/modules/settings/hooks/use-venue-public-settings'
import type { Venue } from '../../type/venue'
import { getVenueApiId, getVenuePartnerId } from '../../utils/venue-list'
import {
  buildVenueDataColumnsById,
  createVenueSelectColumn,
  pickVenuePreferenceColumns,
} from '../../utils/venue-preference-columns'
import { VENUE_SUSPENDED_EXPORT_COLUMN_MAP } from '../../utils/table-export-column-maps'
import { DataTable } from '@/shared/components/table/data-table'
import { withServerSortMeta } from '@/shared/utils/table-sort'
import { VENUE_SUSPENDED_SORT_FIELDS } from '@/shared/utils/table-sort-field-maps'
import { VENUE_SUSPENDED_SEARCH_COLUMNS } from '@/shared/components/table/search-configs'
import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'
import { Button } from '@/shared/components/ui/button'
import {
  VENUE_SUSPENDED_MODULE_KEY,
  DEFAULT_VENUE_SUSPENDED_VISIBLE_COLUMN_IDS,
  VENUE_SUSPENDED_TABLE_COLUMNS_CATALOG,
} from '@/modules/expert/config/venue-management-table-columns.config'
import { ExpertListHeader } from '../experts/expert-list-shared'

export function VenueSuspendedPage() {
  const navigate = useNavigate()
  const { allowAddVenues } = useVenueManagementControls()
  const activateVenueMutation = useActivateVenue()

  const list = useVenueStatusList({
    preferencesKey: VENUE_SUSPENDED_MODULE_KEY,
    filterModuleKey: 'venue-management',
    status: 'suspended',
    sortFieldMap: VENUE_SUSPENDED_SORT_FIELDS,
    exportFileName: 'suspended_venues_export',
    exportColumnMap: VENUE_SUSPENDED_EXPORT_COLUMN_MAP,
    defaultVisibleColumnIds: DEFAULT_VENUE_SUSPENDED_VISIBLE_COLUMN_IDS,
    catalogColumnIds: VENUE_SUSPENDED_TABLE_COLUMNS_CATALOG.map((column) => column.id),
  })

  const handleActivate = useCallback(
    (venue: Venue) => {
      activateVenueMutation.mutate(getVenueApiId(venue), {
        onSuccess: () => toast.success('Venue activated successfully'),
        onError: (error: unknown) => {
          const err = error as { response?: { data?: { message?: string } } }
          toast.error(getApiErrorMessage(err, 'Failed to activate venue. Please try again.'))
        },
      })
    },
    [activateVenueMutation],
  )

  const openCommunicateWithHost = useCallback(
    (venue: Venue) => {
      const partnerId = getVenuePartnerId(venue)
      if (!partnerId) {
        toast.error('Venue partner ID is missing.')
        return
      }
      const params = new URLSearchParams({
        channel: 'email',
        audience: 'venue-partners',
        partnerIds: partnerId,
      })
      navigate(`/communication/create?${params.toString()}`)
    },
    [navigate],
  )

  const columns = useMemo<ColumnDef<Venue>[]>(() => {
    const visibleIds = list.tableColumnPreferencesQuery.data?.visibleColumnIds ?? []
    return withServerSortMeta(
      [
        createVenueSelectColumn({
          allVisibleSelected: list.allVisibleVenuesSelected,
          someVisibleSelected: list.someVisibleVenuesSelected,
          selectedVenueIds: list.selectedVenueIds,
          toggleVisible: list.toggleVisibleVenues,
          toggleOne: list.toggleVenueSelection,
          ariaLabel: 'Select all suspended venues',
        }),
        ...pickVenuePreferenceColumns(
          buildVenueDataColumnsById(),
          visibleIds,
          DEFAULT_VENUE_SUSPENDED_VISIBLE_COLUMN_IDS,
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
            const venue = row.original
            const isOpen = list.activeDropdownId === venue._id
            return (
              <TableActionsDropdown
                label={`Open actions for ${venue.venueName}`}
                isOpen={isOpen}
                onOpenChange={(open) => list.setActiveDropdownId(open ? venue._id : null)}
                menuWidth={200}
                maxVisibleItems={8}
              >
                <TableActionsItem
                  icon={<Eye className="size-3.5" aria-hidden="true" />}
                  onClick={() => {
                    list.setActiveDropdownId(null)
                    navigate(`/venues/management/profile/${getVenueApiId(venue)}`)
                  }}
                >
                  View Profile
                </TableActionsItem>
                <TableActionsItem
                  icon={<PlayCircle className="size-3.5" aria-hidden="true" />}
                  onClick={() => {
                    list.setActiveDropdownId(null)
                    handleActivate(venue)
                  }}
                >
                  Active Venue
                </TableActionsItem>
                <TableActionsItem
                  icon={<MessageSquare className="size-3.5" aria-hidden="true" />}
                  onClick={() => {
                    list.setActiveDropdownId(null)
                    openCommunicateWithHost(venue)
                  }}
                >
                  Communicate with Host
                </TableActionsItem>
              </TableActionsDropdown>
            )
          },
        },
      ],
      VENUE_SUSPENDED_SORT_FIELDS,
    )
  }, [handleActivate, list, navigate, openCommunicateWithHost])

  return (
    <div className="flex flex-col gap-5 md:gap-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div className="min-w-0 flex-1">
          <ExpertListHeader
            title="Suspended Venues"
            breadcrumbItems={[
              { label: 'Venue Management', to: '/venues/management' },
              { label: 'Suspended Venues', isActive: true },
            ]}
            backTo="/venues/management"
            metricsPath="/metrics/venue-suspended?returnTo=/venues/management/suspended"
          />
        </div>
        {allowAddVenues ? (
          <Button
            type="button"
            className="h-9 w-full md:w-auto"
            onClick={() => navigate('/venues/management/onboarding')}
          >
            <Plus className="size-4" />
            Create Account
          </Button>
        ) : null}
      </div>

      <DataTable
        columns={columns}
        data={list.venues}
        getRowId={(venue) => venue._id}
        isLoading={list.isLoading}
        searchValue={list.enhancedSearch.globalSearch}
        onSearchChange={list.enhancedSearch.setGlobalSearch}
        searchableColumns={VENUE_SUSPENDED_SEARCH_COLUMNS}
        columnSearches={list.enhancedSearch.columnSearches}
        onColumnSearchChange={list.enhancedSearch.setColumnSearch}
        onColumnSearchRemove={list.enhancedSearch.removeColumnSearch}
        onClearAllSearches={list.enhancedSearch.clearAll}
        searchPlaceholder="Search by venue name or ID"
        onAdvancedFilter={list.onAdvancedFilter}
        onExport={list.onExport}
        {...list.serverSort.dataTableSortProps}
        pagination={{
          page: list.currentPage,
          pageSize: list.meta?.pagination.limit || 10,
          totalItems: list.meta?.pagination.total || 0,
          totalPages: list.meta?.pagination.pages || 1,
          onPageChange: list.setCurrentPage,
        }}
        resourceLabel="venues"
        emptyMessage="No suspended venues found."
      />
      {list.exportFilterModals}
    </div>
  )
}
