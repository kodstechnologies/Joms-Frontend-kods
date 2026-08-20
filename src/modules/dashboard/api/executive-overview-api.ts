import { adminApiClient } from '@/shared/lib/axios'

import type { ExecutiveOverviewPayload } from '@/modules/dashboard/types/executive-overview'

type ApiSuccess<T> = {
  success: boolean
  message?: string
  data: T
}

export async function fetchExecutiveOverview(refresh = false) {
  const response = await adminApiClient.get<ApiSuccess<ExecutiveOverviewPayload>>(
    '/admin/dashboard/executive-overview',
    { params: refresh ? { refresh: 1 } : undefined },
  )
  return response.data.data
}

export async function logExecutiveOverviewExport() {
  await adminApiClient.post('/admin/dashboard/executive-overview/export')
}
