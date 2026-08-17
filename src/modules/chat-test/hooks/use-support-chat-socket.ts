import { useCallback, useEffect, useRef, useState } from 'react'
import { io, type Socket } from 'socket.io-client'
import type { SupportChatState } from '../api/support.api'

type Handlers = {
  onChatState?: (payload: SupportChatState) => void
  onNewMessage?: (payload: unknown) => void
  onTicketUpdated?: (payload: unknown) => void
  onReconnect?: () => void
}

export function useSupportChatSocket(
  token: string | null,
  getHandlers: () => Handlers,
  baseUrl?: string,
) {
  const socketRef = useRef<Socket | null>(null)
  const getHandlersRef = useRef(getHandlers)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    getHandlersRef.current = getHandlers
  }, [getHandlers])

  useEffect(() => {
    if (!token || !baseUrl) return undefined

    const socket = io(baseUrl, {
      path: '/socket.io',
      auth: { token },
      extraHeaders: { Authorization: `Bearer ${token}` },
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 500,
      reconnectionDelayMax: 5000,
    })
    socketRef.current = socket

    const onConnect = () => {
      setConnected(true)
      socket.emit('join_support', {})
      getHandlersRef.current()?.onReconnect?.()
    }

    const heartbeat = setInterval(() => {
      if (socket.connected) socket.emit('heartbeat')
    }, 10000)

    socket.on('connect', onConnect)
    socket.on('reconnect', onConnect)
    socket.on('connect_error', () => setConnected(false))
    socket.on('disconnect', () => setConnected(false))
    socket.on('support_chat_state', (payload: SupportChatState) =>
      getHandlersRef.current()?.onChatState?.(payload),
    )
    socket.on('support_new_message', (payload: unknown) =>
      getHandlersRef.current()?.onNewMessage?.(payload),
    )
    socket.on('support_ticket_updated', (payload: unknown) =>
      getHandlersRef.current()?.onTicketUpdated?.(payload),
    )
    socket.on('support_ticket_created', (payload: unknown) =>
      getHandlersRef.current()?.onTicketUpdated?.(payload),
    )

    if (socket.connected) onConnect()

    return () => {
      clearInterval(heartbeat)
      socket.removeAllListeners()
      socket.disconnect()
      socketRef.current = null
      setConnected(false)
    }
  }, [token, baseUrl])

  const sendSupportMessage = useCallback(
    (payload: Record<string, unknown>) =>
      new Promise<{ success: boolean; data?: SupportChatState; message?: string }>((resolve) => {
        const socket = socketRef.current
        if (!socket?.connected) {
          resolve({ success: false, message: 'Socket not connected' })
          return
        }
        const timer = setTimeout(() => resolve({ success: false, message: 'Timeout' }), 25000)
        socket.emit(
          'send_support_message',
          payload,
          (res: { success?: boolean; data?: SupportChatState; message?: string }) => {
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

  return { connected, sendSupportMessage }
}
