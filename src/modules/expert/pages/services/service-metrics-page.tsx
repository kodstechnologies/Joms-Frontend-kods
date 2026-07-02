import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { ManageMetrics } from '../../components/manage-metrics'

export const ServiceMetricsPage = () => {
  const navigate = useNavigate()

  return (
    <ManageMetrics
      moduleName="Service Management"
      onBack={() => navigate('/services/dashboard')}
      onCancel={() => navigate('/services/dashboard')}
      onSave={() => {
        toast.success('Metrics configuration saved')
        navigate('/services/dashboard')
      }}
    />
  )
}
