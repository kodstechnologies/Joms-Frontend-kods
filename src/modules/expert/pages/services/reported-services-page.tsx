import { useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Ban, Eye } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { fetchServiceReports } from '../../api/service-api'
import { getServiceManagementViewPath } from '../../lib/service-navigation'
import { SERVICE_REPORTED_MODULE_KEY } from '../../api/ui-preferences-api'
import {
  DEFAULT_SERVICE_REPORTED_VISIBLE_COLUMN_IDS,
  SERVICE_REPORTED_TABLE_COLUMNS_CATALOG,
} from '../../config/service-management-table-columns.config'
import { defaultParseResponse, useReportedList } from '../../hooks/use-reported-list'
import { exportDisplayValue } from '@/shared/utils/export-utils'
import {
  ServiceReportDetailModal,
  type ServiceReportItem,
} from '../../components/service-report-detail-modal'
import { ExpertListHeader } from '../experts/expert-list-shared'
import {
  buildServiceReportDataColumnsById,
  pickServicePreferenceColumns,
} from '../../utils/service-preference-columns'
import { DataTable } from '@/shared/components/table/data-table'
import { withServerSortMeta } from '@/shared/utils/table-sort'
import { SERVICE_COLUMN_SORT_FIELDS } from '@/shared/utils/table-sort-field-maps'
import { SERVICE_REPORTED_SEARCH_COLUMNS } from '@/shared/components/table/search-configs'
import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'

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
  { header: string; accessor: (item: ServiceReportItem) => string }
> = {
  'report-id': { header: 'Report ID', accessor: (item) => exportDisplayValue(item.reportId) },
  'listing-id': { header: 'Listing ID', accessor: (item) => exportDisplayValue(item.serviceId) },
  'listing-name': {
    header: 'Listing Name',
    accessor: (item) => exportDisplayValue(item.serviceTitle),
  },
  'reported-at': {
    header: 'Reported At',
    accessor: (item) => formatExportDateTime(item.submittedAt || item.createdAt),
  },
  'report-reason': {
    header: 'Report Reason',
    accessor: (item) => exportDisplayValue(item.issueType),
  },
  'reported-by': {
    header: 'Reported By',
    accessor: (item) => exportDisplayValue(item.reporterType),
  },
  'reporter-id': {
    header: 'Reporter ID',
    accessor: (item) => exportDisplayValue(item.reporterId),
  },
  'case-status': {
    header: 'Case Status',
    accessor: (item) => exportDisplayValue(item.investigationStatus || 'New'),
  },
  'assigned-admin': {
    header: 'Assigned Admin',
    accessor: (item) => exportDisplayValue(item.investigatingAdmin),
  },
}

export function ServiceReportedServicesPage() {
  const navigate = useNavigate()
  const [selectedReport, setSelectedReport] = useState<ServiceReportItem | null>(null)
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
  } = useReportedList<ServiceReportItem>({
    moduleKey: SERVICE_REPORTED_MODULE_KEY,
    sortFieldMap: SERVICE_COLUMN_SORT_FIELDS,
    exportFileName: 'reported_services_export',
    exportColumnMap: EXPORT_COLUMN_MAP,
    fetchReports: fetchServiceReports,
    parseResponse: defaultParseResponse<ServiceReportItem>,
    defaultVisibleColumnIds: DEFAULT_SERVICE_REPORTED_VISIBLE_COLUMN_IDS,
    catalogColumnIds: SERVICE_REPORTED_TABLE_COLUMNS_CATALOG.map((column) => column.id),
  })

  const columns = useMemo<ColumnDef<ServiceReportItem>[]>(() => {
    const dataColumnsById = buildServiceReportDataColumnsById()
    const visibleIds = tableColumnPreferencesQuery.data?.visibleColumnIds?.length
      ? tableColumnPreferencesQuery.data.visibleColumnIds
      : DEFAULT_SERVICE_REPORTED_VISIBLE_COLUMN_IDS

    return withServerSortMeta(
      [
        ...pickServicePreferenceColumns(
          dataColumnsById,
          visibleIds,
          DEFAULT_SERVICE_REPORTED_VISIBLE_COLUMN_IDS,
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
                    navigate(
                      getServiceManagementViewPath({
                        _id: reportItem.serviceId,
                        partnerId: reportItem.partnerId,
                      }),
                    )
                  }}
                >
                  View Service
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
      SERVICE_COLUMN_SORT_FIELDS,
    )
  }, [activeDropdownId, navigate, setActiveDropdownId, tableColumnPreferencesQuery.data])

  return (
    <div className="flex flex-col gap-5 md:gap-6">
      <ExpertListHeader
        title="Reported Services"
        breadcrumbItems={[
          { label: 'Service Management', to: '/services/management' },
          { label: 'Reported Services', isActive: true },
        ]}
        backTo="/services/management"
        metricsPath="/metrics/service-reported?returnTo=/services/management/reported&section=table"
      />

      <DataTable
        columns={columns}
        data={reports}
        getRowId={(r) => r.reportId || r.id}
        isLoading={loading}
        searchValue={enhancedSearch.globalSearch}
        onSearchChange={enhancedSearch.setGlobalSearch}
        searchableColumns={SERVICE_REPORTED_SEARCH_COLUMNS}
        columnSearches={enhancedSearch.columnSearches}
        onColumnSearchChange={enhancedSearch.setColumnSearch}
        onColumnSearchRemove={enhancedSearch.removeColumnSearch}
        onClearAllSearches={enhancedSearch.clearAll}
        searchPlaceholder="Search by report ID, service title, or reporter"
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
        emptyMessage="No reported services found."
      />
      {exportFilterModals}

      <ServiceReportDetailModal
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
