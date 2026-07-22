import { useState } from 'react'
import { ArrowLeft, CircleDollarSign, Check } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import {
  getRefundEscalationRequestById,
  refundAuthorityRolesMock,
  type RefundAuthorityRole,
} from '@/modules/payments/mock/refund-escalation.mock'
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

export function AssignRefundAuthorityPage() {
  const navigate = useNavigate()
  const { id = 'refund-02' } = useParams<{ id: string }>()
  const request = getRefundEscalationRequestById(id)
  const [selectedRoleId, setSelectedRoleId] = useState('finance-admin')

  const handleContinue = () => {
    const selectedRole = refundAuthorityRolesMock.find((role) => role.id === selectedRoleId)
    toast.success(`Dispute authority assigned to ${selectedRole?.title ?? 'selected role'}`)
    navigate(`/finance/refunds/${id}/dispute`)
  }

  return (
    <div className="bg-brand-bg -mx-4 -my-4 flex min-h-[calc(100dvh-4rem)] flex-col sm:-mx-6 lg:-mx-8 lg:-my-6">
      <div className="flex flex-1 flex-col gap-5 px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
        <header>
          <button
            type="button"
            onClick={() => navigateBackOrFallback(navigate, `/finance/refunds/${id}/dispute`)}
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
            <Link
              to={`/finance/refunds/${id}/dispute`}
              className="hover:text-brand-text transition-colors"
            >
              Payment View Details
            </Link>
          </p>
        </header>

        <section className={cn(cardClass, 'px-5 py-5')}>
          <div>
            <h1 className="text-h4 text-brand-text">Assign Dispute Authority</h1>
            <p className="text-body-sm text-muted mt-1">
              Select the role responsible for reviewing and processing this refund request
            </p>
          </div>

          <div className="my-5 border-b border-white/[0.06]" />

          <div className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3 lg:grid-cols-7">
            <InfoItem label="Request ID" value={request.requestId} />
            <InfoItem label="Customer" value={request.customerName} href="#" />
            <InfoItem label="Amount" value={request.amount} />
            <InfoItem
              label="Reason"
              value={request.reason}
              className="sm:col-span-2 lg:col-span-1"
            />
            <InfoItem label="Module type" value={request.moduleType} />
            <InfoItem label="Service type" value={request.serviceType} />
            <InfoItem label="Payment mode" value={request.paymentMode} />
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
            onClick={() => navigateBackOrFallback(navigate, `/finance/refunds/${id}/dispute`)}
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
    </div>
  )
}
