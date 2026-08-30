import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { PartnerLoginResult } from '../api/partner-auth.api'
import { STATIC_CHAT_USERS, type StaticChatUser } from '../config/static-users'
import { FINANCE_TEST_MODELS } from '../config/finance-test-models'
import { FinanceTestInteractiveActions } from '../components/finance-test-interactive-actions'
import { FinanceTestSessionBar } from '../components/finance-test-session-bar'

const PARTNER_SESSION_KEY = 'joms_dev_partner_chat'
const WIZARD_KEY = 'joms_finance_test_wizard'

type WizardState = {
  stepIndex: number
  completed: string[]
}

function loadPartnerSession(): PartnerLoginResult | null {
  try {
    const raw =
      localStorage.getItem(PARTNER_SESSION_KEY) || sessionStorage.getItem(PARTNER_SESSION_KEY)
    if (!raw) return null
    return JSON.parse(raw) as PartnerLoginResult
  } catch {
    return null
  }
}

function loadWizard(): WizardState {
  try {
    const raw = localStorage.getItem(WIZARD_KEY)
    if (!raw) return { stepIndex: 0, completed: [] }
    const parsed = JSON.parse(raw) as WizardState
    return {
      stepIndex: Math.min(Math.max(0, parsed.stepIndex || 0), FINANCE_TEST_MODELS.length - 1),
      completed: Array.isArray(parsed.completed) ? parsed.completed : [],
    }
  } catch {
    return { stepIndex: 0, completed: [] }
  }
}

export function PaymentFinanceTestingPage() {
  const [partner, setPartner] = useState<PartnerLoginResult | null>(() => loadPartnerSession())
  const [userId, setUserId] = useState(STATIC_CHAT_USERS[0]?.id || '')
  const [wizard, setWizard] = useState<WizardState>(() => loadWizard())

  const selectedUser: StaticChatUser | null = useMemo(
    () => STATIC_CHAT_USERS.find((u) => u.id === userId) || STATIC_CHAT_USERS[0] || null,
    [userId],
  )

  const model = FINANCE_TEST_MODELS[wizard.stepIndex]!
  const doneSet = useMemo(() => new Set(wizard.completed), [wizard.completed])

  useEffect(() => {
    localStorage.setItem(WIZARD_KEY, JSON.stringify(wizard))
  }, [wizard])

  const goStep = (index: number) => setWizard((w) => ({ ...w, stepIndex: index }))

  const markDone = () => {
    setWizard((w) => {
      const completed = w.completed.includes(model.id) ? w.completed : [...w.completed, model.id]
      const next = Math.min(w.stepIndex + 1, FINANCE_TEST_MODELS.length - 1)
      return { stepIndex: next, completed }
    })
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-6xl space-y-4 p-4 md:p-6">
        <header className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Payment &amp; Finance Testing</h1>
            <p className="mt-1 text-sm text-zinc-400">
              Login / refresh tokens at the top → select options → pay → open finance screen.
            </p>
          </div>
          <Link to="/dev/chat-test" className="text-sm text-zinc-400 hover:text-zinc-200">
            Other test pages
          </Link>
        </header>

        <FinanceTestSessionBar
          partner={partner}
          onPartnerChange={setPartner}
          userId={userId}
          onUserIdChange={setUserId}
          selectedUser={selectedUser}
        />

        <nav className="flex gap-2 overflow-x-auto pb-1">
          {FINANCE_TEST_MODELS.map((m, index) => {
            const active = index === wizard.stepIndex
            const done = doneSet.has(m.id)
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => goStep(index)}
                className={`shrink-0 rounded-lg border px-3 py-2 text-left text-xs ${
                  active
                    ? 'border-white/50 bg-white text-zinc-950'
                    : done
                      ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-100'
                      : 'border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800'
                }`}
              >
                <span className="font-semibold">
                  {m.number}. {m.title}
                </span>
              </button>
            )
          })}
        </nav>

        <section className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 md:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[11px] tracking-widest text-zinc-500 uppercase">
                {model.number} / {FINANCE_TEST_MODELS.length}
              </p>
              <h2 className="text-xl font-semibold">{model.title}</h2>
              <p className="mt-1 max-w-2xl text-sm text-zinc-400">{model.summary}</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={wizard.stepIndex === 0}
                onClick={() => goStep(wizard.stepIndex - 1)}
                className="rounded-lg border border-zinc-600 px-3 py-2 text-sm disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={markDone}
                className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-zinc-950"
              >
                {wizard.stepIndex === FINANCE_TEST_MODELS.length - 1
                  ? 'Mark done'
                  : 'Done → Next model'}
              </button>
            </div>
          </div>

          <FinanceTestInteractiveActions
            model={model}
            partner={partner}
            onPartnerChange={setPartner}
            user={selectedUser}
          />
        </section>
      </div>
    </div>
  )
}
