import { useCallback, useMemo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { RotateCcw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import createIcon from '@/assets/JOMS_ICONS-2/icons8-create.svg'
import { ExportDataIcon } from '@/shared/components/icons/action-button-icons'
import { toast } from 'sonner'
import { exportMappedItemsToFile } from '@/shared/utils/export-filter-utils'
import { getApiErrorMessage } from '@/shared/lib/api-error'

import { useRestoreVenue } from '../../hooks/use-venues'
import { useVenueStatusList } from '../../hooks/use-venue-status-list'
import { useVenueManagementControls } from '@/modules/settings/hooks/use-venue-public-settings'
import type { Venue } from '../../type/venue'
import { getVenueApiId, getVenueDisplayId } from '../../utils/venue-list'
import {
  buildVenueDataColumnsById,
  createVenueSelectColumn,
  pickVenuePreferenceColumns,
} from '../../utils/venue-preference-columns'
import { VENUE_DELETED_EXPORT_COLUMN_MAP } from '../../utils/table-export-column-maps'
import { DataTable } from '@/shared/components/table/data-table'
import { withServerSortMeta } from '@/shared/utils/table-sort'
import { VENUE_DELETED_SORT_FIELDS } from '@/shared/utils/table-sort-field-maps'
import { VENUE_DELETED_SEARCH_COLUMNS } from '@/shared/components/table/search-configs'
import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'
import { Button } from '@/shared/components/ui/button'
import {
  VENUE_DELETED_MODULE_KEY,
  DEFAULT_VENUE_DELETED_VISIBLE_COLUMN_IDS,
} from '@/modules/expert/config/venue-management-table-columns.config'
import { ExpertListHeader } from '../experts/expert-list-shared'

export function VenueDeletedPage() {
  const navigate = useNavigate()
  const { allowAddVenues } = useVenueManagementControls()
  const restoreVenueMutation = useRestoreVenue()

  const list = useVenueStatusList({
    preferencesKey: VENUE_DELETED_MODULE_KEY,
    filterModuleKey: 'venue-management',
    status: 'deleted',
    sortFieldMap: VENUE_DELETED_SORT_FIELDS,
    exportFileName: 'deleted_venues_export',
    exportColumnMap: VENUE_DELETED_EXPORT_COLUMN_MAP,
  })

  const handleExportVenueRow = useCallback(
    async (venue: Venue) => {
      const visibleIds = list.tableColumnPreferencesQuery.data?.visibleColumnIds?.length
        ? list.tableColumnPreferencesQuery.data.visibleColumnIds
        : DEFAULT_VENUE_DELETED_VISIBLE_COLUMN_IDS

      try {
        await exportMappedItemsToFile(
          VENUE_DELETED_EXPORT_COLUMN_MAP,
          [venue],
          'excel',
          `deleted_venue_${getVenueDisplayId(venue)}`,
          {
            columnIds: visibleIds,
            catalogOrder: DEFAULT_VENUE_DELETED_VISIBLE_COLUMN_IDS,
          },
        )
        toast.success('Venue exported')
      } catch (error) {
        toast.error(getApiErrorMessage(error, 'Failed to export venue'))
      }
    },
    [list.tableColumnPreferencesQuery.data],
  )

  const handleRestore = useCallback(
    (venue: Venue) => {
      restoreVenueMutation.mutate(getVenueApiId(venue), {
        onSuccess: () => toast.success('Venue restored successfully'),
        onError: (error: unknown) => {
          const err = error as { response?: { data?: { message?: string } } }
          toast.error(getApiErrorMessage(err, 'Failed to restore venue.'))
        },
      })
    },
    [restoreVenueMutation],
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
          ariaLabel: 'Select all deleted venues',
        }),
        ...pickVenuePreferenceColumns(
          buildVenueDataColumnsById(),
          visibleIds,
          DEFAULT_VENUE_DELETED_VISIBLE_COLUMN_IDS,
        ),
        {
          id: 'actions',
          accessorFn: () => null,
          header: 'Actions',
          meta: { headerClassName: 'pr-5 text-right', cellClassName: 'relative pr-5 text-right' },
          cell: ({ row }) => {
            const venue = row.original
            const isOpen = list.activeDropdownId === venue._id
            return (
              <TableActionsDropdown
                label={`Open actions for ${venue.venueName}`}
                isOpen={isOpen}
                onOpenChange={(open) => list.setActiveDropdownId(open ? venue._id : null)}
                menuWidth={192}
              >
                <TableActionsItem
                  icon={<RotateCcw className="size-3.5" />}
                  onClick={() => {
                    list.setActiveDropdownId(null)
                    handleRestore(venue)
                  }}
                >
                  Restore Venue
                </TableActionsItem>
                <TableActionsItem
                  icon={<ExportDataIcon className="size-3.5" />}
                  onClick={() => {
                    list.setActiveDropdownId(null)
                    void handleExportVenueRow(venue)
                  }}
                >
                  Export Data
                </TableActionsItem>
              </TableActionsDropdown>
            )
          },
        },
      ],
      VENUE_DELETED_SORT_FIELDS,
    )
  }, [handleExportVenueRow, handleRestore, list])

  return (
    <div className="flex flex-col gap-5 md:gap-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div className="min-w-0 flex-1">
          <ExpertListHeader
            title="Deleted Venues"
            breadcrumbItems={[
              { label: 'Venue Management', to: '/venues/management' },
              { label: 'Deleted Venues', isActive: true },
            ]}
            backTo="/venues/management"
            metricsPath="/metrics/venue-deleted?returnTo=/venues/management/deleted"
          />
        </div>
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

      <DataTable
        columns={columns}
        data={list.venues}
        getRowId={(venue) => venue._id}
        isLoading={list.isLoading}
        searchValue={list.enhancedSearch.globalSearch}
        onSearchChange={list.enhancedSearch.setGlobalSearch}
        searchableColumns={VENUE_DELETED_SEARCH_COLUMNS}
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
        emptyMessage="No deleted venues found."
      />
      {list.exportFilterModals}
    </div>
  )
}
