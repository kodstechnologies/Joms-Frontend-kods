import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { ManageMetrics } from '../../components/manage-metrics'

export const VenueMetricsPage = () => {
  const navigate = useNavigate()

  return (
    <ManageMetrics
      moduleName="Venue Management"
      onBack={() => navigate('/venues/dashboard')}
      onCancel={() => navigate('/venues/dashboard')}
      onSave={() => {
        toast.success('Metrics configuration saved')
        navigate('/venues/dashboard')
      }}
    />
  )
}
