import { useState, type ReactNode } from 'react'
import { ArrowLeft, Download, SquarePen } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { AddFinanceNoteModal } from '@/modules/payments/components/add-finance-note-modal'
import { FinanceInternalNotesCard } from '@/modules/payments/components/finance-internal-notes-card'
import {
  useAddFinanceNote,
  useEscalateFinance,
  useFinancePayment,
} from '@/modules/payments/hooks/use-finance'
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
const sectionSubtitleClass = 'text-body-sm text-muted mt-1'
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
  if (status === 'Successful' || status === 'Completed') {
    return 'border-brand-positive/25 bg-brand-positive/10 text-brand-positive'
  }
  if (status === 'Pending' || status === 'In Progress') {
    return 'border-brand-accent/40 bg-brand-accent/10 text-brand-accent'
  }
  return 'border-brand-danger/25 bg-brand-danger/10 text-brand-danger'
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        'text-body-sm-semibold inline-flex rounded-full border px-2.5 py-0.5',
        getStatusBadgeClass(status),
      )}
    >
      {status}
    </span>
  )
}

export function ServicePaymentDetailViewPage() {
  const navigate = useNavigate()
  const { id = '' } = useParams<{ id: string }>()
  const { data, isLoading, isError } = useFinancePayment(id)
  const noteMutation = useAddFinanceNote()
  const escalateMutation = useEscalateFinance()
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false)
  const [isEscalateModalOpen, setIsEscalateModalOpen] = useState(false)
  const payment = data?.data

  if (isLoading) {
    return <p className="text-body-sm text-muted">Loading payment details...</p>
  }

  if (isError || !payment) {
    return (
      <div className="space-y-4">
        <p className="text-body-sm text-brand-danger">Payment not found.</p>
        <button
          type="button"
          onClick={() => navigateBackOrFallback(navigate, '/finance/services')}
          className="ui-cta ui-cta-secondary"
        >
          Back to Services
        </button>
      </div>
    )
  }

  const snapshot = payment.moduleSnapshot || {}
  const status = mapPaymentStatus(payment.status)
  const paymentStatus =
    status === 'Paid' ? 'Successful' : status === 'Failed' ? 'Failed' : 'Pending'

  const detail = {
    serviceTitle: (snapshot.title as string) || payment.description || titleCase(payment.module),
    serviceDescription: payment.description || `${titleCase(payment.module)} payment details`,
    paymentInformation: {
      paymentId: payment.orderId,
      transactionId: payment._id,
      bookingId: payment.referenceId || payment.orderId,
      paymentMethod: payment.paymentMethod || 'Razorpay',
      paymentGateway: 'Razorpay',
      createdOn: formatDate(payment.createdAt),
      settlementStatus: titleCase(payment.pricingType) || '—',
      paymentStatus: paymentStatus as 'Successful' | 'Pending' | 'Failed',
    },
    serviceInformation: {
      serviceName: (snapshot.title as string) || payment.description || payment.orderId,
      serviceType: titleCase(payment.pricingType || payment.referenceType),
      category: (snapshot.category as string) || titleCase(payment.module),
      startDate: formatDate(payment.createdAt),
      endDate: formatDate(payment.updatedAt || payment.createdAt),
      completionStatus: (status === 'Paid' ? 'Completed' : 'Pending') as
        | 'Completed'
        | 'In Progress'
        | 'Pending',
      paymentStatus: paymentStatus as 'Successful' | 'Pending' | 'Failed',
    },
    timelineInformation: {
      bookingDate: formatDate(payment.createdAt),
      paymentDate: formatDate(payment.createdAt),
      serviceCompletedOn: '—',
      payoutReleasedOn: '—',
    },
    parties: {
      clientId: payment.userId || '—',
      clientName: (snapshot.userName as string) || payment.userId || '—',
      expertId: payment.partnerId || '—',
      expertName: (snapshot.partnerName as string) || payment.partnerId || '—',
    },
    financialBreakdown: {
      payoutId: formatInr(payment.amount),
      payoutMethod: payment.paymentMethod || 'Bank Transfer',
      serviceCompletedOn: '—',
      payoutDate: '—',
      paymentStatus: paymentStatus as 'Successful' | 'Pending' | 'Failed',
    },
  }

  return (
    <div className="bg-brand-bg flex flex-col gap-5 pb-6">
      <header>
        <button
          type="button"
          onClick={() => navigateBackOrFallback(navigate, '/finance/services')}
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
          <Link to="/finance/services" className="hover:text-brand-text transition-colors">
            Service
          </Link>
          <span> / </span>
          <span className="text-brand-text font-semibold">Payment View Details</span>
        </p>
      </header>

      <section className={cn(cardClass, 'p-5')}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className={sectionTitleClass}>{detail.serviceTitle}</h2>
            <p className={cn(sectionSubtitleClass, 'leading-[20px]')}>
              {detail.serviceDescription}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={() => toast.message('Download report coming soon')}>
              <Download className="size-4" />
              Download Report
            </Button>
            <Button onClick={() => setIsNoteModalOpen(true)}>
              <SquarePen className="size-4" />
              Add Notes
            </Button>
            <Button onClick={() => setIsEscalateModalOpen(true)}>
              <SquarePen className="size-4" />
              Escalate
            </Button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <div className="flex flex-col gap-5">
          <DetailCard title="Payment Information">
            <DetailRow label="Payment ID" value={detail.paymentInformation.paymentId} />
            <DetailRow label="Transaction ID" value={detail.paymentInformation.transactionId} />
            <DetailRow label="Booking ID" value={detail.paymentInformation.bookingId} />
            <DetailRow label="Payment Method" value={detail.paymentInformation.paymentMethod} />
            <DetailRow label="Payment Gateway" value={detail.paymentInformation.paymentGateway} />
            <DetailRow label="Created On" value={detail.paymentInformation.createdOn} />
            <DetailRow
              label="Settlement Status"
              value={detail.paymentInformation.settlementStatus}
            />
            <DetailRow
              label="Payment Status"
              value={<StatusBadge status={detail.paymentInformation.paymentStatus} />}
            />
          </DetailCard>

          <DetailCard title="Timeline Information">
            <DetailRow label="Booking Date" value={detail.timelineInformation.bookingDate} />
            <DetailRow label="Payment Date" value={detail.timelineInformation.paymentDate} />
            <DetailRow
              label="Service Completed On"
              value={detail.timelineInformation.serviceCompletedOn}
            />
            <DetailRow
              label="Payout Released On"
              value={detail.timelineInformation.payoutReleasedOn}
            />
          </DetailCard>

          <DetailCard title="Financial Breakdown">
            <DetailRow label="Payout ID" value={detail.financialBreakdown.payoutId} />
            <DetailRow label="Payout Method" value={detail.financialBreakdown.payoutMethod} />
            <DetailRow
              label="Service Completed On"
              value={detail.financialBreakdown.serviceCompletedOn}
            />
            <DetailRow label="Payout Date" value={detail.financialBreakdown.payoutDate} />
            <DetailRow
              label="Payment Status"
              value={<StatusBadge status={detail.financialBreakdown.paymentStatus} />}
            />
          </DetailCard>
        </div>

        <div className="flex flex-col gap-5">
          <DetailCard title="Service Information">
            <DetailRow label="Service Name" value={detail.serviceInformation.serviceName} />
            <DetailRow label="Service Type" value={detail.serviceInformation.serviceType} />
            <DetailRow label="Category" value={detail.serviceInformation.category} />
            <DetailRow label="Start Date" value={detail.serviceInformation.startDate} />
            <DetailRow label="End Date" value={detail.serviceInformation.endDate} />
            <DetailRow
              label="Completion Status"
              value={<StatusBadge status={detail.serviceInformation.completionStatus} />}
            />
            <DetailRow
              label="Payment Status"
              value={<StatusBadge status={detail.serviceInformation.paymentStatus} />}
            />
          </DetailCard>

          <DetailCard title="Parties">
            <DetailRow label="Client ID" value={detail.parties.clientId} />
            <DetailRow label="Client Name" value={detail.parties.clientName} />
            <DetailRow label="Expert ID" value={detail.parties.expertId} />
            <DetailRow label="Expert Name" value={detail.parties.expertName} />
          </DetailCard>
        </div>
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

      <AddFinanceNoteModal
        open={isEscalateModalOpen}
        title="Escalate"
        description="This records an escalation for admin review and audit history."
        placeholder="Enter escalation note"
        submitLabel="Escalate"
        submittingLabel="Escalating..."
        isSubmitting={escalateMutation.isPending}
        onClose={() => setIsEscalateModalOpen(false)}
        onSubmit={(adminNote) => {
          escalateMutation.mutate(
            { id: payment._id, resourceType: 'Payment', adminNote },
            {
              onSuccess: () => {
                toast.success('Escalated')
                setIsEscalateModalOpen(false)
              },
              onError: () => toast.error('Failed to escalate'),
            },
          )
        }}
      />
    </div>
  )
}
