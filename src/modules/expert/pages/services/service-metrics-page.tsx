import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { ManageMetrics } from '@/shared/components/manage-metrics'

export const ServiceMetricsPage = () => {
  const navigate = useNavigate()
  const goBack = () => navigate('/services/dashboard')

  return (
    <ManageMetrics
      moduleName="Service Management"
      onBack={goBack}
      onCancel={goBack}
      onSave={() => {
        toast.message('Service column preferences coming soon')
        goBack()
      }}
    />
  )
}
