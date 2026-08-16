import { useQuery } from '@tanstack/react-query'

import { fetchExpertLeaderboard, fetchExpertLeaderboardProfile } from '../api/leaderboard-api'
import type { ExpertLeaderboardQuery } from '../type/leaderboard'

export const useExpertLeaderboard = (params: ExpertLeaderboardQuery) =>
  useQuery({
    queryKey: ['expert-leaderboard', params],
    queryFn: () => fetchExpertLeaderboard(params),
  })

export const useExpertLeaderboardProfile = (
  partnerId: string | null,
  params: ExpertLeaderboardQuery,
) =>
  useQuery({
    queryKey: ['expert-leaderboard-profile', partnerId, params],
    queryFn: () => fetchExpertLeaderboardProfile(partnerId as string, params),
    enabled: Boolean(partnerId),
  })
