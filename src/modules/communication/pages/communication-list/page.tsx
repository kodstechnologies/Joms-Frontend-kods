import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, SlidersHorizontal } from 'lucide-react'
import { toast } from 'sonner'

import { communicationColumns } from '../../components/communication-table-columns'
import { useCommunicationMetrics, useCommunications } from '../../hooks/use-communications'
import { DataTable } from '@/shared/components/table/data-table'
import { StatCard } from '@/shared/components/dashboard/stat-card'
import { getApiErrorMessage } from '@/shared/lib/api-error'

const PAGE_SIZE = 10

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

  const metricsQuery = useCommunicationMetrics()
  const listQuery = useCommunications({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
  })

  useEffect(() => {
    if (listQuery.isError) {
      toast.error(getApiErrorMessage(listQuery.error))
    }
  }, [listQuery.error, listQuery.isError])

  const rows = listQuery.data?.data ?? []
  const pagination = listQuery.data?.meta
  const totalItems = pagination?.total ?? 0
  const totalPages = pagination?.totalPages ?? 1
  const metrics = metricsQuery.data

  const stats = [
    { title: 'Total messages sent', value: String(metrics?.totalMessagesSent ?? 20) },
    { title: 'Active campaigns', value: String(metrics?.activeCampaigns ?? 38) },
    { title: 'Channels used', value: String(metrics?.channelsUsed ?? 3) },
    { title: 'Scheduled messages', value: String(metrics?.scheduledMessages ?? 10) },
    { title: 'Failed/Undelivered', value: String(metrics?.failedUndelivered ?? 20) },
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
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
            <Plus className="icon-sm shrink-0" />
            Create Communication
          </button>
        </div>
      </div>

      {/* Stat cards — 5 cols */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            trend={{ direction: 'up', percentage: 6.7, label: 'vs last month' }}
            className="h-[130px]"
          />
        ))}
      </div>

      <DataTable
        columns={communicationColumns}
        data={rows}
        getRowId={(row) => row.id}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        searchPlaceholder="Search by name, ID or profession"
        advancedFilterLabel="Advance Filters"
        onAdvancedFilter={() => toast.info('Advanced filters coming soon')}
        onExport={() => toast.info('Export coming soon')}
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
    </div>
  )
}
