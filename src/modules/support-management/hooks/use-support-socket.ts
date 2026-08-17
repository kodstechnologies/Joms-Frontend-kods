import { useCallback, useEffect, useRef, useState } from 'react'
import { io, type Socket } from 'socket.io-client'

import { env } from '@/config/env'

type SupportSocketHandlers = {
  onConnected?: (payload: unknown) => void
  onChatState?: (payload: unknown) => void
  onTicketCreated?: (payload: unknown) => void
  onTicketUpdated?: (payload: unknown) => void
  onTicketDeleted?: (payload: unknown) => void
  onNewMessage?: (payload: unknown) => void
  onTyping?: (payload: unknown) => void
  onError?: (payload: unknown) => void
}

export function useSupportSocket(
  token: string | null,
  getHandlers: () => SupportSocketHandlers,
  baseUrl = env.adminApiBaseUrl,
) {
  const socketRef = useRef<Socket | null>(null)
  const getHandlersRef = useRef(getHandlers)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    getHandlersRef.current = getHandlers
  }, [getHandlers])

  useEffect(() => {
    if (!token) return undefined

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
    }

    socket.on('connect', onConnect)
    socket.on('reconnect', onConnect)
    socket.on('connect_error', () => setConnected(false))
    socket.on('disconnect', () => setConnected(false))
    socket.on('support_connected', (p: unknown) => getHandlersRef.current()?.onConnected?.(p))
    socket.on('support_chat_state', (p: unknown) => getHandlersRef.current()?.onChatState?.(p))
    socket.on('support_ticket_created', (p: unknown) =>
      getHandlersRef.current()?.onTicketCreated?.(p),
    )
    socket.on('support_ticket_updated', (p: unknown) =>
      getHandlersRef.current()?.onTicketUpdated?.(p),
    )
    socket.on('support_ticket_deleted', (p: unknown) =>
      getHandlersRef.current()?.onTicketDeleted?.(p),
    )
    socket.on('support_new_message', (p: unknown) => getHandlersRef.current()?.onNewMessage?.(p))
    socket.on('support_typing', (p: unknown) => getHandlersRef.current()?.onTyping?.(p))
    socket.on('support_error', (p: unknown) => getHandlersRef.current()?.onError?.(p))

    if (socket.connected) onConnect()

    return () => {
      socket.removeAllListeners()
      socket.disconnect()
      socketRef.current = null
      setConnected(false)
    }
  }, [token, baseUrl])

  const joinTicket = useCallback((ticketId: string) => {
    socketRef.current?.emit('join_ticket', { ticketId })
  }, [])

  const leaveTicket = useCallback((ticketId: string) => {
    socketRef.current?.emit('leave_ticket', { ticketId })
  }, [])

  const sendSupportMessage = useCallback(
    (payload: Record<string, unknown>) =>
      new Promise<{ success: boolean; data?: unknown; message?: string }>((resolve) => {
        const socket = socketRef.current
        if (!socket?.connected) {
          resolve({ success: false, message: 'Socket not connected' })
          return
        }
        const timer = setTimeout(() => resolve({ success: false, message: 'Timeout' }), 12000)
        socket.emit(
          'send_support_message',
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

  const emitTyping = useCallback((ticketId: string, isTyping: boolean) => {
    socketRef.current?.emit('typing', { ticketId, isTyping })
  }, [])

  return { connected, joinTicket, leaveTicket, sendSupportMessage, emitTyping }
}
