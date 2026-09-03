import { useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Ban, Eye } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { fetchVenueReports } from '../../api/venue-api'
import { defaultParseResponse, useReportedList } from '../../hooks/use-reported-list'
import { exportDisplayValue } from '@/shared/utils/export-utils'
import {
  VenueReportDetailModal,
  type VenueReportItem,
} from '../../components/venue-report-detail-modal'
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
import { TableDateTimeCell } from '@/shared/components/table/table-datetime-cell'

const formatExportDateTime = (value?: string | null) =>
  value
    ? new Date(value).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : ''

const EXPORT_COLUMN_MAP: Record<
  string,
  { header: string; accessor: (item: VenueReportItem) => string }
> = {
  'report-id': { header: 'Report ID', accessor: (item) => exportDisplayValue(item.reportId) },
  'venue-id': { header: 'Venue ID', accessor: (item) => exportDisplayValue(item.venueId) },
  'venue-name': {
    header: 'Venue Name',
    accessor: (item) => exportDisplayValue(item.venueName),
  },
  'report-reason': {
    header: 'Report Reason',
    accessor: (item) => exportDisplayValue(item.reason || item.issueType),
  },
  'reported-by': {
    header: 'Reported By',
    accessor: (item) => exportDisplayValue(item.reporterName),
  },
  'reported-at': {
    header: 'Reported At',
    accessor: (item) => formatExportDateTime(item.submittedAt || item.createdAt),
  },
  'escalated-by': {
    header: 'Escalated By',
    accessor: (item) => exportDisplayValue(item.escalatedBy || 'Admin'),
  },
  'escalation-reason': {
    header: 'Escalation Reason',
    accessor: (item) => exportDisplayValue(item.escalationReason || '—'),
  },
  'escalated-at': {
    header: 'Escalated At',
    accessor: (item) => formatExportDateTime(item.escalatedAt),
  },
  'compliance-status': {
    header: 'Compliance Status',
    accessor: (item) =>
      exportDisplayValue(
        item.complianceStatus || item.investigationStatus || 'Under Investigation',
      ),
  },
}

export function VenueReportedVenuesPage() {
  const navigate = useNavigate()
  const [selectedReport, setSelectedReport] = useState<VenueReportItem | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const {
    currentPage,
    setCurrentPage,
    activeDropdownId,
    setActiveDropdownId,
    serverSort,
    enhancedSearch,
    items: reports,
    loading,
    totalItems,
    totalPages,
    tableColumnPreferencesQuery,
    onAdvancedFilter,
    onExport,
    exportFilterModals,
    reload,
  } = useReportedList<VenueReportItem>({
    moduleKey: 'venue-management',
    preferencesKey: VENUE_REPORTED_MODULE_KEY,
    sortFieldMap: VENUE_REPORTED_SORT_FIELDS,
    exportFileName: 'reported_venues_export',
    exportColumnMap: EXPORT_COLUMN_MAP,
    fetchReports: fetchVenueReports,
    parseResponse: defaultParseResponse<VenueReportItem>,
  })

  const columns = useMemo<ColumnDef<VenueReportItem>[]>(() => {
    const dataColumnsById: Record<string, ColumnDef<VenueReportItem>> = {
      'report-id': {
        id: 'report-id',
        accessorKey: 'reportId',
        header: 'Report ID',
        cell: ({ row }) => (
          <span className="font-mono font-semibold text-[#E5B54E]">
            {row.original.reportId || 'VR000'}
          </span>
        ),
      },
      'venue-id': {
        id: 'venue-id',
        accessorKey: 'venueId',
        header: 'Venue ID',
        cell: ({ row }) => (
          <span className="ui-table-id uppercase">{row.original.venueId || '—'}</span>
        ),
      },
      'venue-name': {
        id: 'venue-name',
        accessorKey: 'venueName',
        header: 'Venue Name',
        cell: ({ row }) => (
          <span className="font-semibold text-white">{row.original.venueName || '—'}</span>
        ),
      },
      'report-reason': {
        id: 'report-reason',
        accessorKey: 'reason',
        header: 'Report Reason',
        cell: ({ row }) => (
          <div
            className="max-w-xs truncate text-xs text-slate-300"
            title={row.original.reason || row.original.issueType}
          >
            {row.original.reason || row.original.issueType || '—'}
          </div>
        ),
      },
      'reported-by': {
        id: 'reported-by',
        accessorKey: 'reporterName',
        header: 'Reported By',
        cell: ({ row }) => (
          <div>
            <div className="font-medium text-slate-200">{row.original.reporterName || '—'}</div>
            <div className="text-[11px] text-slate-400">{row.original.reporterType || 'User'}</div>
          </div>
        ),
      },
      'reported-at': {
        id: 'reported-at',
        accessorKey: 'createdAt',
        header: 'Reported At',
        cell: ({ row }) => (
          <TableDateTimeCell value={row.original.submittedAt || row.original.createdAt} />
        ),
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
        accessorKey: 'investigationStatus',
        header: 'Compliance Status',
        cell: ({ row }) => {
          const status = row.original.investigationStatus || 'Under Investigation'
          const isResolved = status === 'Resolved' || status === 'Closed'
          const isReview = status === 'Under Review' || status === 'Escalated'

          return (
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                isResolved
                  ? 'bg-emerald-500/15 text-emerald-400'
                  : isReview
                    ? 'bg-amber-500/15 text-amber-400'
                    : 'bg-blue-500/15 text-blue-400'
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
      : DEFAULT_VENUE_REPORTED_VISIBLE_COLUMN_IDS

    const preferenceColumns = visibleIds.map((id) => dataColumnsById[id]).filter(Boolean)

    const actionsColumn: ColumnDef<VenueReportItem> = {
      id: 'actions',
      header: 'Actions',
      meta: {
        headerClassName: 'pr-5 text-right',
        cellClassName: 'relative pr-5 text-right',
      },
      cell: ({ row }) => {
        const reportItem = row.original
        const isOpen = activeDropdownId === reportItem.reportId

        return (
          <TableActionsDropdown
            label={`Open actions for report ${reportItem.reportId}`}
            isOpen={isOpen}
            onOpenChange={(open) => setActiveDropdownId(open ? reportItem.reportId : null)}
            menuWidth={176}
          >
            <TableActionsItem
              icon={<Eye className="size-3.5" aria-hidden="true" />}
              onClick={() => {
                setActiveDropdownId(null)
                navigate(`/venues/management/full-view/${reportItem.venueId}`)
              }}
            >
              View Venue
            </TableActionsItem>
            <TableActionsItem
              icon={<Ban className="size-3.5 text-red-400" aria-hidden="true" />}
              onClick={() => {
                setActiveDropdownId(null)
                setSelectedReport(reportItem)
                setIsModalOpen(true)
              }}
            >
              View Report
            </TableActionsItem>
          </TableActionsDropdown>
        )
      },
    }

    return withServerSortMeta([...preferenceColumns, actionsColumn], VENUE_REPORTED_SORT_FIELDS)
  }, [activeDropdownId, navigate, setActiveDropdownId, tableColumnPreferencesQuery.data])

  return (
    <div className="flex flex-col gap-5 md:gap-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <ExpertListHeader title="Reported Venues" breadcrumb="Venue Management / Reported Venues" />
        <Button
          className="ui-manage-metrics h-9 w-full md:w-auto"
          onClick={() => navigate('/metrics/venue-reported?returnTo=/venues/management/reported')}
        >
          <ManageMetricsIcon className="size-4 shrink-0" />
          Manage Metrics
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={reports}
        getRowId={(r) => r.reportId || r.id}
        isLoading={loading}
        searchValue={enhancedSearch.globalSearch}
        onSearchChange={enhancedSearch.setGlobalSearch}
        searchableColumns={VENUE_REPORTED_SEARCH_COLUMNS}
        columnSearches={enhancedSearch.columnSearches}
        onColumnSearchChange={enhancedSearch.setColumnSearch}
        onColumnSearchRemove={enhancedSearch.removeColumnSearch}
        onClearAllSearches={enhancedSearch.clearAll}
        searchPlaceholder="Search by report ID, venue name, or reporter"
        onAdvancedFilter={onAdvancedFilter}
        onExport={onExport}
        {...serverSort.dataTableSortProps}
        pagination={{
          page: currentPage,
          pageSize: 10,
          totalItems,
          totalPages,
          onPageChange: setCurrentPage,
        }}
        resourceLabel="reports"
        emptyMessage="No reported venues found."
      />
      {exportFilterModals}

      <VenueReportDetailModal
        report={selectedReport}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedReport(null)
        }}
        onUpdated={reload}
      />
    </div>
  )
}
