import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  fetchMyInAppNotifications,
  fetchMyUnreadNotificationCount,
  markAllInAppNotificationsRead,
  markInAppNotificationRead,
  type InboxKind,
  type InAppNotification,
} from '../api/notifications-api'

export const notificationKeys = {
  all: ['notifications'] as const,
  list: (kind?: InboxKind) => [...notificationKeys.all, 'list', kind || 'all'] as const,
  unread: (kind?: InboxKind) => [...notificationKeys.all, 'unread', kind || 'all'] as const,
}

export const useMyNotifications = (enabled = true, kind?: InboxKind) =>
  useQuery({
    queryKey: notificationKeys.list(kind),
    queryFn: async () => {
      try {
        return await fetchMyInAppNotifications({ page: 1, limit: 50, kind })
      } catch {
        return { success: false, data: [] as InAppNotification[], message: 'unavailable' }
      }
    },
    enabled,
    retry: 1,
    refetchInterval: 60_000,
  })

export const useUnreadNotificationCount = (kind?: InboxKind) =>
  useQuery({
    queryKey: notificationKeys.unread(kind),
    queryFn: async () => {
      try {
        const result = await fetchMyUnreadNotificationCount(kind)
        return result.data?.unreadCount ?? 0
      } catch {
        return 0
      }
    },
    retry: 1,
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
