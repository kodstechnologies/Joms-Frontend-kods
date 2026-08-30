import { useNavigate } from 'react-router-dom'

import { Button } from '@/shared/components/ui/button'
import { ManageMetricsIcon } from '@/shared/components/icons/action-button-icons'

export function EscalationHeader() {
  const navigate = useNavigate()

  return (
    <div className="flex items-start justify-between">
      <div>
        <h1 className="text-h2 text-brand-text tracking-tight">All Escalation</h1>
        <p className="text-body-md text-muted mt-1 leading-[20px]">
          Track revenue, payouts, and financial performance
        </p>
      </div>

      <Button
        className="ui-manage-metrics ui-cta ui-cta-primary"
        onClick={() => navigate('/metrics/escalations?section=table')}
      >
        <ManageMetricsIcon className="size-4 shrink-0" />
        Manage Metrics
      </Button>
    </div>
  )
}
