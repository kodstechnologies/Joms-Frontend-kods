import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart3, Plus } from 'lucide-react'
import { toast } from 'sonner'

import { communicationColumns } from '../../components/communication-table-columns'
import { useCommunicationMetrics, useCommunications } from '../../hooks/use-communications'
import { DataTable } from '@/shared/components/table/data-table'
import { StatCard } from '@/shared/components/dashboard/stat-card'
import { Button } from '@/shared/components/ui/button'
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

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <h1 className="text-brand-text text-2xl font-bold md:text-3xl">
            Communication Management
          </h1>
          <p className="text-brand-muted mt-1 text-sm md:text-base">
            Create and manage announcements across partner audiences.
          </p>
        </div>

        <div className="flex w-full flex-col gap-2 sm:flex-row md:w-auto">
          <Button
            variant="secondary"
            className="ui-manage-metrics"
            onClick={() => navigate('/metrics/communication')}
          >
            <BarChart3 className="size-4" />
            Manage Metrics
          </Button>
          <Button onClick={() => navigate('/communication/create')}>
            <Plus className="size-4" />
            Create Communication
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
        <StatCard title="Total messages sent" value={String(metrics?.totalMessagesSent ?? 0)} />
        <StatCard title="Active campaigns" value={String(metrics?.activeCampaigns ?? 0)} />
        <StatCard title="Channels used" value={String(metrics?.channelsUsed ?? 0)} />
        <StatCard title="Scheduled messages" value={String(metrics?.scheduledMessages ?? 0)} />
        <StatCard title="Failed/Undelivered" value={String(metrics?.failedUndelivered ?? 0)} />
      </div>

      <DataTable
        columns={communicationColumns}
        data={rows}
        getRowId={(row) => row.id}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        searchPlaceholder="Search by title, ID or creator"
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
      />
    </div>
  )
}
