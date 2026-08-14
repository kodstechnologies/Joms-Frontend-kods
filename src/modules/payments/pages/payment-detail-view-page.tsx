import { useState, type ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Download, SquarePen } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { fetchPartnerDisplayNames } from '@/modules/payments/api/partner-lookup-api'
import { AddFinanceNoteModal } from '@/modules/payments/components/add-finance-note-modal'
import { FinanceInternalNotesCard } from '@/modules/payments/components/finance-internal-notes-card'
import { useAddFinanceNote, useFinancePayment } from '@/modules/payments/hooks/use-finance'
import {
  formatDate,
  formatInr,
  mapPaymentStatus,
  titleCase,
} from '@/modules/payments/utils/finance-mappers'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'
import { navigateBackOrFallback } from '@/shared/lib/navigation'

const cardClass = 'radius-lg border border-white/[0.06] bg-brand-surface p-4 sm:p-5'
const sectionTitleClass = 'text-body-md-semibold text-brand-text leading-[20px]'
const labelClass = 'text-body-sm text-muted'
const valueClass = 'text-body-sm-medium text-brand-text'

function DetailCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className={cn(cardClass, 'p-5')}>
      <h2 className={cn(sectionTitleClass, 'mb-4')}>{title}</h2>
      {children}
    </section>
  )
}

function DetailRow({
  label,
  value,
  valueClassName,
}: {
  label: string
  value: ReactNode
  valueClassName?: string
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/5 py-3 last:border-b-0">
      <span className={labelClass}>{label}</span>
      <span className={cn('text-right', valueClass, valueClassName)}>{value}</span>
    </div>
  )
}

function getStatusBadgeClass(status: string) {
  if (status === 'Paid' || status === 'Successful') {
    return 'border-brand-positive/25 bg-brand-positive/10 text-brand-positive'
  }
  if (status === 'Pending') {
    return 'border-brand-accent/40 bg-brand-accent/10 text-brand-accent'
  }
  return 'border-brand-danger/25 bg-brand-danger/10 text-brand-danger'
}

export function PaymentDetailViewPage() {
  const navigate = useNavigate()
  const { id = '' } = useParams<{ id: string }>()
  const { data, isLoading, isError } = useFinancePayment(id)
  const noteMutation = useAddFinanceNote()
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false)
  const payment = data?.data
  const status = payment ? mapPaymentStatus(payment.status) : 'Pending'
  const snapshot = (payment?.moduleSnapshot || {}) as Record<string, unknown>
  const moduleData = (payment?.moduleData || {}) as Record<string, unknown>
  // Membership: payer is the partner — older rows may only have userId populated.
  const partnerId =
    payment?.partnerId ||
    (payment?.userType === 'partner' ? payment.userId : null) ||
    (typeof snapshot.partnerId === 'string' ? snapshot.partnerId : null)
  const snapshotPartnerName =
    (typeof snapshot.partnerName === 'string' && snapshot.partnerName) ||
    (typeof moduleData.partnerName === 'string' && moduleData.partnerName) ||
    null
  const { data: partnerNameMap } = useQuery({
    queryKey: ['finance-partner-name', partnerId],
    queryFn: () => fetchPartnerDisplayNames([String(partnerId)]),
    enabled: !!partnerId && !snapshotPartnerName,
    staleTime: 1000 * 60 * 5,
  })
  const partnerName =
    snapshotPartnerName ||
    (partnerId ? partnerNameMap?.[String(partnerId)] : null) ||
    null
  const title =
    (typeof snapshot.title === 'string' && snapshot.title) ||
    (typeof snapshot.planName === 'string' &&
      `${snapshot.planName}${snapshot.billingCycleName ? ` - ${snapshot.billingCycleName}` : ''}`) ||
    payment?.description ||
    null
  // Older membership rows may lack reference* if schema enum rejected MembershipPlan.
  const referenceType =
    payment?.referenceType ||
    (payment?.module === 'membership' ? 'MembershipPlan' : null) ||
    (typeof snapshot.referenceType === 'string' ? snapshot.referenceType : null)
  const referenceId =
    payment?.referenceId ||
    (typeof snapshot.membershipPlanId === 'string' ? snapshot.membershipPlanId : null) ||
    (typeof moduleData.membershipPlanId === 'string' ? moduleData.membershipPlanId : null) ||
    null
  const pricingType =
    payment?.pricingType || (payment?.module === 'membership' ? 'membership' : null)

  if (isLoading) {
    return <p className="text-body-sm text-muted">Loading payment details...</p>
  }

  if (isError || !payment) {
    return (
      <div className="space-y-4">
        <p className="text-body-sm text-brand-danger">Payment not found.</p>
        <button
          type="button"
          onClick={() => navigateBackOrFallback(navigate, '/finance/revenue')}
          className="ui-cta ui-cta-secondary"
        >
          Back to Revenue
        </button>
      </div>
    )
  }

  return (
    <div className="bg-brand-bg flex flex-col gap-5 pb-6">
      <header>
        <button
          type="button"
          onClick={() => navigateBackOrFallback(navigate, '/finance/revenue')}
          className="group text-h3 hover:text-brand-accent text-brand-text flex w-fit items-center gap-2 tracking-tight transition-colors"
        >
          <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-1" />
          <span>Payment Detail View</span>
        </button>
        <p className="text-body-sm text-muted mt-2 pl-7 leading-[20px]">
          <Link to="/finance/dashboard" className="hover:text-brand-text transition-colors">
            Finance Management
          </Link>
          <span> / </span>
          <Link to="/finance/revenue" className="hover:text-brand-text transition-colors">
            Revenue Overview
          </Link>
          <span> / </span>
          <span className="text-brand-text font-semibold">Payment View Details</span>
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        <Button className="ui-cta ui-cta-secondary" onClick={() => setIsNoteModalOpen(true)}>
          <SquarePen className="size-4" />
          Add Note
        </Button>
        <Button className="ui-cta ui-cta-secondary" onClick={() => toast.message('Export coming soon')}>
          <Download className="size-4" />
          Export
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <DetailCard title="Payment Information">
          <DetailRow label="Order ID" value={payment.orderId} />
          <DetailRow label="Module" value={titleCase(payment.module)} />
          <DetailRow label="Amount" value={formatInr(payment.amount)} />
          <DetailRow
            label="Status"
            value={
              <span
                className={cn(
                  'text-body-sm-semibold inline-flex rounded-full border px-2.5 py-0.5',
                  getStatusBadgeClass(status),
                )}
              >
                {status}
              </span>
            }
          />
          <DetailRow label="Pricing Type" value={titleCase(pricingType)} />
          <DetailRow label="Payment Method" value={payment.paymentMethod || '—'} />
          <DetailRow label="Created" value={formatDate(payment.createdAt)} />
        </DetailCard>

        <DetailCard title="Parties & Reference">
          <DetailRow label="User ID" value={payment.userId || '—'} />
          <DetailRow label="User Type" value={titleCase(payment.userType)} />
          <DetailRow label="Partner ID" value={partnerId || '—'} />
          <DetailRow label="Partner Name" value={partnerName || '—'} />
          <DetailRow label="Reference Type" value={titleCase(referenceType)} />
          <DetailRow label="Reference ID" value={referenceId || '—'} />
          <DetailRow label="Title" value={title || '—'} />
        </DetailCard>
      </div>

      <FinanceInternalNotesCard resourceId={payment._id} />

      <AddFinanceNoteModal
        open={isNoteModalOpen}
        isSubmitting={noteMutation.isPending}
        onClose={() => setIsNoteModalOpen(false)}
        onSubmit={(adminNote) => {
          noteMutation.mutate(
            { id: payment._id, resourceType: 'Payment', adminNote },
            {
              onSuccess: () => {
                toast.success('Note saved')
                setIsNoteModalOpen(false)
              },
              onError: () => toast.error('Failed to save note'),
            },
          )
        }}
      />
    </div>
  )
}
