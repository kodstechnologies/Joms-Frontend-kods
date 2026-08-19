import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Info } from 'lucide-react'

import { Button } from '@/shared/components/ui/button'
import { navigateBackOrFallback } from '@/shared/lib/navigation'

import { useAdminQuotation, useAdminServiceDetail } from '../../hooks/use-service-drilldown'
import { ShimmerBlock } from '../../components/service-drilldown/drilldown-primitives'
import { DASH, formatCurrency } from '../../components/service-drilldown/drilldown-format'
import {
  DrilldownHeader,
  InfoPill,
  PersonAvatar,
} from '../../components/service-drilldown/engagement-chrome'
import { serviceOrderDetailPath, servicePerformancePath } from '../../lib/service-navigation'

export function QuotationViewPage() {
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
  const quotationId = searchParams.get('quotationId') ?? ''
  const { data, isLoading, error } = useAdminQuotation(quotationId || undefined)
  const quotation = data?.data
  const serviceQuery = useAdminServiceDetail(serviceId)
  const expertName = quotation?.expert?.name || serviceQuery.data?.data.expert?.name || 'Expert'

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

  if (error || !quotation) {
    return (
      <div className="flex h-96 w-full flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="bg-brand-danger/10 rounded-full p-3 text-red-500">
          <Info className="size-10" />
        </div>
        <h3 className="text-lg font-semibold text-white">Quotation Not Found</h3>
        <Button variant="ghost" className="text-brand-accent mt-4 gap-2" onClick={backToOrder}>
          <ArrowLeft className="size-4" /> Back to order
        </Button>
      </div>
    )
  }

  const budget = `${formatCurrency(quotation.budget.min, quotation.budget.currency)} - ${formatCurrency(
    quotation.budget.max,
    quotation.budget.currency,
  )}`

  return (
    <div className="flex w-full flex-col gap-8 pb-8 text-white">
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
          <h2 className="text-2xl font-bold text-white">{quotation.title}</h2>
          <p className="text-muted mt-1">{quotation.category}</p>
        </div>
      </div>

      <section>
        <h3 className="mb-3 text-sm font-semibold text-white">Requirements</h3>
        <p className="max-w-4xl text-sm leading-relaxed whitespace-pre-line text-white/80">
          {quotation.requirements}
        </p>
      </section>

      <div className="flex flex-wrap gap-10">
        <div>
          <p className="mb-2 text-sm text-white">Duration</p>
          <InfoPill value={quotation.duration || DASH} />
        </div>
        <div>
          <p className="mb-2 text-sm text-white">Budget range</p>
          <InfoPill value={budget} />
        </div>
      </div>

      <div className="border-t border-white/10 pt-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div>
            <p className="text-muted mb-3 text-[12px]">Quote request from</p>
            <div className="flex items-center gap-3">
              <PersonAvatar name={quotation.requester.name} src={quotation.requester.avatarUrl} />
              <div>
                <p className="font-semibold text-white">{quotation.requester.name || DASH}</p>
                <p className="text-muted text-[12px]">{quotation.requester.role || 'Client'}</p>
              </div>
            </div>
          </div>

          <div>
            <p className="text-muted mb-3 text-[12px]">Expert Details</p>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-3">
                <PersonAvatar name={quotation.expert?.name} src={quotation.expert?.avatarUrl} />
                <div>
                  <p className="font-semibold text-white">{quotation.expert?.name || expertName}</p>
                  <p className="text-muted text-[12px]">
                    {quotation.expert?.profession || quotation.expert?.serviceType || DASH}
                  </p>
                </div>
              </div>
              {quotation.expert?._id ? (
                <Button
                  variant="outline"
                  className="h-8 rounded-full px-4 text-[12px]"
                  onClick={() => navigate(`/experts/management/profile/${quotation.expert?._id}`)}
                >
                  View Profile
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
