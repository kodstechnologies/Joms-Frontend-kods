import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  fetchMyInAppNotifications,
  fetchMyUnreadNotificationCount,
  markAllInAppNotificationsRead,
  markInAppNotificationRead,
} from '../api/notifications-api'

export const notificationKeys = {
  all: ['notifications'] as const,
  list: () => [...notificationKeys.all, 'list'] as const,
  unread: () => [...notificationKeys.all, 'unread'] as const,
}

export const useMyNotifications = (enabled = true) =>
  useQuery({
    queryKey: notificationKeys.list(),
    queryFn: () => fetchMyInAppNotifications({ page: 1, limit: 50 }),
    enabled,
    refetchInterval: 60_000,
  })

export const useUnreadNotificationCount = () =>
  useQuery({
    queryKey: notificationKeys.unread(),
    queryFn: async () => {
      const result = await fetchMyUnreadNotificationCount()
      return result.data?.unreadCount ?? 0
    },
    refetchInterval: 30_000,
  })

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => markInAppNotificationRead(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    },
  })
}

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => markAllInAppNotificationsRead(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    },
  })
}
