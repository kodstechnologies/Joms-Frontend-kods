import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import {
  EXPERT_ACTIVE_METRICS,
  EXPERT_AVAILABLE_METRICS,
  EXPERT_HIDDEN_COLUMNS,
  EXPERT_VISIBLE_COLUMNS,
} from '../../mock/expert-manage-metrics.mock'
import { ManageMetrics } from '@/shared/components/manage-metrics'

type ExpertMetricsPageProps = {
  returnTo?: string
}

export const ExpertMetricsPage = ({ returnTo = '/experts/dashboard' }: ExpertMetricsPageProps) => {
  const navigate = useNavigate()
  const goBack = () => navigate(returnTo)

  return (
    <ManageMetrics
      moduleName="Expert Management"
      dashboard={{
        active: EXPERT_ACTIVE_METRICS,
        available: EXPERT_AVAILABLE_METRICS,
      }}
      tableColumns={{
        visible: EXPERT_VISIBLE_COLUMNS,
        hidden: EXPERT_HIDDEN_COLUMNS,
      }}
      onBack={goBack}
      onCancel={goBack}
      onSave={() => {
        toast.success('Metrics configuration saved')
        goBack()
      }}
    />
  )
}
