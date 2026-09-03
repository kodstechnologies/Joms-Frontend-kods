import { useMemo, useState, useEffect } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Ban, Eye } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'

import { fetchExpertReports } from '../../api/expert-api'
import {
  DEFAULT_EXPERT_REPORTED_VISIBLE_COLUMN_IDS,
  EXPERT_REPORTED_MODULE_KEY,
} from '../../config/expert-management-table-columns.config'
import { defaultParseResponse, useReportedList } from '../../hooks/use-reported-list'
import { exportDisplayValue } from '@/shared/utils/export-utils'
import {
  ExpertReportDetailModal,
  type ExpertReportItem,
} from '../../components/expert-report-detail-modal'
import { ExpertListHeader } from './expert-list-shared'
import { DataTable } from '@/shared/components/table/data-table'
import { withServerSortMeta } from '@/shared/utils/table-sort'
import { EXPERT_COLUMN_SORT_FIELDS } from '@/shared/utils/table-sort-field-maps'
import { EXPERT_REPORTED_SEARCH_COLUMNS } from '@/shared/components/table/search-configs'
import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'
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
  { header: string; accessor: (item: ExpertReportItem) => string }
> = {
  reportId: { header: 'Report ID', accessor: (item) => exportDisplayValue(item.reportId) },
  expertName: {
    header: 'Reported Expert',
    accessor: (item) => exportDisplayValue(item.expertName),
  },
  partnerId: { header: 'Expert ID', accessor: (item) => exportDisplayValue(item.partnerId) },
  reporterName: {
    header: 'Reported By',
    accessor: (item) => exportDisplayValue(item.reporterName),
  },
  reporterType: {
    header: 'Reporter Type',
    accessor: (item) => exportDisplayValue(item.reporterType),
  },
  issueType: { header: 'Issue Type', accessor: (item) => exportDisplayValue(item.issueType) },
  reason: { header: 'Reason', accessor: (item) => exportDisplayValue(item.reason) },
  status: {
    header: 'Status',
    accessor: (item) => exportDisplayValue(item.investigationStatus || 'New'),
  },
  reportedAt: {
    header: 'Reported At',
    accessor: (item) => formatExportDateTime(item.submittedAt),
  },
}

const dash = (value: unknown) =>
  value === null || value === undefined || value === '' ? '—' : String(value)

export function ExpertReportedExpertsPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [selectedReport, setSelectedReport] = useState<ExpertReportItem | null>(null)
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
  } = useReportedList<ExpertReportItem>({
    moduleKey: EXPERT_REPORTED_MODULE_KEY,
    sortFieldMap: EXPERT_COLUMN_SORT_FIELDS,
    exportFileName: 'reported_experts_export',
    exportColumnMap: EXPORT_COLUMN_MAP,
    fetchReports: fetchExpertReports,
    parseResponse: defaultParseResponse<ExpertReportItem>,
  })

  useEffect(() => {
    const openReportId = (location.state as { openReportId?: string } | null)?.openReportId
    if (!openReportId || loading || !reports.length) return

    const match = reports.find(
      (report) => report.reportId === openReportId || report.id === openReportId,
    )
    if (!match) return

    // eslint-disable-next-line react-hooks/set-state-in-effect -- open report detail from navigation state
    setSelectedReport(match)
    setIsModalOpen(true)
    navigate(location.pathname, { replace: true, state: null })
  }, [loading, location.pathname, location.state, navigate, reports])

  const columns = useMemo<ColumnDef<ExpertReportItem>[]>(() => {
    const dataColumnsById: Record<string, ColumnDef<ExpertReportItem>> = {
      'report-id': {
        id: 'report-id',
        header: 'Report ID',
        accessorFn: (row) => row.reportId ?? '',
        cell: ({ row }) => (
          <span className="font-mono font-semibold text-[#E5B54E]">
            {row.original.reportId || '—'}
          </span>
        ),
      },
      'expert-id': {
        id: 'expert-id',
        header: 'Expert ID',
        accessorFn: (row) =>
          row.expertId ||
          (row.partnerId ? `EXP-${String(row.partnerId).slice(-4).toUpperCase()}` : ''),
        cell: ({ row }) =>
          dash(
            row.original.expertId ||
              (row.original.partnerId
                ? `EXP-${String(row.original.partnerId).slice(-4).toUpperCase()}`
                : null),
          ),
      },
      'expert-name': {
        id: 'expert-name',
        header: 'Expert Name',
        accessorFn: (row) => row.expertName ?? '',
        cell: ({ row }) => (
          <span className="font-semibold text-white">{dash(row.original.expertName)}</span>
        ),
      },
      'reported-by': {
        id: 'reported-by',
        header: 'Reported By',
        accessorFn: (row) => row.reporterName ?? '',
        cell: ({ row }) => (
          <div>
            <div className="font-medium text-slate-200">{dash(row.original.reporterName)}</div>
            <div className="text-[11px] text-slate-400">{dash(row.original.reporterType)}</div>
          </div>
        ),
      },
      'reporter-id': {
        id: 'reporter-id',
        header: 'Reporter ID',
        accessorFn: (row) => row.reporterId ?? '',
        cell: ({ row }) => dash(row.original.reporterId),
      },
      'report-category': {
        id: 'report-category',
        header: 'Report Category',
        accessorFn: (row) => row.issueType ?? '',
        cell: ({ row }) => (
          <span className="rounded-full bg-red-500/15 px-2.5 py-0.5 text-xs font-semibold text-red-400">
            {dash(row.original.issueType)}
          </span>
        ),
      },
      'report-reason': {
        id: 'report-reason',
        header: 'Report Reason',
        accessorFn: (row) => row.reason ?? '',
        cell: ({ row }) => (
          <div className="max-w-xs truncate text-xs text-slate-300" title={row.original.reason}>
            {dash(row.original.reason)}
          </div>
        ),
      },
      'evidence-attached': {
        id: 'evidence-attached',
        header: 'Evidence Attached',
        accessorFn: (row) =>
          row.hasSupportingDocuments || (row.supportingDocuments?.length ?? 0) > 0 ? 'Yes' : 'No',
        cell: ({ row }) =>
          dash(
            row.original.hasSupportingDocuments ||
              (row.original.supportingDocuments?.length ?? 0) > 0
              ? 'Yes'
              : 'No',
          ),
      },
      severity: {
        id: 'severity',
        header: 'Severity',
        accessorFn: (row) => row.businessImpact ?? '',
        cell: ({ row }) => dash(row.original.businessImpact),
      },
      'case-status': {
        id: 'case-status',
        header: 'Case Status',
        accessorFn: (row) => row.investigationStatus || 'New',
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
      'assigned-to': {
        id: 'assigned-to',
        header: 'Assigned To',
        accessorFn: (row) => row.investigatingAdmin ?? '',
        cell: ({ row }) => dash(row.original.investigatingAdmin),
      },
      'reported-at': {
        id: 'reported-at',
        header: 'Reported At',
        accessorFn: (row) => row.submittedAt ?? '',
        cell: ({ row }) =>
          row.original.submittedAt ? <TableDateTimeCell value={row.original.submittedAt} /> : '—',
      },
      'last-updated': {
        id: 'last-updated',
        header: 'Last Updated',
        accessorFn: (row) => row.latestActionTimestamp ?? '',
        cell: ({ row }) =>
          row.original.latestActionTimestamp ? (
            <TableDateTimeCell value={row.original.latestActionTimestamp} />
          ) : (
            '—'
          ),
      },
      'escalated-by': {
        id: 'escalated-by',
        header: 'Escalated By',
        accessorFn: (row) => row.adminWhoEscalated ?? '',
        cell: ({ row }) => dash(row.original.adminWhoEscalated),
      },
      'escalated-at': {
        id: 'escalated-at',
        header: 'Escalated At',
        accessorFn: (row) => row.escalatedAt || row.escalationTimestamp || '',
        cell: ({ row }) => {
          const value = row.original.escalatedAt || row.original.escalationTimestamp
          return value ? <TableDateTimeCell value={value} /> : '—'
        },
      },
      resolution: {
        id: 'resolution',
        header: 'Resolution',
        accessorFn: (row) => row.finalOutcome ?? '',
        cell: ({ row }) => dash(row.original.finalOutcome),
      },
      'resolution-notes': {
        id: 'resolution-notes',
        header: 'Resolution Notes',
        accessorFn: (row) => row.internalNotes ?? '',
        cell: ({ row }) => dash(row.original.internalNotes),
      },
      'compliance-flag': {
        id: 'compliance-flag',
        header: 'Compliance Flag',
        accessorFn: (row) =>
          row.complianceReviewRequired == null ? '' : row.complianceReviewRequired ? 'Yes' : 'No',
        cell: ({ row }) =>
          dash(
            row.original.complianceReviewRequired == null
              ? null
              : row.original.complianceReviewRequired
                ? 'Yes'
                : 'No',
          ),
      },
      'related-ticket-id': {
        id: 'related-ticket-id',
        header: 'Related Ticket ID',
        accessorFn: (row) => row.linkedSupportTicket ?? '',
        cell: ({ row }) => dash(row.original.linkedSupportTicket),
      },
    }

    const visibleIds = tableColumnPreferencesQuery.data?.visibleColumnIds?.length
      ? tableColumnPreferencesQuery.data.visibleColumnIds
      : DEFAULT_EXPERT_REPORTED_VISIBLE_COLUMN_IDS

    const preferenceColumns = visibleIds
      .map((id) => dataColumnsById[id])
      .filter(Boolean) as ColumnDef<ExpertReportItem>[]

    return withServerSortMeta(
      [
        ...preferenceColumns,
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
                    navigate(`/experts/management/profile/${reportItem.partnerId}`)
                  }}
                >
                  View Expert
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
      EXPERT_COLUMN_SORT_FIELDS,
    )
  }, [activeDropdownId, navigate, setActiveDropdownId, tableColumnPreferencesQuery.data])

  return (
    <div className="flex flex-col gap-5 md:gap-6">
      <ExpertListHeader
        title="Reported Experts"
        breadcrumb="User Management / Reported Users"
        metricsPath="/metrics/expert-reported?returnTo=/experts/reported"
      />

      <DataTable
        columns={columns}
        data={reports}
        getRowId={(r) => r.reportId || r.id}
        isLoading={loading}
        searchValue={enhancedSearch.globalSearch}
        onSearchChange={enhancedSearch.setGlobalSearch}
        searchableColumns={EXPERT_REPORTED_SEARCH_COLUMNS}
        columnSearches={enhancedSearch.columnSearches}
        onColumnSearchChange={enhancedSearch.setColumnSearch}
        onColumnSearchRemove={enhancedSearch.removeColumnSearch}
        onClearAllSearches={enhancedSearch.clearAll}
        searchPlaceholder="Search by report ID, expert, or reporter"
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
        emptyMessage="No reported experts found."
      />
      {exportFilterModals}

      <ExpertReportDetailModal
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
