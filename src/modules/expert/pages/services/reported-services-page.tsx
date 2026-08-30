import { useMemo, useState, useEffect, useCallback } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Ban, Eye } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { fetchServiceReports } from '../../api/service-api'
import { SERVICE_REPORTED_MODULE_KEY } from '../../api/ui-preferences-api'
import { DEFAULT_SERVICE_REPORTED_VISIBLE_COLUMN_IDS } from '../../config/service-management-table-columns.config'
import { useTableColumnPreferences } from '../../hooks/use-ui-preferences'
import type { FilterValues } from '@/shared/types/data-filter'
import { useModuleExportFilters } from '@/shared/components/advanced-filter/use-module-export-filters'
import { exportDisplayValue } from '@/shared/utils/export-utils'
import { buildFilterParams, createFilteredExportHandler } from '@/shared/utils/export-filter-utils'
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
import { useServerTableSort } from '@/shared/hooks/use-server-table-sort'
import { useEnhancedSearch } from '@/shared/hooks/use-enhanced-search'
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
  reportId: { header: 'Report ID', accessor: (item) => exportDisplayValue(item.reportId) },
  serviceId: { header: 'Listing ID', accessor: (item) => exportDisplayValue(item.serviceId) },
  serviceTitle: {
    header: 'Listing Name',
    accessor: (item) => exportDisplayValue(item.serviceTitle),
  },
  reportedAt: {
    header: 'Reported At',
    accessor: (item) => formatExportDateTime(item.submittedAt || item.createdAt),
  },
  issueType: { header: 'Report Reason', accessor: (item) => exportDisplayValue(item.issueType) },
  reporterType: {
    header: 'Reported By',
    accessor: (item) => exportDisplayValue(item.reporterType),
  },
  reporterId: { header: 'Reporter ID', accessor: (item) => exportDisplayValue(item.reporterId) },
  status: {
    header: 'Case Status',
    accessor: (item) => exportDisplayValue(item.investigationStatus || 'New'),
  },
  assignedAdmin: {
    header: 'Assigned Admin',
    accessor: (item) => exportDisplayValue(item.investigatingAdmin),
  },
}

const fetchServiceReportsForExport = async (params: Record<string, unknown>) => {
  const response = await fetchServiceReports(params)
  const payload = response?.data ?? response
  const items = (payload?.items || []) as ServiceReportItem[]
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

export function ServiceReportedServicesPage() {
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState(1)
  const serverSort = useServerTableSort({
    sortFieldMap: SERVICE_COLUMN_SORT_FIELDS,
    onPageReset: () => setCurrentPage(1),
  })
  const enhancedSearch = useEnhancedSearch({ onSearchChange: () => setCurrentPage(1) })
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null)
  const tableColumnPreferencesQuery = useTableColumnPreferences(SERVICE_REPORTED_MODULE_KEY)

  const [reports, setReports] = useState<ServiceReportItem[]>([])
  const [loading, setLoading] = useState(true)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  const [selectedReport, setSelectedReport] = useState<ServiceReportItem | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [appliedFilters, setAppliedFilters] = useState<FilterValues>({})

  const apiFilterParams = useMemo(() => buildFilterParams(appliedFilters), [appliedFilters])
  const searchParams = useMemo(() => enhancedSearch.buildSearchParams(), [enhancedSearch])

  const [prevKey, setPrevKey] = useState(
    `${currentPage}-${JSON.stringify(searchParams)}-${JSON.stringify(apiFilterParams)}-${JSON.stringify(serverSort.sortParams)}`,
  )

  const currentKey = `${currentPage}-${JSON.stringify(searchParams)}-${JSON.stringify(apiFilterParams)}-${JSON.stringify(serverSort.sortParams)}`

  if (currentKey !== prevKey) {
    setPrevKey(currentKey)
    setLoading(true)
  }

  const loadReports = useCallback(() => {
    fetchServiceReports({
      page: currentPage,
      limit: 10,
      ...serverSort.sortParams,
      ...searchParams,
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
  }, [currentPage, searchParams, apiFilterParams, serverSort.sortParams])

  const handleApplyFilters = useCallback((values: FilterValues) => {
    setAppliedFilters(values)
    setCurrentPage(1)
  }, [])

  const handleExportData = useMemo(
    () =>
      createFilteredExportHandler(
        fetchServiceReportsForExport,
        EXPORT_COLUMN_MAP,
        'reported_services_export',
        {
          search: enhancedSearch.globalSearch.trim() || undefined,
        },
      ),
    [enhancedSearch.globalSearch],
  )

  const {
    onAdvancedFilter,
    onExport,
    modals: exportFilterModals,
  } = useModuleExportFilters({
    moduleKey: SERVICE_REPORTED_MODULE_KEY,
    onApplyFilters: handleApplyFilters,
    onExportData: handleExportData,
  })

  useEffect(() => {
    loadReports()
  }, [loadReports])

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
                    navigate(`/services/management/full-view/${reportItem.serviceId}`)
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
  }, [activeDropdownId, navigate, tableColumnPreferencesQuery.data])

  return (
    <div className="flex flex-col gap-5 md:gap-6">
      <ExpertListHeader
        title="Reported Services"
        breadcrumb="Service Management / Reported Services"
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
        onUpdated={loadReports}
      />
    </div>
  )
}
