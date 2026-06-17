import { useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  Eye,
  Gavel,
  History,
  Image as ImageIcon,
  Languages,
  Loader2,
  Phone,
  RotateCcw,
  X,
  Info,
} from 'lucide-react'

import { useService } from '../../hooks/use-services'
import { Button } from '@/shared/components/ui/button'
import {
  DecisionActionModal,
  type DecisionActionModalVariant,
} from '@/shared/components/modal/decision-action-modal'
import { cn } from '@/shared/lib/cn'
import type { ServiceDetail } from '../../type/service'

type ServiceViewDetail = ServiceDetail & {
  serviceType?: string
  pricing?: number
  consultationTitle?: string
  consultationCategory?: string
  sessionOutline?: string
  benefits?: string
  whoIsItFor?: string
  modeOfConsultation?: string
  language?: string
  followUpWindow?: string
  postSessionRequirement?: string
  preSessionRequirement?: string
  durations?: { label: string; price?: number | string }[]
}

const formatMoney = (value?: number) => {
  if (value === undefined || Number.isNaN(value)) return '₹60,000.00'

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

const formatDate = (isoString?: string) => {
  if (!isoString) return 'Jan 24, 2025 14:32'

  const date = new Date(isoString)
  const formattedDate = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
  const formattedTime = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })

  return `${formattedDate} ${formattedTime}`
}

const getRelativeTime = (isoString?: string) => {
  if (!isoString) return 'Applied 2 days ago'

  const diffDays = Math.max(
    0,
    Math.floor((Date.now() - new Date(isoString).getTime()) / (1000 * 60 * 60 * 24)),
  )

  if (diffDays === 0) return 'Applied today'
  if (diffDays === 1) return 'Applied 1 day ago'
  return `Applied ${diffDays} days ago`
}

const parseDescription = (description = '') => {
  const [summary, ...features] = description.split('+').map((part) => part.trim()).filter(Boolean)

  return {
    summary,
    features,
  }
}

const decisionReasonOptions = [
  { label: 'Unclear Image', value: 'unclear-image' },
  { label: 'Content Issue', value: 'content-issue' },
  { label: 'Invalid documents', value: 'invalid-documents' },
  { label: 'Invalid PAN', value: 'invalid-pan' },
  { label: 'Invalid GST', value: 'invalid-gst' },
]

const escalationOptions = [
  { label: '[Super Admin]', value: 'super-admin' },
  { label: '[Moderator 1]', value: 'moderator-1' },
]

type ServiceDecisionAction = DecisionActionModalVariant

export const ServiceViewPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: apiResponse, isLoading, error } = useService(id || '')
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [activeTierIndex, setActiveTierIndex] = useState(1)
  const [internalNotes, setInternalNotes] = useState('')
  const [activeDecisionAction, setActiveDecisionAction] = useState<ServiceDecisionAction | null>(null)
  const [decisionAdminNotes, setDecisionAdminNotes] = useState('')
  const [decisionReason, setDecisionReason] = useState('')
  const [selectedReasons, setSelectedReasons] = useState<string[]>([])
  const [selectedEscalationOption, setSelectedEscalationOption] = useState(escalationOptions[0].value)
  const [actionToast, setActionToast] = useState<{
    message: string
    type: 'success' | 'info' | 'error' | null
  }>({ message: '', type: null })

  const service = apiResponse?.data as ServiceViewDetail | undefined
  const tierDetails = useMemo(() => {
    if (service?.pricingType !== 'tiered' || !service.tieredPricing?.tiers?.length) return null

    const tier = service.tieredPricing.tiers[activeTierIndex] || service.tieredPricing.tiers[0]
    const parsedDescription = parseDescription(tier.description)

    return {
      ...tier,
      description: parsedDescription.summary,
      features: parsedDescription.features,
    }
  }, [activeTierIndex, service])

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setActionToast({ message, type })
    setTimeout(() => {
      setActionToast({ message: '', type: null })
    }, 4000)
  }

  const openDecisionModal = (action: ServiceDecisionAction) => {
    setActiveDecisionAction(action)
    setDecisionAdminNotes('')
    setDecisionReason('')
    setSelectedReasons(action === 'approve' || action === 'escalate' ? [] : ['unclear-image', 'content-issue'])
    setSelectedEscalationOption(escalationOptions[0].value)
  }

  const closeDecisionModal = () => {
    setActiveDecisionAction(null)
  }

  const toggleDecisionReason = (value: string) => {
    setSelectedReasons((currentReasons) =>
      currentReasons.includes(value)
        ? currentReasons.filter((reasonValue) => reasonValue !== value)
        : [...currentReasons, value],
    )
  }

  const submitDecisionAction = () => {
    if (!activeDecisionAction) return

    const toastByAction: Record<ServiceDecisionAction, { message: string; type: 'success' | 'info' | 'error' }> = {
      approve: { message: 'Service listing approved successfully!', type: 'success' },
      reject: { message: 'Service application rejected.', type: 'error' },
      requestChanges: { message: 'Change request submitted.', type: 'info' },
      escalate: { message: 'Listing escalated for review.', type: 'info' },
    }

    showToast(toastByAction[activeDecisionAction].message, toastByAction[activeDecisionAction].type)
    closeDecisionModal()
  }

  if (isLoading) {
    return (
      <div className="flex h-96 w-full flex-col items-center justify-center gap-4">
        <Loader2 className="size-10 animate-spin text-amber-400" />
        <p className="text-sm font-medium text-slate-400">Fetching service information...</p>
      </div>
    )
  }

  if (error || !service) {
    return (
      <div className="flex h-96 w-full flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="rounded-full bg-red-500/10 p-3 text-red-500">
          <Info className="size-10" />
        </div>
        <h3 className="text-lg font-semibold text-white">Service Not Found</h3>
        <p className="max-w-md text-sm text-slate-400">
          The service details could not be loaded. Please ensure the service ID is correct.
        </p>
        <Button
          variant="ghost"
          className="mt-4 gap-2 text-amber-400 hover:bg-transparent hover:text-amber-300"
          onClick={() => navigate('/services/management')}
        >
          <ArrowLeft className="size-4" /> Back to management
        </Button>
      </div>
    )
  }

  const handleNextImage = () => {
    if (service.images && service.images.length > 0) {
      setActiveImageIndex((prev) => (prev === service.images.length - 1 ? 0 : prev + 1))
    }
  }

  const isConsultation = (service.serviceType || '').toLowerCase().includes('consultation')
  const imageCount = service.images?.length || 0
  const activeImage = imageCount > 0 ? service.images[activeImageIndex] : undefined
  const expertName = service.partnerName || service.expertName || 'Michael Chen'
  const expertId = `#Expert ${(service.partnerId || '10234').slice(-5).toUpperCase()}`
  const categoryName = service.category?.name || service.consultationCategory || 'Legal'
  const submittedAt = formatDate(service.submittedAt || service.createdAt)
  const updatedAt = formatDate(service.updatedAt)
  const statusLabel = service.status === 'in_review' ? 'Review Pending' : service.status.replace('_', ' ')
  const fallbackTierFeatures = [
    'High-level review of the NDA for obvious risks',
    'Clear summary of key confidentiality and obligation clauses',
    'Flags sections that may need closer attention',
  ]

  const fixedStats = [
    {
      value: formatMoney(service.fixedPricing?.price || service.pricing),
      label: 'Pricing',
    },
    {
      value: `${service.fixedPricing?.discountPercent || 10}% Off`,
      label: 'Discounts',
    },
    {
      value: `${service.fixedPricing?.timelineValue || 25} ${service.fixedPricing?.timelineUnit || 'Days'}`,
      label: 'Timelines',
    },
  ]

  const customStats = [
    {
      value: formatMoney(service.customPricing?.minPrice || service.pricing),
      label: 'Starting From',
    },
    {
      value: service.customPricing
        ? `${service.customPricing.timelineFrom}-${service.customPricing.timelineTo} ${service.customPricing.timelineUnit}`
        : 'Long term (2-5 Months)',
      label: 'Timelines',
    },
  ]

  const consultationDurations = service.durations || [
    { label: '15mins (Free)' },
    { label: '30mins (₹2,000)' },
    { label: '60mins (₹4,500)' },
  ]
  const decisionModalConfig = activeDecisionAction
    ? {
        approve: {
          title: 'Confirm Application',
          description:
            'Are you sure you want to approve this application? The applicant will be notified via email.',
          submitLabel: 'Confirm Approval',
          variant: 'approve' as const,
        },
        reject: {
          title: 'Reject Service',
          description:
            'Are you sure you want to Reject Approval to this application? The applicant will be notified via email.',
          submitLabel: 'Reject Service',
          variant: 'reject' as const,
          reasonOptions: decisionReasonOptions,
        },
        requestChanges: {
          title: 'Request Changes – Service Approval',
          description:
            'Are you sure you want to Request Changes to this application? The applicant will be notified via email.',
          submitLabel: 'Request Changes',
          variant: 'requestChanges' as const,
          reasonOptions: decisionReasonOptions,
        },
        escalate: {
          title: 'Escalate Application',
          description:
            'Are you sure you want to escalate this Application? This Post will be reviewed by the selected parties.',
          submitLabel: 'Escalate',
          variant: 'escalate' as const,
          escalationOptions,
        },
      }[activeDecisionAction]
    : null

  const DetailChip = ({ value, label }: { value: string; label: string }) => (
    <div className="flex flex-col items-center gap-1.5">
      <div className="rounded-md bg-[#151515] px-3.5 py-2 text-[10px] font-semibold text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]">
        {value}
      </div>
      <span className="text-[9px] text-[#5C5C5C]">{label}</span>
    </div>
  )

  const ImagePreview = () => (
    <div className="relative h-[178px] w-full overflow-hidden rounded-md bg-[#101010] md:w-[300px]">
      {activeImage ? (
        <img src={activeImage} alt={service.title} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-2 text-[#5C5C5C]">
          <ImageIcon className="size-8" aria-hidden="true" />
          <span className="text-[10px]">No images uploaded</span>
        </div>
      )}

      <button
        type="button"
        onClick={handleNextImage}
        className="absolute right-2 bottom-2 flex items-center gap-1 rounded bg-black/85 px-2 py-1 text-[10px] font-semibold text-white"
      >
        <ImageIcon className="size-3" aria-hidden="true" />
        {imageCount > 0 ? `${activeImageIndex + 1}/${imageCount}` : '0/0'}
      </button>
    </div>
  )

  const ActionCards = () => (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div className="rounded-md bg-[#151515] p-4">
        <div className="mb-3 flex items-center gap-2 text-[14px] font-semibold text-white">
          <History className="size-4" aria-hidden="true" />
          <h3>Internal Notes</h3>
        </div>

        <textarea
          placeholder="No notes yet."
          value={internalNotes}
          onChange={(e) => setInternalNotes(e.target.value)}
          className="h-[60px] w-full resize-none rounded-md border border-transparent bg-black px-4 py-3 text-[11px] text-[#BDBDBD] outline-none placeholder:text-[#5C5C5C] focus:border-[#FBC078]/40"
        />
      </div>

      <div className="rounded-md bg-[#151515] p-4">
        <div className="mb-6 flex items-center gap-2 text-[14px] font-semibold text-white">
          <Gavel className="size-4" aria-hidden="true" />
          <h3>Decision Controls</h3>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => openDecisionModal('approve')}
            className="flex items-center gap-2 rounded-md bg-[#00B761] px-3 py-2 text-[10px] font-bold text-white"
          >
            Approve Application
            <span className="flex size-4 items-center justify-center rounded-full bg-white">
              <Check className="size-2.5 text-[#00B761]" aria-hidden="true" />
            </span>
          </button>

          <button
            type="button"
            onClick={() => openDecisionModal('requestChanges')}
            className="flex items-center gap-2 rounded-md bg-black px-3 py-2 text-[10px] font-bold text-white"
          >
            Request Changes
            <RotateCcw className="size-3" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => openDecisionModal('escalate')}
            className="flex items-center gap-2 rounded-md bg-[#1F6BFF] px-3 py-2 text-[10px] font-bold text-white"
          >
            Escalate
            <ArrowUpRight className="size-3" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => openDecisionModal('reject')}
            className="flex items-center gap-2 rounded-md bg-[#F02D2D] px-3 py-2 text-[10px] font-bold text-white"
          >
            Reject Application
            <span className="flex size-4 items-center justify-center rounded-full border border-white">
              <X className="size-2.5" aria-hidden="true" />
            </span>
          </button>
        </div>
      </div>
    </div>
  )

  const ExpertSummary = () => (
    <section className="rounded-md bg-[#151515] px-5 py-4">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-[18px] font-semibold text-white underline decoration-white/70 underline-offset-2">
            {expertName}
          </h2>
          <p className="mt-1 text-[11px] text-[#777777]">{getRelativeTime(service.createdAt)}</p>
        </div>

        <button
          type="button"
          onClick={() => showToast('Navigating to expert profile details...', 'info')}
          className="mt-1 flex items-center gap-2 rounded-md bg-black px-3 py-2 text-[10px] font-semibold text-white"
        >
          <Eye className="size-3" aria-hidden="true" />
          View Profile
        </button>
      </div>

      <div className="grid max-w-[760px] grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          ['Expert ID', expertId],
          ['Submitted', submittedAt],
          ['Last Updated', updatedAt],
        ].map(([label, value]) => (
          <div key={label} className="rounded-md bg-black px-4 py-3">
            <span className="block text-[10px] text-[#666666]">{label}</span>
            <span className="mt-2 block text-[11px] font-semibold text-white">{value}</span>
          </div>
        ))}
      </div>
    </section>
  )

  const ServiceContent = () => {
    const isTiered = service.pricingType === 'tiered' && tierDetails
    const stats = service.pricingType === 'fixed' ? fixedStats : customStats

    return (
      <section className={cn('relative', isTiered ? 'space-y-5' : 'flex flex-col gap-5 md:flex-row')}>
        <div className={cn(isTiered ? 'flex flex-col gap-5 md:flex-row' : 'contents')}>
          <ImagePreview />

          <div className="min-w-0 flex-1 pt-3">
            <div className="mb-8 flex items-start justify-between gap-6">
              <div>
                <h2 className="text-[20px] font-semibold leading-none text-white">{service.title}</h2>
                <p className="mt-2 text-[10px] text-[#777777]">{categoryName}</p>
              </div>

              <span className="rounded-md bg-[#6B4217] px-3 py-1.5 text-[12px] font-semibold text-[#E7AE63]">
                {statusLabel}
              </span>
            </div>

            <p className="max-w-[560px] text-[12px] leading-relaxed text-white">{service.description}</p>

            <div className="mt-5 flex flex-wrap gap-2">
              {(service.subCategory?.length ? service.subCategory : [{ _id: 'nda', name: 'NDA review' }, { _id: 'policy', name: 'Policy review' }]).map((subCat) => (
                <span
                  key={subCat._id}
                  className="rounded border border-white/40 px-2 py-1 text-[9px] font-medium text-white"
                >
                  {subCat.name}
                </span>
              ))}
            </div>

            {!isTiered && (
              <div className="mt-7 flex flex-wrap gap-8">
                {stats.map((stat) => (
                  <DetailChip key={stat.label} value={stat.value} label={stat.label} />
                ))}
              </div>
            )}
          </div>
        </div>

        {isTiered && (
          <div className="max-w-[315px]">
            <div className="mb-4 flex rounded-full bg-[#171717] p-0.5">
              {service.tieredPricing?.tiers.map((tier, index) => (
                <button
                  key={tier.name}
                  type="button"
                  onClick={() => setActiveTierIndex(index)}
                  className={cn(
                    'flex-1 rounded-full py-2 text-[9px] font-medium transition-colors',
                    activeTierIndex === index ? 'bg-white text-black' : 'text-white',
                  )}
                >
                  {tier.name}
                </button>
              ))}
            </div>

            <p className="text-[12px] leading-relaxed text-white">
              {tierDetails.description || 'Ideal for early-stage reviews or first-time signings'}
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-[11px] leading-relaxed text-white">
              {(tierDetails.features.length ? tierDetails.features : fallbackTierFeatures).map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>

            <div className="mt-4 flex gap-3">
              <DetailChip value={formatMoney(tierDetails.price)} label="Pricing" />
              <DetailChip
                value={`${String(tierDetails.timelineValue).padStart(2, '0')} ${tierDetails.timelineUnit}`}
                label="Timelines"
              />
            </div>
          </div>
        )}
      </section>
    )
  }

  const ConsultationContent = () => (
    <section className="mx-auto w-full max-w-[910px] rounded-md bg-black px-5 py-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_0.95fr]">
        <div className="border-l-4 border-[#FBC078] pl-4">
          <h2 className="text-[13px] font-semibold text-white">
            {service.consultationTitle || service.title || 'Strategy Session'}
          </h2>
          <p className="mt-1 text-[10px] text-[#777777]">{service.consultationCategory || categoryName}</p>

          <div className="mt-5 flex flex-wrap gap-2">
            {(service.subCategory?.length ? service.subCategory : [{ _id: 'nda', name: 'NDA review' }, { _id: 'policy', name: 'Policy review' }]).map((subCat) => (
              <span
                key={subCat._id}
                className="rounded bg-[#A8ADB0] px-2.5 py-1 text-[9px] font-bold text-black"
              >
                {subCat.name}
              </span>
            ))}
          </div>

          {[
            {
              title: 'Session outline',
              body:
                service.sessionOutline ||
                'A custom-fitted gown tailored to your measurements for a perfect silhouette. Designed with timeless, classic styling that complements any occasion. Crafted using standard yet durable fabrics for a comfortable wear.',
            },
            {
              title: 'Benefits',
              body:
                service.benefits ||
                'A custom-fitted gown tailored to your measurements for a perfect silhouette. Designed with timeless, classic styling that complements any occasion.',
            },
            {
              title: 'Who is it for?',
              body: service.whoIsItFor || 'Start-up founders, young entrepreneurs',
            },
          ].map((section) => (
            <div key={section.title} className="mt-5">
              <h3 className="text-[11px] font-semibold text-white">{section.title}</h3>
              <p className="mt-2 whitespace-pre-line text-[10px] leading-relaxed text-[#777777]">
                {section.body}
              </p>
            </div>
          ))}
        </div>

        <div className="border-l border-[#242424] pl-5">
          <h3 className="text-[11px] font-semibold text-white">Additional Information</h3>

          <div className="mt-5 flex flex-wrap gap-5">
            {[
              { icon: Phone, value: service.modeOfConsultation || 'Mode', label: 'Mode' },
              { icon: Languages, value: service.language || 'English', label: 'English' },
              { value: service.followUpWindow || '5 Days', label: 'FollowUps' },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-2">
                <div className="flex size-[54px] items-center justify-center rounded-md bg-[#151515] text-[11px] font-semibold text-white">
                  {'icon' in item && item.icon ? <item.icon className="size-4" aria-hidden="true" /> : item.value}
                </div>
                <span className="text-[9px] text-[#777777]">{item.label}</span>
              </div>
            ))}
          </div>

          {[
            {
              title: 'Post-session requirement',
              body: service.postSessionRequirement || 'Keep your requirements and questions ready.',
            },
            {
              title: 'Pre-session requirement',
              body: service.preSessionRequirement || 'Keep your requirements and questions ready.',
            },
            {
              title: 'Duration & Pricing',
              body: '',
            },
          ].map((section) => (
            <div key={section.title} className="border-t border-[#242424] py-4">
              <h3 className="text-[11px] font-semibold text-white">{section.title}</h3>
              {section.body && <p className="mt-2 text-[10px] text-[#777777]">{section.body}</p>}
              {section.title === 'Duration & Pricing' && (
                <div className="mt-4 flex flex-wrap gap-4">
                  {consultationDurations.map((duration) => (
                    <span
                      key={duration.label}
                      className="rounded-md bg-[#151515] px-4 py-2.5 text-[10px] font-semibold text-white"
                    >
                      {duration.label}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )

  return (
    <div className="relative flex min-h-screen max-w-[1080px] flex-col gap-5 p-0 pb-8 text-white">
      {actionToast.message && (
        <div
          className={cn(
            'animate-in fade-in slide-in-from-top-4 fixed top-4 right-4 z-50 flex items-center gap-3 rounded-xl border px-5 py-4 shadow-2xl transition-all duration-300',
            actionToast.type === 'success'
              ? 'border-emerald-500/30 bg-emerald-950/95 text-emerald-400'
              : actionToast.type === 'error'
                ? 'border-red-500/30 bg-red-950/95 text-red-400'
                : 'border-slate-800 bg-slate-900/95 text-slate-300',
          )}
        >
          <div className="size-2 animate-pulse rounded-full bg-current" />
          <span className="text-sm font-semibold">{actionToast.message}</span>
          <button
            type="button"
            onClick={() => setActionToast({ message: '', type: null })}
            className="ml-2 hover:opacity-80"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {decisionModalConfig && (
        <DecisionActionModal
          open={Boolean(activeDecisionAction)}
          variant={decisionModalConfig.variant}
          title={decisionModalConfig.title}
          description={decisionModalConfig.description}
          submitLabel={decisionModalConfig.submitLabel}
          adminNotes={decisionAdminNotes}
          onAdminNotesChange={setDecisionAdminNotes}
          reason={decisionReason}
          onReasonChange={
            activeDecisionAction === 'reject' || activeDecisionAction === 'requestChanges'
              ? setDecisionReason
              : undefined
          }
          reasonOptions={decisionModalConfig.reasonOptions}
          selectedReasons={selectedReasons}
          onReasonToggle={toggleDecisionReason}
          escalationOptions={decisionModalConfig.escalationOptions}
          selectedEscalationOption={selectedEscalationOption}
          onEscalationOptionChange={setSelectedEscalationOption}
          onClose={closeDecisionModal}
          onSubmit={submitDecisionAction}
        />
      )}

      <header className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => navigate('/services/management')}
          className="group flex w-fit items-center gap-2 text-[18px] font-semibold text-white transition-colors hover:text-slate-200"
        >
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
          <span>{isConsultation ? 'Consultation View' : 'Service View'}</span>
        </button>

        <div className="mt-2 flex items-center gap-1.5 text-[10px] text-[#777777]">
          <span>Service management</span>
          <span>/</span>
          <span>Service View</span>
          <span>/</span>
          <span className="font-medium text-white">{expertName}</span>
        </div>
        <h1 className="mt-3 text-[15px] font-semibold text-white">
          {isConsultation ? 'Consultation Details' : 'Service Details'}
        </h1>
      </header>

      <ExpertSummary />

      {isConsultation ? <ConsultationContent /> : <ServiceContent />}

      <ActionCards />
    </div>
  )
}
