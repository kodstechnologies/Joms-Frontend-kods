export type FinanceTestRole = 'user' | 'partner' | 'admin' | 'system'

export type FinanceTestModel = {
  id: string
  number: number
  title: string
  route: string
  startsAs: FinanceTestRole[]
  summary: string
  steps: string[]
  panels: Array<'user-book' | 'partner-inbox' | 'membership-pay' | 'admin-links' | 'none'>
  adminSeedLinks?: Array<{ label: string; href: string }>
  verifyHints: string[]
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

export const FINANCE_TEST_MODELS: FinanceTestModel[] = [
  {
    id: 'revenue',
    number: 1,
    title: 'Revenue Overview',
    route: '/finance/revenue',
    startsAs: ['partner', 'user'],
    summary: 'Paid rows land here. Membership is the easiest seed.',
    steps: [
      'Log in Partner + User on the top bar.',
      'Seed money via Membership (step 4) or Services (step 2).',
      'Open the finance screen and check the payment row, details, and note.',
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
      'User pays. Fixed/tiered go to by-service + payout. Consultation to by-consultation. Custom/milestone to escrow.',
    steps: [
      'Partner needs a live service or consultation.',
      'User: load offerings → order + dummy pay, or book a consultation.',
      'Escrow: seed one-time / milestone from the same panel.',
      'Open /finance/services and check the tabs, then a row.',
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
    summary: 'User books a venue here. Needs Admin + User on the session bar.',
    steps: [
      'Login Admin and pick User.',
      'Create a venue if the catalog is empty, then load venues.',
      'Book + dummy pay, then check /finance/venues.',
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
    summary: 'Partner buys a plan. Also shows on Revenue and Invoices. No payout.',
    steps: [
      'Admin: create a plan and copy the id.',
      'Use the membership panel (or /payment-test.html) with the partner JWT.',
      'Pay, then check /finance/memberships — Pause / Cancel on an active row.',
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
      'Login Admin on this page.',
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
      'GST/TDS rows auto-created on payment fulfill. Backfill older pays from this step, then open /finance/tax.',
    steps: [
      'Login Admin. Seed a pay on Revenue/Memberships/Services if needed.',
      'New pays: tax rows appear automatically after fulfill.',
      'Older pays: click Backfill tax + reconciliation on this step.',
      'Open /finance/tax — confirm GST (and TDS for service/venue) rows.',
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
      'Gateway vs platform amounts auto-created on fulfill. Backfill older pays, then open /finance/reconciliation.',
    steps: [
      'Login Admin. Seed a pay on Revenue/Memberships/Services if needed.',
      'New pays: reconciliation row appears automatically after fulfill.',
      'Older pays: click Backfill tax + reconciliation on this step.',
      'Open /finance/reconciliation — matched/mismatch rows.',
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
    summary: 'UI table only — nothing to seed from partner/user.',
    steps: [
      'Open /finance/categories.',
      'Confirm table/search UI only — no chat-user create path.',
    ],
    panels: ['none'],
    verifyHints: ['UI renders', 'No LIVE finance dependency'],
    reflection: { kind: 'categories' },
  },
]
