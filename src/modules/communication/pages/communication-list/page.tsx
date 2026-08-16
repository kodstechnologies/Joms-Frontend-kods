import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SlidersHorizontal } from 'lucide-react'
import { toast } from 'sonner'
import createIcon from '@/assets/JOMS_ICONS-2/icons8-create.svg'
import type { ColumnDef } from '@tanstack/react-table'

import {
  CommunicationActions,
  CommunicationStatusBadge,
} from '../../components/communication-table-cells'
import { useCommunicationMetrics, useCommunications } from '../../hooks/use-communications'
import type { Communication } from '../../api/communication-api'
import { DataTable } from '@/shared/components/table/data-table'
import { StatCard } from '@/shared/components/dashboard/stat-card'
import { getApiErrorMessage } from '@/shared/lib/api-error'
import {
  orderByActiveMetricIds,
  useActiveMetricIds,
} from '@/modules/expert/hooks/use-active-metric-ids'
import { useTableColumnPreferences } from '@/modules/expert/hooks/use-ui-preferences'
import { useModuleExportFilters } from '@/shared/components/advanced-filter'
import { exportDisplayValue } from '@/shared/utils/export-utils'
import { createFilteredExportHandler } from '@/shared/utils/export-filter-utils'
import { fetchCommunications } from '../../api/communication-api'
import type { FilterValues } from '@/shared/types/data-filter'

const PAGE_SIZE = 10
const COMMUNICATION_MODULE_KEY = 'communication'

const DEFAULT_METRIC_IDS = [
  'total-messages-sent',
  'active-campaigns',
  'channels-used',
  'scheduled-messages',
  'failed-undelivered',
]

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
  title: { header: 'Title', accessor: (c) => exportDisplayValue(c.title) },
  channel: { header: 'Channel', accessor: (c) => exportDisplayValue(c.channelLabel) },
  type: { header: 'Type', accessor: (c) => exportDisplayValue(c.typeLabel) },
  audience: { header: 'Audience', accessor: (c) => exportDisplayValue(c.audienceLabel) },
  status: { header: 'Status', accessor: (c) => exportDisplayValue(c.statusLabel) },
  'created-by': { header: 'Created By', accessor: (c) => exportDisplayValue(c.createdBy) },
  'created-on': { header: 'Created On', accessor: (c) => exportDisplayValue(c.createdAtLabel) },
}

export function CommunicationListPage() {
  const [searchValue, setSearchValue] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const navigate = useNavigate()

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchValue.trim())
      setPage(1)
    }, 300)
    return () => window.clearTimeout(timer)
  }, [searchValue])

  const [appliedFilters, setAppliedFilters] = useState<FilterValues>({})

  const metricsQuery = useCommunicationMetrics()
  const listQuery = useCommunications({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
    status: (appliedFilters.status as string[])?.join(',') || undefined,
    channel: (appliedFilters.channel as string[])?.join(',') || undefined,
    audience: (appliedFilters.audience as string[])?.join(',') || undefined,
    type: (appliedFilters.type as string[])?.join(',') || undefined,
    messageId: (appliedFilters.messageId as string) || undefined,
    title: (appliedFilters.title as string) || undefined,
    createdBy: (appliedFilters.createdBy as string) || undefined,
  })
  const activeMetricIds = useActiveMetricIds(COMMUNICATION_MODULE_KEY, DEFAULT_METRIC_IDS)
  const tableColumnPreferencesQuery = useTableColumnPreferences(COMMUNICATION_MODULE_KEY)

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
      createFilteredExportHandler(fetchCommunications, EXPORT_COLUMN_MAP, 'communications_export'),
    [],
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
    const cards = metricsQuery.data?.cards ?? []
    if (!cards.length) return []
    return orderByActiveMetricIds(cards, activeMetricIds)
  }, [activeMetricIds, metricsQuery.data?.cards])

  const columns = useMemo(() => {
    const dataColumnsById: Record<string, ColumnDef<Communication>> = {
      'message-id': {
        id: 'message-id',
        accessorKey: 'messageId',
        header: 'Message ID',
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
      status: {
        id: 'status',
        accessorKey: 'statusLabel',
        header: 'Status',
        cell: ({ row }) => <CommunicationStatusBadge status={row.original.statusLabel} />,
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
    }

    const visibleIds = tableColumnPreferencesQuery.data?.visibleColumnIds?.length
      ? tableColumnPreferencesQuery.data.visibleColumnIds
      : DEFAULT_VISIBLE_COLUMN_IDS

    const preferenceColumns = visibleIds.map((id) => dataColumnsById[id]).filter(Boolean)

    const selectColumn: ColumnDef<Communication> = {
      id: 'select',
      header: () => <input type="checkbox" className="rounded border-white/20 bg-transparent" />,
      cell: () => <input type="checkbox" className="rounded border-white/20 bg-transparent" />,
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

    return [selectColumn, ...preferenceColumns, actionsColumn]
  }, [tableColumnPreferencesQuery.data])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-h2 text-brand-text tracking-tight">Communication Management</h1>
          <p className="text-body-md text-muted mt-1 leading-[20px]">
            Create and manage announcements across partner audiences.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/metrics/communication')}
            className="ui-manage-metrics ui-cta ui-cta-primary"
          >
            <SlidersHorizontal className="icon-sm shrink-0" />
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map((stat) => (
          <StatCard
            key={stat.id}
            title={stat.title}
            value={stat.value}
            trend={stat.trend}
            hint={stat.hint}
            className="h-[130px]"
          />
        ))}
      </div>

      <DataTable
        columns={columns}
        data={rows}
        getRowId={(row) => row.id}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        searchPlaceholder="Search by name, ID or profession"
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
