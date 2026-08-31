import { Navigate, useParams } from 'react-router-dom'

import { consultationPerformancePath } from '../../lib/service-navigation'

export function ConsultationDetailPage() {
  const { expertId = '', consultationId = '' } = useParams<{
    expertId: string
    consultationId: string
  }>()

  return <Navigate to={consultationPerformancePath(expertId, consultationId)} replace />
}
