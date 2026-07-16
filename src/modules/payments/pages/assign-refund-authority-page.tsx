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

const labelClass = 'font-figtree text-[11px] font-normal leading-[20px] text-[#888888]'
const valueClass = 'font-figtree text-[12px] font-medium leading-[20px] text-white'

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
          className={cn('size-2.5', active ? 'text-white' : 'text-[#666666]')}
          strokeWidth={2.5}
          aria-hidden="true"
        />
      </span>
      <span
        className={cn(
          'font-figtree text-[11px] leading-[20px] font-normal',
          active ? 'text-[#CCCCCC]' : 'text-[#777777]',
        )}
      >
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
        'flex min-h-[228px] w-full flex-col rounded-[10px] border p-5 text-left transition-colors',
        selected
          ? 'border-white bg-[#1A1A1A]'
          : 'border-transparent bg-[#141414] hover:bg-[#181818]',
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'grid size-10 shrink-0 place-items-center rounded-full border border-white/10 bg-[#0F0F0F]',
            selected ? 'text-[#AAAAAA]' : 'text-[#666666]',
          )}
        >
          <CircleDollarSign className="size-[18px]" strokeWidth={1.75} />
        </div>
        <div className="min-w-0 flex-1">
          <h3
            className={cn(
              'font-figtree text-[14px] leading-[20px] font-semibold',
              selected ? 'text-white' : 'text-[#DDDDDD]',
            )}
          >
            {role.title}
          </h3>
          <p className="font-figtree mt-1 text-[11px] leading-[18px] font-normal text-[#888888]">
            {role.description}
          </p>
        </div>
      </div>

      <div className="mt-5 flex-1">
        <p
          className={cn(
            'font-figtree mb-3 text-[12px] leading-[20px] font-semibold',
            selected ? 'text-white' : 'text-[#CCCCCC]',
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
    <div className="-mx-4 -my-4 flex min-h-[calc(100dvh-4rem)] flex-col bg-black sm:-mx-6 lg:-mx-8 lg:-my-6">
      <div className="flex flex-1 flex-col gap-5 px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
        <header>
          <button
            type="button"
            onClick={() => navigateBackOrFallback(navigate, `/finance/refunds/${id}/dispute`)}
            className="group font-figtree flex w-fit items-center gap-2 text-[20px] leading-7 font-bold tracking-tight text-white transition-colors hover:text-[#FBC078]"
          >
            <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-1" />
            <span>Escalation</span>
          </button>
          <p className="font-figtree mt-2 pl-7 text-[12px] leading-[20px] font-normal text-[#777777]">
            <Link to="/finance/refunds" className="transition-colors hover:text-white">
              Finance Management
            </Link>
            <span> / </span>
            <Link
              to={`/finance/refunds/${id}/dispute`}
              className="transition-colors hover:text-white"
            >
              Payment View Details
            </Link>
          </p>
        </header>

        <section className="rounded-[10px] border border-white/[0.06] bg-[#1A1A1A] px-5 py-5">
          <div>
            <h1 className="font-figtree text-[18px] leading-[24px] font-semibold text-white">
              Assign Dispute Authority
            </h1>
            <p className="font-figtree mt-1 text-[12px] leading-[20px] font-normal text-[#888888]">
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
          <p className="font-figtree mb-4 text-[12px] leading-[20px] font-medium text-white">
            Select and assign the refund:
          </p>
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

      <footer className="mt-auto border-t border-white/[0.06] bg-[#0B0F14] px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => navigateBackOrFallback(navigate, `/finance/refunds/${id}/dispute`)}
            className="font-figtree inline-flex h-10 w-full items-center justify-center rounded-[10px] border border-white/20 bg-transparent px-6 text-[12px] leading-[20px] font-semibold text-white transition-colors hover:bg-white/5 sm:w-auto sm:min-w-[120px]"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleContinue}
            className="font-figtree inline-flex h-10 w-full items-center justify-center rounded-[10px] border border-white/10 bg-[#2A2A2A] px-6 text-[12px] leading-[20px] font-semibold text-white transition-colors hover:bg-[#333333] sm:ml-auto sm:w-auto sm:min-w-[120px]"
          >
            Continue
          </button>
        </div>
      </footer>
    </div>
  )
}
