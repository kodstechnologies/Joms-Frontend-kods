import type { ReactNode } from 'react'
import { useState } from 'react'
import {
  AlertCircle,
  ArrowLeft,
  Check,
  FileText,
  Flag,
  Gavel,
  Lightbulb,
  User,
  X,
} from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { EscalateToSuperAdminModal } from '@/modules/payments/components/escalate-to-super-admin-modal'
import { ApproveRefundModal } from '@/modules/payments/components/approve-refund-modal'
import { getDisputeDetailById } from '@/modules/payments/mock/dispute-detail.mock'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'

function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <section className={cn('rounded-xl border border-white/[0.06] bg-[#1A1A1A] p-4 sm:p-5', className)}>
      {children}
    </section>
  )
}

function InfoItem({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="min-w-[130px] shrink-0 space-y-1.5 sm:min-w-0 sm:shrink">
      <p className="text-[11px] text-[#888888]">{label}</p>
      <div className="text-[12px] font-medium text-white">{value}</div>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/5 py-3 last:border-b-0">
      <span className="text-[12px] text-[#888888]">{label}</span>
      <span className="text-right text-[12px] font-medium text-white">{value}</span>
    </div>
  )
}

function TextPanel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'rounded-lg border border-white/[0.06] bg-[#0F0F0F] p-4 text-[12px] leading-relaxed text-[#CCCCCC]',
        className,
      )}
    >
      {children}
    </div>
  )
}

function AssessmentBlock({
  icon,
  title,
  children,
}: {
  icon: ReactNode
  title: string
  children: ReactNode
}) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2">
        <span className="text-[#888888]">{icon}</span>
        <p className="text-[12px] font-semibold text-white">{title}</p>
      </div>
      {children}
    </div>
  )
}

function UnderReviewBadge() {
  return (
    <span className="inline-flex rounded-full border border-amber-400/40 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-amber-300">
      Under Review
    </span>
  )
}

export function DisputeDetailViewPage() {
  const navigate = useNavigate()
  const { id = 'refund-02' } = useParams<{ id: string }>()
  const detail = getDisputeDetailById(id)
  const [selectedEvidenceId, setSelectedEvidenceId] = useState(detail.evidenceFiles[0]?.id ?? '')
  const [isEscalateOpen, setIsEscalateOpen] = useState(false)
  const [isApproveRefundOpen, setIsApproveRefundOpen] = useState(false)

  return (
    <div className="flex flex-col gap-5 pb-6">
      <header>
        <button
          type="button"
          onClick={() => navigate('/finance/refunds')}
          className="group flex w-fit items-center gap-2 text-[20px] font-bold tracking-tight text-white transition-colors hover:text-[#FBC078]"
        >
          <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-1" />
          <span>Payment Detail View</span>
        </button>
        <p className="mt-2 pl-7 text-[12px] text-[#777777]">
          <Link to="/finance/refunds" className="transition-colors hover:text-white">
            Refunds & Chargebacks
          </Link>
          <span> / </span>
          <span>Payment View Details</span>
          <span> / </span>
          <span className="font-semibold text-white">Dispute</span>
        </p>
      </header>

      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-[16px] font-bold text-white sm:text-[18px]">Dispute Details</h1>
            <p className="mt-1 text-[12px] text-[#888888]">
              Complete information related to the reported refund dispute.
            </p>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-[#121212] px-3 py-1.5 text-[11px] font-medium text-white">
            <Flag className="size-3.5" aria-hidden="true" />
            Escalated to Admin
          </span>
        </div>

        <div className="my-5 border-b border-white/[0.06]" />

        <div className="-mx-1 overflow-x-auto px-1 pb-1">
          <div className="flex min-w-max gap-6 sm:grid sm:min-w-0 sm:grid-cols-3 lg:grid-cols-6">
            <InfoItem label="Dispute ID" value={detail.disputeId} />
            <InfoItem label="Transaction ID" value={detail.transactionId} />
            <InfoItem label="Opened Date" value={detail.openedDate} />
            <InfoItem label="Status" value={<UnderReviewBadge />} />
            <InfoItem label="Module type" value={detail.moduleType} />
            <InfoItem label="Payment mode" value={detail.paymentMode} />
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-5">
          <Card>
            <div className="mb-5">
              <h2 className="text-[14px] font-bold text-white">Support Team Assessment</h2>
              <p className="mt-1 text-[12px] text-[#888888]">
                Escalated by {detail.escalatedBy} on {detail.escalatedOn}
              </p>
            </div>

            <div className="space-y-5">
              <AssessmentBlock icon={<FileText className="size-4" />} title="Support Review Summary">
                <TextPanel>{detail.supportReviewSummary}</TextPanel>
              </AssessmentBlock>

              <AssessmentBlock icon={<AlertCircle className="size-4" />} title="Escalation Reason">
                <TextPanel>{detail.escalationReason}</TextPanel>
              </AssessmentBlock>

              <AssessmentBlock icon={<Lightbulb className="size-4" />} title="Support's Recommendation">
                <TextPanel>
                  <span className="font-semibold text-emerald-400">{detail.supportRecommendation}</span>
                </TextPanel>
              </AssessmentBlock>

              <AssessmentBlock icon={<FileText className="size-4" />} title="Detailed Notes from Support">
                <TextPanel>{detail.detailedNotes}</TextPanel>
              </AssessmentBlock>
            </div>
          </Card>

          <Card>
            <div className="mb-5">
              <h2 className="text-[14px] font-bold text-white">Client Evidence</h2>
              <p className="mt-1 text-[12px] text-[#888888]">
                Submitted screenshots and contract showing deliverables not met
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {detail.evidenceFiles.map((file) => {
                const selected = selectedEvidenceId === file.id

                return (
                  <button
                    key={file.id}
                    type="button"
                    onClick={() => setSelectedEvidenceId(file.id)}
                    className={cn(
                      'rounded-xl border bg-[#121212] p-4 text-left transition-colors',
                      selected ? 'border-white' : 'border-white/[0.06] hover:border-white/20',
                    )}
                  >
                    <FileText className="mb-3 size-8 text-[#888888]" aria-hidden="true" />
                    <p className="truncate text-[12px] font-medium text-white">{file.fileName}</p>
                    <p className="mt-2 text-[10px] text-[#888888]">
                      {file.fileSize} · {file.date}
                    </p>
                  </button>
                )
              })}
            </div>
          </Card>

          <Card>
            <div className="mb-4 flex items-center gap-2">
              <Gavel className="size-4 text-[#888888]" aria-hidden="true" />
              <h2 className="text-[14px] font-bold text-white">Decision Controls</h2>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <button
                type="button"
                onClick={() => setIsApproveRefundOpen(true)}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
              >
                <Check className="size-4" />
                Resolve Dispute
              </button>
              <button
                type="button"
                onClick={() => toast.error('Dispute rejected')}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rose-500"
              >
                <X className="size-4" />
                Reject Dispute
              </button>
              <Button variant="secondary" onClick={() => toast.message('Request more info coming soon')}>
                <Flag className="size-4" />
                Request More Info
              </Button>
              <Button variant="secondary" onClick={() => setIsEscalateOpen(true)}>
                <Flag className="size-4" />
                Escalate
              </Button>
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-5">
          <Card>
            <h2 className="mb-4 text-[14px] font-bold text-white">User Information</h2>
            <DetailRow label="User ID" value={detail.userId} />
            <DetailRow label="Name" value={detail.userName} />
            <DetailRow label="Email" value={detail.userEmail} />
          </Card>

          <Card>
            <h2 className="mb-4 text-[14px] font-bold text-white">Dispute Summary</h2>
            <DetailRow label="Related Entity ID" value={detail.relatedEntityId} />
            <DetailRow label="Dispute Reason" value={detail.disputeReason} />
            <DetailRow label="Assigned To" value={detail.assignedTo} />
            <DetailRow label="Amount" value={detail.amount} />
            <div className="mt-4 space-y-2">
              <p className="text-[12px] text-[#888888]">User Message</p>
              <TextPanel>{detail.userMessage}</TextPanel>
            </div>
          </Card>

          <Card>
            <h2 className="mb-5 text-[14px] font-bold text-white">Activity Timeline</h2>
            <div className="space-y-0">
              {detail.timeline.map((item, index) => (
                <div key={item.step} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="grid size-8 shrink-0 place-items-center rounded-full border border-white/15 bg-[#121212] text-[11px] font-semibold text-white">
                      {item.step}
                    </div>
                    {index < detail.timeline.length - 1 ? (
                      <div className="my-1 w-px flex-1 bg-white/10" />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1 pb-6">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-[13px] font-semibold text-white">{item.title}</p>
                      <span className="inline-flex items-center gap-1 text-[11px] text-[#888888]">
                        <User className="size-3" aria-hidden="true" />
                        {item.actor}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-[#666666]">{item.timestamp}</p>
                    <TextPanel className="mt-3">{item.description}</TextPanel>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <EscalateToSuperAdminModal
        open={isEscalateOpen}
        refundId={detail.disputeId}
        requestedBy={detail.userName}
        amount={detail.amount}
        onClose={() => setIsEscalateOpen(false)}
        onSubmit={() => navigate(`/finance/refunds/${id}/escalate`)}
      />

      <ApproveRefundModal
        open={isApproveRefundOpen}
        data={{
          disputeId: detail.disputeId,
          transactionId: detail.transactionId,
          userName: detail.userName,
          userId: detail.userId,
          moduleType: detail.moduleType,
          paymentMethod: detail.paymentMode,
          refundAmount: detail.amount,
          supportRecommendation: detail.supportRecommendation,
          reason: detail.disputeReason,
          maxRefundableAmount: detail.maxRefundableAmount,
          platformRetainAmount: detail.platformRetainAmount,
        }}
        onClose={() => setIsApproveRefundOpen(false)}
      />
    </div>
  )
}
