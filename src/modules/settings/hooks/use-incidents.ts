import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { assignIncident, fetchIncidentMetrics, fetchIncidents } from '../api/incidents-api'

export const incidentKeys = {
  all: ['settings', 'incidents'] as const,
  metrics: () => [...incidentKeys.all, 'metrics'] as const,
  list: (params?: object) => [...incidentKeys.all, 'list', params] as const,
}

export const useIncidentMetrics = () =>
  useQuery({
    queryKey: incidentKeys.metrics(),
    queryFn: fetchIncidentMetrics,
  })

export const useIncidents = (params?: {
  page?: number
  limit?: number
  search?: string
  severity?: string
  status?: string
}) =>
  useQuery({
    queryKey: incidentKeys.list(params),
    queryFn: () => fetchIncidents(params),
  })

export const useAssignIncident = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      department,
      assignee,
      assigneeId,
    }: {
      id: string
      department: string
      assignee: string
      assigneeId: string
    }) => assignIncident(id, { department, assignee, assigneeId }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: incidentKeys.all })
    },
  })
}
