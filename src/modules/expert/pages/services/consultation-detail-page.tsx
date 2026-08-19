import { Navigate, useParams } from 'react-router-dom'

import { consultationPerformancePath } from '../../lib/service-navigation'

/** Consultation Details is not in the Expert Management flow; go to Performance. */
export function ConsultationDetailPage() {
  const { expertId = '', consultationId = '' } = useParams<{
    expertId: string
    consultationId: string
  }>()

  return <Navigate to={consultationPerformancePath(expertId, consultationId)} replace />
}
