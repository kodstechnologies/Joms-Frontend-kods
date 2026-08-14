import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { STATIC_CHAT_USERS } from '../config/static-users'
import { UserVenueBookPanel } from '../components/user-venue-book-panel'
import { env } from '@/config/env'

/**
 * Completely separate from /dev/chat-user (quotations / consultations / chat).
 * Venue book + dummy pay only.
 */
export function UserVenueChatTestPage() {
  const [userId, setUserId] = useState(STATIC_CHAT_USERS[0]?.id || '')

  const selectedUser = useMemo(
    () => STATIC_CHAT_USERS.find((x) => x.id === userId) || STATIC_CHAT_USERS[0] || null,
    [userId],
  )

  return (
    <div className="min-h-screen bg-zinc-950 p-4 text-zinc-100 md:p-6">
      <div className="mx-auto max-w-3xl space-y-4">
        <header className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">User · Venue bookings</h1>
            <div className="flex flex-wrap gap-3 text-sm">
              <Link to="/dev/chat-user" className="text-sky-400 hover:underline">
                User chat →
              </Link>
              <Link to="/dev/chat-partner" className="text-amber-400 hover:underline">
                Partner →
              </Link>
            </div>
          </div>
          <p className="text-sm text-zinc-400">
            Standalone Venue tab for chat-test. Browse approved venues → spaces → slots → create
            booking → dummy pay. Does not share UI with quotations or chat.
          </p>
          <p className="text-[11px] text-zinc-500">API: {env.venueApiBaseUrl}/venue-bookings</p>
        </header>

        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/60 p-3">
          <label className="text-xs tracking-wide text-zinc-500 uppercase">Static user</label>
          <select
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          >
            {STATIC_CHAT_USERS.map((u) => (
              <option key={u.id} value={u.id}>
                {u.username}
              </option>
            ))}
          </select>
          <span className="text-xs break-all text-zinc-500">
            {selectedUser?.id} · {selectedUser?.phone_e164}
          </span>
        </div>

        {selectedUser ? <UserVenueBookPanel user={selectedUser} /> : null}
      </div>
    </div>
  )
}
