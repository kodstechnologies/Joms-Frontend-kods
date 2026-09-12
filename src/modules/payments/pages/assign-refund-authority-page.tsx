import { useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, CircleDollarSign } from 'lucide-react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'

import { fetchEscalationAssignees } from '@/modules/my-tasks/api/escalation-api'
import {
  escalateFinanceDispute,
  escalateFinanceRefund,
  escalateFinanceResource,
} from '@/modules/payments/api/finance-api'
import { EscalateToSuperAdminModal } from '@/modules/payments/components/escalate-to-super-admin-modal'
import {
  useFinanceDispute,
  useFinanceEscrowDetail,
  useFinancePayment,
  useFinanceRefund,
  useFinanceTaxDetail,
} from '@/modules/payments/hooks/use-finance'
import {
  escalateKind,
  escalateDetailPath,
  safeEscalateReturnTo,
} from '@/modules/payments/utils/finance-escalate'
import { formatInr, titleCase } from '@/modules/payments/utils/finance-mappers'
import { cn } from '@/shared/lib/cn'
import { navigateBackOrFallback } from '@/shared/lib/navigation'

const cardClass = 'radius-lg border border-white/[0.06] bg-brand-surface p-4 sm:p-5'
const innerRowClass = 'radius-lg border border-white/[0.06] bg-brand-bg p-4 sm:p-5'
const labelClass = 'text-body-sm text-muted'
const valueClass = 'text-body-sm-medium text-brand-text'

const REFUND_PERMISSIONS = [
  'Approve & issue refunds',
  'Partial refund capability',
  'Reject with reason',
  'Escalate if amount exceeds limit',
] as const

const ROLE_DESCRIPTION = 'Can approve and issue refunds within policy limits'

const AUTHORITY_ROLES = [
  { id: 'finance-admin', name: 'Finance Admin' },
  { id: 'operations-admin', name: 'Operations Admin' },
  { id: 'support-lead', name: 'Support Lead' },
  { id: 'super-admin', name: 'Super Admin' },
] as const

type AuthorityRoleId = (typeof AUTHORITY_ROLES)[number]['id']

type SummaryItem = {
  label: string
  value: string
  href?: string
  wide?: boolean
}

function firstSnapshotString(source: Record<string, unknown> | null | undefined, keys: string[]) {
  if (!source) return ''
  for (const key of keys) {
    const value = source[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return ''
}

function InfoItem({
  label,
  value,
  href,
  wide,
}: {
  label: string
  value: string
  href?: string
  wide?: boolean
}) {
  return (
    <div className={cn('min-w-0 space-y-1', wide ? 'min-w-[240px] flex-[2]' : 'flex-1')}>
      <p className={labelClass}>{label}</p>
      {href ? (
        <Link to={href} className={cn(valueClass, 'block underline underline-offset-2')}>
          {value}
        </Link>
      ) : (
        <p className={cn(valueClass, wide ? 'line-clamp-2' : 'truncate')}>{value}</p>
      )}
    </div>
  )
}

function SummaryRow({ items }: { items: SummaryItem[] }) {
  if (items.length === 0) return null
  const sevenCol = items.length === 7
  return (
    <div className={innerRowClass}>
      <div
        className={cn(
          'flex min-h-[72px] w-full items-center gap-6 overflow-x-auto',
          sevenCol && 'lg:grid lg:grid-cols-7 lg:overflow-visible',
        )}
      >
        {items.map((item) => (
          <InfoItem key={item.label} {...item} />
        ))}
      </div>
    </div>
  )
}

function WhiteTick({ muted }: { muted?: boolean }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="size-3.5 shrink-0" aria-hidden="true">
      <path
        d="M3 8.2 6.6 11.8 13 4.5"
        stroke={muted ? '#6E6E73' : '#FFFFFF'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function RoleCard({
  name,
  selected,
  onSelect,
}: {
  name: string
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'radius-lg flex h-[275px] w-full flex-col border p-5 text-left transition-colors',
        selected
          ? 'bg-brand-surface border-white'
          : 'bg-brand-surface border-white/[0.06] opacity-50 hover:border-white/15 hover:opacity-80',
      )}
    >
      <div className="mb-3 grid size-8 shrink-0 place-items-center rounded-full border border-white/15 text-white">
        <CircleDollarSign className="size-4" strokeWidth={1.75} />
      </div>
      <h3 className="text-[14px] leading-5 font-semibold text-white">{name}</h3>
      <p className="mt-1 text-[12px] leading-5 text-[#B3B3B3]">{ROLE_DESCRIPTION}</p>
      <p className="mt-4 text-[13px] leading-5 font-semibold text-white">Permissions</p>
      <ul className="mt-2 space-y-1.5">
        {REFUND_PERMISSIONS.map((item) => (
          <li key={item} className="flex items-center gap-2 text-[12px] leading-5 text-[#B3B3B3]">
            <WhiteTick muted={!selected} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </button>
  )
}

function apiErrorMessage(err: unknown, fallback: string) {
  return (
    (err as { response?: { data?: { message?: string } } })?.response?.data?.message || fallback
  )
}

function listCrumb(from: string, kind: string) {
  if (kind === 'dispute' || kind === 'refund' || from.startsWith('/finance/refunds')) {
    return { to: '/finance/refunds', label: 'Refunds & Chargebacks' }
  }
  if (from.startsWith('/finance/services')) return { to: '/finance/services', label: 'Services' }
  if (from.startsWith('/finance/venues')) return { to: '/finance/venues', label: 'Venues' }
  if (from.startsWith('/finance/tax')) return { to: '/finance/tax', label: 'Tax & Compliance' }
  if (from.startsWith('/finance/escrow')) return { to: '/finance/escrow', label: 'Escrow' }
  return { to: '/finance/revenue', label: 'Revenue Overview' }
}

export function AssignRefundAuthorityPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { id = '' } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const resourceType = searchParams.get('resourceType') || ''
  const kind = escalateKind(searchParams.get('kind'), resourceType)
  const returnTo = safeEscalateReturnTo(
    searchParams.get('returnTo'),
    escalateDetailPath(id, { kind, resourceType, from: searchParams.get('returnTo') }),
  )
  const detailPath = escalateDetailPath(id, {
    kind,
    resourceType,
    from: searchParams.get('returnTo'),
  })
  const crumb = listCrumb(returnTo, kind)

  const refundQuery = useFinanceRefund(kind === 'refund' ? id : '')
  const disputeQuery = useFinanceDispute(kind === 'dispute' ? id : '')
  const refund = refundQuery.data?.data
  const paymentQuery = useFinancePayment(
    kind === 'resource' && resourceType !== 'TaxRecord' && resourceType !== 'EscrowHold'
      ? id
      : kind === 'refund'
        ? refund?.paymentId || ''
        : '',
  )
  const taxQuery = useFinanceTaxDetail(
    kind === 'resource' && resourceType === 'TaxRecord' ? id : '',
  )
  const escrowQuery = useFinanceEscrowDetail(
    kind === 'resource' && resourceType === 'EscrowHold' ? id : '',
  )

  const dispute = disputeQuery.data?.data
  const payment = paymentQuery.data?.data
  const tax = taxQuery.data?.data
  const escrow = escrowQuery.data?.data

  const assigneesQuery = useQuery({
    queryKey: ['escalation-assignees', 'finance.*'],
    queryFn: () => fetchEscalationAssignees('finance.*'),
  })

  const assignees = useMemo(() => {
    const list = assigneesQuery.data?.data
    if (Array.isArray(list) && list.length > 0) return list
    return []
  }, [assigneesQuery.data?.data])

  const fallbackAssigneesQuery = useQuery({
    queryKey: ['escalation-assignees', 'experts.*'],
    queryFn: () => fetchEscalationAssignees('experts.*'),
    enabled: !assigneesQuery.isLoading && assignees.length === 0,
  })

  const resolvedAssignees =
    assignees.length > 0 ? assignees : fallbackAssigneesQuery.data?.data || []

  const [selectedRoleId, setSelectedRoleId] = useState<AuthorityRoleId>('finance-admin')
  const [isEscalateOpen, setIsEscalateOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const selectedRoleIndex = AUTHORITY_ROLES.findIndex((role) => role.id === selectedRoleId)
  const selectedRole = AUTHORITY_ROLES[selectedRoleIndex] || AUTHORITY_ROLES[0]
  const selected = resolvedAssignees[selectedRoleIndex] || resolvedAssignees[0]

  const heading = 'Assign Refund Authority'
  const subtitle = 'Select the role responsible for reviewing and processing this refund request'
  const listLabel = 'Select and assign the refund:'
  const currentCrumb = kind === 'dispute' ? 'Dispute' : kind === 'resource' ? 'Record' : 'Refunds'

  const paymentViewPath = refund?.paymentId
    ? `/finance/revenue/${refund.paymentId}`
    : kind === 'resource' && resourceType !== 'TaxRecord' && resourceType !== 'EscrowHold'
      ? `/finance/revenue/${id}`
      : returnTo

  const customerId =
    payment?.userId ||
    (kind === 'resource' && resourceType === 'EscrowHold' ? escrow?.userId : '') ||
    '—'
  const customerName =
    titleCase(refund?.beneficiary) || escrow?.userName || titleCase(payment?.userType) || '—'
  const membershipStatus =
    titleCase(
      firstSnapshotString(payment?.moduleSnapshot, [
        'membershipStatus',
        'membershipPlan',
        'planName',
        'membership',
      ]) ||
        firstSnapshotString(payment?.moduleData, [
          'membershipStatus',
          'membershipPlan',
          'planName',
          'membership',
        ]),
    ) || '—'

  const summaryRows: SummaryItem[][] =
    kind === 'dispute'
      ? [
          [
            { label: 'Request ID', value: dispute?.disputeId || id || '—' },
            { label: 'Raised by', value: titleCase(dispute?.raisedBy) || '—' },
            { label: 'Amount', value: dispute ? formatInr(dispute.originalAmount) : '—' },
            { label: 'Reason', value: dispute?.reason || dispute?.summary || '—' },
            { label: 'Module type', value: titleCase(dispute?.module) || '—' },
            { label: 'Case type', value: titleCase(dispute?.caseType) || '—' },
            { label: 'Status', value: titleCase(dispute?.status) || '—' },
          ],
        ]
      : kind === 'resource' && resourceType === 'TaxRecord'
        ? [
            [
              { label: 'Tax record ID', value: tax?.taxRecordId || id || '—' },
              { label: 'Module type', value: titleCase(tax?.module) || '—' },
              { label: 'Amount', value: tax ? formatInr(tax.taxAmount) : '—' },
              { label: 'Tax type', value: titleCase(tax?.taxType) || '—' },
              { label: 'Region', value: tax?.region || '—' },
              { label: 'Filing status', value: titleCase(tax?.filingStatus) || '—' },
              { label: 'Invoice', value: tax?.invoiceNumber || '—' },
            ],
          ]
        : kind === 'resource' && resourceType === 'EscrowHold'
          ? [
              [
                { label: 'Escrow ID', value: escrow?.escrowId || id || '—' },
                { label: 'Module type', value: titleCase(escrow?.module) || '—' },
                { label: 'Amount', value: escrow ? formatInr(escrow.amountHeld) : '—' },
                { label: 'Hold reason', value: escrow?.holdReason || '—' },
                { label: 'Status', value: titleCase(escrow?.status) || '—' },
                { label: 'Partner', value: escrow?.partnerName || '—' },
                { label: 'User', value: escrow?.userName || '—' },
              ],
            ]
          : kind === 'resource'
            ? [
                [
                  { label: 'Order ID', value: payment?.orderId || id || '—' },
                  { label: 'Customer', value: titleCase(payment?.userType) || '—' },
                  { label: 'Amount', value: payment ? formatInr(payment.amount) : '—' },
                  { label: 'Description', value: payment?.description || '—' },
                  { label: 'Module type', value: titleCase(payment?.module) || '—' },
                  { label: 'Status', value: titleCase(payment?.status) || '—' },
                  { label: 'Payment mode', value: payment?.paymentMethod || '—' },
                ],
              ]
            : [
                [
                  { label: 'Request ID', value: refund?.refundId || id || '—' },
                  {
                    label: 'Customer ID',
                    value: customerId,
                    href: paymentViewPath,
                  },
                  {
                    label: 'Customer Name',
                    value: customerName,
                    href: paymentViewPath,
                  },
                  { label: 'Membership Status', value: membershipStatus },
                  { label: 'Module', value: titleCase(refund?.module) || '—' },
                  { label: 'Category', value: titleCase(refund?.refundType) || '—' },
                  { label: 'Amount', value: refund ? formatInr(refund.amount) : '—' },
                ],
                [
                  { label: 'Routed By', value: refund?.initiatedBy || '—' },
                  {
                    label: 'Customer Comments',
                    value: refund?.reason || '—',
                    wide: true,
                  },
                  {
                    label: 'Internal Notes',
                    value: refund?.adminNote || refund?.reason || '—',
                    wide: true,
                  },
                ],
              ]

  const modalSummary = {
    recordId:
      kind === 'dispute'
        ? dispute?.disputeId || id
        : kind === 'resource' && resourceType === 'TaxRecord'
          ? tax?.taxRecordId || id
          : kind === 'resource' && resourceType === 'EscrowHold'
            ? escrow?.escrowId || id
            : kind === 'resource'
              ? payment?.orderId || id
              : refund?.refundId || id,
    requestedBy:
      kind === 'dispute'
        ? titleCase(dispute?.raisedBy) || '—'
        : kind === 'resource' && resourceType === 'TaxRecord'
          ? titleCase(tax?.module) || '—'
          : kind === 'resource' && resourceType === 'EscrowHold'
            ? escrow?.partnerName || '—'
            : kind === 'resource'
              ? titleCase(payment?.module) || '—'
              : titleCase(refund?.beneficiary) || '—',
    amount:
      kind === 'dispute'
        ? dispute
          ? formatInr(dispute.originalAmount)
          : '—'
        : kind === 'resource' && resourceType === 'TaxRecord'
          ? tax
            ? formatInr(tax.taxAmount)
            : '—'
          : kind === 'resource' && resourceType === 'EscrowHold'
            ? escrow
              ? formatInr(escrow.amountHeld)
              : '—'
            : kind === 'resource'
              ? payment
                ? formatInr(payment.amount)
                : '—'
              : refund
                ? formatInr(refund.amount)
                : '—',
    recordIdLabel:
      kind === 'dispute'
        ? 'Dispute ID'
        : kind === 'resource' && resourceType === 'TaxRecord'
          ? 'Tax Record ID'
          : kind === 'resource' && resourceType === 'EscrowHold'
            ? 'Escrow ID'
            : kind === 'resource'
              ? 'Order ID'
              : 'Refund ID',
    requestedByLabel:
      kind === 'dispute'
        ? 'Raised by'
        : kind === 'resource'
          ? resourceType === 'EscrowHold'
            ? 'Partner'
            : 'Module'
          : 'Requested By',
  }

  const handleContinue = () => {
    if (!id) {
      toast.error('Record id is missing')
      return
    }
    if (!selected?.id) {
      toast.error('Select a role to assign this case')
      return
    }
    setIsEscalateOpen(true)
  }

  const handleEscalateSubmit = async ({
    priority,
    adminNotes,
  }: {
    priority: 'urgent' | 'high' | 'normal'
    adminNotes: string
  }) => {
    if (!id || !selected?.id) {
      toast.error('Select a role to assign this case')
      throw new Error('Missing assignee')
    }

    setIsSubmitting(true)
    try {
      if (kind === 'dispute') {
        await escalateFinanceDispute(id, {
          escalateToAdminId: selected.id,
          adminNotes,
          priority,
        })
      } else if (kind === 'resource') {
        await escalateFinanceResource(
          id,
          resourceType || 'Payment',
          adminNotes,
          selected.id,
          priority,
        )
      } else {
        await escalateFinanceRefund(id, {
          escalateToAdminId: selected.id,
          adminNotes,
          priority,
        })
      }
      void queryClient.invalidateQueries({ queryKey: ['my-tasks'] })
      void queryClient.invalidateQueries({ queryKey: ['all-escalations'] })
      toast.success(`Escalated to ${selectedRole.name}`)
      const separator = detailPath.includes('?') ? '&' : '?'
      navigate(`${detailPath}${separator}assignee=${encodeURIComponent(selectedRole.name)}`)
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Failed to escalate'))
      throw err
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-brand-bg -mx-4 -my-4 flex min-h-[calc(100dvh-4rem)] flex-col sm:-mx-6 lg:-mx-8 lg:-my-6">
      <div className="flex flex-1 flex-col gap-5 px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
        <header>
          <button
            type="button"
            onClick={() => navigateBackOrFallback(navigate, returnTo)}
            className="group text-h3 hover:text-brand-accent text-brand-text flex w-fit items-center gap-2 tracking-tight transition-colors"
          >
            <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-1" />
            <span>Escalation</span>
          </button>
          <p className="text-body-sm text-muted mt-2 pl-7">
            <Link to={crumb.to} className="hover:text-brand-text transition-colors">
              {crumb.label}
            </Link>
            <span> / </span>
            <Link to={paymentViewPath} className="hover:text-brand-text transition-colors">
              Payment View Details
            </Link>
            <span> / </span>
            <span className="text-brand-text font-semibold">{currentCrumb}</span>
          </p>
        </header>

        <section className={cn(cardClass, 'px-5 py-5')}>
          <div>
            <h1 className="text-h4 text-brand-text">{heading}</h1>
            <p className="ui-page-subtitle mt-1 text-[16px] leading-5 font-medium tracking-normal text-[#FFFFFF80]">
              {subtitle}
            </p>
          </div>

          <div className="my-5 border-b border-white/[0.06]" />

          <div className="space-y-4">
            {summaryRows.map((row, index) => (
              <SummaryRow key={index} items={row} />
            ))}
          </div>
        </section>

        <section className="flex-1 pb-4">
          <p className="text-body-sm-medium text-brand-text mb-4">{listLabel}</p>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {AUTHORITY_ROLES.map((role) => (
              <RoleCard
                key={role.id}
                name={role.name}
                selected={selectedRoleId === role.id}
                onSelect={() => setSelectedRoleId(role.id)}
              />
            ))}
          </div>
        </section>
      </div>

      <footer className="mt-auto bg-[#141414] px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigateBackOrFallback(navigate, returnTo)}
            className="ui-cta ui-cta-secondary min-w-[120px]"
          >
            Close
          </button>
          <button
            type="button"
            disabled={!selected?.id}
            onClick={handleContinue}
            className="ui-cta min-w-[120px] border-0 bg-black text-white hover:bg-black/80 disabled:opacity-60"
          >
            Continue
          </button>
        </div>
      </footer>

      <EscalateToSuperAdminModal
        open={isEscalateOpen}
        refundId={modalSummary.recordId || id}
        requestedBy={modalSummary.requestedBy}
        amount={modalSummary.amount}
        assigneeName={selectedRole.name}
        recordIdLabel={modalSummary.recordIdLabel}
        requestedByLabel={modalSummary.requestedByLabel}
        isSubmitting={isSubmitting}
        onClose={() => setIsEscalateOpen(false)}
        onSubmit={handleEscalateSubmit}
      />
    </div>
  )
}
