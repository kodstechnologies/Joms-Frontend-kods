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

import { ApproveRefundModal } from '@/modules/payments/components/approve-refund-modal'
import { RejectRefundModal } from '@/modules/payments/components/reject-refund-modal'
import { RequestMoreInformationModal } from '@/modules/payments/components/request-more-information-modal'
import { getDisputeDetailById } from '@/modules/payments/mock/dispute-detail.mock'
import { cn } from '@/shared/lib/cn'
import { navigateBackOrFallback } from '@/shared/lib/navigation'

const cardClass = 'radius-lg border border-white/[0.06] bg-brand-surface p-4 sm:p-5'
const sectionTitleClass = 'text-body-md-semibold text-brand-text leading-[20px]'
const sectionSubtitleClass = 'text-body-sm text-muted mt-1'
const labelClass = 'text-body-sm text-muted'
const valueClass = 'text-body-sm text-brand-text'
const textPanelClass =
  'radius-lg border border-white/[0.06] bg-brand-bg p-4 text-body-sm text-brand-text/80'

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
        <span className="text-muted">{icon}</span>
        <p className={sectionTitleClass}>{title}</p>
      </div>
      {children}
    </div>
  )
}

function UnderReviewBadge() {
  return (
    <span className="text-body-sm-semibold border-brand-accent/40 bg-brand-accent/10 text-brand-accent inline-flex rounded-full border px-2.5 py-0.5">
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
    <div className="bg-brand-bg flex flex-col gap-5 pb-6">
      <header>
        <button
          type="button"
          onClick={() => navigateBackOrFallback(navigate, '/finance/refunds')}
          className="group text-h3 hover:text-brand-accent text-brand-text flex w-fit items-center gap-2 tracking-tight transition-colors"
        >
          <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-1" />
          <span>Payment Detail View</span>
        </button>
        <p className="text-body-sm text-muted mt-2 pl-7">
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
          <span className="text-body-sm-medium bg-brand-bg text-brand-text inline-flex w-fit items-center gap-2 rounded-full border border-white/15 px-3 py-1.5">
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
              <AssessmentBlock
                icon={<FileText className="size-4" />}
                title="Support Review Summary"
              >
                <TextPanel>{detail.supportReviewSummary}</TextPanel>
              </AssessmentBlock>

              <AssessmentBlock icon={<AlertCircle className="size-4" />} title="Escalation Reason">
                <TextPanel>{detail.escalationReason}</TextPanel>
              </AssessmentBlock>

              <AssessmentBlock
                icon={<Lightbulb className="size-4" />}
                title="Support's Recommendation"
              >
                <TextPanel>
                  <span className="text-body-sm-semibold text-brand-positive">
                    {detail.supportRecommendation}
                  </span>
                </TextPanel>
              </AssessmentBlock>

              <AssessmentBlock
                icon={<FileText className="size-4" />}
                title="Detailed Notes from Support"
              >
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
                      'radius-lg bg-brand-bg border p-4 text-left transition-colors',
                      selected ? 'border-white' : 'border-white/[0.06] hover:border-white/20',
                    )}
                  >
                    <FileText className="text-muted mb-3 size-8" aria-hidden="true" />
                    <p className="text-body-sm-medium text-brand-text truncate">{file.fileName}</p>
                    <p className="text-body-sm text-muted mt-2">
                      {file.fileSize} · {file.date}
                    </p>
                  </button>
                )
              })}
            </div>
          </Card>

          <Card>
            <div className="mb-4 flex items-center gap-2">
              <Gavel className="text-muted size-4" aria-hidden="true" />
              <h2 className="text-body-sm-semibold text-brand-text">Decision Controls</h2>
            </div>

            <div className="flex flex-col gap-[10px] sm:flex-row sm:flex-wrap">
              <button
                type="button"
                onClick={() => setIsApproveRefundOpen(true)}
                className="ui-cta ui-cta-positive w-[138px] shrink-0"
              >
                Resolve Dispute
                <Check
                  className="icon-sm shrink-0 text-white"
                  strokeWidth={2.5}
                  aria-hidden="true"
                />
              </button>
              <button
                type="button"
                onClick={() => setIsRejectRefundOpen(true)}
                className="ui-cta ui-cta-negative w-[131px] shrink-0"
              >
                Reject Dispute
                <X className="icon-sm shrink-0 text-white" strokeWidth={2.5} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => setIsRequestMoreInfoOpen(true)}
                className="ui-cta ui-cta-secondary shrink-0"
              >
                Request More Info
                <Flag
                  fill="#FFFFFF"
                  stroke="#FFFFFF"
                  className="icon-sm shrink-0"
                  strokeWidth={2}
                  aria-hidden="true"
                />
              </button>
              <button
                type="button"
                onClick={() => navigate(`/finance/refunds/${id}/escalate`)}
                className="ui-cta ui-cta-secondary shrink-0"
              >
                Escalate
                <Flag
                  fill="#FFFFFF"
                  stroke="#FFFFFF"
                  className="icon-sm shrink-0"
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
                    <div className="text-body-sm-semibold bg-brand-surface text-brand-text grid size-8 shrink-0 place-items-center rounded-full border border-white/15">
                      {item.step}
                    </div>
                    {index < detail.timeline.length - 1 ? (
                      <div className="my-1 w-px flex-1 bg-white/10" />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1 pb-6">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-body-md-semibold text-brand-text">{item.title}</p>
                      <span className="text-body-sm text-muted inline-flex items-center gap-1">
                        <User className="size-3" aria-hidden="true" />
                        {item.actor}
                      </span>
                    </div>
                    <p className="text-body-sm text-muted mt-1">{item.timestamp}</p>
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
