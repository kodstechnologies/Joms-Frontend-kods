import { useMemo, useState, useEffect, useCallback } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Ban, Eye } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { exportExpertReportsCSV, fetchExpertReports } from '../../api/expert-api'
import {
  ExpertReportDetailModal,
  type ExpertReportItem,
} from '../../components/expert-report-detail-modal'
import { ExpertListHeader } from './expert-list-shared'
import { DataTable } from '@/shared/components/table/data-table'
import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'

export function ExpertReportedExpertsPage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null)

  const [reports, setReports] = useState<ExpertReportItem[]>([])
  const [loading, setLoading] = useState(true)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  const [selectedReport, setSelectedReport] = useState<ExpertReportItem | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [prevKey, setPrevKey] = useState(`${currentPage}-${searchQuery}`)

  const currentKey = `${currentPage}-${searchQuery}`

  if (currentKey !== prevKey) {
    setPrevKey(currentKey)
    setLoading(true)
  }

  const loadReports = useCallback(() => {
    fetchExpertReports({
      page: currentPage,
      limit: 10,
      search: searchQuery,
    })
      .then((res) => {
        const items = res?.data?.items || res?.items || []
        const pagination = res?.data?.pagination || res?.pagination

        setReports(items)
        setTotalItems(pagination?.total || items.length)
        setTotalPages(pagination?.totalPages || 1)
      })
      .catch((err: unknown) => {
        console.error('Failed to load reported experts:', err)
        setReports([])
      })
      .finally(() => {
        setLoading(false)
      })
  }, [currentPage, searchQuery])

  useEffect(() => {
    loadReports()
  }, [loadReports])

  const columns = useMemo<ColumnDef<ExpertReportItem>[]>(
    () => [
      {
        accessorKey: 'reportId',
        header: 'Report ID',
        cell: ({ row }) => (
          <span className="font-mono font-semibold text-[#E5B54E]">
            {row.original.reportId || 'REP000'}
          </span>
        ),
      },
      {
        accessorKey: 'expertName',
        header: 'Reported Expert',
        cell: ({ row }) => (
          <div>
            <div className="font-semibold text-white">{row.original.expertName}</div>
            <div className="text-[11px] text-slate-400">ID: {row.original.partnerId}</div>
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
        accessorKey: 'submittedAt',
        header: 'Reported At',
        cell: ({ row }) => (
          <span className="text-xs text-slate-400">
            {row.original.submittedAt
              ? new Date(row.original.submittedAt).toLocaleDateString('en-GB')
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
    [activeDropdownId, navigate],
  )

  return (
    <div className="flex flex-col gap-5 md:gap-6">
      <ExpertListHeader title="Reported Experts" breadcrumb="User Management / Reported Users" />

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
        searchPlaceholder="Search by report ID, expert, or reporter"
        onAdvancedFilter={() => toast.message('Advanced filters are coming soon')}
        onExport={async () => {
          try {
            toast.loading('Exporting expert reports...')
            await exportExpertReportsCSV({ search: searchQuery })
            toast.dismiss()
            toast.success('Expert reports exported successfully')
          } catch (err: unknown) {
            toast.dismiss()
            toast.error(err instanceof Error ? err.message : 'Failed to export report CSV')
          }
        }}
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

      <ExpertReportDetailModal
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
