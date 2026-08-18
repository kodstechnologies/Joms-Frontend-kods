import { useState } from 'react'
import {
  fetchFinanceEscrow,
  fetchFinanceInvoices,
  fetchFinancePayouts,
  fetchFinanceReconciliation,
  fetchFinanceRefunds,
  fetchFinanceRevenue,
  fetchFinanceTax,
} from '@/modules/payments/api/finance-api'
import { fetchExpertSubscriptions } from '@/modules/memberships/api/membership-subscription-api'
import { useAuthStore } from '@/modules/auth/store/auth-store'
import type { FinanceTestModel } from '../config/finance-test-models'

type Props = {
  model: FinanceTestModel
}

type ReflectionResult = {
  ok: boolean
  label: string
  detail: string
}

function paginatedTotal(res: { data?: { rows?: unknown[]; meta?: { total?: number } } }): {
  total: number
  rows: unknown[]
} {
  const rows = res?.data?.rows ?? []
  const total = res?.data?.meta?.total ?? rows.length
  return { total, rows }
}

async function runReflection(
  kind: NonNullable<FinanceTestModel['reflection']>['kind'],
): Promise<ReflectionResult> {
  if (kind === 'categories') {
    return {
      ok: true,
      label: 'MOCK screen',
      detail: 'No LIVE API — open the UI and confirm the table renders.',
    }
  }

  try {
    if (kind === 'memberships') {
      const res = await fetchExpertSubscriptions({ page: 1, limit: 5 })
      const list = res?.data?.subscriptions ?? []
      const total = res?.data?.meta?.total ?? list.length
      return {
        ok: true,
        label: `${total} subscription(s)`,
        detail: total
          ? 'Open Memberships screen for Pause/Cancel.'
          : 'Empty — partner buy via payment-test.',
      }
    }

    if (kind === 'revenue' || kind === 'services' || kind === 'venues') {
      const res = await fetchFinanceRevenue(
        kind === 'venues' ? { module: 'venue', limit: 5 } : { limit: 5 },
      )
      const { total, rows } = paginatedTotal(res)
      const sample = (rows as Array<{ module?: string; status?: string }>)
        .slice(0, 3)
        .map((p) => `${p.module || '?'} · ${p.status || ''}`)
      let extra = ''
      if (kind === 'services') {
        try {
          const escrow = await fetchFinanceEscrow({ limit: 3 })
          const e = paginatedTotal(escrow)
          extra = ` · escrow holds: ${e.total}`
        } catch {
          /* ignore */
        }
      }
      return {
        ok: true,
        label: `${total} revenue row(s)${extra}`,
        detail: sample.length ? sample.join(' | ') : 'Empty — seed a real payment first.',
      }
    }

    if (kind === 'payouts') {
      const { total } = paginatedTotal(await fetchFinancePayouts({ limit: 5 }))
      return {
        ok: true,
        label: `${total} payout(s)`,
        detail: total
          ? 'Open screen to Retry/Release when allowed.'
          : 'Empty until real fixed/tiered fulfill.',
      }
    }

    if (kind === 'refunds') {
      const { total } = paginatedTotal(await fetchFinanceRefunds({ limit: 5 }))
      return {
        ok: true,
        label: `${total} refund(s)`,
        detail: total ? 'Open Refund vs Dispute details.' : 'Empty until a refund is raised.',
      }
    }

    if (kind === 'tax') {
      const { total } = paginatedTotal(await fetchFinanceTax({ limit: 5 }))
      return {
        ok: true,
        label: `${total} tax record(s)`,
        detail: total ? 'Open detail.' : 'Empty OK early.',
      }
    }

    if (kind === 'invoices') {
      const { total } = paginatedTotal(await fetchFinanceInvoices({ limit: 5 }))
      return {
        ok: true,
        label: `${total} invoice(s)`,
        detail: total ? 'Open detail.' : 'Empty until real payment fulfill.',
      }
    }

    if (kind === 'reconciliation') {
      const { total } = paginatedTotal(await fetchFinanceReconciliation({ limit: 5 }))
      return {
        ok: true,
        label: `${total} recon row(s)`,
        detail: total ? 'Open detail.' : 'Empty until gateway settlement ingest.',
      }
    }

    return { ok: false, label: 'Unknown kind', detail: String(kind) }
  } catch (err) {
    const msg =
      (err as { response?: { data?: { message?: string }; status?: number } })?.response?.data
        ?.message || (err instanceof Error ? err.message : 'Reflection failed')
    const status = (err as { response?: { status?: number } })?.response?.status
    return {
      ok: false,
      label: status === 401 || status === 403 ? 'Admin auth required' : 'API error',
      detail: String(msg),
    }
  }
}

export function FinanceTestReflection({ model }: Props) {
  const adminToken = useAuthStore((s) => s.token)
  const adminUser = useAuthStore((s) => s.user)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ReflectionResult | null>(null)

  const check = async () => {
    if (!model.reflection) return
    setLoading(true)
    setResult(null)
    try {
      if (model.reflection.kind === 'categories') {
        setResult({
          ok: true,
          label: 'MOCK',
          detail: 'Open the categories screen — UI only, no LIVE count.',
        })
        return
      }
      if (!adminToken) {
        setResult({
          ok: false,
          label: 'Admin not logged in',
          detail:
            'Log in as admin in this browser (same origin), then Check again — or just Open finance screen.',
        })
        return
      }
      setResult(await runReflection(model.reflection.kind))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3 rounded-xl border border-sky-500/30 bg-sky-500/5 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-sky-200">Verify reflection</h3>
          <p className="mt-1 text-xs text-zinc-400">
            Open the admin finance screen (new tab). Optionally check LIVE API counts if admin is
            logged in here.
          </p>
        </div>
        <div className="text-[11px] text-zinc-500">
          Admin:{' '}
          {adminUser ? (
            <span className="text-emerald-300">{adminUser.email}</span>
          ) : (
            <span className="text-amber-300">not logged in</span>
          )}
        </div>
      </div>

      <ul className="list-disc space-y-1 pl-4 text-xs text-zinc-400">
        {model.verifyHints.map((h) => (
          <li key={h}>{h}</li>
        ))}
      </ul>

      <div className="flex flex-wrap gap-2">
        <a
          href={model.route}
          target="_blank"
          rel="noreferrer"
          className="rounded-lg bg-sky-400 px-3 py-2 text-sm font-medium text-zinc-950"
        >
          Open {model.title} →
        </a>
        <button
          type="button"
          onClick={() => void check()}
          disabled={loading}
          className="rounded-lg border border-zinc-600 px-3 py-2 text-sm text-zinc-100 hover:bg-zinc-800 disabled:opacity-50"
        >
          {loading ? 'Checking…' : 'Check LIVE reflection'}
        </button>
        {!adminToken ? (
          <a
            href="/auth/login"
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-zinc-600 px-3 py-2 text-sm text-amber-200 hover:bg-zinc-800"
          >
            Admin login →
          </a>
        ) : null}
      </div>

      {result ? (
        <div
          className={`rounded-lg border px-3 py-2 text-xs ${
            result.ok
              ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-100'
              : 'border-red-500/40 bg-red-500/10 text-red-100'
          }`}
        >
          <div className="font-medium">{result.label}</div>
          <div className="mt-0.5 opacity-90">{result.detail}</div>
        </div>
      ) : null}
    </div>
  )
}
