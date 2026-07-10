import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import {
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  EyeOff,
  ImageOff,
  MapPin,
  PauseCircle,
  RotateCcw,
  Star,
  XCircle,
} from 'lucide-react'

import {
  fetchAmenityMasters,
  updateVenueSpaceStatus,
  updateVenueSpaceVisibility,
  type UpdateVenueSpaceStatusPayload,
  type UpdateVenueSpaceVisibilityPayload,
} from '../../api/venue-api'
import { useVenueFullView } from '../../hooks/use-venues'
import type { VenueFullView, VenueFullViewGalleryImage } from '../../type/venue-full-view'
import {
  DecisionActionModal,
  type DecisionActionModalOption,
} from '@/shared/components/modal/decision-action-modal'
import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'
import { cn } from '@/shared/lib/cn'
import { useAuthStore } from '@/modules/auth/store/auth-store'
import {
  useAdminEscalation,
  useEscalateVenueSpaceApplication,
  useEscalationAssignees,
  useStartAdminEscalationReview,
} from '@/modules/my-tasks/hooks/use-admin-escalation'

type AmenitySubCategory = {
  _id: string
  name: string
  image?: string
}

type AmenityCategory = {
  _id: string
  category: string
  subCategories?: AmenitySubCategory[]
}

type SpaceAction = 'hide' | 'suspend'
type DecisionVariant = 'approve' | 'reject' | 'requestChanges' | 'escalate'

const ACTION_MENU_CLASS = 'border border-slate-200 bg-white shadow-xl'
const ACTION_ITEM_CLASS = 'text-slate-800 hover:bg-slate-100 hover:text-slate-900'

const SPACE_REASON_OPTIONS: DecisionActionModalOption[] = [
  { label: 'Temporary operational issue', value: 'temporary_operational_issue' },
  { label: 'Scheduled maintenance', value: 'scheduled_maintenance' },
  { label: 'Availability issue', value: 'availability_issue' },
  { label: 'System verification in progress', value: 'system_verification_in_progress' },
  { label: 'Admin review required', value: 'admin_review_required' },
]

const REJECT_REASONS: DecisionActionModalOption[] = [
  { label: 'Unclear Image', value: 'Unclear Image' },
  { label: 'Content issue', value: 'Content issue' },
  { label: 'Invalid Documents', value: 'Invalid Documents' },
  { label: 'Invalid PAN', value: 'IndiaPAN' },
  { label: 'Invalid GST', value: 'InvalidGST' },
]

const getApiErrorMessage = (error: unknown) => {
  const err = error as { response?: { data?: { message?: string } } }
  return err?.response?.data?.message || 'Something went wrong. Please try again.'
}

const formatCurrency = (value?: number | null) => {
  if (value === null || value === undefined) return '—'
  return `₹${value.toLocaleString('en-IN')}`
}

function SafeImage({
  src,
  alt,
  className,
}: {
  src?: string | null
  alt: string
  className?: string
}) {
  const [errored, setErrored] = useState(false)

  if (!src || errored) {
    return (
      <div className={cn('flex items-center justify-center bg-black text-[#666]', className)}>
        <ImageOff className="size-5" />
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setErrored(true)}
    />
  )
}

function Card({
  title,
  children,
  className,
}: {
  title?: string
  children: ReactNode
  className?: string
}) {
  return (
    <section className={cn('rounded-lg border border-white/5 bg-[#111111] p-5', className)}>
      {title && <h2 className="mb-4 text-[13px] font-bold text-white">{title}</h2>}
      {children}
    </section>
  )
}

function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-black px-3 py-1.5 text-[11px] font-semibold text-white">
      {children}
    </span>
  )
}

function ServiceItem({ label, enabled }: { label: string; enabled?: boolean }) {
  return (
    <div className="flex items-center gap-2 text-[12px]">
      <CheckCircle2 className={cn('size-3.5', enabled ? 'text-emerald-400' : 'text-[#555]')} />
      <span className={enabled ? 'text-[#bbb]' : 'text-[#777] line-through'}>{label}</span>
    </div>
  )
}

function resolveAmenities(data: VenueFullView, masters: AmenityCategory[]) {
  const categories = new Map(masters.map((category) => [category._id, category]))
  const subCategories = new Map<string, AmenitySubCategory & { categoryName?: string }>()

  masters.forEach((category) => {
    category.subCategories?.forEach((subCategory) => {
      subCategories.set(subCategory._id, {
        ...subCategory,
        categoryName: category.category,
      })
    })
  })

  return (data.overview.amenities?.amenities || []).flatMap((amenity) => {
    const category = categories.get(amenity.categoryId)

    return amenity.subCategoryIds.map((subCategoryId) => {
      const subCategory = subCategories.get(subCategoryId)
      return {
        id: `${amenity.categoryId}-${subCategoryId}`,
        categoryName: category?.category || amenity.categoryId,
        name: subCategory?.name || subCategoryId,
        image: subCategory?.image,
      }
    })
  })
}

export function SpaceDetailsPage() {
  const navigate = useNavigate()
  const { venueId, spaceId } = useParams<{ venueId: string; spaceId: string }>()
  const queryClient = useQueryClient()
  const [actionsOpen, setActionsOpen] = useState(false)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [modalAction, setModalAction] = useState<SpaceAction | null>(null)
  const [decisionModalOpen, setDecisionModalOpen] = useState(false)
  const [decisionVariant, setDecisionVariant] = useState<DecisionVariant>('approve')
  const [selectedReasons, setSelectedReasons] = useState<string[]>([])
  const [reasonDetails, setReasonDetails] = useState('')
  const [adminNotes, setAdminNotes] = useState('')
  const [decisionAdminNotes, setDecisionAdminNotes] = useState('')
  const [decisionSelectedReasons, setDecisionSelectedReasons] = useState<string[]>([])
  const [decisionRejectionReason, setDecisionRejectionReason] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [suspendIndefinitely, setSuspendIndefinitely] = useState(false)
  const [selectedEscalationOption, setSelectedEscalationOption] = useState('')

  const user = useAuthStore((state) => state.user)
  const isSuperAdmin = Boolean(user?.isSuperAdmin)

  const { data, isLoading, isError, error } = useVenueFullView(venueId, spaceId)
  const { data: amenityMasters } = useQuery({
    queryKey: ['amenities-master'],
    queryFn: fetchAmenityMasters,
  })

  const fullView = data?.data
  const carouselImages = useMemo(() => {
    if (!fullView) return []

    const { gallery, venue } = fullView.overview
    const summaryItem =
      fullView.spaces.find((item) => item.spaceId === spaceId) || fullView.spaces[0]

    const urls = [
      ...(gallery?.venueCoverImages || []).map((image) => image.url),
      ...(gallery?.spaceCoverImages || []).map((image) => image.url),
      ...(gallery?.galleryImages || []).map((image) => image.url),
      summaryItem?.coverImage,
      venue.coverImageUrl,
    ].filter((url): url is string => Boolean(url))

    return [...new Set(urls)]
  }, [fullView, spaceId])

  useEffect(() => {
    setActiveImageIndex(0)
  }, [spaceId, carouselImages.length])

  const resolvedAmenities = useMemo(
    () => (fullView ? resolveAmenities(fullView, amenityMasters?.data || []) : []),
    [amenityMasters?.data, fullView],
  )

  const visibilityMutation = useMutation({
    mutationFn: ({
      targetSpaceId,
      payload,
    }: {
      targetSpaceId: string
      payload: UpdateVenueSpaceVisibilityPayload
    }) => updateVenueSpaceVisibility(targetSpaceId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venue-full-view', venueId, spaceId] })
      queryClient.invalidateQueries({ queryKey: ['venues'] })
    },
  })

  const spaceStatusMutation = useMutation({
    mutationFn: ({
      targetSpaceId,
      payload,
    }: {
      targetSpaceId: string
      payload: UpdateVenueSpaceStatusPayload
    }) => updateVenueSpaceStatus(targetSpaceId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venue-full-view', venueId, spaceId] })
      queryClient.invalidateQueries({ queryKey: ['venues'] })
      queryClient.invalidateQueries({ queryKey: ['my-tasks'] })
    },
  })

  const { data: assigneesData } = useEscalationAssignees('venues.*')
  const { data: escalationData } = useAdminEscalation('venue_space', spaceId)
  const escalateVenueSpace = useEscalateVenueSpaceApplication(spaceId, venueId)
  const startEscalationReview = useStartAdminEscalationReview('venue_space', spaceId)

  useEffect(() => {
    if (!spaceId || isSuperAdmin) return
    startEscalationReview.mutate()
  }, [spaceId, isSuperAdmin])

  const backToProfile = () => navigate(`/venues/management/profile/${venueId}`)

  const resetModal = () => {
    setSelectedReasons([])
    setReasonDetails('')
    setAdminNotes('')
    setStartDate('')
    setEndDate('')
    setSuspendIndefinitely(false)
  }

  const openActionModal = (action: SpaceAction) => {
    resetModal()
    setActionsOpen(false)
    setModalAction(action)
  }

  const closeModal = () => setModalAction(null)

  const toggleReason = (value: string) => {
    setSelectedReasons((current) =>
      current.includes(value)
        ? current.filter((reason) => reason !== value)
        : [...current, value],
    )
  }

  const submitVisibilityAction = () => {
    if (!spaceId || !modalAction) return

    if (selectedReasons.length === 0) {
      toast.error('Please select at least one reason.')
      return
    }

    if (modalAction === 'suspend' && !suspendIndefinitely && (!startDate || !endDate)) {
      toast.error('Please provide a suspension timeline or choose to suspend indefinitely.')
      return
    }

    if (!adminNotes.trim()) {
      toast.error('Admin notes are required.')
      return
    }

    const toIso = (value: string) =>
      value ? new Date(`${value}T00:00:00.000Z`).toISOString() : undefined

    const payload: UpdateVenueSpaceVisibilityPayload =
      modalAction === 'hide'
        ? {
          action: 'hide',
          selectedReasons,
          reasonDetails: reasonDetails.trim(),
          adminNotes: adminNotes.trim(),
        }
        : {
          action: 'suspend',
          selectedReasons,
          suspendIndefinitely,
          startDate: suspendIndefinitely ? undefined : toIso(startDate),
          endDate: suspendIndefinitely ? undefined : toIso(endDate),
          reasonDetails: reasonDetails.trim(),
          adminNotes: adminNotes.trim(),
        }

    visibilityMutation.mutate(
      { targetSpaceId: spaceId, payload },
      {
        onSuccess: () => {
          toast.success(modalAction === 'hide' ? 'Space hidden successfully' : 'Space suspended successfully')
          closeModal()
        },
        onError: (err) => toast.error(getApiErrorMessage(err)),
      },
    )
  }

  const activateSpace = () => {
    if (!spaceId) return
    setActionsOpen(false)
    visibilityMutation.mutate(
      { targetSpaceId: spaceId, payload: { action: 'activate' } },
      {
        onSuccess: () => toast.success('Space activated successfully'),
        onError: (err) => toast.error(getApiErrorMessage(err)),
      },
    )
  }

  const resetDecisionModal = () => {
    setDecisionAdminNotes('')
    setDecisionSelectedReasons([])
    setDecisionRejectionReason('')
    setSelectedEscalationOption('')
  }

  const openDecisionModal = (variant: DecisionVariant) => {
    resetDecisionModal()
    setDecisionVariant(variant)
    setDecisionModalOpen(true)
  }

  const toggleDecisionReason = (value: string) => {
    setDecisionSelectedReasons((current) =>
      current.includes(value)
        ? current.filter((reason) => reason !== value)
        : [...current, value],
    )
  }

  const isDecisionRejectFlow =
    decisionVariant === 'reject' || decisionVariant === 'requestChanges'

  const handleSubmitDecision = () => {
    if (!spaceId) {
      toast.error('No space found for this venue.')
      return
    }

    if (decisionVariant === 'escalate') {
      if (!selectedEscalationOption) {
        toast.error('Please select a sub-admin to assign.')
        return
      }
      if (!decisionAdminNotes.trim()) {
        toast.error('Admin notes are required.')
        return
      }

      const selectedAssignee = assigneesData?.data.find(
        (item) => item.id === selectedEscalationOption,
      )

      escalateVenueSpace.mutate(
        {
          assigneeSubAdminId: selectedEscalationOption,
          assigneeName: selectedAssignee?.fullname || '',
          adminNote: decisionAdminNotes.trim(),
          venueId,
          applicationUrl: `/venues/management/profile/${venueId}/space/${spaceId}`,
          entityTitle: fullView?.overview?.venue?.name || 'Venue Space',
        },
        {
          onSuccess: () => {
            toast.success('Application assigned successfully')
            setDecisionModalOpen(false)
          },
          onError: (err) => toast.error(getApiErrorMessage(err)),
        },
      )
      return
    }

    if (!decisionAdminNotes.trim()) {
      toast.error('Admin notes are required.')
      return
    }

    if (isDecisionRejectFlow) {
      if (decisionSelectedReasons.length === 0) {
        toast.error('Please select at least one reason.')
        return
      }
      if (!decisionRejectionReason.trim()) {
        toast.error('Please provide a rejection reason.')
        return
      }
    }

    const payload: UpdateVenueSpaceStatusPayload =
      decisionVariant === 'approve'
        ? { status: 'approved', adminNote: decisionAdminNotes.trim() }
        : {
            status: 'rejected',
            reasonFor: decisionSelectedReasons,
            rejectionReason: decisionRejectionReason.trim(),
            adminNote: decisionAdminNotes.trim(),
          }

    spaceStatusMutation.mutate(
      { targetSpaceId: spaceId, payload },
      {
        onSuccess: () => {
          toast.success(
            decisionVariant === 'approve'
              ? 'Space approved successfully'
              : decisionVariant === 'requestChanges'
                ? 'Resubmission requested successfully'
                : 'Space rejected successfully',
          )
          setDecisionModalOpen(false)
        },
        onError: (err) => toast.error(getApiErrorMessage(err)),
      },
    )
  }

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="size-9 animate-spin rounded-full border-4 border-brand-accent border-t-transparent" />
      </div>
    )
  }

  if (isError || !fullView) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={backToProfile}
          className="group flex w-fit items-center gap-2 font-heading text-[20px] font-bold text-white transition-colors hover:text-brand-accent"
        >
          <ArrowLeft className="size-5" />
          <span>Space Details</span>
        </button>
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {getApiErrorMessage(error)}
        </div>
      </div>
    )
  }

  const { venue, space, gallery, terms, availability } = fullView.overview
  const summary = fullView.spaces.find((item) => item.spaceId === spaceId)
  const detailSpace =
    space && String(space._id) === String(spaceId) ? space : null
  const spaceName =
    detailSpace?.name || summary?.spaceName || 'Space Details'
  const galleryImages: VenueFullViewGalleryImage[] = [
    ...(gallery?.venueCoverImages || []),
    ...(gallery?.spaceCoverImages || []),
    ...(gallery?.galleryImages || []),
  ]
  const imageCount = carouselImages.length
  const activeImage =
    imageCount > 0 ? carouselImages[Math.min(activeImageIndex, imageCount - 1)] : null

  const handlePrevImage = () => {
    if (imageCount <= 1) return
    setActiveImageIndex((prev) => (prev === 0 ? imageCount - 1 : prev - 1))
  }

  const handleNextImage = () => {
    if (imageCount <= 1) return
    setActiveImageIndex((prev) => (prev === imageCount - 1 ? 0 : prev + 1))
  }

  const location = detailSpace?.location || venue.location
  const addressLine = [
    location?.address,
    location?.city,
    location?.state,
    location?.pincode,
  ]
    .filter(Boolean)
    .join(', ')
  const capacity = detailSpace?.guestLimit ?? detailSpace?.capacityRange ?? summary?.capacity
  const isHidden = Boolean(detailSpace?.isHidden || summary?.isHidden)
  const isSuspended = Boolean(detailSpace?.isSuspend || summary?.isSuspend)
  const spaceStatus = detailSpace?.status ?? summary?.status ?? 'submitted'
  const isDecisionPending = spaceStatus === 'submitted'
  const decisionDisabled =
    !isDecisionPending || spaceStatusMutation.isPending || !spaceId
  const escalateDisabled =
    !isDecisionPending || escalateVenueSpace.isPending || !spaceId
  const escalation = escalationData?.data
  const isEscalateFlow = decisionVariant === 'escalate'
  const escalationOptions: DecisionActionModalOption[] =
    assigneesData?.data.map((assignee) => ({
      label: assignee.fullname,
      value: assignee.id,
    })) || []

  return (
    <div className="mx-auto flex max-w-[1120px] flex-col gap-5">
      <header className="flex items-start justify-between">
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={backToProfile}
            className="group flex w-fit items-center gap-2 font-heading text-[20px] font-bold tracking-tight text-white transition-colors hover:text-brand-accent"
          >
            <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-1" />
            <span>Space Details</span>
          </button>
          <div className="flex items-center gap-1.5 pl-7 text-[12px] font-medium text-[#777777]">
            <button type="button" onClick={backToProfile} className="transition-colors hover:text-white">
              {venue.name}
            </button>
            <span className="text-[#333333]">/</span>
            <span className="font-bold text-white">{spaceName}</span>
          </div>
        </div>

        <TableActionsDropdown
          label="Open space actions"
          isOpen={actionsOpen}
          onOpenChange={setActionsOpen}
          menuClassName={ACTION_MENU_CLASS}
          menuWidth={180}
        >
          {isHidden || isSuspended ? (
            <TableActionsItem
              icon={<RotateCcw className="size-3.5 text-slate-700" />}
              className={ACTION_ITEM_CLASS}
              onClick={activateSpace}
            >
              Active Space
            </TableActionsItem>
          ) : (
            <TableActionsItem
              icon={<EyeOff className="size-3.5 text-slate-700" />}
              className={ACTION_ITEM_CLASS}
              onClick={() => openActionModal('hide')}
            >
              Hide Space
            </TableActionsItem>
          )}
          <TableActionsItem
            icon={<BarChart3 className="size-3.5 text-slate-700" />}
            className={ACTION_ITEM_CLASS}
            onClick={() => navigate(`/venues/management/profile/${venueId}/space/${spaceId}/analytics`)}
          >
            Analytics
          </TableActionsItem>
          <TableActionsItem
            icon={<PauseCircle className="size-3.5 text-slate-700" />}
            className={ACTION_ITEM_CLASS}
            onClick={() => openActionModal('suspend')}
          >
            Suspend Space
          </TableActionsItem>
        </TableActionsDropdown>
      </header>

      {(isHidden || isSuspended) && (
        <div className="rounded-lg border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-[12px] font-semibold text-amber-200">
          This space is currently {isSuspended ? 'suspended' : 'hidden'} and is not visible in partner-facing listings.
        </div>
      )}

      <div className="relative h-64 w-full overflow-hidden rounded-lg border border-white/5 bg-[#111111]">
        <SafeImage src={activeImage} alt={spaceName} className="size-full object-cover" />

        {imageCount > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={handlePrevImage}
              className="absolute top-1/2 left-3 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/75 text-white transition-colors hover:bg-black"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={handleNextImage}
              className="absolute top-1/2 right-3 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/75 text-white transition-colors hover:bg-black"
            >
              <ChevronRight className="size-4" />
            </button>
          </>
        )}

        {imageCount > 0 && (
          <span className="absolute bottom-3 right-3 rounded-md bg-black/70 px-2 py-1 text-[11px] font-medium text-white">
            {imageCount > 1
              ? `${activeImageIndex + 1}/${imageCount}`
              : `${imageCount} photo${imageCount === 1 ? '' : 's'}`}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.25fr_1fr]">
        <Card>
          <p className="text-[11px] font-semibold text-[#777]">{venue.name}</p>
          <div className="mt-2 flex items-center justify-between gap-3">
            <h1 className="text-xl font-bold text-white">{spaceName}</h1>
            <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-white">
              <Star className="size-4 fill-brand-accent text-brand-accent" />
              {venue.ratings ?? '—'}
            </span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Chip>{venue.venueType || 'Venue'}</Chip>
            <Chip>{detailSpace?.spaceType || 'Space'}</Chip>
            {capacity !== null && capacity !== undefined && (
              <Chip>{typeof capacity === 'number' ? `${capacity} guests` : capacity}</Chip>
            )}
          </div>
          <p className="mt-4 text-[12px] font-semibold text-emerald-400">
            Available:{' '}
            <span className="text-white">
              {availability?.weeklyAvailability?.length
                ? availability.weeklyAvailability
                  .map((slot) => `${slot.day} ${slot.from}-${slot.to}`)
                  .join(', ')
                : '—'}
            </span>
          </p>
          <p className="mt-1 text-[12px] font-semibold text-red-400">
            Unavailable:{' '}
            <span className="text-white">
              {availability?.blockedDates?.length
                ? availability.blockedDates
                  .map((slot) => `${slot.date} ${slot.from}-${slot.to}`)
                  .join(', ')
                : '—'}
            </span>
          </p>
        </Card>

        <div className="grid grid-cols-1 gap-5">
          <Card title="Location">
            <div className="flex items-start gap-3 rounded-md bg-black p-3">
              <MapPin className="mt-0.5 size-4 text-red-400" />
              <div>
                <p className="text-[12px] font-semibold text-white">
                  {location?.city || summary?.city || '—'}
                </p>
                <p className="mt-1 text-[10px] text-[#777]">{addressLine || '—'}</p>
              </div>
            </div>
          </Card>

          <Card title="Pricing">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-md bg-black p-3">
                <p className="text-[10px] text-[#777]">Weekday</p>
                <p className="mt-1 text-[12px] font-bold text-white">
                  {formatCurrency(summary?.weekdayPrice)}
                </p>
              </div>
              <div className="rounded-md bg-black p-3">
                <p className="text-[10px] text-[#777]">Weekend</p>
                <p className="mt-1 text-[12px] font-bold text-white">
                  {formatCurrency(summary?.weekendPrice)}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.2fr_1fr]">
        <Card title="About the venue">
          <p className="text-[12px] leading-relaxed text-[#aaa]">
            {venue.aboutVenue || 'No venue description provided.'}
          </p>
          <h3 className="mt-5 text-[12px] font-bold text-white">Service Included</h3>
          <div className="mt-3 space-y-2">
            <ServiceItem label="Parking Available" enabled={detailSpace?.parkingAvailable ?? venue.parkingAvailable} />
            <ServiceItem label="Catering service available" enabled={detailSpace?.inHouseCatering ?? venue.inHouseCatering} />
            <ServiceItem label="Decoration available" enabled={detailSpace?.decorationAvailable ?? venue.decorationAvailable} />
            <ServiceItem label="Accessibility" enabled={detailSpace?.accessibility ?? venue.accessibility} />
          </div>
        </Card>

        <Card title="Amenities">
          <div className="grid grid-cols-2 gap-3">
            {resolvedAmenities.length > 0 ? (
              resolvedAmenities.map((amenity) => (
                <div
                  key={amenity.id}
                  className="flex items-center gap-2 rounded-md bg-black px-3 py-2 text-[11px] font-semibold text-white"
                  title={amenity.categoryName}
                >
                  {amenity.image ? (
                    <img src={amenity.image} alt="" className="size-4 object-contain" />
                  ) : (
                    <CheckCircle2 className="size-4 text-brand-accent" />
                  )}
                  <span className="truncate">{amenity.name}</span>
                </div>
              ))
            ) : (
              <p className="col-span-2 text-[12px] text-[#777]">No amenities listed.</p>
            )}
          </div>
        </Card>
      </div>

      <Card title="Gallery">
        {galleryImages.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {galleryImages.slice(0, 6).map((image, index) => (
              <a
                key={`${image.url}-${index}`}
                href={image.url}
                target="_blank"
                rel="noreferrer"
                className="block aspect-[4/3] overflow-hidden rounded-md border border-white/5 bg-black"
              >
                <SafeImage src={image.url} alt={`Gallery ${index + 1}`} className="size-full object-cover" />
              </a>
            ))}
          </div>
        ) : (
          <p className="text-[12px] text-[#777]">No gallery images uploaded.</p>
        )}
      </Card>

      <Card title="Terms & Conditions">
        <div className="flex flex-wrap gap-4">
          {(terms?.terms || []).map((term) => (
            <div key={term} className="flex items-center gap-2 text-[11px] text-[#bbb]">
              <CheckCircle2 className="size-3.5 text-emerald-400" />
              {term}
            </div>
          ))}
          {terms?.cancellation && (
            <div className="flex items-center gap-2 text-[11px] text-[#bbb]">
              <CheckCircle2 className="size-3.5 text-emerald-400" />
              Free cancellation up to {terms.cancellation.freeCancellationHours ?? 0} hrs before booking
            </div>
          )}
          {!terms?.terms?.length && !terms?.cancellation && (
            <p className="text-[12px] text-[#777]">No terms added.</p>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card title="Application Notes">
          <div className="rounded-md bg-black p-3 text-[12px] leading-relaxed text-[#777] whitespace-pre-wrap">
            {detailSpace?.adminNote || venue.adminInternalNotes || 'No notes yet.'}
            {escalation?.escalatedByName ? (
              <p className="mt-3 text-[11px] text-[#999]">
                Escalated by {escalation.escalatedByName}
                {escalation.escalatedToName ? ` to ${escalation.escalatedToName}` : ''}.
                {escalation.escalationNote ? ` Note: ${escalation.escalationNote}` : ''}
              </p>
            ) : null}
          </div>
        </Card>

        <Card title="Decision Controls">
          {!isDecisionPending && (
            <p className="mb-3 rounded-md bg-black px-3 py-2 text-[11px] font-medium text-[#999]">
              This space is currently{' '}
              <span className="font-bold text-white">{spaceStatus || '—'}</span>.
            </p>
          )}
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => openDecisionModal('approve')}
              disabled={decisionDisabled}
              className="flex items-center gap-1.5 rounded-md bg-brand-success px-4 py-2.5 text-[11px] font-bold text-white transition-colors hover:bg-[#08a85d] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Approve
              <CheckCircle2 className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => openDecisionModal('requestChanges')}
              disabled={decisionDisabled}
              className="rounded-md bg-brand-accent px-4 py-2.5 text-[11px] font-bold text-brand-text-dark hover:bg-brand-gold-from transition-colors hover:bg-brand-gold-from disabled:cursor-not-allowed disabled:opacity-50"
            >
              Ask for Re-Submit
            </button>
            {isSuperAdmin ? (
              <button
                type="button"
                disabled={escalateDisabled}
                onClick={() => openDecisionModal('escalate')}
                className="rounded-md bg-brand-action px-4 py-2.5 text-[11px] font-bold text-white transition-colors hover:bg-[#1e40af] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Escalate
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => openDecisionModal('reject')}
              disabled={decisionDisabled}
              className="flex items-center gap-1.5 rounded-md bg-brand-danger px-4 py-2.5 text-[11px] font-bold text-white transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Reject Application
              <XCircle className="size-3.5" />
            </button>
          </div>
        </Card>
      </div>

      <DecisionActionModal
        open={decisionModalOpen}
        variant={decisionVariant}
        title={
          decisionVariant === 'approve'
            ? 'Approve Space'
            : decisionVariant === 'requestChanges'
              ? 'Request Changes'
              : decisionVariant === 'escalate'
                ? 'Escalate Application'
                : 'Reject Space'
        }
        description={
          decisionVariant === 'approve'
            ? 'Are you sure you want to approve this venue space?'
            : decisionVariant === 'requestChanges'
              ? 'Are you sure you want to Request Changes to this application? The applicant will be notified via email.'
              : decisionVariant === 'escalate'
                ? 'Are you sure you want to escalate this application? This post will be reviewed by the selected parties.'
                : 'Please choose the rejection reasons and add notes for this venue space.'
        }
        submitLabel={
          decisionVariant === 'approve'
            ? 'Approve'
            : decisionVariant === 'requestChanges'
              ? 'Request Changes'
              : decisionVariant === 'escalate'
                ? 'Escalate'
                : 'Reject'
        }
        reasonOptions={isDecisionRejectFlow ? REJECT_REASONS : []}
        selectedReasons={decisionSelectedReasons}
        onReasonToggle={toggleDecisionReason}
        reason={isDecisionRejectFlow ? decisionRejectionReason : undefined}
        onReasonChange={isDecisionRejectFlow ? setDecisionRejectionReason : undefined}
        adminNotes={decisionAdminNotes}
        onAdminNotesChange={setDecisionAdminNotes}
        escalationOptions={isEscalateFlow ? escalationOptions : []}
        selectedEscalationOption={selectedEscalationOption}
        onEscalationOptionChange={setSelectedEscalationOption}
        onClose={() => setDecisionModalOpen(false)}
        onSubmit={handleSubmitDecision}
        isSubmitting={
          isEscalateFlow ? escalateVenueSpace.isPending : spaceStatusMutation.isPending
        }
      />

      <DecisionActionModal
        open={Boolean(modalAction)}
        variant="suspend"
        title={modalAction === 'hide' ? 'Hide Space' : 'Suspend Space'}
        description={
          modalAction === 'hide'
            ? 'Are you sure you want to hide this space? This will prevent it from appearing in partner-facing listings.'
            : 'Are you sure you want to suspend this space? This will temporarily restrict booking visibility.'
        }
        submitLabel={modalAction === 'hide' ? 'Hide' : 'Suspend'}
        reasonOptions={SPACE_REASON_OPTIONS}
        selectedReasons={selectedReasons}
        onReasonToggle={toggleReason}
        reason={reasonDetails}
        onReasonChange={setReasonDetails}
        adminNotes={adminNotes}
        onAdminNotesChange={setAdminNotes}
        showTimeline={modalAction === 'suspend'}
        startDate={startDate}
        onStartDateChange={setStartDate}
        endDate={endDate}
        onEndDateChange={setEndDate}
        indefinite={suspendIndefinitely}
        onIndefiniteChange={setSuspendIndefinitely}
        onClose={closeModal}
        onSubmit={submitVisibilityAction}
        isSubmitting={visibilityMutation.isPending}
      />
    </div>
  )
}
