import { useState } from 'react'
import {
  getVenueInsights,
  listEligibleVenueReviews,
  submitVenueReview,
  type EligibleVenueReviewItem,
  type PartnerInsights,
} from '../api/profile-review.api'
import type { StaticChatUser } from '../config/static-users'
import { env } from '@/config/env'

type Props = {
  user: StaticChatUser
}

function errMessage(err: unknown) {
  return (
    (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
    (err instanceof Error ? err.message : 'Request failed')
  )
}

export function UserVenueInsightsPanel({ user }: Props) {
  const [venueId, setVenueId] = useState('')
  const [eligible, setEligible] = useState<EligibleVenueReviewItem[]>([])
  const [insights, setInsights] = useState<
    (PartnerInsights & { venueId: string; ownerId?: string | null; venueName?: string }) | null
  >(null)
  const [drafts, setDrafts] = useState<Record<string, { rating: number; text: string }>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)

  const loadEligible = async () => {
    const items = await listEligibleVenueReviews(user.accessToken, venueId.trim() || undefined)
    setEligible(items)
    return items
  }

  const loadInsights = async (id: string) => {
    const data = await getVenueInsights(id, { sort: 'recent', limit: 20 })
    setInsights(data)
    return data
  }

  const refresh = async () => {
    setLoading(true)
    setError(null)
    try {
      const items = await loadEligible()
      const id = venueId.trim() || items[0]?.venueId || ''
      if (id) {
        await loadInsights(id)
        setOk(`Loaded ${items.length} eligible booking(s) + live insights for ${id}`)
      } else {
        setInsights(null)
        setOk('No eligible completed venue bookings yet — dummy pay then Mark completed')
      }
    } catch (err) {
      setError(errMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const submit = async (item: EligibleVenueReviewItem) => {
    const key = item.sessionId
    const draft = drafts[key] || { rating: 5, text: '' }
    setLoading(true)
    setError(null)
    setOk(null)
    try {
      await submitVenueReview(user.accessToken, item.venueId, {
        sessionId: item.sessionId,
        rating: draft.rating,
        text: draft.text,
        userName: user.username,
      })
      setOk(`Review saved for “${item.title}” — insights refreshed from venue-service`)
      await loadEligible()
      await loadInsights(item.venueId)
    } catch (err) {
      setError(errMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="space-y-4 rounded-xl border border-violet-500/30 bg-zinc-900/70 p-4">
      <div>
        <h2 className="text-lg font-medium text-violet-300">Venue insights + rate a booking</h2>
        <p className="text-xs text-zinc-500">
          Dynamic — eligible list from completed PartnerSessions, then POST
          /venues/:venueId/reviews. Insights from GET /venues/:venueId/insights (
          {env.venueApiBaseUrl}).
        </p>
      </div>

      {error ? (
        <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
          {error}
        </div>
      ) : null}
      {ok ? (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-100">
          {ok}
        </div>
      ) : null}

      <div className="flex flex-wrap items-end gap-2">
        <label className="min-w-[220px] flex-1 space-y-1 text-sm">
          <span className="text-xs tracking-wide text-zinc-500 uppercase">Venue id (optional)</span>
          <input
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 font-mono text-xs"
            value={venueId}
            onChange={(e) => setVenueId(e.target.value)}
            placeholder="Paste venue id to filter, or leave blank"
          />
        </label>
        <button
          type="button"
          disabled={loading}
          onClick={() => void refresh()}
          className="rounded-lg bg-violet-500 px-4 py-2 text-sm font-medium text-white hover:bg-violet-400 disabled:opacity-40"
        >
          {loading ? 'Loading…' : 'Load eligible + insights'}
        </button>
      </div>

      {insights ? (
        <div className="grid gap-2 rounded-lg border border-zinc-800 bg-zinc-950/60 p-3 text-sm sm:grid-cols-4">
          <div>
            <div className="text-xs text-zinc-500">
              Ratings · {insights.venueName || insights.venueId}
            </div>
            <div className="font-medium">
              {insights.ratingsSummary.available
                ? `${insights.ratingsSummary.average} ★ (${insights.ratingsSummary.count})`
                : '—'}
            </div>
          </div>
          <div>
            <div className="text-xs text-zinc-500">NPS</div>
            <div className="font-medium">
              {insights.metrics.nps.available ? insights.metrics.nps.score : '—'}
            </div>
          </div>
          <div>
            <div className="text-xs text-zinc-500">Speed</div>
            <div className="font-medium">
              {insights.metrics.speed.available ? insights.metrics.speed.label : '—'}
            </div>
          </div>
          <div>
            <div className="text-xs text-zinc-500">Response</div>
            <div className="font-medium">
              {insights.metrics.response.available ? insights.metrics.response.label : '—'}
            </div>
          </div>
        </div>
      ) : null}

      <div className="space-y-2">
        <h3 className="text-sm font-medium text-zinc-200">Rate a completed venue booking</h3>
        <p className="text-[11px] text-zinc-500">
          Dummy pay → Mark completed (or wait until endAt). Then rate that exact session.
        </p>
        {!eligible.length ? (
          <p className="text-sm text-zinc-500">
            No completed venue bookings waiting for a review. Book → dummy pay → Mark completed,
            then this list fills.
          </p>
        ) : (
          <ul className="space-y-3">
            {eligible.map((item) => {
              const key = item.sessionId
              const draft = drafts[key] || { rating: 5, text: '' }
              return (
                <li
                  key={key}
                  className="rounded-lg border border-zinc-800 bg-zinc-950/50 px-3 py-2 text-sm"
                >
                  <div className="font-medium text-zinc-100">{item.title}</div>
                  <div className="text-[11px] text-zinc-500">
                    {item.venueName || item.venueId}
                    {item.spaceName ? ` · ${item.spaceName}` : ''} · session {item.sessionId}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <label className="text-xs text-zinc-400">
                      Stars
                      <select
                        className="ml-1 rounded border border-zinc-700 bg-zinc-900 px-2 py-1"
                        value={draft.rating}
                        onChange={(e) =>
                          setDrafts((prev) => ({
                            ...prev,
                            [key]: { ...draft, rating: Number(e.target.value) },
                          }))
                        }
                      >
                        {[5, 4, 3, 2, 1].map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <textarea
                    className="mt-2 w-full rounded border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-xs"
                    rows={2}
                    placeholder="Write a review for this venue…"
                    value={draft.text}
                    onChange={(e) =>
                      setDrafts((prev) => ({
                        ...prev,
                        [key]: { ...draft, text: e.target.value },
                      }))
                    }
                  />
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => void submit(item)}
                    className="mt-2 rounded-lg bg-amber-400 px-3 py-1.5 text-xs font-medium text-zinc-950 disabled:opacity-40"
                  >
                    Submit review
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {insights?.reviews?.length ? (
        <div className="space-y-2 border-t border-zinc-800 pt-3">
          <h3 className="text-sm font-medium text-zinc-200">Live reviews on venue</h3>
          <ul className="space-y-2">
            {insights.reviews.map((r) => (
              <li key={r.id} className="rounded-lg border border-zinc-800 px-3 py-2 text-sm">
                <div className="font-medium">
                  {r.rating}★ · {r.userName} · {r.title || 'Venue booking'}
                </div>
                <div className="text-xs text-zinc-400">{r.text || '—'}</div>
                <div className="text-[11px] text-zinc-500">{r.relativeLabel}</div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  )
}
