import { useMemo, useState } from 'react'
import { ArrowLeft, CircleDollarSign, Check } from 'lucide-react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'

import { EscalateToSuperAdminModal } from '@/modules/payments/components/escalate-to-super-admin-modal'
import {
  useEscalateDispute,
  useEscalateFinance,
  useEscalateRefund,
  useFinanceDispute,
  useFinanceEscrowDetail,
  useFinancePayment,
  useFinanceRefund,
  useFinanceTaxDetail,
} from '@/modules/payments/hooks/use-finance'
import {
  getRefundEscalationRequestById,
  refundAuthorityRolesMock,
  type RefundAuthorityRole,
} from '@/modules/payments/mock/refund-escalation.mock'
import { formatInr, titleCase } from '@/modules/payments/utils/finance-mappers'
import { type FinanceEscalateKind } from '@/modules/payments/utils/finance-escalate'
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

function PermissionItem({ label, active }: { label: string; active: boolean }) {
  return (
    <li className="flex items-center gap-2.5">
      <span
        className={cn(
          'grid size-4 shrink-0 place-items-center rounded-full border',
          active ? 'border-white/30' : 'border-white/15',
        )}
      >
        <Check
          className={cn('size-2.5', active ? 'text-brand-text' : 'text-muted')}
          strokeWidth={2.5}
          aria-hidden="true"
        />
      </span>
      <span className={cn('text-body-sm', active ? 'text-brand-text/80' : 'text-muted')}>
        {label}
      </span>
    </li>
  )
}

function RoleCard({
  role,
  selected,
  onSelect,
}: {
  role: RefundAuthorityRole
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'radius-lg flex min-h-[228px] w-full flex-col border p-5 text-left transition-colors',
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
            {role.title}
          </h3>
          <p className="text-body-sm text-muted mt-1">{role.description}</p>
        </div>
      </div>

      <div className="mt-5 flex-1">
        <p
          className={cn(
            'text-body-sm-semibold mb-3',
            selected ? 'text-brand-text' : 'text-brand-text/80',
          )}
        >
          Permissions
        </p>
        <ul className="space-y-2.5">
          {role.permissions.map((permission) => (
            <PermissionItem key={permission} label={permission} active={selected} />
          ))}
        </ul>
      </div>
    </button>
  )
}

function escalateKind(kindParam: string | null, resourceType: string | null): FinanceEscalateKind {
  if (kindParam === 'dispute' || kindParam === 'resource' || kindParam === 'refund') {
    return kindParam
  }
  if (resourceType === 'Dispute') return 'dispute'
  if (resourceType === 'Refund' || !resourceType) return 'refund'
  return 'resource'
}

function apiErrorMessage(err: unknown, fallback: string) {
  return (
    (err as { response?: { data?: { message?: string } } })?.response?.data?.message || fallback
  )
}

export function AssignRefundAuthorityPage() {
  const navigate = useNavigate()
  const { id = '' } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const resourceTypeParam = searchParams.get('resourceType')
  const kind = escalateKind(searchParams.get('kind'), resourceTypeParam)
  const resourceType =
    resourceTypeParam || (kind === 'dispute' ? 'Dispute' : kind === 'refund' ? 'Refund' : 'Payment')
  const fallbackReturnTo =
    kind === 'dispute'
      ? `/finance/refunds/${id}/dispute`
      : kind === 'refund'
        ? `/finance/refunds/${id}`
        : '/finance/refunds'
  const returnTo = searchParams.get('returnTo') || fallbackReturnTo

  const refundQuery = useFinanceRefund(kind === 'refund' ? id : '')
  const disputeQuery = useFinanceDispute(kind === 'dispute' ? id : '')
  const paymentQuery = useFinancePayment(
    kind === 'resource' && resourceType === 'Payment' ? id : '',
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
  const mockRequest = getRefundEscalationRequestById(id)

  const summary = useMemo(() => {
    if (refund) {
      return {
        requestId: refund.refundId || id,
        customerName: refund.beneficiary || refund.initiatedBy || mockRequest.customerName,
        amount: formatInr(refund.amount),
        reason: refund.reason || mockRequest.reason,
        moduleType: titleCase(refund.module) || mockRequest.moduleType,
        serviceType: titleCase(refund.refundType) || mockRequest.serviceType,
        paymentMode: refund.refundMode || mockRequest.paymentMode,
        requestedBy: refund.initiatedBy || refund.beneficiary || '—',
      }
    }
    if (dispute) {
      return {
        requestId: dispute.disputeId || id,
        customerName: dispute.raisedBy || dispute.userId || mockRequest.customerName,
        amount: formatInr(dispute.originalAmount),
        reason: dispute.reason || mockRequest.reason,
        moduleType: titleCase(dispute.module) || mockRequest.moduleType,
        serviceType: titleCase(dispute.caseType) || mockRequest.serviceType,
        paymentMode: dispute.source || mockRequest.paymentMode,
        requestedBy: dispute.raisedBy || '—',
      }
    }
    if (payment) {
      return {
        requestId: payment.orderId || payment._id,
        customerName: payment.userId || mockRequest.customerName,
        amount: formatInr(payment.amount),
        reason: mockRequest.reason,
        moduleType: titleCase(payment.module) || mockRequest.moduleType,
        serviceType: titleCase(payment.pricingType) || mockRequest.serviceType,
        paymentMode: mockRequest.paymentMode,
        requestedBy: payment.userId || '—',
      }
    }
    if (tax) {
      return {
        requestId: tax.taxRecordId || id,
        customerName: tax.partnerId || tax.userId || mockRequest.customerName,
        amount: formatInr(tax.taxAmount),
        reason: tax.taxType || mockRequest.reason,
        moduleType: titleCase(tax.module) || mockRequest.moduleType,
        serviceType: tax.taxType || mockRequest.serviceType,
        paymentMode: mockRequest.paymentMode,
        requestedBy: tax.partnerId || tax.userId || '—',
      }
    }
    if (escrow) {
      return {
        requestId: escrow.escrowId || id,
        customerName: escrow.userName || escrow.userId || mockRequest.customerName,
        amount: formatInr(escrow.amountHeld),
        reason: escrow.holdReason || mockRequest.reason,
        moduleType: titleCase(escrow.module) || mockRequest.moduleType,
        serviceType: titleCase(escrow.pricingType) || mockRequest.serviceType,
        paymentMode: mockRequest.paymentMode,
        requestedBy: escrow.userName || escrow.userId || '—',
      }
    }
    return {
      requestId: mockRequest.requestId,
      customerName: mockRequest.customerName,
      amount: mockRequest.amount,
      reason: mockRequest.reason,
      moduleType: mockRequest.moduleType,
      serviceType: mockRequest.serviceType,
      paymentMode: mockRequest.paymentMode,
      requestedBy: mockRequest.customerName,
    }
  }, [dispute, escrow, id, mockRequest, payment, refund, tax])

  const [selectedRoleId, setSelectedRoleId] = useState('finance-admin')
  const [isEscalateOpen, setIsEscalateOpen] = useState(false)

  const escalateRefund = useEscalateRefund()
  const escalateDispute = useEscalateDispute()
  const escalateResource = useEscalateFinance()
  const selectedRole = refundAuthorityRolesMock.find((role) => role.id === selectedRoleId)

  const goBack = () => navigateBackOrFallback(navigate, returnTo)

  const handleContinue = () => {
    if (!selectedRoleId) {
      toast.error('Select a refund authority before continuing')
      return
    }
    setIsEscalateOpen(true)
  }

  return (
    <div className="bg-brand-bg -mx-4 -my-4 flex min-h-[calc(100dvh-4rem)] flex-col sm:-mx-6 lg:-mx-8 lg:-my-6">
      <div className="flex flex-1 flex-col gap-5 px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
        <header>
          <button
            type="button"
            onClick={goBack}
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
            <Link to={returnTo} className="hover:text-brand-text transition-colors">
              Payment View Details
            </Link>
          </p>
        </header>

        <section className={cn(cardClass, 'px-5 py-5')}>
          <div>
            <h1 className="text-h4 text-brand-text">Assign Refund Authority</h1>
            <p className="text-body-sm text-muted mt-1">
              Select the role responsible for reviewing and processing this refund request
            </p>
          </div>

          <div className="my-5 border-b border-white/[0.06]" />

          <div className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3 lg:grid-cols-7">
            <InfoItem label="Request ID" value={summary.requestId} />
            <InfoItem label="Customer" value={summary.customerName} />
            <InfoItem label="Amount" value={summary.amount} />
            <InfoItem
              label="Reason"
              value={summary.reason}
              className="sm:col-span-2 lg:col-span-1"
            />
            <InfoItem label="Module type" value={summary.moduleType} />
            <InfoItem label="Service type" value={summary.serviceType} />
            <InfoItem label="Payment mode" value={summary.paymentMode} />
          </div>
        </section>

        <section className="flex-1 pb-4">
          <p className="text-body-sm-medium text-brand-text mb-4">Select and assign the refund:</p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {refundAuthorityRolesMock.map((role) => (
              <RoleCard
                key={role.id}
                role={role}
                selected={selectedRoleId === role.id}
                onSelect={() => setSelectedRoleId(role.id)}
              />
            ))}
          </div>
        </section>
      </div>

      <footer className="bg-brand-bg mt-auto border-t border-white/[0.06] px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={goBack}
            className="ui-cta ui-cta-secondary w-full sm:w-auto sm:min-w-[120px]"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleContinue}
            className="ui-cta ui-cta-primary w-full sm:ml-auto sm:w-auto sm:min-w-[120px]"
          >
            Continue
          </button>
        </div>
      </footer>

      <EscalateToSuperAdminModal
        open={isEscalateOpen}
        refundId={summary.requestId}
        requestedBy={summary.requestedBy}
        amount={summary.amount}
        onClose={() => setIsEscalateOpen(false)}
        onSubmit={async ({ priority, adminNotes }) => {
          const assignedTo = selectedRole?.title || 'selected role'
          const note = [adminNotes.trim(), `Assigned to ${assignedTo}`].filter(Boolean).join(' — ')
          try {
            if (kind === 'dispute') {
              await escalateDispute.mutateAsync({ id, priority, adminNotes: note })
            } else if (kind === 'refund') {
              await escalateRefund.mutateAsync({ id, priority, adminNotes: note })
            } else {
              await escalateResource.mutateAsync({
                id,
                resourceType,
                adminNote: `[${priority}] ${note}`,
              })
            }
            toast.success(`Escalated to admin · ${assignedTo}`)
            setIsEscalateOpen(false)
            navigate(returnTo)
          } catch (err) {
            toast.error(apiErrorMessage(err, 'Failed to escalate'))
            throw err
          }
        }}
      />
    </div>
  )
}
