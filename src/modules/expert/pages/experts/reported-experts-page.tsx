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
import {
  ExpertReportDetailModal,
  type ExpertReportItem,
} from '../../components/expert-report-detail-modal'
import {
  buildExpertReportDataColumnsById,
  pickExpertReportPreferenceColumns,
} from '../../utils/expert-preference-columns'
import { EXPERT_REPORTED_EXPORT_COLUMN_MAP } from '../../utils/table-export-column-maps'
import { ExpertListHeader } from './expert-list-shared'
import { DataTable } from '@/shared/components/table/data-table'
import { withServerSortMeta } from '@/shared/utils/table-sort'
import { EXPERT_COLUMN_SORT_FIELDS } from '@/shared/utils/table-sort-field-maps'
import { EXPERT_REPORTED_SEARCH_COLUMNS } from '@/shared/components/table/search-configs'
import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'

export function ExpertReportedExpertsPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [selectedReport, setSelectedReport] = useState<ExpertReportItem | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const list = useReportedList<ExpertReportItem>({
    moduleKey: EXPERT_REPORTED_MODULE_KEY,
    sortFieldMap: EXPERT_COLUMN_SORT_FIELDS,
    exportFileName: 'reported_experts_export',
    exportColumnMap: EXPERT_REPORTED_EXPORT_COLUMN_MAP,
    fetchReports: fetchExpertReports,
    parseResponse: defaultParseResponse<ExpertReportItem>,
  })

  useEffect(() => {
    const openReportId = (location.state as { openReportId?: string } | null)?.openReportId
    if (!openReportId || list.loading || !list.items.length) return

    const match = list.items.find(
      (report) => report.reportId === openReportId || report.id === openReportId,
    )
    if (!match) return

    // eslint-disable-next-line react-hooks/set-state-in-effect -- open report detail from navigation state
    setSelectedReport(match)
    setIsModalOpen(true)
    navigate(location.pathname, { replace: true, state: null })
  }, [list.items, list.loading, location.pathname, location.state, navigate])

  const columns = useMemo<ColumnDef<ExpertReportItem>[]>(() => {
    const visibleIds = list.tableColumnPreferencesQuery.data?.visibleColumnIds ?? []
    return withServerSortMeta(
      [
        ...pickExpertReportPreferenceColumns(
          buildExpertReportDataColumnsById(),
          visibleIds,
          DEFAULT_EXPERT_REPORTED_VISIBLE_COLUMN_IDS,
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
                    navigate(`/experts/management/profile/${reportItem.partnerId}`)
                  }}
                >
                  View Expert
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
      EXPERT_COLUMN_SORT_FIELDS,
    )
  }, [list, navigate])

  return (
    <div className="flex flex-col gap-5 md:gap-6">
      <ExpertListHeader
        title="Reported Experts"
        breadcrumb="User Management / Reported Users"
        metricsPath="/metrics/expert-reported?returnTo=/experts/reported"
      />

      <DataTable
        columns={columns}
        data={list.items}
        getRowId={(r) => r.reportId || r.id}
        isLoading={list.loading}
        searchValue={list.enhancedSearch.globalSearch}
        onSearchChange={list.enhancedSearch.setGlobalSearch}
        searchableColumns={EXPERT_REPORTED_SEARCH_COLUMNS}
        columnSearches={list.enhancedSearch.columnSearches}
        onColumnSearchChange={list.enhancedSearch.setColumnSearch}
        onColumnSearchRemove={list.enhancedSearch.removeColumnSearch}
        onClearAllSearches={list.enhancedSearch.clearAll}
        searchPlaceholder="Search by report ID, expert, or reporter"
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
        emptyMessage="No reported experts found."
      />
      {list.exportFilterModals}

      <ExpertReportDetailModal
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
