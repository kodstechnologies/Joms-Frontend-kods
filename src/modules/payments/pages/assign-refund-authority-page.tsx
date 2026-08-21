import { useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Check, CircleDollarSign } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import {
  escalateRefundApplication,
  fetchEscalationAssignees,
} from '@/modules/my-tasks/api/escalation-api'
import { useFinanceRefund } from '@/modules/payments/hooks/use-finance'
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
        Will review and process this refund from My Tasks.
      </p>
    </button>
  )
}

export function AssignRefundAuthorityPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { id = '' } = useParams<{ id: string }>()
  const refundQuery = useFinanceRefund(id)
  const refund = refundQuery.data?.data

  const assigneesQuery = useQuery({
    queryKey: ['escalation-assignees', 'finance.*'],
    queryFn: () => fetchEscalationAssignees('finance.*'),
  })

  const assignees = useMemo(() => {
    const list = assigneesQuery.data?.data
    if (Array.isArray(list) && list.length > 0) return list
    // Fallback: any active sub-admin if finance permission filter returns empty
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
  const [isSubmitting, setIsSubmitting] = useState(false)

  const selected = resolvedAssignees.find((item) => item.id === selectedId) || resolvedAssignees[0]

  const handleContinue = async () => {
    if (!id) {
      toast.error('Refund id is missing')
      return
    }
    if (!selected?.id) {
      toast.error('Select a sub-admin to assign this refund')
      return
    }

    setIsSubmitting(true)
    try {
      await escalateRefundApplication(id, {
        assigneeSubAdminId: selected.id,
        assigneeName: selected.fullname,
        adminNote: refund?.adminNote || 'Escalated refund assigned for review',
        entityTitle: refund?.refundId || `Refund ${id}`,
        applicationUrl: `/settings/refund-details/${id}`,
        refundId: refund?.refundId,
        amount: refund?.amount,
        reason: refund?.reason || refund?.adminNote,
        paymentMethod: refund?.refundMode || undefined,
        serviceName: refund?.module,
        requestedBy: refund?.beneficiary,
        transactionId: refund?.paymentId ? String(refund.paymentId) : undefined,
        priority: 'High',
      })
      void queryClient.invalidateQueries({ queryKey: ['my-tasks'] })
      void queryClient.invalidateQueries({ queryKey: ['all-escalations'] })
      toast.success(`Refund assigned to ${selected.fullname}`)
      navigate(`/settings/refund-details/${id}`)
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to assign refund authority'
      toast.error(message)
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
            onClick={() => navigateBackOrFallback(navigate, `/finance/refunds/${id}`)}
            className="group text-h3 hover:text-brand-accent text-brand-text flex w-fit items-center gap-2 tracking-tight transition-colors"
          >
            <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-1" />
            <span>Escalation</span>
          </button>
          <p className="text-body-sm text-muted mt-2 pl-7">
            <Link to="/finance/refunds" className="hover:text-brand-text transition-colors">
              Finance Management
            </Link>
            <span> / </span>
            <Link to={`/finance/refunds/${id}`} className="hover:text-brand-text transition-colors">
              Refund Details
            </Link>
          </p>
        </header>

        <section className={cn(cardClass, 'px-5 py-5')}>
          <div>
            <h1 className="text-h4 text-brand-text">Assign Dispute Authority</h1>
            <p className="text-body-sm text-muted mt-1">
              Select the sub-admin responsible for reviewing and processing this refund request
            </p>
          </div>

          <div className="my-5 border-b border-white/[0.06]" />

          <div className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3 lg:grid-cols-7">
            <InfoItem label="Request ID" value={refund?.refundId || id || '—'} />
            <InfoItem label="Customer" value={titleCase(refund?.beneficiary) || '—'} />
            <InfoItem label="Amount" value={refund ? formatInr(refund.amount) : '—'} />
            <InfoItem
              label="Reason"
              value={refund?.reason || refund?.adminNote || '—'}
              className="sm:col-span-2 lg:col-span-1"
            />
            <InfoItem label="Module type" value={titleCase(refund?.module) || '—'} />
            <InfoItem label="Service type" value={titleCase(refund?.refundType) || '—'} />
            <InfoItem label="Payment mode" value={refund?.refundMode || '—'} />
          </div>
        </section>

        <section className="flex-1 pb-4">
          <p className="text-body-sm-medium text-brand-text mb-4">Select and assign the refund:</p>
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
            onClick={() => navigateBackOrFallback(navigate, `/finance/refunds/${id}`)}
            className="ui-cta ui-cta-secondary w-full sm:w-auto sm:min-w-[120px]"
          >
            Close
          </button>
          <button
            type="button"
            disabled={isSubmitting || !selected?.id}
            onClick={() => void handleContinue()}
            className="ui-cta ui-cta-primary w-full disabled:opacity-60 sm:ml-auto sm:w-auto sm:min-w-[120px]"
          >
            {isSubmitting ? 'Assigning...' : 'Continue'}
          </button>
        </div>
      </footer>
    </div>
  )
}
