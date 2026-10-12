import { useEffect, useMemo, useRef } from 'react'
import { useMutation, useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  fetchMyInAppNotifications,
  fetchMyUnreadNotificationCount,
  markAllInAppNotificationsRead,
  markInAppNotificationRead,
  type InboxKind,
  type InAppNotification,
} from '../api/notifications-api'

export const NOTIFICATION_PAGE_SIZE = 20

export const notificationKeys = {
  all: ['notifications'] as const,
  list: (kind?: InboxKind, page = 1, limit = NOTIFICATION_PAGE_SIZE) =>
    [...notificationKeys.all, 'list', kind || 'all', page, limit] as const,
  infinite: (kind?: InboxKind, limit = NOTIFICATION_PAGE_SIZE) =>
    [...notificationKeys.all, 'infinite', kind || 'all', limit] as const,
  unread: (kind?: InboxKind) => [...notificationKeys.all, 'unread', kind || 'all'] as const,
}

type UseMyNotificationsOptions = {
  page?: number
  limit?: number
}

type NotificationsPage = {
  success: boolean
  data: InAppNotification[]
  message?: string
  meta?: {
    page?: number
    limit?: number
    total?: number
    totalPages?: number
  }
}

const emptyPage = (page: number, limit: number): NotificationsPage => ({
  success: false,
  data: [],
  message: 'unavailable',
  meta: { page, limit, total: 0, totalPages: 1 },
})

export const useMyNotifications = (
  enabled = true,
  kind?: InboxKind,
  options: UseMyNotificationsOptions = {},
) => {
  const page = Math.max(1, options.page ?? 1)
  const limit = Math.max(1, options.limit ?? NOTIFICATION_PAGE_SIZE)

  return useQuery({
    queryKey: notificationKeys.list(kind, page, limit),
    queryFn: async () => {
      try {
        return await fetchMyInAppNotifications({ page, limit, kind })
      } catch {
        return emptyPage(page, limit)
      }
    },
    enabled,
    retry: 1,
    refetchInterval: 60_000,
    placeholderData: (previous) => previous,
  })
}

export const useInfiniteMyNotifications = (
  enabled = true,
  kind?: InboxKind,
  limit = NOTIFICATION_PAGE_SIZE,
) => {
  const pageSize = Math.max(1, limit)

  const query = useInfiniteQuery({
    queryKey: notificationKeys.infinite(kind, pageSize),
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const page = Math.max(1, Number(pageParam) || 1)
      try {
        return await fetchMyInAppNotifications({ page, limit: pageSize, kind })
      } catch {
        return emptyPage(page, pageSize)
      }
    },
    getNextPageParam: (lastPage) => {
      const page = Number(lastPage.meta?.page) || 1
      const totalPages = Number(lastPage.meta?.totalPages) || 1
      return page < totalPages ? page + 1 : undefined
    },
    enabled,
    retry: 1,
    refetchInterval: 60_000,
  })

  const notifications = useMemo(() => {
    const seen = new Set<string>()
    const items: InAppNotification[] = []
    for (const page of query.data?.pages ?? []) {
      for (const item of page.data ?? []) {
        if (!item?.id || seen.has(item.id)) continue
        seen.add(item.id)
        items.push(item)
      }
    }
    return items
  }, [query.data?.pages])

  const totalCount = query.data?.pages?.[0]?.meta?.total ?? notifications.length

  return {
    ...query,
    notifications,
    totalCount,
  }
}

export const useInboxInfiniteScroll = ({
  enabled,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  itemCount = 0,
}: {
  enabled: boolean
  hasNextPage: boolean
  isFetchingNextPage: boolean
  fetchNextPage: () => void
  itemCount?: number
}) => {
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const fetchRef = useRef(fetchNextPage)
  const fetchingRef = useRef(isFetchingNextPage)

  useEffect(() => {
    fetchRef.current = fetchNextPage
  }, [fetchNextPage])

  useEffect(() => {
    fetchingRef.current = isFetchingNextPage
  }, [isFetchingNextPage])

  useEffect(() => {
    if (!enabled || !hasNextPage || itemCount <= 0) return
    const node = sentinelRef.current
    if (!node) return

    const root = node.closest('.overflow-y-auto') ?? node.parentElement
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        if (fetchingRef.current) return
        fetchRef.current()
      },
      { root, rootMargin: '160px 0px', threshold: 0 },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [enabled, hasNextPage, itemCount])

  return sentinelRef
}

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
