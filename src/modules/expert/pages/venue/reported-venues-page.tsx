import { useMemo, useState, useEffect, useCallback } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Ban, Eye } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { fetchVenueReports } from '../../api/venue-api'
import type { FilterValues } from '@/shared/types/data-filter'
import { useModuleExportFilters } from '@/shared/components/advanced-filter/use-module-export-filters'
import { exportDisplayValue } from '@/shared/utils/export-utils'
import { buildFilterParams, createFilteredExportHandler } from '@/shared/utils/export-filter-utils'
import {
  VenueReportDetailModal,
  type VenueReportItem,
} from '../../components/venue-report-detail-modal'
import { ExpertListHeader } from '../experts/expert-list-shared'
import { DataTable } from '@/shared/components/table/data-table'
import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'

import { SlidersHorizontal } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { useTableColumnPreferences } from '../../hooks/use-ui-preferences'
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

const fetchVenueReportsForExport = async (params: Record<string, unknown>) => {
  const response = await fetchVenueReports(params)
  const payload = response?.data ?? response
  const items = (payload?.items || []) as VenueReportItem[]
  const pagination = payload?.pagination || response?.pagination

  return {
    data: items,
    meta: {
      pagination: {
        pages: pagination?.pages ?? pagination?.totalPages,
        totalPages: pagination?.totalPages ?? pagination?.pages,
      },
    },
  }
}

export function VenueReportedVenuesPage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null)

  const tableColumnPreferencesQuery = useTableColumnPreferences(VENUE_REPORTED_MODULE_KEY)

  const [reports, setReports] = useState<VenueReportItem[]>([])
  const [loading, setLoading] = useState(true)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  const [selectedReport, setSelectedReport] = useState<VenueReportItem | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [appliedFilters, setAppliedFilters] = useState<FilterValues>({})

  const apiFilterParams = useMemo(() => buildFilterParams(appliedFilters), [appliedFilters])

  const [prevKey, setPrevKey] = useState(
    `${currentPage}-${searchQuery}-${JSON.stringify(apiFilterParams)}`,
  )

  const currentKey = `${currentPage}-${searchQuery}-${JSON.stringify(apiFilterParams)}`

  if (currentKey !== prevKey) {
    setPrevKey(currentKey)
    setLoading(true)
  }

  const loadReports = useCallback(() => {
    fetchVenueReports({
      page: currentPage,
      limit: 10,
      search: searchQuery,
      ...apiFilterParams,
    })
      .then((res) => {
        const items = res?.data?.items || res?.items || []
        const pagination = res?.data?.pagination || res?.pagination

        setReports(items)
        setTotalItems(pagination?.total || items.length)
        setTotalPages(pagination?.totalPages || 1)
      })
      .catch(() => {
        setReports([])
      })
      .finally(() => {
        setLoading(false)
      })
  }, [currentPage, searchQuery, apiFilterParams])

  const handleApplyFilters = useCallback((values: FilterValues) => {
    setAppliedFilters(values)
    setCurrentPage(1)
  }, [])

  const handleExportData = useMemo(
    () =>
      createFilteredExportHandler(
        fetchVenueReportsForExport,
        EXPORT_COLUMN_MAP,
        'reported_venues_export',
        {
          search: searchQuery.trim() || undefined,
        },
      ),
    [searchQuery],
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

  useEffect(() => {
    loadReports()
  }, [loadReports])

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

    return [...preferenceColumns, actionsColumn]
  }, [activeDropdownId, navigate, tableColumnPreferencesQuery.data])

  return (
    <div className="flex flex-col gap-5 md:gap-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <ExpertListHeader title="Reported Venues" breadcrumb="Venue Management / Reported Venues" />
        <Button
          className="ui-manage-metrics h-9 w-full md:w-auto"
          onClick={() => navigate('/metrics/venue-reported?returnTo=/venues/management/reported')}
        >
          <SlidersHorizontal className="size-4" />
          Manage Metrics
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={reports}
        getRowId={(r) => r.reportId || r.id}
        isLoading={loading}
        searchValue={searchQuery}
        onSearchChange={(value) => {
          setSearchQuery(value)
          setCurrentPage(1)
        }}
        searchPlaceholder="Search by report ID, venue name, or reporter"
        onAdvancedFilter={onAdvancedFilter}
        onExport={onExport}
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
        onUpdated={loadReports}
      />
    </div>
  )
}
