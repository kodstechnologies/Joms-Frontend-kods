import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { fetchMyTasks, startEscalationReview } from '../api/my-tasks-api'
import type { TaskTab } from '../types/my-tasks'

export const useMyTasks = (tab: TaskTab = 'all') =>
  useQuery({
    queryKey: ['my-tasks', tab],
    queryFn: () => fetchMyTasks(tab),
  })

export const useStartEscalationReview = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (partnerId: string) => startEscalationReview(partnerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-tasks'] })
    },
  })
}
