import { useCallback, useEffect, useRef, useState } from 'react'
import { io, type Socket } from 'socket.io-client'
import { env } from '@/config/env'

type Handlers = {
  onNewMessage?: (payload: unknown) => void
  onThreadUpdated?: (payload: unknown) => void
  onThreadsList?: (payload: unknown) => void
  onTyping?: (payload: unknown) => void
  onUserStatus?: (payload: unknown) => void
  onMessagesRead?: (payload: unknown) => void
  onMessageUpdated?: (payload: unknown) => void
  onMessageDeleted?: (payload: unknown) => void
  onReconnect?: () => void
}

export function useChatSocket(token: string | null, getHandlers: () => Handlers, baseUrl?: string) {
  const socketRef = useRef<Socket | null>(null)
  const getHandlersRef = useRef(getHandlers)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    getHandlersRef.current = getHandlers
  }, [getHandlers])

  useEffect(() => {
    if (!token) return undefined

    const socket = io(baseUrl || env.chatApiBaseUrl, {
      path: '/socket.io',
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
    })
    socketRef.current = socket

    const onConnect = () => {
      setConnected(true)
      socket.emit('register_user', {}, () => {})
      socket.emit('heartbeat')
      getHandlersRef.current()?.onReconnect?.()
    }

    socket.on('connect', onConnect)
    socket.on('disconnect', () => setConnected(false))
    socket.on('new_message', (p: unknown) => getHandlersRef.current()?.onNewMessage?.(p))
    socket.on('thread_updated', (p: unknown) => getHandlersRef.current()?.onThreadUpdated?.(p))
    socket.on('update_threads', (p: unknown) => getHandlersRef.current()?.onThreadsList?.(p))
    socket.on('user_typing', (p: unknown) => getHandlersRef.current()?.onTyping?.(p))
    socket.on('user_status', (p: unknown) => getHandlersRef.current()?.onUserStatus?.(p))
    socket.on('messages_read', (p: unknown) => getHandlersRef.current()?.onMessagesRead?.(p))
    socket.on('message_updated', (p: unknown) => getHandlersRef.current()?.onMessageUpdated?.(p))
    socket.on('message_deleted', (p: unknown) => getHandlersRef.current()?.onMessageDeleted?.(p))

    const heartbeat = setInterval(() => {
      if (socket.connected) socket.emit('heartbeat')
    }, 25000)

    if (socket.connected) onConnect()

    return () => {
      clearInterval(heartbeat)
      socket.removeAllListeners()
      socket.disconnect()
      socketRef.current = null
      setConnected(false)
    }
  }, [token, baseUrl])

  const joinThread = useCallback((threadId: string) => {
    socketRef.current?.emit('join_thread', { threadId })
  }, [])

  const leaveThread = useCallback((threadId: string) => {
    socketRef.current?.emit('leave_thread', { threadId })
  }, [])

  const sendSocketMessage = useCallback(
    (payload: Record<string, unknown>) =>
      new Promise<{ success: boolean; data?: unknown; message?: string }>((resolve) => {
        const s = socketRef.current
        if (!s?.connected) {
          resolve({ success: false, message: 'Socket not connected' })
          return
        }
        const timer = setTimeout(() => resolve({ success: false, message: 'Timeout' }), 8000)
        s.emit(
          'send_message',
          payload,
          (res: { success?: boolean; data?: unknown; message?: string }) => {
            clearTimeout(timer)
            resolve({
              success: Boolean(res?.success),
              data: res?.data,
              message: res?.message,
            })
          },
        )
      }),
    [],
  )

  const emitTyping = useCallback((threadId: string, isTyping: boolean) => {
    socketRef.current?.emit('typing', { threadId, isTyping })
  }, [])

  const subscribePresence = useCallback((userIds: string[]) => {
    const ids = userIds.map((id) => String(id || '').trim()).filter(Boolean)
    if (!ids.length) return
    const s = socketRef.current
    if (!s) return
    const emit = () => s.emit('subscribe_presence', { userIds: ids })
    if (s.connected) emit()
    else s.once('connect', emit)
  }, [])

  return { connected, joinThread, leaveThread, sendSocketMessage, emitTyping, subscribePresence }
}
