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

import { ApproveRefundModal } from '@/modules/payments/components/approve-refund-modal'
import { RejectRefundModal } from '@/modules/payments/components/reject-refund-modal'
import { RequestMoreInformationModal } from '@/modules/payments/components/request-more-information-modal'
import { getDisputeDetailById } from '@/modules/payments/mock/dispute-detail.mock'
import { cn } from '@/shared/lib/cn'

const cardClass = 'rounded-[10px] border border-white/[0.06] bg-[#141414] p-4 sm:p-5'
const sectionTitleClass = 'font-figtree text-[14px] font-semibold leading-[20px] text-white'
const sectionSubtitleClass = 'mt-1 font-figtree text-[12px] font-normal leading-[20px] text-[#888888]'
const labelClass = 'font-figtree text-[12px] font-normal leading-[20px] text-[#888888]'
const valueClass = 'font-figtree text-[12px] font-normal leading-[20px] text-white'
const textPanelClass =
  'rounded-[10px] border border-white/[0.06] bg-[#0F0F0F] p-4 font-figtree text-[12px] font-normal leading-[20px] text-[#CCCCCC]'

const resolveDisputeButtonClass =
  'inline-flex h-10 w-[138px] shrink-0 items-center justify-center gap-[10px] rounded-[10px] bg-[#00A63E] p-[10px] font-figtree text-[12px] font-semibold leading-[20px] tracking-normal text-white transition-colors hover:bg-[#009636]'

const rejectDisputeButtonClass =
  'inline-flex h-10 w-[131px] shrink-0 items-center justify-center gap-[10px] rounded-[10px] bg-[#D3191C] p-[10px] font-figtree text-[12px] font-semibold leading-[20px] tracking-normal text-white transition-colors hover:bg-[#B81417]'

const secondaryDecisionButtonClass =
  'inline-flex h-10 shrink-0 items-center justify-center gap-[10px] rounded-[10px] border border-white/20 bg-transparent p-[10px] font-figtree text-[12px] font-semibold leading-[20px] tracking-normal text-white transition-colors hover:bg-white/5'

function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <section className={cn(cardClass, className)}>{children}</section>
}

function InfoItem({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="min-w-[130px] shrink-0 space-y-1.5 sm:min-w-0 sm:shrink">
      <p className={labelClass}>{label}</p>
      <div className={valueClass}>{value}</div>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/5 py-3 last:border-b-0">
      <span className={labelClass}>{label}</span>
      <span className={cn(valueClass, 'text-right')}>{value}</span>
    </div>
  )
}

function TextPanel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn(textPanelClass, className)}>{children}</div>
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
        <p className={sectionTitleClass}>{title}</p>
      </div>
      {children}
    </div>
  )
}

function UnderReviewBadge() {
  return (
    <span className="inline-flex rounded-full border border-[#FFC16B]/40 bg-[#FFC16B]/10 px-2.5 py-0.5 font-figtree text-[11px] font-semibold leading-[20px] text-[#FFC16B]">
      Under Review
    </span>
  )
}

export function DisputeDetailViewPage() {
  const navigate = useNavigate()
  const { id = 'refund-02' } = useParams<{ id: string }>()
  const detail = getDisputeDetailById(id)
  const [selectedEvidenceId, setSelectedEvidenceId] = useState(detail.evidenceFiles[0]?.id ?? '')
  const [isApproveRefundOpen, setIsApproveRefundOpen] = useState(false)
  const [isRejectRefundOpen, setIsRejectRefundOpen] = useState(false)
  const [isRequestMoreInfoOpen, setIsRequestMoreInfoOpen] = useState(false)

  return (
    <div className="flex flex-col gap-5 bg-black pb-6">
      <header>
        <button
          type="button"
          onClick={() => navigate('/finance/refunds')}
          className="group flex w-fit items-center gap-2 text-[20px] font-bold tracking-tight text-white transition-colors hover:text-[#FBC078]"
        >
          <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-1" />
          <span>Payment Detail View</span>
        </button>
        <p className="mt-2 pl-7 font-figtree text-[12px] font-normal leading-[20px] text-[#777777]">
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
            <h1 className={sectionTitleClass}>Dispute Details</h1>
            <p className={sectionSubtitleClass}>
              Complete information related to the reported refund dispute.
            </p>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-[#0F0F0F] px-3 py-1.5 font-figtree text-[11px] font-medium leading-[20px] text-white">
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
              <h2 className={sectionTitleClass}>Support Team Assessment</h2>
              <p className={sectionSubtitleClass}>
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
                  <span className="font-figtree text-[12px] font-semibold leading-[20px] text-[#00A63E]">
                    {detail.supportRecommendation}
                  </span>
                </TextPanel>
              </AssessmentBlock>

              <AssessmentBlock icon={<FileText className="size-4" />} title="Detailed Notes from Support">
                <TextPanel>{detail.detailedNotes}</TextPanel>
              </AssessmentBlock>
            </div>
          </Card>

          <Card>
            <div className="mb-5">
              <h2 className={sectionTitleClass}>Client Evidence</h2>
              <p className={sectionSubtitleClass}>
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
                      'rounded-[10px] border bg-[#0F0F0F] p-4 text-left transition-colors',
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
              <h2 className="font-figtree text-[12px] font-semibold leading-[20px] text-white">
                Decision Controls
              </h2>
            </div>

            <div className="flex flex-col gap-[10px] sm:flex-row sm:flex-wrap">
              <button
                type="button"
                onClick={() => setIsApproveRefundOpen(true)}
                className={resolveDisputeButtonClass}
              >
                Resolve Dispute
                <Check
                  className="size-[16.67px] shrink-0 text-white"
                  strokeWidth={2.5}
                  aria-hidden="true"
                />
              </button>
              <button
                type="button"
                onClick={() => setIsRejectRefundOpen(true)}
                className={rejectDisputeButtonClass}
              >
                Reject Dispute
                <X
                  className="h-[16.708px] w-[16.667px] shrink-0 text-white"
                  strokeWidth={2.5}
                  aria-hidden="true"
                />
              </button>
              <button
                type="button"
                onClick={() => setIsRequestMoreInfoOpen(true)}
                className={secondaryDecisionButtonClass}
              >
                Request More Info
                <Flag
                  fill="#FFFFFF"
                  stroke="#FFFFFF"
                  className="h-[16.25px] w-[14.583px] shrink-0"
                  strokeWidth={2}
                  aria-hidden="true"
                />
              </button>
              <button
                type="button"
                onClick={() => navigate(`/finance/refunds/${id}/escalate`)}
                className={secondaryDecisionButtonClass}
              >
                Escalate
                <Flag
                  fill="#FFFFFF"
                  stroke="#FFFFFF"
                  className="h-[16.25px] w-[14.583px] shrink-0"
                  strokeWidth={2}
                  aria-hidden="true"
                />
              </button>
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-5">
          <Card>
            <h2 className={cn(sectionTitleClass, 'mb-4')}>User Information</h2>
            <DetailRow label="User ID" value={detail.userId} />
            <DetailRow label="Name" value={detail.userName} />
            <DetailRow label="Email" value={detail.userEmail} />
          </Card>

          <Card>
            <h2 className={cn(sectionTitleClass, 'mb-4')}>Dispute Summary</h2>
            <DetailRow label="Related Entity ID" value={detail.relatedEntityId} />
            <DetailRow label="Dispute Reason" value={detail.disputeReason} />
            <DetailRow label="Assigned To" value={detail.assignedTo} />
            <DetailRow label="Amount" value={detail.amount} />
            <div className="mt-4 space-y-2">
              <p className={labelClass}>User Message</p>
              <TextPanel>{detail.userMessage}</TextPanel>
            </div>
          </Card>

          <Card>
            <h2 className={cn(sectionTitleClass, 'mb-5')}>Activity Timeline</h2>
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

      <RejectRefundModal
        open={isRejectRefundOpen}
        data={{
          disputeId: detail.disputeId,
          transactionId: detail.transactionId,
          userName: detail.userName,
          userId: detail.userId,
          moduleType: detail.moduleType,
          paymentMethod: detail.paymentMode,
          refundAmount: detail.listedRefundAmount,
          supportRecommendation: detail.supportRecommendation,
          reason: detail.disputeReason,
          userStatement: detail.userMessage,
          denyAmount: detail.amount,
          denyFromName: detail.userName,
        }}
        onClose={() => setIsRejectRefundOpen(false)}
      />

      <RequestMoreInformationModal
        open={isRequestMoreInfoOpen}
        data={{
          denyAmount: detail.amount,
          denyFromName: detail.userName,
          userName: detail.userName,
          reason: detail.requestInfoReason,
          evidenceCount: detail.submittedEvidenceCount,
        }}
        onClose={() => setIsRequestMoreInfoOpen(false)}
      />
    </div>
  )
}
