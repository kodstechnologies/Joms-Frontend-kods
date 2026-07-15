import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { ManageMetrics } from '@/shared/components/manage-metrics'

export const VenueMetricsPage = () => {
  const navigate = useNavigate()
  const goBack = () => navigate('/venues/dashboard')

  return (
    <ManageMetrics
      moduleName="Venue Management"
      onBack={goBack}
      onCancel={goBack}
      onSave={() => {
        toast.message('Venue column preferences coming soon')
        goBack()
      }}
    />
  )
}
