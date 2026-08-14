import { useState } from 'react'
import { env } from '@/config/env'

type Props = {
  partnerToken: string | null
  partnerId: string | null
}

/**
 * Lightweight launcher for partner membership purchase.
 * Full Razorpay flow lives on /payment-test.html — we prefill token via localStorage key that page already uses.
 */
export function FinanceTestMembershipPanel({ partnerToken, partnerId }: Props) {
  const [planId, setPlanId] = useState('')
  const [copied, setCopied] = useState(false)

  const openPaymentTest = () => {
    if (partnerToken) {
      try {
        const raw = localStorage.getItem('joms-payment-test-config')
        const prev = raw ? (JSON.parse(raw) as Record<string, string>) : {}
        localStorage.setItem(
          'joms-payment-test-config',
          JSON.stringify({
            ...prev,
            partnerToken,
            paymentApiUrl: env.paymentApiBaseUrl,
            membershipApiUrl: env.membershipApiBaseUrl,
          }),
        )
      } catch {
        /* ignore */
      }
    }
    window.open('/payment-test.html', '_blank', 'noopener,noreferrer')
  }

  const copyPlanHint = async () => {
    const text = planId.trim() || '<paste plan id from /memberships/plans>'
    await navigator.clipboard.writeText(text)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="space-y-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
      <div>
        <h3 className="text-sm font-semibold text-emerald-200">Membership pay (Partner)</h3>
        <p className="mt-1 text-xs text-zinc-400">
          Partner buys a plan → LIVE rows on Memberships, Revenue, Invoices. Payment API:{' '}
          <span className="font-mono text-zinc-300">{env.paymentApiBaseUrl}</span>
        </p>
      </div>

      {!partnerToken ? (
        <p className="text-xs text-amber-300">Login partner in the top session bar first.</p>
      ) : (
        <p className="text-[11px] break-all text-zinc-500">
          Partner id: <span className="text-amber-300">{partnerId}</span>
        </p>
      )}

      <label className="block space-y-1 text-xs">
        <span className="tracking-wide text-zinc-500 uppercase">
          Plan id (optional, for clipboard)
        </span>
        <input
          className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
          value={planId}
          onChange={(e) => setPlanId(e.target.value)}
          placeholder="Mongo ObjectId from /memberships/plans"
        />
      </label>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={openPaymentTest}
          disabled={!partnerToken}
          className="rounded-lg bg-emerald-400 px-3 py-2 text-sm font-medium text-zinc-950 disabled:opacity-40"
        >
          Open payment-test.html (partner token saved)
        </button>
        <button
          type="button"
          onClick={() => void copyPlanHint()}
          className="rounded-lg border border-zinc-600 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-800"
        >
          {copied ? 'Copied' : 'Copy plan id'}
        </button>
        <a
          href="/memberships/plans"
          target="_blank"
          rel="noreferrer"
          className="rounded-lg border border-zinc-600 px-3 py-2 text-sm text-sky-300 hover:bg-zinc-800"
        >
          Create / copy plan in admin →
        </a>
      </div>

      <ol className="list-decimal space-y-1 pl-4 text-xs text-zinc-400">
        <li>In payment-test: confirm partner token loaded → Module = Membership</li>
        <li>Paste plan id + billing cycle → Create order → Pay Razorpay → Verify</li>
        <li>Return here → Open finance screen to confirm reflection</li>
      </ol>
    </div>
  )
}
