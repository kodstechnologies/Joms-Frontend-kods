import { useMemo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { ArrowLeft, CheckCircle2, ClipboardCheck, Eye } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import createIcon from '@/assets/JOMS_ICONS-2/icons8-create.svg'
import { ManageMetricsIcon } from '@/shared/components/icons/action-button-icons'

import { navigateBackOrFallback } from '@/shared/lib/navigation'
import { PageBreadcrumb } from '@/shared/components/navigation/page-breadcrumb'
import { useVenueManagementControls } from '@/modules/settings/hooks/use-venue-public-settings'
import { useVenueStatusList } from '../../hooks/use-venue-status-list'
import type { Venue } from '../../type/venue'
import { getVenueApiId } from '../../utils/venue-list'
import {
  buildVenueDataColumnsById,
  createVenueSelectColumn,
  pickVenuePreferenceColumns,
} from '../../utils/venue-preference-columns'
import { VENUE_PENDING_EXPORT_COLUMN_MAP } from '../../utils/table-export-column-maps'
import { DataTable } from '@/shared/components/table/data-table'
import { withServerSortMeta } from '@/shared/utils/table-sort'
import { VENUE_PENDING_SORT_FIELDS } from '@/shared/utils/table-sort-field-maps'
import { VENUE_PENDING_SEARCH_COLUMNS } from '@/shared/components/table/search-configs'
import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'
import { Button } from '@/shared/components/ui/button'
import {
  VENUE_PENDING_APPROVALS_MODULE_KEY,
  DEFAULT_VENUE_PENDING_APPROVALS_VISIBLE_COLUMN_IDS,
} from '@/modules/expert/config/venue-management-table-columns.config'

export function VenuePendingApprovalsPage() {
  const navigate = useNavigate()
  const { allowAddVenues } = useVenueManagementControls()

  const list = useVenueStatusList({
    preferencesKey: VENUE_PENDING_APPROVALS_MODULE_KEY,
    filterModuleKey: 'venue-management',
    status: 'in_review',
    sortFieldMap: VENUE_PENDING_SORT_FIELDS,
    exportFileName: 'pending_venues_export',
    exportColumnMap: VENUE_PENDING_EXPORT_COLUMN_MAP,
  })

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
          ariaLabel: 'Select all pending venues',
        }),
        ...pickVenuePreferenceColumns(
          buildVenueDataColumnsById(),
          visibleIds,
          DEFAULT_VENUE_PENDING_APPROVALS_VISIBLE_COLUMN_IDS,
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
                menuWidth={190}
              >
                <TableActionsItem
                  icon={<Eye className="size-3.5" aria-hidden="true" />}
                  onClick={() => {
                    list.setActiveDropdownId(null)
                    navigate(`/venues/management/create?venueId=${getVenueApiId(venue)}&view=true`)
                  }}
                >
                  View Details
                </TableActionsItem>
                <TableActionsItem
                  icon={<ClipboardCheck className="size-3.5" aria-hidden="true" />}
                  onClick={() => {
                    list.setActiveDropdownId(null)
                    navigate(`/venues/management/application/${getVenueApiId(venue)}`)
                  }}
                >
                  View Application
                </TableActionsItem>
                <TableActionsItem
                  icon={<CheckCircle2 className="size-3.5 text-emerald-400" aria-hidden="true" />}
                  onClick={() => {
                    list.setActiveDropdownId(null)
                    navigate(`/venues/management/application/${getVenueApiId(venue)}`)
                  }}
                >
                  Approve Application
                </TableActionsItem>
              </TableActionsDropdown>
            )
          },
        },
      ],
      VENUE_PENDING_SORT_FIELDS,
    )
  }, [list, navigate])

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

          <div className="pl-7">
            <PageBreadcrumb
              items={[
                { label: 'Venue Management', to: '/venues/management' },
                { label: 'Pending Approvals', isActive: true },
              ]}
            />
          </div>
        </header>

        <div className="flex w-full flex-col items-center gap-3 md:w-auto md:flex-row">
          <Button
            className="ui-manage-metrics h-9 w-full md:w-auto"
            onClick={() =>
              navigate('/metrics/venue-pending-approvals?returnTo=/venues/management/pending')
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
            <img src={createIcon} alt="create" className="size-4" />
            Create Account
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={list.venues}
        getRowId={(venue) => venue._id}
        {...list.serverSort.dataTableSortProps}
        isLoading={list.isLoading}
        searchValue={list.enhancedSearch.globalSearch}
        onSearchChange={list.enhancedSearch.setGlobalSearch}
        searchableColumns={VENUE_PENDING_SEARCH_COLUMNS}
        columnSearches={list.enhancedSearch.columnSearches}
        onColumnSearchChange={list.enhancedSearch.setColumnSearch}
        onColumnSearchRemove={list.enhancedSearch.removeColumnSearch}
        onClearAllSearches={list.enhancedSearch.clearAll}
        searchPlaceholder="Search by venue name or ID"
        onAdvancedFilter={list.onAdvancedFilter}
        onExport={list.onExport}
        pagination={{
          page: list.currentPage,
          pageSize: list.meta?.pagination.limit || 10,
          totalItems: list.meta?.pagination.total || 0,
          totalPages: list.meta?.pagination.pages || 1,
          onPageChange: list.setCurrentPage,
        }}
        resourceLabel="venues"
        emptyMessage="No pending venues found."
      />
      {list.exportFilterModals}
    </div>
  )
}
