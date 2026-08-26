import { useMemo, useState, type ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import {
  ArrowLeft,
  Ban,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Info,
  Play,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/shared/components/ui/button'
import { DecisionActionModal } from '@/shared/components/modal/decision-action-modal'
import { cn } from '@/shared/lib/cn'
import { navigateBackOrFallback } from '@/shared/lib/navigation'
import { MODERATION_CATEGORY_SLUGS } from '@/modules/settings/api/templates-api'
import {
  useModerationReasonOptions,
  useRecordModerationReasonUsage,
} from '@/modules/settings/hooks/use-templates'

import {
  useAdminServiceDetail,
  useFlagServiceForReview,
  usePauseServiceListing,
  useRequestServiceChanges,
  useServiceSupportTickets,
  useUnflagService,
  useUnpauseServiceListing,
} from '../../hooks/use-service-drilldown'
import { useSuspendService } from '../../hooks/use-services'
import { VersionHistoryDrawer } from '../../components/service-drilldown/version-history-drawer'
import {
  DetailChip,
  EmptyState,
  ShimmerBlock,
} from '../../components/service-drilldown/drilldown-primitives'
import {
  DASH,
  displayServiceTitle,
  formatCurrency,
  formatDate,
  formatRelativeTime,
  formatServiceTypeLabel,
  titleCase,
} from '../../components/service-drilldown/drilldown-format'
import { servicePerformancePath } from '../../lib/service-navigation'

type DetailAction = 'pause' | 'requestChanges' | 'flag' | 'suspend' | null

const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || fallback
  }
  return fallback
}

const parseTierDescription = (description = '') => {
  const [summary, ...features] = description
    .split('+')
    .map((part) => part.trim())
    .filter(Boolean)
  return { summary, features }
}

function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/5 py-3 last:border-b-0">
      <span className="text-body-sm text-muted">{label}</span>
      <span className="text-body-sm-medium text-right text-white">{value}</span>
    </div>
  )
}

export const ServiceDetailPage = () => {
  const { expertId = '', serviceId = '' } = useParams<{ expertId: string; serviceId: string }>()
  const navigate = useNavigate()

  const { data, isLoading, error } = useAdminServiceDetail(serviceId)
  const service = data?.data

  const { data: ticketsResponse, isLoading: isTicketsLoading } = useServiceSupportTickets(
    serviceId,
    expertId,
  )
  const tickets = ticketsResponse?.data ?? []

  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [activeTierIndex, setActiveTierIndex] = useState(0)
  const [showVersionHistory, setShowVersionHistory] = useState(false)
  const [activeAction, setActiveAction] = useState<DetailAction>(null)
  const [adminNotes, setAdminNotes] = useState('')
  const [reasonText, setReasonText] = useState('')
  const [selectedReasons, setSelectedReasons] = useState<string[]>([])
  const [suspendIndefinitely, setSuspendIndefinitely] = useState(false)
  const [suspendStartDate, setSuspendStartDate] = useState('')
  const [suspendEndDate, setSuspendEndDate] = useState('')

  const recordReasonUsage = useRecordModerationReasonUsage()
  const { options: pauseReasonOptions, buildPayload: buildPauseReasonPayload } =
    useModerationReasonOptions(MODERATION_CATEGORY_SLUGS.pauseService)
  const { options: requestChangesOptions, buildPayload: buildRequestChangesPayload } =
    useModerationReasonOptions(MODERATION_CATEGORY_SLUGS.requestChangesService)
  const { options: suspendReasonOptions, buildPayload: buildSuspendReasonPayload } =
    useModerationReasonOptions(MODERATION_CATEGORY_SLUGS.suspendService)

  const pauseMutation = usePauseServiceListing()
  const unpauseMutation = useUnpauseServiceListing()
  const requestChangesMutation = useRequestServiceChanges()
  const flagMutation = useFlagServiceForReview()
  const unflagMutation = useUnflagService()
  const suspendMutation = useSuspendService()

  const images = service?.images ?? []
  const imageCount = images.length
  const activeImage =
    imageCount > 0 ? images[Math.min(activeImageIndex, imageCount - 1)] : undefined

  const tierDetails = useMemo(() => {
    const tiers = service?.pricing?.tiers ?? []
    if (tiers.length === 0) return null
    const tier = tiers[Math.min(activeTierIndex, tiers.length - 1)]
    const parsed = parseTierDescription(tier.description)
    return { ...tier, summary: parsed.summary, features: parsed.features }
  }, [activeTierIndex, service?.pricing?.tiers])

  const closeModal = () => {
    setActiveAction(null)
    setAdminNotes('')
    setReasonText('')
    setSelectedReasons([])
    setSuspendIndefinitely(false)
    setSuspendStartDate('')
    setSuspendEndDate('')
  }

  const openModal = (action: Exclude<DetailAction, null>) => {
    closeModal()
    setActiveAction(action)
  }

  const toggleReason = (value: string) =>
    setSelectedReasons((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
    )

  const handleBack = () =>
    navigateBackOrFallback(navigate, `/experts/management/profile/${expertId}`)

  const handleUnpause = async () => {
    try {
      await unpauseMutation.mutateAsync({ serviceId, payload: undefined as never })
      toast.success('Service resumed')
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to resume the service.'))
    }
  }

  const handleUnflag = async () => {
    try {
      await unflagMutation.mutateAsync({ serviceId, payload: undefined as never })
      toast.success('Flag removed')
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to remove the flag.'))
    }
  }

  const submitAction = async () => {
    if (!activeAction) return

    if (activeAction === 'pause') {
      if (selectedReasons.length === 0) {
        toast.error('Please select at least one reason.')
        return
      }
      if (!adminNotes.trim()) {
        toast.error('Admin notes are required.')
        return
      }

      const payload = buildPauseReasonPayload(selectedReasons)
      try {
        await pauseMutation.mutateAsync({
          serviceId,
          payload: {
            selectedReasons: payload.selectedReasons,
            reasonDetails: [payload.reasonDetails, reasonText.trim()].filter(Boolean).join('\n\n'),
            adminNotes: adminNotes.trim(),
          },
        })
        if (payload.reasonIds.length > 0) recordReasonUsage.mutate(payload.reasonIds)
        toast.success('Service paused')
        closeModal()
      } catch (err) {
        toast.error(getApiErrorMessage(err, 'Failed to pause the service.'))
      }
      return
    }

    if (activeAction === 'requestChanges') {
      if (selectedReasons.length === 0) {
        toast.error('Please select at least one reason.')
        return
      }
      if (!adminNotes.trim()) {
        toast.error('Admin notes are required.')
        return
      }

      const payload = buildRequestChangesPayload(selectedReasons)
      try {
        await requestChangesMutation.mutateAsync({
          serviceId,
          payload: {
            note: adminNotes.trim(),
            selectedReasons: payload.selectedReasons,
          },
        })
        if (payload.reasonIds.length > 0) recordReasonUsage.mutate(payload.reasonIds)
        toast.success('Changes requested from the expert')
        closeModal()
      } catch (err) {
        toast.error(getApiErrorMessage(err, 'Failed to request changes.'))
      }
      return
    }

    if (activeAction === 'flag') {
      if (!reasonText.trim()) {
        toast.error('A reason is required to flag this service.')
        return
      }
      try {
        await flagMutation.mutateAsync({
          serviceId,
          payload: { reason: reasonText.trim(), adminNotes: adminNotes.trim() },
        })
        toast.success('Service flagged for review')
        closeModal()
      } catch (err) {
        toast.error(getApiErrorMessage(err, 'Failed to flag the service.'))
      }
      return
    }

    if (activeAction === 'suspend') {
      if (selectedReasons.length === 0) {
        toast.error('Please select at least one reason.')
        return
      }
      if (!suspendIndefinitely && (!suspendStartDate || !suspendEndDate)) {
        toast.error('Please provide a suspension timeline or choose to suspend indefinitely.')
        return
      }
      if (!adminNotes.trim()) {
        toast.error('Admin notes are required.')
        return
      }

      const payload = buildSuspendReasonPayload(selectedReasons)
      const toIso = (value: string) =>
        value ? new Date(`${value}T00:00:00.000Z`).toISOString() : undefined

      try {
        await suspendMutation.mutateAsync({
          id: serviceId,
          payload: {
            selectedReasons: payload.selectedReasons,
            suspendIndefinitely,
            startDate: suspendIndefinitely ? undefined : toIso(suspendStartDate),
            endDate: suspendIndefinitely ? undefined : toIso(suspendEndDate),
            reasonDetails: [payload.reasonDetails, reasonText.trim()].filter(Boolean).join('\n\n'),
            adminNotes: adminNotes.trim(),
          },
        })
        if (payload.reasonIds.length > 0) recordReasonUsage.mutate(payload.reasonIds)
        toast.success('Service suspended')
        closeModal()
      } catch (err) {
        toast.error(getApiErrorMessage(err, 'Failed to suspend the service.'))
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex w-full flex-col gap-6 pb-8">
        <ShimmerBlock className="h-10 w-full" />
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
          <div className="flex flex-col gap-5">
            <ShimmerBlock className="h-72 w-full" />
            <ShimmerBlock className="h-48 w-full" />
          </div>
          <ShimmerBlock className="h-[420px] w-full" />
        </div>
      </div>
    )
  }

  if (error || !service) {
    return (
      <div className="flex h-96 w-full flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="bg-brand-danger/10 rounded-full p-3 text-red-500">
          <Info className="size-10" />
        </div>
        <h3 className="text-lg font-semibold text-white">Service Not Found</h3>
        <p className="text-muted max-w-md text-sm">
          {getApiErrorMessage(error, 'This service could not be loaded.')}
        </p>
        <Button variant="ghost" className="text-brand-accent mt-4 gap-2" onClick={handleBack}>
          <ArrowLeft className="size-4" /> Go back
        </Button>
      </div>
    )
  }

  const pricing = service.pricing
  const expertName = service.expert?.name || 'Expert'

  const modalConfig =
    activeAction === 'pause'
      ? {
          variant: 'pause' as const,
          title: 'Pause Service',
          description:
            'Are you sure you want to pause this service? It will be hidden from users until resumed.',
          submitLabel: 'Pause Service',
          reasonOptions: pauseReasonOptions,
          reasonLabel: 'Additional details',
          reasonRequired: false,
        }
      : activeAction === 'requestChanges'
        ? {
            variant: 'requestChanges' as const,
            title: 'Request Changes – Service Listing',
            description:
              'Are you sure you want to request changes? The expert will be notified and the listing returns to draft.',
            submitLabel: 'Request Changes',
            reasonOptions: requestChangesOptions,
            reasonLabel: 'Request Changes',
            reasonRequired: false,
          }
        : activeAction === 'flag'
          ? {
              variant: 'warn' as const,
              title: 'Flag for Review',
              description:
                'Flagging keeps the listing live but marks it for internal moderation follow-up.',
              submitLabel: 'Flag Service',
              reasonOptions: [],
              reasonLabel: 'Reason',
              reasonRequired: true,
            }
          : activeAction === 'suspend'
            ? {
                variant: 'suspend' as const,
                title: 'Suspend Service',
                description:
                  'Are you sure you want to suspend this service? It will be removed from the marketplace.',
                submitLabel: 'Suspend Service',
                reasonOptions: suspendReasonOptions,
                reasonLabel: 'Additional details',
                reasonRequired: false,
              }
            : null

  const expertRole = service.expert?.serviceType ? titleCase(service.expert.serviceType) : 'Expert'
  const money = (value?: number | null) => formatCurrency(value, pricing.currency, 2)
  const headerActionClass =
    'h-10 shrink-0 gap-1.5 rounded-lg border-white px-3.5 text-[13px] font-medium'

  const ticketStatusClass = (status?: string) => {
    const normalized = String(status || '')
      .toLowerCase()
      .replace(/[_-]+/g, ' ')
    if (normalized.includes('progress') || normalized === 'open' || normalized === 'pending') {
      return 'bg-[#E0A263] text-black'
    }
    if (normalized.includes('resolv') || normalized.includes('close')) {
      return 'bg-[#6B4A3A] text-white'
    }
    return 'bg-white/15 text-white'
  }

  return (
    <div className="relative flex w-full flex-col gap-6 pb-8 text-white">
      <VersionHistoryDrawer
        open={showVersionHistory}
        serviceId={serviceId}
        onClose={() => setShowVersionHistory(false)}
      />

      {modalConfig ? (
        <DecisionActionModal
          open
          variant={modalConfig.variant}
          title={modalConfig.title}
          description={modalConfig.description}
          submitLabel={modalConfig.submitLabel}
          adminNotes={adminNotes}
          onAdminNotesChange={setAdminNotes}
          reason={reasonText}
          onReasonChange={setReasonText}
          reasonLabel={modalConfig.reasonLabel}
          reasonRequired={modalConfig.reasonRequired}
          reasonOptions={modalConfig.reasonOptions}
          selectedReasons={selectedReasons}
          onReasonToggle={toggleReason}
          showTimeline={activeAction === 'suspend'}
          startDate={suspendStartDate}
          onStartDateChange={setSuspendStartDate}
          endDate={suspendEndDate}
          onEndDateChange={setSuspendEndDate}
          indefinite={suspendIndefinitely}
          onIndefiniteChange={setSuspendIndefinitely}
          onClose={closeModal}
          onSubmit={submitAction}
          isSubmitting={
            pauseMutation.isPending ||
            requestChangesMutation.isPending ||
            flagMutation.isPending ||
            suspendMutation.isPending
          }
        />
      ) : null}

      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <button
            type="button"
            onClick={handleBack}
            className="group font-heading hover:text-brand-accent text-h3 flex w-fit items-center gap-2 font-bold tracking-tight text-white transition-colors"
          >
            <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-1" />
            <span>Service Details</span>
          </button>

          <div className="text-body-sm text-muted mt-1 flex items-center gap-1.5 pl-7 font-medium">
            <button
              type="button"
              onClick={() => navigate('/experts/management')}
              className="hover:text-brand-text transition-colors"
            >
              All Experts
            </button>
            <span>/</span>
            <button
              type="button"
              onClick={() => navigate(`/experts/management/profile/${expertId}`)}
              className="hover:text-brand-text transition-colors"
            >
              {expertName}
            </button>
            <span>/</span>
            <span className="font-bold text-white">Service Details</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
          <Button
            variant="outline"
            className={headerActionClass}
            onClick={() => setShowVersionHistory(true)}
          >
            <Ban className="size-3.5" aria-hidden="true" />
            Version History
          </Button>
          <Button
            variant="outline"
            className={headerActionClass}
            onClick={() => (service.isPaused ? handleUnpause() : openModal('pause'))}
            disabled={pauseMutation.isPending || unpauseMutation.isPending}
          >
            {service.isPaused ? (
              <Play className="size-3.5" aria-hidden="true" />
            ) : (
              <Ban className="size-3.5" aria-hidden="true" />
            )}
            {service.isPaused ? 'Resume Service' : 'Pause Service'}
          </Button>
          <Button
            variant="outline"
            className={headerActionClass}
            onClick={() => openModal('requestChanges')}
          >
            <Ban className="size-3.5" aria-hidden="true" />
            Request Changes
          </Button>
          <Button
            variant="outline"
            className={headerActionClass}
            onClick={() => (service.isFlagged ? handleUnflag() : openModal('flag'))}
            disabled={flagMutation.isPending || unflagMutation.isPending}
          >
            <Ban className="size-3.5" aria-hidden="true" />
            {service.isFlagged ? 'Remove Flag' : 'Flag for Review'}
          </Button>
          <Button
            variant="outline"
            className={headerActionClass}
            onClick={() => openModal('suspend')}
            disabled={service.isSuspend}
          >
            <Ban className="size-3.5" aria-hidden="true" />
            Suspend Service
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-5">
          <div className="relative h-[320px] w-full overflow-hidden rounded-xl bg-black">
            {activeImage ? (
              <img src={activeImage} alt={service.title} className="h-full w-full object-cover" />
            ) : (
              <div className="text-muted flex h-full flex-col items-center justify-center gap-2">
                <ImageIcon className="size-8" aria-hidden="true" />
                <span className="text-[10px]">No images uploaded</span>
              </div>
            )}

            {imageCount > 1 ? (
              <>
                <button
                  type="button"
                  aria-label="Previous image"
                  onClick={() =>
                    setActiveImageIndex((prev) => (prev === 0 ? imageCount - 1 : prev - 1))
                  }
                  className="absolute top-1/2 left-3 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/75 text-white"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <button
                  type="button"
                  aria-label="Next image"
                  onClick={() =>
                    setActiveImageIndex((prev) => (prev === imageCount - 1 ? 0 : prev + 1))
                  }
                  className="absolute top-1/2 right-3 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/75 text-white"
                >
                  <ChevronRight className="size-4" />
                </button>
              </>
            ) : null}

            <div className="absolute right-3 bottom-3 flex items-center gap-1 rounded bg-black/85 px-2 py-1 text-[11px] font-semibold text-white">
              <ImageIcon className="size-3" />
              {imageCount > 0 ? `${activeImageIndex + 1}/${imageCount}` : '0/0'}
            </div>
          </div>

          <section className="rounded-xl bg-[#141414] p-5">
            <h3 className="text-body-md font-semibold text-white">Support &amp; Admin</h3>

            <p className="text-muted mt-4 text-[12px] font-medium">All Tickets</p>
            {isTicketsLoading ? (
              <div className="mt-3 space-y-2">
                <ShimmerBlock className="h-16 w-full" />
                <ShimmerBlock className="h-16 w-full" />
              </div>
            ) : tickets.length === 0 ? (
              <EmptyState message="No support tickets raised by this expert." />
            ) : (
              <ul className="mt-3 space-y-3">
                {tickets.map((ticket) => (
                  <li key={ticket._id}>
                    <button
                      type="button"
                      onClick={() => navigate(`/support/tickets/${ticket._id}`)}
                      className="flex w-full items-start justify-between gap-3 text-left"
                    >
                      <div className="min-w-0">
                        <p className="text-body-sm truncate font-medium text-white">
                          # {ticket.ticketNumber} – {ticket.subject}
                        </p>
                        <p className="text-muted mt-1 text-[11px]">
                          Updated: {formatRelativeTime(ticket.updatedAt || ticket.createdAt)}
                        </p>
                      </div>
                      <span
                        className={cn(
                          'shrink-0 rounded-md px-2.5 py-1 text-[10px] font-semibold tracking-wide whitespace-nowrap',
                          ticketStatusClass(ticket.status),
                        )}
                      >
                        {titleCase(ticket.status)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <p className="text-muted mt-5 text-[12px] font-medium">Admin notes</p>
            <div className="text-body-sm mt-2 min-h-[72px] rounded-lg bg-black/60 p-4 text-white">
              {service.adminNote?.trim() || 'None.'}
              {service.flagDetails?.reason ? (
                <p className="mt-3 text-[#E0A263]">
                  Flagged: {service.flagDetails.reason}
                  {service.flagDetails.flaggedByName
                    ? ` (by ${service.flagDetails.flaggedByName})`
                    : ''}
                </p>
              ) : null}
            </div>
          </section>
        </div>

        <div className="flex h-full min-w-0 flex-col">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-[28px] leading-tight font-semibold text-white">
                {displayServiceTitle(service.title)}
              </h1>
              {service.category?.name ? (
                <p className="text-body-sm text-muted mt-1">{service.category.name}</p>
              ) : null}
            </div>
            <div className="text-muted shrink-0 text-right text-[12px] leading-5">
              <p>
                Created By: <span className="text-white">{expertName}</span>
              </p>
              <p>Role: {expertRole}</p>
            </div>
          </div>

          {service.description ? (
            <p className="text-body-sm text-muted mt-5 leading-relaxed">{service.description}</p>
          ) : null}

          {service.subCategory?.length ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {service.subCategory.map((item) => (
                <span
                  key={item._id}
                  className="rounded-md border border-white/70 px-3 py-1 text-[11px] font-medium text-white"
                >
                  {item.name}
                </span>
              ))}
            </div>
          ) : null}

          <section className="mt-6 rounded-xl border border-white/[0.06] bg-[#141414] p-5">
            <h3 className="text-body-md font-semibold text-white">Service Information</h3>
            <p className="text-body-sm text-muted mt-1">Provide details about this service</p>
            <div className="mt-2">
              <InfoRow label="Service Name" value={displayServiceTitle(service.title)} />
              <InfoRow
                label="Service Type"
                value={formatServiceTypeLabel(pricing.pricingType || service.pricingType)}
              />
              <InfoRow label="Category" value={service.category?.name || DASH} />
              <InfoRow label="Created" value={formatDate(service.createdAt)} />
              <InfoRow label="Status" value={titleCase(service.displayStatus || service.status)} />
            </div>
          </section>

          {pricing.pricingType === 'fixed' ? (
            <div className="mt-8 flex flex-wrap gap-4">
              <DetailChip value={money(pricing.price)} label="Pricing" />
              <DetailChip
                value={pricing.discountPercent ? `${pricing.discountPercent}% Off` : 'No discount'}
                label="Discounts"
              />
              <DetailChip value={pricing.timelineLabel || DASH} label="Timelines" />
            </div>
          ) : null}

          {pricing.pricingType === 'custom' ? (
            <div className="mt-8 flex flex-wrap gap-4">
              <DetailChip value={money(pricing.startingFrom)} label="Starting From" />
              <DetailChip
                value={pricing.discountPercent ? `${pricing.discountPercent}% Off` : 'No discount'}
                label="Discounts"
              />
              <DetailChip value={pricing.timelineLabel || DASH} label="Timelines" />
            </div>
          ) : null}

          {pricing.pricingType === 'tiered' && pricing.tiers.length > 0 ? (
            <div className="mt-8 space-y-4">
              <div className="flex w-full max-w-[360px] rounded-full border border-white/20 p-0.5">
                {pricing.tiers.map((tier, index) => (
                  <button
                    key={tier.name}
                    type="button"
                    onClick={() => setActiveTierIndex(index)}
                    className={cn(
                      'flex-1 rounded-full py-2 text-[10px] font-medium capitalize transition-colors',
                      activeTierIndex === index ? 'bg-white text-black' : 'text-white',
                    )}
                  >
                    {tier.name}
                  </button>
                ))}
              </div>

              {tierDetails?.summary ? (
                <p className="text-body-sm text-muted max-w-[560px] leading-relaxed">
                  {tierDetails.summary}
                </p>
              ) : null}

              {tierDetails?.features.length ? (
                <ul className="text-body-sm text-muted list-disc space-y-1 pl-4 leading-relaxed">
                  {tierDetails.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
              ) : null}

              <div className="flex flex-wrap gap-4">
                <DetailChip value={money(tierDetails?.price)} label="Pricing" />
                <DetailChip value="No discount" label="Discounts" />
                <DetailChip value={tierDetails?.timelineLabel || DASH} label="Timelines" />
              </div>
            </div>
          ) : null}

          <button
            type="button"
            onClick={() => navigate(servicePerformancePath(expertId, serviceId))}
            className="mt-10 flex w-full items-center justify-between rounded-lg border border-white px-4 py-3 text-left text-[14px] font-medium text-white transition-colors hover:bg-white/5 lg:mt-auto"
          >
            <span>Service Performance</span>
            <ChevronRight className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  )
}
