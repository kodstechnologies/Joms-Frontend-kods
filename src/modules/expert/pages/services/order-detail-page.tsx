import { useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, FileText, Info, MessageSquare } from 'lucide-react'

import { Button } from '@/shared/components/ui/button'
import { navigateBackOrFallback } from '@/shared/lib/navigation'

import {
  useAdminChatVault,
  useAdminOrderDetail,
  useAdminServiceDetail,
} from '../../hooks/use-service-drilldown'
import { EngagementTimeline } from '../../components/service-drilldown/engagement-timeline'
import { PaymentDetailsModal } from '../../components/service-drilldown/payment-details-modal'
import { SectionCard, ShimmerBlock } from '../../components/service-drilldown/drilldown-primitives'
import { formatDateTime, titleCase } from '../../components/service-drilldown/drilldown-format'
import {
  DrilldownHeader,
  EngagementCard,
  FileVaultButton,
  MilestoneStatusCard,
  MonitorMessagesButton,
  OutlineActionButton,
  PairingRow,
} from '../../components/service-drilldown/engagement-chrome'
import { resolveEngagementTone } from '../../components/service-drilldown/engagement-tone'
import {
  serviceOrderFilesPath,
  serviceOrderMessagesPath,
  serviceOrderProposalPath,
  serviceOrderQuotationPath,
  servicePerformancePath,
} from '../../lib/service-navigation'

export function OrderDetailPage() {
  const {
    expertId = '',
    serviceId = '',
    orderId = '',
  } = useParams<{
    expertId: string
    serviceId: string
    orderId: string
  }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const typeParam = searchParams.get('type')
  const orderType: 'order' | 'proposal' = typeParam === 'proposal' ? 'proposal' : 'order'

  const [showPayment, setShowPayment] = useState(false)
  const [milestoneOffset, setMilestoneOffset] = useState(0)

  const { data, isLoading, error } = useAdminOrderDetail(orderId, orderType)
  const detail = data?.data
  const serviceQuery = useAdminServiceDetail(serviceId)
  const vaultQuery = useAdminChatVault(detail?.links.threadId ?? undefined)

  if (isLoading) {
    return (
      <div className="flex w-full flex-col gap-5 pb-8">
        <ShimmerBlock className="h-8 w-64" />
        <ShimmerBlock className="h-40 w-full" />
        <ShimmerBlock className="h-64 w-full" />
      </div>
    )
  }

  if (error || !detail) {
    return (
      <div className="flex h-96 w-full flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="bg-brand-danger/10 rounded-full p-3 text-red-500">
          <Info className="size-10" />
        </div>
        <h3 className="text-lg font-semibold text-white">Order Not Found</h3>
        <p className="text-muted max-w-md text-sm">This order could not be loaded.</p>
        <Button
          variant="ghost"
          className="text-brand-accent mt-4 gap-2"
          onClick={() => navigate(servicePerformancePath(expertId, serviceId))}
        >
          Back to Service Performance
        </Button>
      </div>
    )
  }

  const { engagement, links } = detail
  const isMilestoneProject = detail.engagementType === 'proposal' && detail.milestones.length > 0
  const expertName = detail.expert?.name || serviceQuery.data?.data.expert?.name || 'Expert'
  const serviceTitle = links.serviceTitle || engagement.title
  const vaultCount = vaultQuery.data?.data.total ?? 0
  const visibleMilestones = 3
  const maxMilestoneOffset = Math.max(0, detail.milestones.length - visibleMilestones)
  const milestoneSlice = detail.milestones.slice(
    milestoneOffset,
    milestoneOffset + visibleMilestones,
  )
  const workLabel =
    engagement.workStatusLabel ||
    (engagement.paymentStatus === 'paid' ? 'Completed' : 'Yet to start')
  const paymentLabel =
    engagement.paymentStatus === 'paid'
      ? 'Paid'
      : engagement.paymentStatus === 'partially_paid'
        ? 'Pending'
        : 'Not yet'

  return (
    <div className="relative flex w-full flex-col gap-8 pb-8 text-white">
      <PaymentDetailsModal
        open={showPayment}
        orderId={detail._id}
        orderType={detail.engagementType}
        fallbackService={{
          title: engagement.title,
          category: engagement.category,
          pricingType: engagement.pricingType,
          image: engagement.serviceImage,
        }}
        onClose={() => setShowPayment(false)}
      />

      <DrilldownHeader
        title={isMilestoneProject ? 'Clientele' : 'Expert Management'}
        onBack={() =>
          navigateBackOrFallback(
            navigate,
            isMilestoneProject
              ? servicePerformancePath(expertId, serviceId)
              : `/experts/management/profile/${expertId}`,
          )
        }
        subtitleBack={
          isMilestoneProject
            ? undefined
            : {
                label: serviceTitle,
                onClick: () => navigate(servicePerformancePath(expertId, serviceId)),
              }
        }
        crumbs={
          isMilestoneProject
            ? [
                { label: 'Expert Management', onClick: () => navigate('/experts/management') },
                {
                  label: expertName,
                  onClick: () => navigate(`/experts/management/profile/${expertId}`),
                },
                { label: serviceTitle },
              ]
            : undefined
        }
        actions={
          <>
            <FileVaultButton
              onClick={() =>
                navigate(
                  serviceOrderFilesPath(expertId, serviceId, detail._id, detail.engagementType),
                )
              }
              count={isMilestoneProject ? vaultCount : undefined}
            />
            <MonitorMessagesButton
              onClick={() =>
                navigate(
                  serviceOrderMessagesPath(expertId, serviceId, detail._id, detail.engagementType),
                )
              }
            />
            {links.quotationId ? (
              <OutlineActionButton
                onClick={() =>
                  navigate(
                    serviceOrderQuotationPath(
                      expertId,
                      serviceId,
                      detail._id,
                      links.quotationId as string,
                    ),
                  )
                }
              >
                <MessageSquare className="size-4" aria-hidden="true" />
                View Quotation
              </OutlineActionButton>
            ) : null}
            {links.proposalId ? (
              <OutlineActionButton
                onClick={() =>
                  navigate(
                    serviceOrderProposalPath(
                      expertId,
                      serviceId,
                      detail._id,
                      links.proposalId as string,
                    ),
                  )
                }
              >
                <FileText className="size-4" aria-hidden="true" />
                View Proposal
              </OutlineActionButton>
            ) : null}
          </>
        }
      />

      {isMilestoneProject ? (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white">{engagement.title}</h2>
              <div className="mt-4">
                <PairingRow
                  expertName={detail.expert?.name}
                  expertRole={detail.expert?.profession || detail.expert?.serviceType}
                  expertAvatar={detail.expert?.avatarUrl}
                  clientName={detail.client.name}
                  clientRole={detail.client.role || 'Client'}
                  clientAvatar={detail.client.avatarUrl}
                />
              </div>
            </div>
            {detail.milestones.length > visibleMilestones ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label="Previous milestones"
                  disabled={milestoneOffset === 0}
                  onClick={() => setMilestoneOffset((current) => Math.max(0, current - 1))}
                  className="grid size-8 place-items-center rounded-full border border-white/20 disabled:opacity-30"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <button
                  type="button"
                  aria-label="Next milestones"
                  disabled={milestoneOffset >= maxMilestoneOffset}
                  onClick={() =>
                    setMilestoneOffset((current) => Math.min(maxMilestoneOffset, current + 1))
                  }
                  className="grid size-8 place-items-center rounded-full border border-white/20 disabled:opacity-30"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {milestoneSlice.map((milestone) => (
              <MilestoneStatusCard
                key={milestone._id}
                milestone={milestone}
                currency={engagement.currency}
              />
            ))}
          </div>
        </div>
      ) : (
        <EngagementCard
          typeLabel={engagement.pricingLabel}
          title={engagement.title}
          description={engagement.description}
          timeline={engagement.timeline}
          allottedFund={engagement.allottedFund}
          currency={engagement.currency}
          paymentLabel={paymentLabel}
          workLabel={workLabel}
          tone={resolveEngagementTone(engagement.paymentStatus, engagement.workStatus)}
          onPaymentClick={() => setShowPayment(true)}
        />
      )}

      <EngagementTimeline steps={detail.timeline} />

      {detail.disputes.length > 0 ? (
        <SectionCard title="Disputes">
          <ul className="space-y-3">
            {detail.disputes.map((dispute) => (
              <li key={dispute._id} className="rounded-lg border border-white/5 bg-black p-4">
                <p className="text-sm font-semibold text-white">
                  {dispute.milestoneTitle || titleCase(dispute.scope)}
                </p>
                <p className="text-muted mt-1 text-[11px]">
                  Raised by {dispute.raisedBy?.name || titleCase(dispute.raisedBy?.userType)} ·{' '}
                  {formatDateTime(dispute.createdAt)}
                </p>
                <p className="mt-2 text-sm text-white">{dispute.reason}</p>
              </li>
            ))}
          </ul>
        </SectionCard>
      ) : null}
    </div>
  )
}
