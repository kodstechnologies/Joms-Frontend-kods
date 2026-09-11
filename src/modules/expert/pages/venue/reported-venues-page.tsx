import { useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Ban, Eye } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { fetchVenueReports } from '../../api/venue-api'
import { defaultParseResponse, useReportedList } from '../../hooks/use-reported-list'
import {
  VenueReportDetailModal,
  type VenueReportItem,
} from '../../components/venue-report-detail-modal'
import {
  buildVenueReportDataColumnsById,
  pickVenuePreferenceColumns,
} from '../../utils/venue-preference-columns'
import { VENUE_REPORTED_EXPORT_COLUMN_MAP } from '../../utils/table-export-column-maps'
import { ExpertListHeader } from '../experts/expert-list-shared'
import { DataTable } from '@/shared/components/table/data-table'
import { withServerSortMeta } from '@/shared/utils/table-sort'
import { VENUE_REPORTED_SORT_FIELDS } from '@/shared/utils/table-sort-field-maps'
import { VENUE_REPORTED_SEARCH_COLUMNS } from '@/shared/components/table/search-configs'
import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'
import { ManageMetricsIcon } from '@/shared/components/icons/action-button-icons'
import { Button } from '@/shared/components/ui/button'
import {
  VENUE_REPORTED_MODULE_KEY,
  DEFAULT_VENUE_REPORTED_VISIBLE_COLUMN_IDS,
} from '@/modules/expert/config/venue-management-table-columns.config'

export function VenueReportedVenuesPage() {
  const navigate = useNavigate()
  const [selectedReport, setSelectedReport] = useState<VenueReportItem | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const list = useReportedList<VenueReportItem>({
    moduleKey: 'venue-management',
    preferencesKey: VENUE_REPORTED_MODULE_KEY,
    sortFieldMap: VENUE_REPORTED_SORT_FIELDS,
    exportFileName: 'reported_venues_export',
    exportColumnMap: VENUE_REPORTED_EXPORT_COLUMN_MAP,
    fetchReports: fetchVenueReports,
    parseResponse: defaultParseResponse<VenueReportItem>,
  })

  const columns = useMemo<ColumnDef<VenueReportItem>[]>(() => {
    const visibleIds = list.tableColumnPreferencesQuery.data?.visibleColumnIds ?? []
    return withServerSortMeta(
      [
        ...pickVenuePreferenceColumns(
          buildVenueReportDataColumnsById(),
          visibleIds,
          DEFAULT_VENUE_REPORTED_VISIBLE_COLUMN_IDS,
        ),
        {
          id: 'actions',
          header: 'Actions',
          meta: {
            headerClassName: 'pr-5 text-right',
            cellClassName: 'relative pr-5 text-right',
          },
          cell: ({ row }) => {
            const reportItem = row.original
            const isOpen = list.activeDropdownId === reportItem.reportId
            return (
              <TableActionsDropdown
                label={`Open actions for report ${reportItem.reportId}`}
                isOpen={isOpen}
                onOpenChange={(open) => list.setActiveDropdownId(open ? reportItem.reportId : null)}
                menuWidth={176}
              >
                <TableActionsItem
                  icon={<Eye className="size-3.5" aria-hidden="true" />}
                  onClick={() => {
                    list.setActiveDropdownId(null)
                    navigate(`/venues/management/profile/${reportItem.venueId}`)
                  }}
                >
                  View Venue
                </TableActionsItem>
                <TableActionsItem
                  icon={<Ban className="size-3.5 text-red-400" aria-hidden="true" />}
                  onClick={() => {
                    list.setActiveDropdownId(null)
                    setSelectedReport(reportItem)
                    setIsModalOpen(true)
                  }}
                >
                  View Report
                </TableActionsItem>
              </TableActionsDropdown>
            )
          },
        },
      ],
      VENUE_REPORTED_SORT_FIELDS,
    )
  }, [list, navigate])

  return (
    <div className="flex flex-col gap-5 md:gap-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <ExpertListHeader title="Reported Venues" breadcrumb="Venue Management / Reported Venues" />
        <Button
          className="ui-manage-metrics h-9 w-full md:w-auto"
          onClick={() => navigate('/metrics/venue-reported?returnTo=/venues/management/reported')}
        >
          <ManageMetricsIcon />
          Manage Metrics
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={list.items}
        getRowId={(r) => r.reportId || r.id}
        isLoading={list.loading}
        searchValue={list.enhancedSearch.globalSearch}
        onSearchChange={list.enhancedSearch.setGlobalSearch}
        searchableColumns={VENUE_REPORTED_SEARCH_COLUMNS}
        columnSearches={list.enhancedSearch.columnSearches}
        onColumnSearchChange={list.enhancedSearch.setColumnSearch}
        onColumnSearchRemove={list.enhancedSearch.removeColumnSearch}
        onClearAllSearches={list.enhancedSearch.clearAll}
        searchPlaceholder="Search by report ID, venue name, or reporter"
        onAdvancedFilter={list.onAdvancedFilter}
        onExport={list.onExport}
        {...list.serverSort.dataTableSortProps}
        pagination={{
          page: list.currentPage,
          pageSize: 10,
          totalItems: list.totalItems,
          totalPages: list.totalPages,
          onPageChange: list.setCurrentPage,
        }}
        resourceLabel="reports"
        emptyMessage="No reported venues found."
      />
      {list.exportFilterModals}

      <VenueReportDetailModal
        report={selectedReport}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedReport(null)
        }}
        onUpdated={list.reload}
      />
    </div>
  )
}
