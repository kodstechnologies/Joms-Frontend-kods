export type FinanceTestRole = 'user' | 'partner' | 'admin' | 'system'

export type FinanceTestModel = {
  id: string
  number: number
  title: string
  route: string
  /** Who initiates the money / data for this screen */
  startsAs: FinanceTestRole[]
  summary: string
  /** Ordered checklist shown on the step */
  steps: string[]
  /** Which action panels to show on this step */
  panels: Array<'user-book' | 'partner-inbox' | 'membership-pay' | 'admin-links' | 'none'>
  adminSeedLinks?: Array<{ label: string; href: string }>
  verifyHints: string[]
  /** Optional finance API path for reflection count (admin JWT) */
  reflection?: {
    kind:
      | 'revenue'
      | 'services'
      | 'venues'
      | 'memberships'
      | 'payouts'
      | 'refunds'
      | 'tax'
      | 'invoices'
      | 'reconciliation'
      | 'categories'
  }
}

/** The 10 sidebar models (Dashboard & Events excluded / muted). */
export const FINANCE_TEST_MODELS: FinanceTestModel[] = [
  {
    id: 'revenue',
    number: 1,
    title: 'Revenue Overview',
    route: '/finance/revenue',
    startsAs: ['partner', 'user'],
    summary:
      'Any successful Payment lands here. Easiest LIVE seed is partner membership; service/consultation need real pay after chat-user dummy pay.',
    steps: [
      'Ensure Partner + User sessions are logged in (top bar).',
      'Seed money: either Membership (step 4 panel) or Services (step 2 panels).',
      'For LIVE rows after chat-user dummy pay, run real /payments/orders (see Appendix in docs).',
      'Click “Open finance screen” and confirm the payment row + View Details + Add note.',
    ],
    panels: ['membership-pay', 'user-book'],
    verifyHints: [
      'List loads',
      'Row for membership or service/consultation',
      'Detail + note works',
    ],
    reflection: { kind: 'revenue' },
  },
  {
    id: 'services',
    number: 2,
    title: 'Services',
    route: '/finance/services',
    startsAs: ['user', 'partner'],
    summary:
      'User pays. Fixed/tiered → by-service + payout. Consultation → by-consultation. Custom/milestone → escrow (harness Seed escrow or partner payment request).',
    steps: [
      'Partner must have a live service and/or consultation (create in admin if needed).',
      'USER panel: load offerings → Order + LIVE dummy pay (fixed/tiered) OR Book consultation.',
      'Escrow: same panel → Seed escrow (one-time / milestone) — quotation → proposal → LIVE payment_request dummy pay.',
      'Open /finance/services — check tabs: all / by-service / by-consultation / escrow.',
      'Open a row → detail. For escrow holds also open /finance/escrow.',
    ],
    panels: ['user-book', 'partner-inbox', 'admin-links'],
    adminSeedLinks: [
      { label: 'Create service listing', href: '/services/management/create' },
      { label: 'Pending service approvals', href: '/services/management/pending' },
      { label: 'Escrow (no sidebar)', href: '/finance/escrow' },
    ],
    verifyHints: [
      'by-service shows fixed/tiered pays',
      'by-consultation shows bookings',
      'escrow shows custom/milestone holds only',
    ],
    reflection: { kind: 'services' },
  },
  {
    id: 'venues',
    number: 3,
    title: 'Venues',
    route: '/finance/venues',
    startsAs: ['partner', 'user'],
    summary:
      'Admin creates venue (catalog). User LIVE dummy pay on this harness → payment-service module=venue → /finance/venues. Needs Admin + User session.',
    steps: [
      'Login Admin + select User on the session bar.',
      'Create venue if catalog empty, then Load venues.',
      'Tap venue → Book + LIVE dummy pay.',
      'Open /finance/venues — confirm payment row.',
    ],
    panels: ['admin-links'],
    adminSeedLinks: [
      { label: 'Create venue', href: '/venues/management/create' },
      { label: 'Venue pending approvals', href: '/venues/management/pending' },
      { label: 'Venue management (catalog)', href: '/venues/management' },
    ],
    verifyHints: ['Load venues', 'LIVE dummy pay', 'Row on /finance/venues'],
    reflection: { kind: 'venues' },
  },
  {
    id: 'memberships',
    number: 4,
    title: 'Memberships',
    route: '/finance/memberships',
    startsAs: ['partner'],
    summary:
      'Partner → JOMS receivable. Admin creates plan; partner buys via payment-test.html. Also feeds Revenue + Invoices. No payout.',
    steps: [
      'Admin: create membership plan → copy plan Mongo id.',
      'Use Membership pay panel below (or /payment-test.html) with partner JWT.',
      'Create order → Pay Razorpay → verify.',
      'Open /finance/memberships → detail → Pause / Cancel when active.',
      'Also confirm row on Revenue Overview.',
    ],
    panels: ['membership-pay', 'admin-links'],
    adminSeedLinks: [{ label: 'Membership plans', href: '/memberships/plans' }],
    verifyHints: ['Subscription list LIVE', 'Pause/Cancel on detail', 'No payout created'],
    reflection: { kind: 'memberships' },
  },
  {
    id: 'payouts',
    number: 5,
    title: 'Payout Management',
    route: '/finance/payouts',
    startsAs: ['system'],
    summary:
      'Created after real fixed/tiered (or post-escrow-release) fulfill. Complete Services seed with real pay first. Membership never creates payouts.',
    steps: [
      'Finish Services step with a real payment fulfill (fixed/tiered) OR release an escrow hold.',
      'Open /finance/payouts — expect scheduled/pending rows.',
      'View Details → Retry (failed) or Release (scheduled/pending/failed) + admin note.',
    ],
    panels: ['user-book', 'partner-inbox'],
    verifyHints: ['Payout row after real service pay', 'Detail actions when status allows'],
    reflection: { kind: 'payouts' },
  },
  {
    id: 'refunds',
    number: 6,
    title: 'Refunds & Chargebacks',
    route: '/finance/refunds',
    startsAs: ['admin', 'user', 'partner'],
    summary:
      'Stuck service/venue pay only: paid but fulfill pending → refund or chargeback. Not for fully completed LIVE pays.',
    steps: [
      'Login Admin on the harness.',
      'Stuck service → refund / chargeback, or Stuck venue → refund / chargeback.',
      'Open /finance/refunds — Refund + Dispute rows (refund status initiated).',
      'Walk detail / escalate (some modals still UI-only).',
    ],
    panels: ['none'],
    verifyHints: ['Refund vs Dispute rows', 'Escalate flow', 'Chargeback display-only'],
    reflection: { kind: 'refunds' },
  },
  {
    id: 'tax',
    number: 7,
    title: 'Tax & Compliance',
    route: '/finance/tax',
    startsAs: ['partner', 'system'],
    summary:
      'Compliance from partner KYC/docs; tax from ledger/settings. Not seeded via chat-user. Empty list OK early.',
    steps: [
      'Ensure service partner KYC / DigiLocker / verifications as applicable.',
      'Open /finance/tax — list loads (empty OK).',
      'Open detail if a row exists.',
    ],
    panels: ['none'],
    verifyHints: ['List/API loads', 'Detail when data exists'],
    reflection: { kind: 'tax' },
  },
  {
    id: 'invoices',
    number: 8,
    title: 'Invoices & Billing',
    route: '/finance/invoices',
    startsAs: ['system'],
    summary:
      'Auto-created on successful real payment fulfill (membership or service/consultation).',
    steps: [
      'Complete Membership step and/or Services with real pay.',
      'Open /finance/invoices — find invoice for that payment.',
      'View Details (direction: membership expert→platform; bookings user→platform).',
    ],
    panels: ['membership-pay'],
    verifyHints: ['Invoice after real pay', 'Detail opens'],
    reflection: { kind: 'invoices' },
  },
  {
    id: 'reconciliation',
    number: 9,
    title: 'Financial Reconciliation',
    route: '/finance/reconciliation',
    startsAs: ['system'],
    summary:
      'Gateway settlement vs platform. Needs Razorpay settlement ingest. Empty early is expected.',
    steps: [
      'Open /finance/reconciliation.',
      'Confirm list loads (empty OK).',
      'Open detail if any row exists.',
    ],
    panels: ['none'],
    verifyHints: ['Screen loads', 'Empty state acceptable'],
    reflection: { kind: 'reconciliation' },
  },
  {
    id: 'categories',
    number: 10,
    title: 'Category Management',
    route: '/finance/categories',
    startsAs: ['admin'],
    summary: 'MOCK only — no LIVE seed from partner/user. UI table check.',
    steps: [
      'Open /finance/categories.',
      'Confirm table/search UI only — no chat-user create path.',
    ],
    panels: ['none'],
    verifyHints: ['UI renders', 'No LIVE finance dependency'],
    reflection: { kind: 'categories' },
  },
]
