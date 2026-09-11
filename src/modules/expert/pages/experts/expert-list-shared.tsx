import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { getManagementStatusDisplay } from '../../utils/management-status'
import { displayExpertValue } from './expert-list-format'
import { navigateBackOrFallback } from '@/shared/lib/navigation'
import { Button } from '@/shared/components/ui/button'
import { ManageMetricsIcon } from '@/shared/components/icons/action-button-icons'

export function ExpertListHeader({
  title,
  breadcrumb,
  metricsPath = '/experts/management/metrics?section=table',
}: {
  title: string
  breadcrumb: string
  metricsPath?: string
}) {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
      <header className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => navigateBackOrFallback(navigate, '/experts/management')}
          className="group font-heading hover:text-brand-accent flex w-fit items-center gap-2 text-[20px] font-bold tracking-tight text-white transition-colors"
        >
          <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-1" />
          <span>{title}</span>
        </button>
        <p className="text-body-sm-medium text-muted pl-7">{breadcrumb}</p>
      </header>
      <Button
        className="ui-manage-metrics h-9 w-full md:w-auto"
        onClick={() => navigate(metricsPath)}
      >
        <ManageMetricsIcon />
        Manage Metrics
      </Button>
    </div>
  )
}

export function ExpertStatusBadge({ status }: { status?: string }) {
  const { label, className } = getManagementStatusDisplay(status)

  return <span className={className}>{displayExpertValue(label)}</span>
}
