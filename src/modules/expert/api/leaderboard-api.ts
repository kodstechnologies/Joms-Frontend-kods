import { adminApiClient } from '@/shared/lib/axios'

import type {
  ExpertLeaderboardProfileResponse,
  ExpertLeaderboardQuery,
  ExpertLeaderboardResponse,
} from '../type/leaderboard'

export const fetchExpertLeaderboard = async (params?: ExpertLeaderboardQuery) => {
  const response = await adminApiClient.get<ExpertLeaderboardResponse>(
    '/admin/internal/admin/experts/leaderboard',
    { params },
  )
  return response.data
}

export const fetchExpertLeaderboardProfile = async (
  partnerId: string,
  params?: ExpertLeaderboardQuery,
) => {
  const response = await adminApiClient.get<ExpertLeaderboardProfileResponse>(
    `/admin/internal/admin/experts/leaderboard/${encodeURIComponent(partnerId)}`,
    { params },
  )
  return response.data
}
