import { useMemo, useState, useEffect, useCallback } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Ban, Eye } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { fetchVenueReports } from '../../api/venue-api'
import type { FilterValues } from '@/shared/types/data-filter'
import { useModuleExportFilters } from '@/shared/components/advanced-filter/use-module-export-filters'
import { exportDataToFile, exportDisplayValue } from '@/shared/utils/export-utils'
import { buildFilterParams } from '@/shared/utils/export-filter-utils'
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

const EXPORT_COLUMN_MAP: Record<
  string,
  { header: string; accessor: (item: VenueReportItem) => string }
> = {
  reportId: { header: 'Report ID', accessor: (item) => exportDisplayValue(item.reportId) },
  venueId: { header: 'Venue ID', accessor: (item) => exportDisplayValue(item.venueId) },
  venueName: { header: 'Venue Name', accessor: (item) => exportDisplayValue(item.venueName) },
  partnerId: { header: 'Partner ID', accessor: (item) => exportDisplayValue(item.partnerId) },
  reporterType: {
    header: 'Reporter Type',
    accessor: (item) => exportDisplayValue(item.reporterType),
  },
  reporterId: { header: 'Reporter ID', accessor: (item) => exportDisplayValue(item.reporterId) },
  reporterName: {
    header: 'Reporter Name',
    accessor: (item) => exportDisplayValue(item.reporterName),
  },
  issueType: { header: 'Issue Type', accessor: (item) => exportDisplayValue(item.issueType) },
  businessImpact: {
    header: 'Business Impact',
    accessor: (item) => exportDisplayValue(item.businessImpact),
  },
  investigationStatus: {
    header: 'Status',
    accessor: (item) => exportDisplayValue(item.investigationStatus),
  },
  createdAt: {
    header: 'Report Date',
    accessor: (item) =>
      exportDisplayValue(
        item.createdAt ? new Date(item.createdAt as string).toLocaleString() : undefined,
      ),
  },
}

export function VenueReportedVenuesPage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null)

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
      .catch((err: unknown) => {
        console.error('Failed to load reported venues:', err)
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

  const handleExportData = useCallback(
    async (values: FilterValues, format: string) => {
      try {
        toast.loading('Exporting venue reports...')

        const data = await fetchVenueReports({
          search: searchQuery,
          ...apiFilterParams,
          limit: 1000,
        })
        const items = data?.data?.items || data?.items || []

        if (!items || items.length === 0) {
          toast.dismiss()
          toast.error('No report records found to export.')
          return
        }

        const exportCols = Object.values(EXPORT_COLUMN_MAP)
        const headers = exportCols.map((c) => c.header)
        const rows = items.map((item: VenueReportItem) => exportCols.map((c) => c.accessor(item)))

        exportDataToFile(
          headers,
          rows,
          format,
          `Venue_Reports_${new Date().toISOString().split('T')[0]}`,
        )

        toast.dismiss()
        toast.success('Venue reports exported successfully')
      } catch (err: unknown) {
        toast.dismiss()
        toast.error(err instanceof Error ? err.message : 'Failed to export report')
      }
    },
    [searchQuery, apiFilterParams],
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

  const columns = useMemo<ColumnDef<VenueReportItem>[]>(
    () => [
      {
        accessorKey: 'reportId',
        header: 'Report ID',
        cell: ({ row }) => (
          <span className="font-mono font-semibold text-[#E5B54E]">
            {row.original.reportId || 'VR000'}
          </span>
        ),
      },
      {
        accessorKey: 'venueName',
        header: 'Reported Venue',
        cell: ({ row }) => (
          <div>
            <div className="font-semibold text-white">{row.original.venueName}</div>
            <div className="text-[11px] text-slate-400">ID: {row.original.venueId}</div>
          </div>
        ),
      },
      {
        accessorKey: 'reporterName',
        header: 'Reported By',
        cell: ({ row }) => (
          <div>
            <div className="font-medium text-slate-200">{row.original.reporterName}</div>
            <div className="text-[11px] text-slate-400">{row.original.reporterType}</div>
          </div>
        ),
      },
      {
        accessorKey: 'issueType',
        header: 'Issue Type',
        cell: ({ row }) => (
          <span className="rounded-full bg-red-500/15 px-2.5 py-0.5 text-xs font-semibold text-red-400">
            {row.original.issueType}
          </span>
        ),
      },
      {
        accessorKey: 'reason',
        header: 'Reason',
        cell: ({ row }) => (
          <div className="max-w-xs truncate text-xs text-slate-300" title={row.original.reason}>
            {row.original.reason}
          </div>
        ),
      },
      {
        accessorKey: 'investigationStatus',
        header: 'Status',
        cell: ({ row }) => {
          const status = row.original.investigationStatus || 'New'
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
      {
        accessorKey: 'createdAt',
        header: 'Reported At',
        cell: ({ row }) => (
          <span className="text-xs text-slate-400">
            {row.original.createdAt
              ? new Date(row.original.createdAt).toLocaleDateString('en-GB')
              : '—'}
          </span>
        ),
      },
      {
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
      },
    ],
    [activeDropdownId, navigate],
  )

  return (
    <div className="flex flex-col gap-5 md:gap-6">
      <ExpertListHeader title="Reported Venues" breadcrumb="Venue Management / Reported Venues" />

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
