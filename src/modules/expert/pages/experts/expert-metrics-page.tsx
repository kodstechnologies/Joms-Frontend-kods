import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { ManageMetrics } from '../../components/manage-metrics'

export const ExpertMetricsPage = () => {
  const navigate = useNavigate()

  return (
    <ManageMetrics
      moduleName="Expert Management"
      onBack={() => navigate('/experts/dashboard')}
      onCancel={() => navigate('/experts/dashboard')}
      onSave={() => {
        toast.success('Metrics configuration saved')
        navigate('/experts/dashboard')
      }}
    />
  )
}
