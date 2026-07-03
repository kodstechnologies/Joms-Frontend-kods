import { useState } from 'react'
import { ArrowLeft, Check, CircleDollarSign } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import {
  getRefundEscalationRequestById,
  refundAuthorityRolesMock,
  type RefundAuthorityRole,
} from '@/modules/payments/mock/refund-escalation.mock'
import { cn } from '@/shared/lib/cn'

function InfoItem({
  label,
  value,
  href,
}: {
  label: string
  value: string
  href?: string
}) {
  return (
    <div className="min-w-[120px] shrink-0 space-y-1.5 sm:min-w-0 sm:shrink">
      <p className="text-[11px] text-[#888888]">{label}</p>
      {href ? (
        <Link
          to={href}
          className="block text-[12px] font-medium text-white underline underline-offset-2"
        >
          {value}
        </Link>
      ) : (
        <p className="text-[12px] font-medium text-white">{value}</p>
      )}
    </div>
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
        'flex h-full w-full flex-col rounded-xl border p-4 text-left transition-colors sm:p-5',
        selected
          ? 'border-white bg-[#1A1A1A]'
          : 'border-transparent bg-[#141414] hover:bg-[#1A1A1A]',
      )}
    >
      <div className="mb-4 flex items-start gap-3">
        <div className="grid size-9 shrink-0 place-items-center rounded-full border border-white/10 bg-[#0F0F0F] text-[#888888]">
          <CircleDollarSign className="size-4" />
        </div>
        <div className="min-w-0">
          <h3 className="text-[14px] font-bold text-white">{role.title}</h3>
          <p className="mt-1 text-[11px] leading-relaxed text-[#888888]">{role.description}</p>
        </div>
      </div>

      <div className="mt-auto">
        <p className="mb-3 text-[12px] font-semibold text-white">Permissions</p>
        <ul className="space-y-2.5">
          {role.permissions.map((permission) => (
            <li key={permission} className="flex items-start gap-2.5 text-[11px] text-[#CCCCCC]">
              <Check className="mt-0.5 size-3.5 shrink-0 text-white" aria-hidden="true" />
              <span>{permission}</span>
            </li>
          ))}
        </ul>
      </div>
    </button>
  )
}

export function AssignRefundAuthorityPage() {
  const navigate = useNavigate()
  const { id = 'refund-01' } = useParams<{ id: string }>()
  const request = getRefundEscalationRequestById(id)
  const [selectedRoleId, setSelectedRoleId] = useState(refundAuthorityRolesMock[0]?.id ?? '')

  const handleContinue = () => {
    const selectedRole = refundAuthorityRolesMock.find((role) => role.id === selectedRoleId)
    toast.success(`Refund authority assigned to ${selectedRole?.title ?? 'selected role'}`)
    navigate(`/finance/refunds/${id}`)
  }

  return (
    <div className="flex min-h-full flex-col gap-5 pb-6">
      <header>
        <button
          type="button"
          onClick={() => navigate(`/finance/refunds/${id}`)}
          className="group flex w-fit items-center gap-2 text-[20px] font-bold tracking-tight text-white transition-colors hover:text-[#FBC078]"
        >
          <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-1" />
          <span>Escalation</span>
        </button>
        <p className="mt-2 pl-7 text-[12px] text-[#777777]">
          <Link to="/finance/refunds" className="transition-colors hover:text-white">
            Refunds & Chargebacks
          </Link>
          <span> / </span>
          <Link to={`/finance/refunds/${id}`} className="transition-colors hover:text-white">
            Payment View Details
          </Link>
          <span> / </span>
          <span className="font-semibold text-white">Refunds</span>
        </p>
      </header>

      <section className="rounded-xl border border-white/[0.06] bg-[#1A1A1A] p-4 sm:p-5">
        <div>
          <h1 className="text-[18px] font-bold text-white sm:text-[20px]">Assign Refund Authority</h1>
          <p className="mt-1 text-[12px] text-[#888888]">
            Select the role responsible for reviewing and processing this refund request.
          </p>
        </div>

        <div className="my-5 border-b border-white/[0.06]" />

        <div className="-mx-1 overflow-x-auto px-1 pb-1">
          <div className="flex min-w-max gap-6 sm:grid sm:min-w-0 sm:grid-cols-4 lg:grid-cols-7">
            <InfoItem label="Request ID" value={request.requestId} />
            <InfoItem label="Customer ID" value={request.customerId} href="#" />
            <InfoItem label="Customer Name" value={request.customerName} href="#" />
            <InfoItem label="Membership Status" value={request.membershipStatus} />
            <InfoItem label="Module" value={request.module} />
            <InfoItem label="Category" value={request.category} />
            <InfoItem label="Amount" value={request.amount} />
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-white/[0.04] bg-[#121212] p-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
            <InfoItem label="Routed By" value={request.routedBy} />
            <InfoItem label="Customer Comments" value={request.customerComments} />
            <InfoItem label="Internal Notes" value={request.internalNotes} />
          </div>
        </div>
      </section>

      <section className="flex-1">
        <p className="mb-4 text-[12px] font-medium text-white">Select and assign the refund:</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
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

      <footer className="mt-auto flex flex-col-reverse gap-3 border-t border-white/[0.06] pt-5 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={() => navigate(`/finance/refunds/${id}`)}
          className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-white/20 bg-transparent px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/5 sm:w-auto"
        >
          Close
        </button>
        <button
          type="button"
          onClick={handleContinue}
          className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-white/10 bg-[#2A2A2A] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#333333] sm:w-auto"
        >
          Continue
        </button>
      </footer>
    </div>
  )
}
