import { ArrowLeft, BarChart3 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { getManagementStatusDisplay } from '../../utils/management-status'
import { displayExpertValue } from './expert-list-format'
import { navigateBackOrFallback } from '@/shared/lib/navigation'
import { Button } from '@/shared/components/ui/button'

export function ExpertListHeader({ title, breadcrumb }: { title: string; breadcrumb: string }) {
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
        <p className="pl-7 text-[12px] font-medium text-[#777777]">{breadcrumb}</p>
      </header>
      <Button
        className="h-9 w-full md:w-auto"
        onClick={() => navigate('/experts/management/metrics')}
      >
        <BarChart3 className="size-4" />
        Manage Metrics
      </Button>
    </div>
  )
}

export function ExpertStatusBadge({ status }: { status?: string }) {
  const { label, className } = getManagementStatusDisplay(status)

  return <span className={className}>{displayExpertValue(label)}</span>
}
