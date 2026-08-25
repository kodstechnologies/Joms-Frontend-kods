import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'

import { env } from '@/config/env'
import { registerDeviceToken } from '@/modules/notifications/api/notifications-api'
import { requestNotificationPermission } from '@/shared/lib/firebase'
import { cn } from '@/shared/lib/cn'

import {
  dispatchPartnerPush,
  fetchPartnerDeviceTokens,
  fetchPartnerInAppNotifications,
  notifyPartnerTransactional,
  type PartnerInAppRow,
  type PartnerNotifyResult,
} from '../api/push-notification.api'
import type { PartnerLoginResult } from '../api/partner-auth.api'
import {
  fetchPushTestContext,
  type PushTestContext,
  type PushTestResolvedIds,
} from '../api/push-test-context.api'
import {
  buildPushNotificationFixtures,
  PUSH_FIXTURE_CATEGORIES,
  type PushNotificationFixture,
} from '../config/push-notification-fixtures'

type Props = {
  session: PartnerLoginResult
}

type LastResult = {
  fixtureId: string
  at: string
  inApp: PartnerNotifyResult
  message: string
}

function errMessage(err: unknown) {
  return (
    (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
    (err instanceof Error ? err.message : 'Request failed')
  )
}

const ID_LABELS: Array<{ key: keyof PushTestResolvedIds; label: string }> = [
  { key: 'serviceId', label: 'serviceId' },
  { key: 'consultationId', label: 'consultationId' },
  { key: 'quotationRequestId', label: 'quotationRequestId' },
  { key: 'consultQuotationId', label: 'consultQuotationId' },
  { key: 'proposalMilestoneId', label: 'proposalMilestoneId' },
  { key: 'proposalOneTimeId', label: 'proposalOneTimeId' },
  { key: 'consultationBookingId', label: 'consultationBookingId' },
  { key: 'venueId', label: 'venueId' },
  { key: 'spaceId', label: 'spaceId' },
  { key: 'subscriptionId', label: 'subscriptionId' },
  { key: 'kycDocId', label: 'kycDocId' },
  { key: 'venueKycDocId', label: 'venueKycDocId' },
]

export function PushNotificationTestPanel({ session }: Props) {
  const [partnerId, setPartnerId] = useState(String(session.id))
  const [category, setCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState('kyc-approved')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [lastResult, setLastResult] = useState<LastResult | null>(null)
  const [inbox, setInbox] = useState<PartnerInAppRow[]>([])
  const [deviceTokens, setDeviceTokens] = useState<Array<{ id: string; platform: string }>>([])
  const [registeringToken, setRegisteringToken] = useState(false)
  const [contextEpoch, setContextEpoch] = useState(0)
  const [loadedContextKey, setLoadedContextKey] = useState<string | null>(null)
  const [testContext, setTestContext] = useState<PushTestContext | null>(null)
  const testRunRef = useRef(0)
  const contextKey = `${session.accessToken}:${partnerId.trim()}:${contextEpoch}`
  const contextLoading = loadedContextKey !== contextKey

  const fixtures = useMemo(
    () => buildPushNotificationFixtures(testContext?.ids),
    [testContext?.ids],
  )

  const liveIdCount = useMemo(
    () => Object.values(testContext?.sources ?? {}).filter((source) => source === 'live').length,
    [testContext?.sources],
  )

  const refreshTestContext = useCallback(() => {
    setContextEpoch((epoch) => epoch + 1)
  }, [])

  useEffect(() => {
    const requestKey = contextKey
    let cancelled = false
    void fetchPushTestContext(session.accessToken, partnerId.trim())
      .then((next) => {
        if (cancelled) return
        setTestContext(next)
        setLoadedContextKey(requestKey)
      })
      .catch((error) => {
        if (cancelled) return
        toast.error(`Could not resolve partner IDs: ${errMessage(error)}`)
        setLoadedContextKey(requestKey)
      })
    return () => {
      cancelled = true
    }
  }, [contextKey, partnerId, session.accessToken])

  const filteredFixtures = useMemo(() => {
    const q = search.trim().toLowerCase()
    return fixtures.filter((item) => {
      if (category !== 'All' && item.category !== category) return false
      if (!q) return true
      return (
        item.label.toLowerCase().includes(q) ||
        item.eventType.toLowerCase().includes(q) ||
        item.deepLink.screen.toLowerCase().includes(q)
      )
    })
  }, [category, fixtures, search])

  const selected = useMemo(
    () => fixtures.find((item) => item.id === selectedId) ?? null,
    [fixtures, selectedId],
  )

  const refreshInbox = useCallback(async () => {
    try {
      const res = await fetchPartnerInAppNotifications(session.accessToken, { limit: 15 })
      setInbox(res.data || [])
    } catch (error) {
      toast.error(`Inbox refresh failed: ${errMessage(error)}`)
    }
  }, [session.accessToken])

  const refreshTokens = useCallback(async () => {
    try {
      const res = await fetchPartnerDeviceTokens(session.accessToken)
      setDeviceTokens((res.data || []).map((row) => ({ id: row.id, platform: row.platform })))
    } catch (error) {
      toast.error(`Device tokens failed: ${errMessage(error)}`)
    }
  }, [session.accessToken])

  const sendFixture = async (fixture: PushNotificationFixture) => {
    setBusyId(fixture.id)
    try {
      testRunRef.current += 1
      const sourceId = `${fixture.sourceIdPrefix}:test:${testRunRef.current}`
      const res = await notifyPartnerTransactional({
        recipientId: partnerId.trim(),
        eventType: fixture.eventType,
        title: fixture.title,
        body: fixture.body,
        source: fixture.source,
        sourceId,
        deepLink: fixture.deepLink,
        skipIfExists: false,
      })

      setLastResult({
        fixtureId: fixture.id,
        at: new Date().toISOString(),
        inApp: res.data,
        message: res.message || 'Notification dispatched',
      })

      if (res.data.skipped) {
        toast.warning(res.data.note || res.message || 'Notification skipped')
      } else {
        toast.success(`${fixture.label} → in-app + push queued`)
      }

      await refreshInbox()
    } catch (error) {
      toast.error(errMessage(error))
    } finally {
      setBusyId(null)
    }
  }

  const registerWebFcmToken = async () => {
    setRegisteringToken(true)
    try {
      const token = await requestNotificationPermission()
      if (!token) {
        toast.error('No FCM token — check VITE_FIREBASE_* and browser notification permission')
        return
      }
      await registerDeviceToken(token, 'web')
      toast.success('Web FCM token registered for this partner')
      await refreshTokens()
    } catch (error) {
      toast.error(errMessage(error))
    } finally {
      setRegisteringToken(false)
    }
  }

  const sendBroadcastPush = async () => {
    setBusyId('broadcast')
    try {
      const res = await dispatchPartnerPush({
        recipientId: partnerId.trim(),
        title: 'JOMS test broadcast',
        body: 'Campaign push from /dev/push-notification-test harness.',
        type: 'announcement',
      })
      const sent = res.data.sent ?? 0
      if (sent > 0) toast.success(`Broadcast push sent to ${sent} device(s)`)
      else toast.warning(res.data.note || 'Broadcast push was not delivered')
      await refreshInbox()
    } catch (error) {
      toast.error(errMessage(error))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
        <h2 className="text-lg font-semibold text-zinc-100">Partner session</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Signed in as <span className="text-zinc-200">{session.fullname}</span> · notification API{' '}
          <code className="text-violet-300">{env.notificationApiBaseUrl}</code>
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto_auto_auto]">
          <label className="block text-sm">
            <span className="mb-1 block text-zinc-400">Recipient partner id</span>
            <input
              value={partnerId}
              onChange={(e) => setPartnerId(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
            />
          </label>
          <button
            type="button"
            onClick={() => void refreshInbox()}
            className="self-end rounded-lg border border-zinc-600 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-800"
          >
            Refresh inbox
          </button>
          <button
            type="button"
            onClick={() => void refreshTokens()}
            className="self-end rounded-lg border border-zinc-600 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-800"
          >
            List tokens
          </button>
          <button
            type="button"
            disabled={registeringToken}
            onClick={() => void registerWebFcmToken()}
            className="self-end rounded-lg bg-violet-600 px-3 py-2 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-60"
          >
            {registeringToken ? 'Registering…' : 'Register web FCM'}
          </button>
        </div>
        {deviceTokens.length ? (
          <p className="mt-2 text-xs text-zinc-500">
            Registered tokens: {deviceTokens.map((t) => t.platform).join(', ')} (
            {deviceTokens.length})
          </p>
        ) : (
          <p className="mt-2 text-xs text-amber-400/90">
            No device tokens yet — register FCM before expecting push tray notifications.
          </p>
        )}
        <p className="mt-2 text-xs text-zinc-500">
          Partner Flutter tokens use Firebase project{' '}
          <code className="text-zinc-400">vaagon-partner</code>. This web harness uses{' '}
          <code className="text-zinc-400">VITE_FIREBASE_*</code> — use a real partner device for
          end-to-end FCM if projects differ.
        </p>
      </section>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">Deep link IDs</h2>
            <p className="mt-1 text-sm text-zinc-400">
              Loaded from this partner&apos;s listings, bookings, KYC, venues, and membership. Dummy
              IDs are used only when no live record exists.
            </p>
          </div>
          <button
            type="button"
            disabled={contextLoading}
            onClick={refreshTestContext}
            className="rounded-lg border border-zinc-600 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-800 disabled:opacity-60"
          >
            {contextLoading ? 'Resolving…' : 'Refresh IDs'}
          </button>
        </div>
        <p className="mt-2 text-xs text-zinc-500">
          {contextLoading
            ? 'Fetching partner data…'
            : `${liveIdCount} live ID field(s) resolved for deep links.`}
        </p>
        {testContext?.errors.length ? (
          <p className="mt-2 text-xs text-amber-400/90">
            Partial load: {testContext.errors.join(' · ')}
          </p>
        ) : null}
        <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {ID_LABELS.map(({ key, label }) => {
            const value = testContext?.ids[key] ?? '—'
            const source = testContext?.sources[key]
            const isLive = source === 'live'
            return (
              <div
                key={key}
                className="rounded-lg border border-zinc-800 bg-zinc-950/40 px-3 py-2 text-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-zinc-500">{label}</span>
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-[10px] tracking-wide uppercase',
                      isLive ? 'bg-emerald-500/15 text-emerald-300' : 'bg-zinc-800 text-zinc-500',
                    )}
                  >
                    {contextLoading ? '…' : isLive ? 'live' : 'dummy'}
                  </span>
                </div>
                <p className="mt-1 truncate font-mono text-zinc-300" title={value}>
                  {value}
                </p>
              </div>
            )
          })}
        </div>
      </section>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">Transactional push types</h2>
            <p className="mt-1 text-sm text-zinc-400">
              Calls{' '}
              <code className="text-violet-300">POST /notifications/internal/in-app/notify</code> →
              creates in-app row + async FCM with deepLink data.
            </p>
          </div>
          <button
            type="button"
            disabled={busyId === 'broadcast'}
            onClick={() => void sendBroadcastPush()}
            className="rounded-lg border border-violet-500/40 bg-violet-500/10 px-3 py-2 text-sm text-violet-200 hover:bg-violet-500/20 disabled:opacity-60"
          >
            Test broadcast push
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {PUSH_FIXTURE_CATEGORIES.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              className={cn(
                'rounded-full px-3 py-1 text-xs',
                category === item
                  ? 'bg-violet-600 text-white'
                  : 'border border-zinc-700 text-zinc-400 hover:bg-zinc-800',
              )}
            >
              {item}
            </button>
          ))}
        </div>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search event type or screen…"
          className="mt-3 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
        />

        <div className="mt-4 overflow-hidden rounded-lg border border-zinc-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-950/80 text-xs tracking-wide text-zinc-500 uppercase">
              <tr>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">eventType</th>
                <th className="px-3 py-2">deepLink.screen</th>
                <th className="px-3 py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredFixtures.map((fixture) => (
                <tr
                  key={fixture.id}
                  className={cn(
                    'border-t border-zinc-800/80',
                    selectedId === fixture.id && 'bg-violet-500/5',
                  )}
                  onClick={() => setSelectedId(fixture.id)}
                >
                  <td className="px-3 py-2 text-zinc-200">{fixture.label}</td>
                  <td className="px-3 py-2 font-mono text-xs text-zinc-400">{fixture.eventType}</td>
                  <td className="px-3 py-2 font-mono text-xs text-emerald-400/90">
                    {fixture.deepLink.screen}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      type="button"
                      disabled={busyId === fixture.id}
                      onClick={(e) => {
                        e.stopPropagation()
                        void sendFixture(fixture)
                      }}
                      className="rounded-md bg-amber-500/90 px-2.5 py-1 text-xs font-medium text-zinc-950 hover:bg-amber-400 disabled:opacity-60"
                    >
                      {busyId === fixture.id ? 'Sending…' : 'Send test'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selected ? (
          <div className="mt-4 rounded-lg border border-zinc-800 bg-zinc-950/50 p-3">
            <p className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
              FCM data preview — {selected.label}
            </p>
            <pre className="mt-2 overflow-x-auto text-xs leading-relaxed text-zinc-300">
              {JSON.stringify(
                {
                  message: {
                    token: '<FCM_DEVICE_TOKEN>',
                    notification: { title: selected.title, body: selected.body },
                    data: {
                      sourceId: `${selected.sourceIdPrefix}:test`,
                      screen: selected.deepLink.screen,
                      notificationId: '<in-app-notification-id>',
                      eventType: selected.eventType,
                      params: JSON.stringify(selected.deepLink.params),
                      type: 'transactional',
                    },
                    android: {
                      priority: 'high',
                      notification: { channel_id: 'joms_partner_channel' },
                    },
                  },
                },
                null,
                2,
              )}
            </pre>
          </div>
        ) : null}

        {lastResult ? (
          <div className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 text-sm">
            <p className="font-medium text-emerald-200">Last result · {lastResult.fixtureId}</p>
            <p className="mt-1 text-zinc-400">{lastResult.message}</p>
            <pre className="mt-2 overflow-x-auto text-xs text-zinc-300">
              {JSON.stringify(lastResult.inApp, null, 2)}
            </pre>
          </div>
        ) : null}
      </section>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
        <h2 className="text-lg font-semibold text-zinc-100">Partner in-app inbox</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Verify the same payload landed in{' '}
          <code className="text-violet-300">GET /notifications/in-app/me</code>
        </p>
        <div className="mt-3 space-y-2">
          {inbox.length === 0 ? (
            <p className="text-sm text-zinc-500">No rows loaded — click Refresh inbox.</p>
          ) : (
            inbox.map((row) => (
              <article
                key={row.id}
                className="rounded-lg border border-zinc-800 bg-zinc-950/40 px-3 py-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium text-zinc-200">{row.title}</p>
                  <span className="font-mono text-[11px] text-violet-300">{row.eventType}</span>
                </div>
                <p className="mt-1 text-sm text-zinc-400">{row.body}</p>
                <p className="mt-1 font-mono text-xs text-emerald-400/90">
                  screen={row.deepLink?.screen ?? '—'} · params=
                  {JSON.stringify(row.deepLink?.params ?? {})}
                </p>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  )
}
