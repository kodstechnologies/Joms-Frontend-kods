import { useCallback, useEffect, useState } from 'react'
import {
  listPartnerServiceProjectsWithUser,
  type ServiceProjectCard,
  type ServiceProjectStatus,
} from '../api/quotation.api'

type Props = {
  token: string
  userId: string
  userLabel?: string
  open: boolean
  onClose: () => void
}

const filters: Array<{ value: ServiceProjectStatus; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'newservice', label: 'New' },
  { value: 'ongoing', label: 'On-going' },
  { value: 'completed', label: 'Completed' },
]

function paymentLabel(type: ServiceProjectCard['paymentType']) {
  if (type === 'milestone') return 'Milestones'
  if (type === 'one_time') return 'Single Payment'
  if (type === 'fixed') return 'Fixed'
  if (type === 'tiered') return 'Tiered'
  return 'Quotation'
}

function statusLabel(status: ServiceProjectCard['projectStatus']) {
  if (status === 'newservice') return 'New'
  if (status === 'ongoing') return 'On-going'
  return status
}

export function PartnerChatMyProjectsModal({ token, userId, userLabel, open, onClose }: Props) {
  const [status, setStatus] = useState<ServiceProjectStatus>('all')
  const [projects, setProjects] = useState<ServiceProjectCard[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!open || !userId.trim()) return
    setLoading(true)
    setError(null)
    try {
      const rows = await listPartnerServiceProjectsWithUser(token, userId.trim(), status)
      setProjects(rows)
    } catch (err) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Failed to load projects',
      )
    } finally {
      setLoading(false)
    }
  }, [open, token, userId, status])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate partner projects from API
    void load()
  }, [load])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-3 sm:items-center">
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl border border-zinc-800 bg-zinc-950 text-zinc-100 shadow-xl">
        <header className="border-b border-zinc-800 px-4 py-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-serif text-2xl">My projects</h2>
              <p className="mt-1 text-xs text-zinc-400">
                Service engagements with{' '}
                <span className="text-amber-300">{userLabel || userId}</span>
              </p>
            </div>
            <button
              type="button"
              className="rounded-lg border border-zinc-700 px-2 py-1 text-sm text-zinc-300 hover:bg-zinc-800"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </header>

        <div className="border-b border-zinc-800 px-4 py-2">
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setStatus(filter.value)}
                className={`rounded-full px-3 py-1 text-[11px] font-medium ${
                  status === filter.value
                    ? 'bg-amber-400 text-zinc-950'
                    : 'border border-zinc-700 text-zinc-300 hover:border-zinc-500'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {error ? (
            <div className="mb-3 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </div>
          ) : null}

          {loading ? (
            <p className="py-8 text-center text-sm text-zinc-500">Loading projects…</p>
          ) : null}

          {!loading && !projects.length ? (
            <p className="rounded-xl border border-dashed border-zinc-700 py-10 text-center text-sm text-zinc-500">
              No service projects with this user
            </p>
          ) : null}

          <ul className="space-y-2">
            {projects.map((project) => (
              <li
                key={project.id}
                className="rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 py-3 text-sm"
              >
                <div className="font-medium text-zinc-100">{project.title}</div>
                <p className="mt-1 text-xs text-zinc-400">
                  {paymentLabel(project.paymentType)} ·{' '}
                  {project.engagementType === 'fixed_tiered' ? 'Fixed/Tiered' : 'Custom'} ·{' '}
                  <span className="capitalize">{statusLabel(project.projectStatus)}</span>
                </p>
                <p className="mt-1 text-[10px] text-zinc-500">
                  {project.navigation.screenHint.replaceAll('_', ' ')}
                  {project.navigation.threadId ? ` · thread ${project.navigation.threadId}` : ''}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <footer className="border-t border-zinc-800 px-4 py-2 text-[10px] text-zinc-500">
          Uses{' '}
          <span className="font-mono">GET /quotations/projects/services/with-user/:userId</span>.
          Full actions on My projects section above.
        </footer>
      </div>
    </div>
  )
}
