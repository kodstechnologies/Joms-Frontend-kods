import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Info } from 'lucide-react'

import { Button } from '@/shared/components/ui/button'
import { navigateBackOrFallback } from '@/shared/lib/navigation'

import { useAdminProposal } from '../../hooks/use-service-drilldown'
import {
  DetailChip,
  EmptyState,
  ShimmerBlock,
} from '../../components/service-drilldown/drilldown-primitives'
import {
  DASH,
  formatCurrency,
  formatOrdinalDate,
} from '../../components/service-drilldown/drilldown-format'
import { DrilldownHeader } from '../../components/service-drilldown/engagement-chrome'
import { serviceOrderDetailPath, servicePerformancePath } from '../../lib/service-navigation'

function ProposalTextCard({ children }: { children: string }) {
  return (
    <div className="rounded-xl bg-[#1A1A1A] p-4 text-sm leading-relaxed whitespace-pre-line text-white/85">
      {children}
    </div>
  )
}

export function ProposalViewPage() {
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
  const proposalId = searchParams.get('proposalId') ?? orderId
  const { data, isLoading, error } = useAdminProposal(proposalId || undefined)
  const proposal = data?.data

  const backToOrder = () =>
    navigateBackOrFallback(
      navigate,
      serviceOrderDetailPath(expertId, serviceId, orderId, 'proposal'),
    )

  if (isLoading) {
    return (
      <div className="flex w-full flex-col gap-5 pb-8">
        <ShimmerBlock className="h-8 w-64" />
        <ShimmerBlock className="h-48 w-full" />
      </div>
    )
  }

  if (error || !proposal) {
    return (
      <div className="flex h-96 w-full flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="bg-brand-danger/10 rounded-full p-3 text-red-500">
          <Info className="size-10" />
        </div>
        <h3 className="text-lg font-semibold text-white">Proposal Not Found</h3>
        <Button variant="ghost" className="text-brand-accent mt-4 gap-2" onClick={backToOrder}>
          <ArrowLeft className="size-4" /> Back to order
        </Button>
      </div>
    )
  }

  const isMilestone = proposal.paymentType === 'milestone'

  return (
    <div className="flex w-full flex-col gap-6 pb-8 text-white">
      <DrilldownHeader
        title="Expert Management"
        onBack={() => navigateBackOrFallback(navigate, `/experts/management/profile/${expertId}`)}
        crumbs={[
          { label: 'Expert Management', onClick: () => navigate('/experts/management') },
          {
            label: 'Service Performance',
            onClick: () => navigate(servicePerformancePath(expertId, serviceId)),
          },
          { label: 'Client Management' },
          {
            label: 'Service',
            onClick: () =>
              navigate(serviceOrderDetailPath(expertId, serviceId, orderId, 'proposal')),
          },
          { label: 'Request Quote View' },
        ]}
      />

      <div className="flex items-start gap-3">
        <span className="bg-brand-accent mt-1 h-10 w-1 rounded-full" />
        <div>
          <h2 className="text-2xl font-bold text-white">{proposal.title}</h2>
          {proposal.category ? <p className="text-muted mt-1">{proposal.category}</p> : null}
        </div>
      </div>

      <h3 className="text-sm font-semibold text-white">Requirements</h3>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <div className="flex flex-col gap-5">
          <section>
            <h3 className="mb-3 text-sm font-semibold text-white">Deliverables</h3>
            <div className="rounded-xl bg-[#1A1A1A] p-4">
              <p className="text-sm leading-relaxed whitespace-pre-line text-white/85">
                {proposal.deliverables}
              </p>
              {proposal.benefits.length > 0 ? (
                <div className="mt-4">
                  <p className="mb-2 text-sm font-semibold text-white">Benefits</p>
                  <ul className="list-disc space-y-1 pl-5 text-sm text-white/80">
                    {proposal.benefits.map((benefit) => (
                      <li key={benefit}>{benefit}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </section>

          {isMilestone ? (
            <div className="flex flex-col gap-4">
              {proposal.milestones.length === 0 ? (
                <EmptyState message="No milestones defined on this proposal." />
              ) : (
                proposal.milestones.map((milestone) => (
                  <article key={milestone._id} className="rounded-xl bg-[#1A1A1A] p-4">
                    <h4 className="font-semibold text-white">{milestone.title}</h4>
                    {milestone.goal ? (
                      <p className="text-muted mt-2 text-sm leading-relaxed">
                        Goal: {milestone.goal}
                      </p>
                    ) : null}
                    <div className="mt-4 flex flex-wrap gap-8 text-sm">
                      <div>
                        <p className="text-muted text-[11px]">Timelines</p>
                        <p className="font-semibold text-white">{milestone.timeline || DASH}</p>
                      </div>
                      <div>
                        <p className="text-muted text-[11px]">Advance Amount</p>
                        <p className="font-semibold text-white">
                          {milestone.advanceAmount === null
                            ? formatCurrency(milestone.price, proposal.currency, 2)
                            : formatCurrency(milestone.advanceAmount, proposal.currency, 2)}
                        </p>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          ) : (
            <section>
              <h3 className="mb-3 text-sm font-semibold text-white">Next steps</h3>
              <ProposalTextCard>{proposal.nextSteps || 'No next steps recorded.'}</ProposalTextCard>
            </section>
          )}
        </div>

        <div className="flex flex-col gap-5">
          <section>
            <h3 className="mb-3 text-sm font-semibold text-white">Exclusions</h3>
            <ProposalTextCard>{proposal.exclusions || 'Nothing excluded.'}</ProposalTextCard>
          </section>

          {isMilestone ? (
            <section>
              <h3 className="mb-3 text-sm font-semibold text-white">Next steps</h3>
              <ProposalTextCard>{proposal.nextSteps || 'No next steps recorded.'}</ProposalTextCard>
            </section>
          ) : null}

          <section>
            <h3 className="mb-3 text-sm font-semibold text-white">Price & Duration</h3>
            <div className="grid grid-cols-2 gap-4">
              <DetailChip
                value={formatCurrency(proposal.payableAmount, proposal.currency, 2)}
                label="Pricing"
              />
              <DetailChip
                value={proposal.discountPercent ? `${proposal.discountPercent}% Off` : 'None'}
                label="Discounts"
              />
              <DetailChip value={proposal.timeline || DASH} label="Timelines" />
              <DetailChip value={formatOrdinalDate(proposal.validTill)} label="Proposal Validity" />
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
