import { useCallback, useEffect, useState } from 'react'
import { listVaultFiles, type VaultFile, type VaultScope } from '../api/chat.api'

type Props = {
  token: string
  threadId: string
  open: boolean
  chatBaseUrl: string
  onClose: () => void
}

const TABS: { id: VaultScope; label: string }[] = [
  { id: 'yours', label: 'Your Files' },
  { id: 'clients', label: "Client's Files" },
  { id: 'recent', label: 'Recent files' },
]

export function FileVaultModal({ token, threadId, open, chatBaseUrl, onClose }: Props) {
  const [scope, setScope] = useState<VaultScope>('recent')
  const [search, setSearch] = useState('')
  const [files, setFiles] = useState<VaultFile[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!open || !threadId) return
    setLoading(true)
    setError(null)
    try {
      const data = await listVaultFiles(token, threadId, scope, { search, limit: 50 }, chatBaseUrl)
      setFiles(data.files || [])
    } catch (err) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Failed to load vault',
      )
    } finally {
      setLoading(false)
    }
  }, [token, threadId, scope, search, open, chatBaseUrl])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate vault listing from chat API
    void load()
  }, [load])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-3 sm:items-center">
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl border border-zinc-800 bg-zinc-950 text-zinc-100 shadow-xl">
        <header className="border-b border-zinc-800 px-4 py-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-serif text-2xl">File Vault</h2>
              <p className="mt-1 text-xs text-zinc-400">
                Shared files for review — yours, client&apos;s, and recent.
              </p>
            </div>
            <button
              type="button"
              className="rounded-lg border border-zinc-700 px-2 py-1 text-xs hover:bg-zinc-800"
              onClick={onClose}
            >
              Close
            </button>
          </div>

          <div className="relative mt-3">
            <input
              className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            {TABS.filter((t) => t.id !== 'recent').map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setScope(tab.id)}
                className={`rounded-xl border px-3 py-4 text-sm ${
                  scope === tab.id ? 'border-sky-400 bg-zinc-900' : 'border-zinc-800 bg-zinc-900/50'
                }`}
              >
                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-800 text-xl text-amber-300">
                  📁
                </div>
                {tab.label}
              </button>
            ))}
          </div>
        </header>

        <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2">
          <button
            type="button"
            className={`text-sm ${scope === 'recent' ? 'text-white' : 'text-zinc-500'}`}
            onClick={() => setScope('recent')}
          >
            Recent files
          </button>
          <button
            type="button"
            className="text-xs text-zinc-500 hover:text-zinc-300"
            onClick={() => void load()}
          >
            Refresh
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4">
          {error ? (
            <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-200">
              {error}
            </div>
          ) : null}
          {loading ? <div className="text-sm text-zinc-500">Loading…</div> : null}
          {!loading && !files.length ? (
            <div className="text-sm text-zinc-500">No files yet</div>
          ) : null}

          <div className="grid grid-cols-3 gap-3">
            {files.map((f) => (
              <a
                key={f.messageId}
                href={f.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="group block"
                title={f.fileName}
              >
                <div className="relative aspect-square overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
                  {f.messageType === 'image' ? (
                    <img src={f.fileUrl} alt={f.fileName} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-3xl text-zinc-600">
                      📄
                    </div>
                  )}
                </div>
                <div className="mt-1 truncate text-xs text-zinc-300">{f.fileName}</div>
                <div className="truncate text-[10px] text-zinc-500">
                  {f.isMine ? 'You' : f.senderName}
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
