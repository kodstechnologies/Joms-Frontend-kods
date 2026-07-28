import { useState } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/shared/components/ui/button'
import { DataTable } from '@/shared/components/table/data-table'
import { StatCard } from '@/shared/components/dashboard/stat-card'
import {
  useAllEscalations,
  useEscalationMetrics,
} from '@/modules/my-tasks/hooks/use-admin-escalation'

import { escalationColumns } from './escalation-table-columns'

export function EscalationDetails() {
  const navigate = useNavigate()
  const [searchValue, setSearchValue] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 10

  const { data: metricsResponse, isLoading: isMetricsLoading } = useEscalationMetrics()
  const { data: escalationsResponse, isLoading: isEscalationsLoading } = useAllEscalations({
    page,
    limit: pageSize,
    search: searchValue,
  })

  const metrics = metricsResponse?.data
  const escalations = escalationsResponse?.data?.escalations || []
  const meta = escalationsResponse?.data?.meta

  return (
    <div className="flex flex-col gap-5 md:gap-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <h1 className="text-h2 text-brand-text tracking-tight">All Escalation</h1>
          <p className="text-body-md text-muted mt-1 leading-[20px]">
            Track revenue, payouts, and financial performance
          </p>
        </div>

        <Button className="ui-manage-metrics" onClick={() => navigate('/metrics/escalations')}>
          <SlidersHorizontal className="size-4" />
          Manage Metrics
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Escalation"
          value={isMetricsLoading ? '—' : String(metrics?.total ?? 0).padStart(2, '0')}
          trend={{ direction: 'up', percentage: 6.7, label: 'vs last month' }}
        />
        <StatCard
          title="Open Escalation"
          value={isMetricsLoading ? '—' : String(metrics?.open ?? 0)}
          trend={{ direction: 'up', percentage: 6.7, label: 'vs last month' }}
        />
        <StatCard
          title="In Review"
          value={isMetricsLoading ? '—' : String(metrics?.inReview ?? 0)}
          trend={{ direction: 'up', percentage: 6.7, label: 'vs last month' }}
        />
        <StatCard
          title="Resolved"
          value={isMetricsLoading ? '—' : String(metrics?.resolved ?? 0)}
          trend={{ direction: 'up', percentage: 6.7, label: 'vs last month' }}
        />
      </div>

      <DataTable
        columns={escalationColumns}
        data={escalations}
        searchValue={searchValue}
        onSearchChange={(value) => {
          setSearchValue(value)
          setPage(1)
        }}
        searchPlaceholder="Search by name, ID or profession"
        advancedFilterLabel="Advance Filters"
        onAdvancedFilter={() => {}}
        onExport={() => {}}
        isLoading={isEscalationsLoading}
        pagination={{
          page,
          pageSize,
          totalItems: meta?.total ?? escalations.length,
          totalPages: meta?.totalPages ?? 1,
          onPageChange: setPage,
        }}
        resourceLabel="escalations"
      />
    </div>
  )
}
