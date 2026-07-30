import { Link } from 'react-router-dom'

/** Landing for temp chat harness links */
export function ChatTestPage() {
  return (
    <div className="min-h-screen bg-zinc-950 p-6 text-zinc-100">
      <div className="mx-auto max-w-lg space-y-4">
        <h1 className="text-2xl font-semibold">Chat test harness</h1>
        <p className="text-sm text-zinc-400">Temporary — delete later.</p>
        <div className="grid gap-3">
          <Link
            to="/dev/chat-partner"
            className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 hover:bg-amber-500/20"
          >
            <div className="font-medium text-amber-300">Partner panel</div>
            <div className="text-sm text-zinc-400">Dynamic login (phone + password)</div>
          </Link>
          <Link
            to="/dev/chat-user"
            className="rounded-xl border border-sky-500/40 bg-sky-500/10 px-4 py-3 hover:bg-sky-500/20"
          >
            <div className="font-medium text-sky-300">User panel</div>
            <div className="text-sm text-zinc-400">Static test users</div>
          </Link>
        </div>
      </div>
    </div>
  )
}
