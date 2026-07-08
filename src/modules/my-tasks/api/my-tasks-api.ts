import { adminApiClient } from '@/shared/lib/axios'

import type { MyTasksResponse, TaskTab } from '../types/my-tasks'

export const fetchMyTasks = async (tab: TaskTab = 'all') => {
  const response = await adminApiClient.get<MyTasksResponse>('/admin/tasks', {
    params: { tab },
  })
  return response.data
}

export const startEscalationReview = async (partnerId: string) => {
  const response = await adminApiClient.patch(
    `/admin/internal/admin/partners/${partnerId}/escalation/start`,
  )
  return response.data
}
