import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import createIcon from '@/assets/JOMS_ICONS-2/create-account-icon.png'
import type { ColumnDef } from '@tanstack/react-table'
import { ManageMetricsIcon } from '@/shared/components/icons/action-button-icons'

import {
  CommunicationActions,
  CommunicationStatusBadge,
} from '../../components/communication-table-cells'
import {
  COMMUNICATION_METRIC_IDS,
  COMMUNICATION_METRIC_ID_SET,
  COMMUNICATION_MODULE_KEY,
  DEFAULT_COMMUNICATION_METRIC_IDS,
} from '../../config/communication-metrics.config'
import { useCommunicationMetrics, useCommunications } from '../../hooks/use-communications'
import type { Communication } from '../../api/communication-api'
import { DataTable } from '@/shared/components/table/data-table'
import { useServerTableSort } from '@/shared/hooks/use-server-table-sort'
import { useEnhancedSearch } from '@/shared/hooks/use-enhanced-search'
import { withServerSortMeta } from '@/shared/utils/table-sort'
import { COMMUNICATION_SEARCH_COLUMNS } from '@/shared/components/table/search-configs'
import { getApiErrorMessage } from '@/shared/lib/api-error'
import {
  orderByActiveMetricIds,
  useActiveMetricIds,
} from '@/modules/expert/hooks/use-active-metric-ids'
import { useTableColumnPreferences } from '@/modules/expert/hooks/use-ui-preferences'
import { useTableExportColumnIds } from '@/shared/hooks/use-table-export-column-ids'
import { useModuleExportFilters } from '@/shared/components/advanced-filter'
import { exportDisplayValue } from '@/shared/utils/export-utils'
import {
  buildCommunicationListQueryParams,
  createCommunicationFilteredExportHandler,
} from '@/shared/utils/export-filter-utils'
import { sortIdsByCatalogOrder } from '@/shared/lib/dedupe-ids'
import { fetchCommunications } from '../../api/communication-api'
import { CommunicationStatsBar } from '../../components/communication-stats-bar'
import { buildCommunicationMetricCards } from '../../utils/communication-metrics'
import type { FilterValues } from '@/shared/types/data-filter'

const PAGE_SIZE = 10

const DEFAULT_VISIBLE_COLUMN_IDS = [
  'message-id',
  'title',
  'channel',
  'type',
  'audience',
  'status',
  'created-by',
  'created-on',
]

const EXPORT_COLUMN_MAP: Record<
  string,
  { header: string; accessor: (c: Communication) => string }
> = {
  'message-id': { header: 'Message ID', accessor: (c) => exportDisplayValue(c.messageId) },
  'campaign-id': { header: 'Campaign ID', accessor: (c) => exportDisplayValue(c.campaignId) },
  title: { header: 'Title', accessor: (c) => exportDisplayValue(c.title) },
  channel: { header: 'Channel', accessor: (c) => exportDisplayValue(c.channelLabel) },
  type: { header: 'Type', accessor: (c) => exportDisplayValue(c.typeLabel) },
  audience: { header: 'Audience', accessor: (c) => exportDisplayValue(c.audienceLabel) },
  'audience-size': {
    header: 'Audience Size',
    accessor: (c) => exportDisplayValue(c.audienceSize),
  },
  'content-preview': {
    header: 'Content Preview',
    accessor: (c) => exportDisplayValue(c.contentPreview),
  },
  status: { header: 'Status', accessor: (c) => exportDisplayValue(c.statusLabel) },
  priority: { header: 'Priority', accessor: (c) => exportDisplayValue(c.priorityLabel) },
  'created-by': { header: 'Created By', accessor: (c) => exportDisplayValue(c.createdBy) },
  'created-on': { header: 'Created On', accessor: (c) => exportDisplayValue(c.createdAtLabel) },
  'scheduled-at': {
    header: 'Scheduled At',
    accessor: (c) => exportDisplayValue(c.scheduledAtLabel),
  },
  'sent-at': { header: 'Sent At', accessor: (c) => exportDisplayValue(c.sentAtLabel) },
  'delivered-count': {
    header: 'Delivered Count',
    accessor: (c) => exportDisplayValue(c.deliveredCount),
  },
  'failed-count': { header: 'Failed Count', accessor: (c) => exportDisplayValue(c.failedCount) },
  'open-rate': { header: 'Open Rate', accessor: (c) => `${c.openRate ?? 0}%` },
  'click-rate': { header: 'Click Rate', accessor: (c) => `${c.clickRate ?? 0}%` },
  'last-updated': { header: 'Last Updated', accessor: (c) => exportDisplayValue(c.updatedAtLabel) },
}

const COMMUNICATION_SORT_FIELD_MAP: Record<string, string | null> = {
  'message-id': 'messageId',
  'campaign-id': 'campaignId',
  title: 'title',
  channel: 'channel',
  type: 'type',
  audience: 'audience',
  'audience-size': 'audienceSize',
  'content-preview': 'messageContent',
  status: 'status',
  priority: 'priority',
  'created-by': 'createdBy',
  'created-on': 'createdAt',
  'created-at': 'createdAt',
  'scheduled-at': 'scheduledAt',
  'sent-at': 'sentAt',
  'delivered-count': 'deliveredCount',
  'failed-count': 'failedCount',
  'open-rate': 'openRate',
  'click-rate': 'clickRate',
  'last-updated': 'updatedAt',
}

export function CommunicationListPage() {
  const [page, setPage] = useState(1)
  const serverSort = useServerTableSort({
    sortFieldMap: COMMUNICATION_SORT_FIELD_MAP,
    defaultSortBy: 'created-on',
    onPageReset: () => setPage(1),
  })
  const enhancedSearch = useEnhancedSearch({ onSearchChange: () => setPage(1) })
  const navigate = useNavigate()

  const [appliedFilters, setAppliedFilters] = useState<FilterValues>({})

  const metricsQuery = useCommunicationMetrics()
  const listQueryParams = useMemo(
    () =>
      buildCommunicationListQueryParams(appliedFilters, {
        page,
        limit: PAGE_SIZE,
        ...enhancedSearch.buildSearchParams(),
        ...serverSort.sortParams,
      }),
    [appliedFilters, enhancedSearch, page, serverSort.sortParams],
  )
  const listQuery = useCommunications(listQueryParams)
  const activeMetricIds = useActiveMetricIds(COMMUNICATION_MODULE_KEY, [
    ...DEFAULT_COMMUNICATION_METRIC_IDS,
  ])
  const filteredActiveMetricIds = useMemo(
    () =>
      sortIdsByCatalogOrder(
        activeMetricIds.filter((id) => COMMUNICATION_METRIC_ID_SET.has(id)),
        COMMUNICATION_METRIC_IDS,
      ),
    [activeMetricIds],
  )
  const tableColumnPreferencesQuery = useTableColumnPreferences(COMMUNICATION_MODULE_KEY)
  const catalogColumnIds = useMemo(() => Object.keys(EXPORT_COLUMN_MAP), [])
  const exportColumnIds = useTableExportColumnIds({
    visibleColumnIds: tableColumnPreferencesQuery.data?.visibleColumnIds,
    defaultColumnIds: DEFAULT_VISIBLE_COLUMN_IDS,
    catalogColumnIds,
  })

  useEffect(() => {
    if (listQuery.isError) {
      toast.error(getApiErrorMessage(listQuery.error))
    }
  }, [listQuery.error, listQuery.isError])

  useEffect(() => {
    if (metricsQuery.isError) {
      toast.error(getApiErrorMessage(metricsQuery.error))
    }
  }, [metricsQuery.error, metricsQuery.isError])

  const rows = useMemo(() => listQuery.data?.data ?? [], [listQuery.data?.data])
  const pagination = listQuery.data?.meta
  const totalItems = pagination?.total ?? 0
  const totalPages = pagination?.totalPages ?? 1

  const handleApplyFilters = useCallback((values: FilterValues) => {
    toast.success('Filters applied')
    setAppliedFilters(values)
    setPage(1)
  }, [])

  const handleExportData = useMemo(
    () =>
      createCommunicationFilteredExportHandler(
        fetchCommunications,
        EXPORT_COLUMN_MAP,
        'communications_export',
        { search: enhancedSearch.globalSearch || undefined },
        { columnIds: exportColumnIds, catalogOrder: catalogColumnIds },
      ),
    [catalogColumnIds, enhancedSearch.globalSearch, exportColumnIds],
  )

  const {
    onAdvancedFilter,
    onExport,
    modals: exportFilterModals,
  } = useModuleExportFilters({
    moduleKey: 'communication-management',
    onApplyFilters: handleApplyFilters,
    onExportData: handleExportData,
  })

  const stats = useMemo(() => {
    if (!metricsQuery.data) return []
    const catalogCards = buildCommunicationMetricCards(metricsQuery.data).filter((card) =>
      COMMUNICATION_METRIC_ID_SET.has(card.id),
    )
    return orderByActiveMetricIds(catalogCards, filteredActiveMetricIds)
  }, [filteredActiveMetricIds, metricsQuery.data])

  const columns = useMemo(() => {
    const dataColumnsById: Record<string, ColumnDef<Communication>> = {
      'message-id': {
        id: 'message-id',
        accessorKey: 'messageId',
        header: 'Message ID',
      },
      'campaign-id': {
        id: 'campaign-id',
        accessorKey: 'campaignId',
        header: 'Campaign ID',
      },
      title: {
        id: 'title',
        accessorKey: 'title',
        header: 'Title',
      },
      channel: {
        id: 'channel',
        accessorKey: 'channelLabel',
        header: 'Channel',
      },
      type: {
        id: 'type',
        accessorKey: 'typeLabel',
        header: 'Type',
      },
      audience: {
        id: 'audience',
        accessorKey: 'audienceLabel',
        header: 'Audience',
      },
      'audience-size': {
        id: 'audience-size',
        accessorKey: 'audienceSize',
        header: 'Audience Size',
      },
      'content-preview': {
        id: 'content-preview',
        accessorKey: 'contentPreview',
        header: 'Content Preview',
      },
      status: {
        id: 'status',
        accessorKey: 'statusLabel',
        header: 'Status',
        cell: ({ row }) => <CommunicationStatusBadge status={row.original.statusLabel} />,
      },
      priority: {
        id: 'priority',
        accessorKey: 'priorityLabel',
        header: 'Priority',
      },
      'created-by': {
        id: 'created-by',
        accessorKey: 'createdBy',
        header: 'Created By',
      },
      'created-on': {
        id: 'created-on',
        accessorKey: 'createdAtLabel',
        header: 'Created On',
      },
      'scheduled-at': {
        id: 'scheduled-at',
        accessorKey: 'scheduledAtLabel',
        header: 'Scheduled At',
      },
      'sent-at': {
        id: 'sent-at',
        accessorKey: 'sentAtLabel',
        header: 'Sent At',
      },
      'delivered-count': {
        id: 'delivered-count',
        accessorKey: 'deliveredCount',
        header: 'Delivered Count',
      },
      'failed-count': {
        id: 'failed-count',
        accessorKey: 'failedCount',
        header: 'Failed Count',
      },
      'open-rate': {
        id: 'open-rate',
        header: 'Open Rate',
        accessorFn: (row) => `${row.openRate ?? 0}%`,
      },
      'click-rate': {
        id: 'click-rate',
        header: 'Click Rate',
        accessorFn: (row) => `${row.clickRate ?? 0}%`,
      },
      'last-updated': {
        id: 'last-updated',
        accessorKey: 'updatedAtLabel',
        header: 'Last Updated',
      },
    }

    const visibleIds = tableColumnPreferencesQuery.data?.visibleColumnIds?.length
      ? tableColumnPreferencesQuery.data.visibleColumnIds
      : DEFAULT_VISIBLE_COLUMN_IDS

    const preferenceColumns = visibleIds.map((id) => dataColumnsById[id]).filter(Boolean)

    const selectColumn: ColumnDef<Communication> = {
      id: 'select',
      header: () => <input type="checkbox" className="ui-table-checkbox" />,
      cell: () => <input type="checkbox" className="ui-table-checkbox" />,
      meta: { headerClassName: 'w-10', cellClassName: 'w-10' },
      enableSorting: false,
    }

    const actionsColumn: ColumnDef<Communication> = {
      id: 'actions',
      header: 'Actions',
      enableSorting: false,
      meta: { headerClassName: 'pr-5 text-right', cellClassName: 'relative pr-5 text-right' },
      cell: ({ row }) => <CommunicationActions communication={row.original} />,
    }

    return withServerSortMeta(
      [selectColumn, ...preferenceColumns, actionsColumn],
      COMMUNICATION_SORT_FIELD_MAP,
    )
  }, [tableColumnPreferencesQuery.data])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-h2 text-brand-text tracking-tight">Communication Management</h1>
          <p className="ui-page-subtitle mt-1 text-[16px] leading-5 font-medium tracking-normal text-[#FFFFFF80]">
            Create and manage announcements across partner audiences.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/metrics/communication')}
            className="ui-manage-metrics ui-cta ui-cta-primary"
          >
            <ManageMetricsIcon />
            Manage Metrics
          </button>
          <button
            type="button"
            onClick={() => navigate('/communication/create')}
            className="ui-cta ui-cta-primary"
          >
            <img src={createIcon} alt="create" className="icon-sm shrink-0" />
            Create Communication
          </button>
        </div>
      </div>

      <CommunicationStatsBar
        metrics={stats}
        isLoading={metricsQuery.isLoading}
        skeletonIds={filteredActiveMetricIds}
      />

      <DataTable
        columns={columns}
        data={rows}
        getRowId={(row) => row.id}
        {...serverSort.dataTableSortProps}
        searchValue={enhancedSearch.globalSearch}
        onSearchChange={enhancedSearch.setGlobalSearch}
        searchableColumns={COMMUNICATION_SEARCH_COLUMNS}
        columnSearches={enhancedSearch.columnSearches}
        onColumnSearchChange={enhancedSearch.setColumnSearch}
        onColumnSearchRemove={enhancedSearch.removeColumnSearch}
        onClearAllSearches={enhancedSearch.clearAll}
        searchPlaceholder="Search by message ID or subject"
        advancedFilterLabel="Advance Filters"
        onAdvancedFilter={onAdvancedFilter}
        onExport={onExport}
        isLoading={listQuery.isLoading}
        pagination={{
          page,
          pageSize: PAGE_SIZE,
          totalItems,
          totalPages,
          onPageChange: setPage,
        }}
        resourceLabel="communications"
        emptyMessage="No communications found."
      />
      {exportFilterModals}
    </div>
  )
}
