import { useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Check, CircleDollarSign } from 'lucide-react'
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
const labelClass = 'text-body-sm text-muted'
const valueClass = 'text-body-sm-medium text-brand-text'

function InfoItem({
  label,
  value,
  href,
  className,
}: {
  label: string
  value: string
  href?: string
  className?: string
}) {
  return (
    <div className={cn('min-w-0 space-y-1', className)}>
      <p className={labelClass}>{label}</p>
      {href ? (
        <Link to={href} className={cn(valueClass, 'block underline underline-offset-2')}>
          {value}
        </Link>
      ) : (
        <p className={cn(valueClass, 'truncate')}>{value}</p>
      )}
    </div>
  )
}

function AssigneeCard({
  name,
  email,
  selected,
  onSelect,
}: {
  name: string
  email?: string
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'radius-lg flex min-h-[140px] w-full flex-col border p-5 text-left transition-colors',
        selected
          ? 'bg-brand-surface border-white'
          : 'bg-brand-surface hover:bg-brand-surface/80 border-transparent',
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'bg-brand-bg grid size-10 shrink-0 place-items-center rounded-full border border-white/10',
            selected ? 'text-brand-text/70' : 'text-muted',
          )}
        >
          <CircleDollarSign className="size-[18px]" strokeWidth={1.75} />
        </div>
        <div className="min-w-0 flex-1">
          <h3
            className={cn(
              'text-body-md-semibold',
              selected ? 'text-brand-text' : 'text-brand-text/90',
            )}
          >
            {name}
          </h3>
          {email ? <p className="text-body-sm text-muted mt-1 truncate">{email}</p> : null}
        </div>
        {selected ? (
          <span className="border-brand-positive text-brand-positive grid size-5 place-items-center rounded-full border">
            <Check className="size-3" strokeWidth={2.5} />
          </span>
        ) : null}
      </div>
      <p className="text-body-sm text-muted mt-4">
        Will review this case from My Tasks after you continue.
      </p>
    </button>
  )
}

function apiErrorMessage(err: unknown, fallback: string) {
  return (
    (err as { response?: { data?: { message?: string } } })?.response?.data?.message || fallback
  )
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

  const refundQuery = useFinanceRefund(kind === 'refund' ? id : '')
  const disputeQuery = useFinanceDispute(kind === 'dispute' ? id : '')
  const paymentQuery = useFinancePayment(
    kind === 'resource' && resourceType !== 'TaxRecord' && resourceType !== 'EscrowHold' ? id : '',
  )
  const taxQuery = useFinanceTaxDetail(
    kind === 'resource' && resourceType === 'TaxRecord' ? id : '',
  )
  const escrowQuery = useFinanceEscrowDetail(
    kind === 'resource' && resourceType === 'EscrowHold' ? id : '',
  )

  const refund = refundQuery.data?.data
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

  const [selectedId, setSelectedId] = useState('')
  const [isEscalateOpen, setIsEscalateOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const selected = resolvedAssignees.find((item) => item.id === selectedId) || resolvedAssignees[0]

  const heading =
    kind === 'dispute'
      ? 'Assign Dispute Authority'
      : kind === 'resource'
        ? 'Assign Review Authority'
        : 'Assign Refund Authority'
  const subtitle =
    kind === 'dispute'
      ? 'Select the sub-admin responsible for reviewing and processing this dispute'
      : kind === 'resource'
        ? 'Select the sub-admin responsible for reviewing this finance record'
        : 'Select the sub-admin responsible for reviewing and processing this refund request'
  const listLabel =
    kind === 'dispute'
      ? 'Select and assign the dispute:'
      : kind === 'resource'
        ? 'Select and assign the record:'
        : 'Select and assign the refund:'
  const detailCrumb =
    kind === 'dispute'
      ? 'Dispute Details'
      : kind === 'resource'
        ? 'Record Details'
        : 'Refund Details'

  const summaryItems =
    kind === 'dispute'
      ? [
          { label: 'Request ID', value: dispute?.disputeId || id || '—' },
          { label: 'Raised by', value: titleCase(dispute?.raisedBy) || '—' },
          { label: 'Amount', value: dispute ? formatInr(dispute.originalAmount) : '—' },
          { label: 'Reason', value: dispute?.reason || dispute?.summary || '—' },
          { label: 'Module type', value: titleCase(dispute?.module) || '—' },
          { label: 'Case type', value: titleCase(dispute?.caseType) || '—' },
          { label: 'Status', value: titleCase(dispute?.status) || '—' },
        ]
      : kind === 'resource' && resourceType === 'TaxRecord'
        ? [
            { label: 'Tax record ID', value: tax?.taxRecordId || id || '—' },
            { label: 'Module type', value: titleCase(tax?.module) || '—' },
            { label: 'Amount', value: tax ? formatInr(tax.taxAmount) : '—' },
            { label: 'Tax type', value: titleCase(tax?.taxType) || '—' },
            { label: 'Region', value: tax?.region || '—' },
            { label: 'Filing status', value: titleCase(tax?.filingStatus) || '—' },
            { label: 'Invoice', value: tax?.invoiceNumber || '—' },
          ]
        : kind === 'resource' && resourceType === 'EscrowHold'
          ? [
              { label: 'Escrow ID', value: escrow?.escrowId || id || '—' },
              { label: 'Module type', value: titleCase(escrow?.module) || '—' },
              { label: 'Amount', value: escrow ? formatInr(escrow.amountHeld) : '—' },
              { label: 'Hold reason', value: escrow?.holdReason || '—' },
              { label: 'Status', value: titleCase(escrow?.status) || '—' },
              { label: 'Partner', value: escrow?.partnerName || '—' },
              { label: 'User', value: escrow?.userName || '—' },
            ]
          : kind === 'resource'
            ? [
                { label: 'Order ID', value: payment?.orderId || id || '—' },
                { label: 'Customer', value: titleCase(payment?.userType) || '—' },
                { label: 'Amount', value: payment ? formatInr(payment.amount) : '—' },
                { label: 'Description', value: payment?.description || '—' },
                { label: 'Module type', value: titleCase(payment?.module) || '—' },
                { label: 'Status', value: titleCase(payment?.status) || '—' },
                { label: 'Payment mode', value: payment?.paymentMethod || '—' },
              ]
            : [
                { label: 'Request ID', value: refund?.refundId || id || '—' },
                { label: 'Customer', value: titleCase(refund?.beneficiary) || '—' },
                { label: 'Amount', value: refund ? formatInr(refund.amount) : '—' },
                { label: 'Reason', value: refund?.reason || refund?.adminNote || '—' },
                { label: 'Module type', value: titleCase(refund?.module) || '—' },
                { label: 'Service type', value: titleCase(refund?.refundType) || '—' },
                { label: 'Payment mode', value: refund?.refundMode || '—' },
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
      toast.error('Select a sub-admin to assign this case')
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
      toast.error('Select a sub-admin to assign this case')
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
      toast.success(`Escalated to ${selected.fullname}`)
      const separator = detailPath.includes('?') ? '&' : '?'
      navigate(`${detailPath}${separator}assignee=${encodeURIComponent(selected.fullname)}`)
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
            <Link to="/finance/dashboard" className="hover:text-brand-text transition-colors">
              Finance Management
            </Link>
            <span> / </span>
            <Link to={returnTo} className="hover:text-brand-text transition-colors">
              {detailCrumb}
            </Link>
          </p>
        </header>

        <section className={cn(cardClass, 'px-5 py-5')}>
          <div>
            <h1 className="text-h4 text-brand-text">{heading}</h1>
            <p className="text-body-sm text-muted mt-1">{subtitle}</p>
          </div>

          <div className="my-5 border-b border-white/[0.06]" />

          <div className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3 lg:grid-cols-7">
            {summaryItems.map((item) => (
              <InfoItem key={item.label} label={item.label} value={item.value} />
            ))}
          </div>
        </section>

        <section className="flex-1 pb-4">
          <p className="text-body-sm-medium text-brand-text mb-4">{listLabel}</p>
          {assigneesQuery.isLoading || fallbackAssigneesQuery.isLoading ? (
            <p className="text-body-sm text-muted">Loading assignees...</p>
          ) : resolvedAssignees.length === 0 ? (
            <p className="text-body-sm text-muted">No active sub-admins available to assign.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {resolvedAssignees.map((assignee) => (
                <AssigneeCard
                  key={assignee.id}
                  name={assignee.fullname}
                  email={assignee.email}
                  selected={(selectedId || resolvedAssignees[0]?.id) === assignee.id}
                  onSelect={() => setSelectedId(assignee.id)}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      <footer className="bg-brand-bg mt-auto border-t border-white/[0.06] px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => navigateBackOrFallback(navigate, returnTo)}
            className="ui-cta ui-cta-secondary w-full sm:w-auto sm:min-w-[120px]"
          >
            Close
          </button>
          <button
            type="button"
            disabled={!selected?.id}
            onClick={handleContinue}
            className="ui-cta ui-cta-primary w-full disabled:opacity-60 sm:ml-auto sm:w-auto sm:min-w-[120px]"
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
        assigneeName={selected?.fullname}
        recordIdLabel={modalSummary.recordIdLabel}
        requestedByLabel={modalSummary.requestedByLabel}
        isSubmitting={isSubmitting}
        onClose={() => setIsEscalateOpen(false)}
        onSubmit={handleEscalateSubmit}
      />
    </div>
  )
}
