import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'

import { navigateBackOrFallback } from '@/shared/lib/navigation'
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
  DecisionControlButtons,
  DecisionControlsHeader,
} from '@/shared/components/decision-controls'
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
import { MODERATION_CATEGORY_SLUGS } from '@/modules/settings/api/templates-api'
import {
  useModerationReasonOptions,
  useRecordModerationReasonUsage,
} from '@/modules/settings/hooks/use-templates'

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

const ACTION_ITEM_CLASS = 'text-slate-800 hover:bg-slate-100 hover:text-slate-900'

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
      <div className={cn('text-muted flex items-center justify-center bg-black', className)}>
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
    <section
      className={cn('rounded-brand-lg bg-brand-surface border border-white/5 p-5', className)}
    >
      {title && <h2 className="text-body-md mb-4 font-bold text-white">{title}</h2>}
      {children}
    </section>
  )
}

function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="text-body-sm inline-flex items-center gap-1 rounded-md bg-black px-3 py-1.5 font-semibold text-white">
      {children}
    </span>
  )
}

function ServiceItem({ label, enabled }: { label: string; enabled?: boolean }) {
  return (
    <div className="text-body-sm flex items-center gap-2">
      <CheckCircle2 className={cn('size-3.5', enabled ? 'text-brand-positive' : 'text-muted')} />
      <span className={enabled ? 'text-muted' : 'text-muted line-through'}>{label}</span>
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
  const [decisionConfirmed, setDecisionConfirmed] = useState(false)
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

  const [imageResetKey, setImageResetKey] = useState({ spaceId, length: carouselImages.length })
  if (imageResetKey.spaceId !== spaceId || imageResetKey.length !== carouselImages.length) {
    setImageResetKey({ spaceId, length: carouselImages.length })
    setActiveImageIndex(0)
  }

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
  const recordReasonUsage = useRecordModerationReasonUsage()
  const { options: suspendReasonOptions, buildPayload: buildSuspendReasonPayload } =
    useModerationReasonOptions(MODERATION_CATEGORY_SLUGS.suspendVenue)
  const { options: rejectReasonOptions, buildPayload: buildRejectReasonPayload } =
    useModerationReasonOptions(MODERATION_CATEGORY_SLUGS.rejectVenue)
  const { options: requestChangesReasonOptions, buildPayload: buildRequestChangesReasonPayload } =
    useModerationReasonOptions(MODERATION_CATEGORY_SLUGS.requestChangesVenue)

  useEffect(() => {
    if (!spaceId || isSuperAdmin) return
    startEscalationReview.mutate()
  }, [spaceId, isSuperAdmin, startEscalationReview])

  const backToProfile = () =>
    navigateBackOrFallback(navigate, `/venues/management/profile/${venueId}`)

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
      current.includes(value) ? current.filter((reason) => reason !== value) : [...current, value],
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

    const payload: UpdateVenueSpaceVisibilityPayload = (() => {
      const reasonPayload = buildSuspendReasonPayload(selectedReasons)
      return modalAction === 'hide'
        ? {
            action: 'hide' as const,
            selectedReasons: reasonPayload.selectedReasons,
            reasonDetails: reasonDetails.trim() || reasonPayload.reasonDetails,
            adminNotes: adminNotes.trim(),
          }
        : {
            action: 'suspend' as const,
            selectedReasons: reasonPayload.selectedReasons,
            suspendIndefinitely,
            startDate: suspendIndefinitely ? undefined : toIso(startDate),
            endDate: suspendIndefinitely ? undefined : toIso(endDate),
            reasonDetails: reasonDetails.trim() || reasonPayload.reasonDetails,
            adminNotes: adminNotes.trim(),
          }
    })()

    const reasonPayload = buildSuspendReasonPayload(selectedReasons)
    if (reasonPayload.selectedReasons.length === 0) {
      toast.error('Selected reasons are no longer available. Please refresh and try again.')
      return
    }

    visibilityMutation.mutate(
      { targetSpaceId: spaceId, payload },
      {
        onSuccess: () => {
          if (reasonPayload.reasonIds.length > 0) {
            recordReasonUsage.mutate(reasonPayload.reasonIds)
          }
          toast.success(
            modalAction === 'hide' ? 'Space hidden successfully' : 'Space suspended successfully',
          )
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
    setDecisionConfirmed(false)
    setSelectedEscalationOption('')
  }

  const openDecisionModal = (variant: DecisionVariant) => {
    resetDecisionModal()
    setDecisionVariant(variant)
    setDecisionModalOpen(true)
  }

  const toggleDecisionReason = (value: string) => {
    setDecisionSelectedReasons((current) =>
      current.includes(value) ? current.filter((reason) => reason !== value) : [...current, value],
    )
  }

  const isDecisionRejectFlow = decisionVariant === 'reject' || decisionVariant === 'requestChanges'

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
      if (decisionVariant === 'reject' && !decisionConfirmed) {
        toast.error('Please confirm the rejection reasons before continuing.')
        return
      }
      if (decisionVariant === 'requestChanges' && !decisionRejectionReason.trim()) {
        toast.error('Please provide request change details.')
        return
      }
    }

    const reasonPayload =
      decisionVariant === 'requestChanges'
        ? buildRequestChangesReasonPayload(decisionSelectedReasons)
        : buildRejectReasonPayload(decisionSelectedReasons)

    if (isDecisionRejectFlow && reasonPayload.selectedReasons.length === 0) {
      toast.error('Selected reasons are no longer available. Please refresh and try again.')
      return
    }

    const payload: UpdateVenueSpaceStatusPayload =
      decisionVariant === 'approve'
        ? { status: 'approved', adminNote: decisionAdminNotes.trim() }
        : {
            status: 'rejected',
            reasonFor: reasonPayload.selectedReasons,
            rejectionReason:
              decisionVariant === 'requestChanges'
                ? decisionRejectionReason.trim() || reasonPayload.reasonDetails
                : reasonPayload.selectedReasons.join(', '),
            adminNote: decisionAdminNotes.trim(),
          }

    spaceStatusMutation.mutate(
      { targetSpaceId: spaceId, payload },
      {
        onSuccess: () => {
          if (isDecisionRejectFlow && reasonPayload.reasonIds.length > 0) {
            recordReasonUsage.mutate(reasonPayload.reasonIds)
          }
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
        <div className="border-brand-accent size-9 animate-spin rounded-full border-4 border-t-transparent" />
      </div>
    )
  }

  if (isError || !fullView) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={backToProfile}
          className="group font-heading hover:text-brand-accent text-h3 flex w-fit items-center gap-2 font-bold text-white transition-colors"
        >
          <ArrowLeft className="size-5" />
          <span>Space Details</span>
        </button>
        <div className="bg-brand-danger/10 text-brand-danger rounded-lg border border-red-500/40 px-4 py-3 text-sm">
          {getApiErrorMessage(error)}
        </div>
      </div>
    )
  }

  const { venue, space, gallery, terms, availability } = fullView.overview
  const summary = fullView.spaces.find((item) => item.spaceId === spaceId)
  const detailSpace = space && String(space._id) === String(spaceId) ? space : null
  const spaceName = detailSpace?.name || summary?.spaceName || 'Space Details'
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
  const addressLine = [location?.address, location?.city, location?.state, location?.pincode]
    .filter(Boolean)
    .join(', ')
  const capacity = detailSpace?.guestLimit ?? detailSpace?.capacityRange ?? summary?.capacity
  const isHidden = Boolean(detailSpace?.isHidden || summary?.isHidden)
  const isSuspended = Boolean(detailSpace?.isSuspend || summary?.isSuspend)
  const spaceStatus = detailSpace?.status ?? summary?.status ?? 'submitted'
  const isDecisionPending = spaceStatus === 'submitted'
  const decisionDisabled = !isDecisionPending || spaceStatusMutation.isPending || !spaceId
  const escalateDisabled = !isDecisionPending || escalateVenueSpace.isPending || !spaceId
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
            className="group font-heading hover:text-brand-accent text-h3 flex w-fit items-center gap-2 font-bold tracking-tight text-white transition-colors"
          >
            <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-1" />
            <span>Space Details</span>
          </button>
          <div className="text-body-sm text-muted flex items-center gap-1.5 pl-7 font-medium">
            <button
              type="button"
              onClick={backToProfile}
              className="transition-colors hover:text-white"
            >
              {venue.name}
            </button>
            <span className="text-muted/40">/</span>
            <span className="font-bold text-white">{spaceName}</span>
          </div>
        </div>

        <TableActionsDropdown
          label="Open space actions"
          isOpen={actionsOpen}
          onOpenChange={setActionsOpen}
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
            onClick={() =>
              navigate(`/venues/management/profile/${venueId}/space/${spaceId}/analytics`)
            }
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
        <div className="text-body-sm rounded-lg border border-amber-400/30 bg-amber-400/10 px-4 py-3 font-semibold text-amber-200">
          This space is currently {isSuspended ? 'suspended' : 'hidden'} and is not visible in
          partner-facing listings.
        </div>
      )}

      <div className="rounded-brand-lg bg-brand-surface relative h-64 w-full overflow-hidden border border-white/5">
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
          <span className="text-body-sm absolute right-3 bottom-3 rounded-md bg-black/70 px-2 py-1 font-medium text-white">
            {imageCount > 1
              ? `${activeImageIndex + 1}/${imageCount}`
              : `${imageCount} photo${imageCount === 1 ? '' : 's'}`}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.25fr_1fr]">
        <Card>
          <p className="text-body-sm text-muted font-semibold">{venue.name}</p>
          <div className="mt-2 flex items-center justify-between gap-3">
            <h1 className="text-xl font-bold text-white">{spaceName}</h1>
            <span className="text-body-md inline-flex items-center gap-1 font-semibold text-white">
              <Star className="fill-brand-accent text-brand-accent size-4" />
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
          <p className="text-body-sm text-brand-positive mt-4 font-semibold">
            Available:{' '}
            <span className="text-white">
              {availability?.weeklyAvailability?.length
                ? availability.weeklyAvailability
                    .map((slot) => `${slot.day} ${slot.from}-${slot.to}`)
                    .join(', ')
                : '—'}
            </span>
          </p>
          <p className="text-body-sm text-brand-danger mt-1 font-semibold">
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
              <MapPin className="text-brand-danger mt-0.5 size-4" />
              <div>
                <p className="text-body-sm font-semibold text-white">
                  {location?.city || summary?.city || '—'}
                </p>
                <p className="text-muted mt-1 text-[10px]">{addressLine || '—'}</p>
              </div>
            </div>
          </Card>

          <Card title="Pricing">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-md bg-black p-3">
                <p className="text-muted text-[10px]">Weekday</p>
                <p className="text-body-sm mt-1 font-bold text-white">
                  {formatCurrency(summary?.weekdayPrice)}
                </p>
              </div>
              <div className="rounded-md bg-black p-3">
                <p className="text-muted text-[10px]">Weekend</p>
                <p className="text-body-sm mt-1 font-bold text-white">
                  {formatCurrency(summary?.weekendPrice)}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.2fr_1fr]">
        <Card title="About the venue">
          <p className="text-body-sm text-muted leading-relaxed">
            {venue.aboutVenue || 'No venue description provided.'}
          </p>
          <h3 className="text-body-sm mt-5 font-bold text-white">Service Included</h3>
          <div className="mt-3 space-y-2">
            <ServiceItem
              label="Parking Available"
              enabled={detailSpace?.parkingAvailable ?? venue.parkingAvailable}
            />
            <ServiceItem
              label="Catering service available"
              enabled={detailSpace?.inHouseCatering ?? venue.inHouseCatering}
            />
            <ServiceItem
              label="Decoration available"
              enabled={detailSpace?.decorationAvailable ?? venue.decorationAvailable}
            />
            <ServiceItem
              label="Accessibility"
              enabled={detailSpace?.accessibility ?? venue.accessibility}
            />
          </div>
        </Card>

        <Card title="Amenities">
          <div className="grid grid-cols-2 gap-3">
            {resolvedAmenities.length > 0 ? (
              resolvedAmenities.map((amenity) => (
                <div
                  key={amenity.id}
                  className="text-body-sm flex items-center gap-2 rounded-md bg-black px-3 py-2 font-semibold text-white"
                  title={amenity.categoryName}
                >
                  {amenity.image ? (
                    <img src={amenity.image} alt="" className="size-4 object-contain" />
                  ) : (
                    <CheckCircle2 className="text-brand-accent size-4" />
                  )}
                  <span className="truncate">{amenity.name}</span>
                </div>
              ))
            ) : (
              <p className="text-body-sm text-muted col-span-2">No amenities listed.</p>
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
                <SafeImage
                  src={image.url}
                  alt={`Gallery ${index + 1}`}
                  className="size-full object-cover"
                />
              </a>
            ))}
          </div>
        ) : (
          <p className="text-body-sm text-muted">No gallery images uploaded.</p>
        )}
      </Card>

      <Card title="Terms & Conditions">
        <div className="flex flex-wrap gap-4">
          {(terms?.terms || []).map((term) => (
            <div key={term} className="text-body-sm text-muted flex items-center gap-2">
              <CheckCircle2 className="text-brand-positive size-3.5" />
              {term}
            </div>
          ))}
          {terms?.cancellation && (
            <div className="text-body-sm text-muted flex items-center gap-2">
              <CheckCircle2 className="text-brand-positive size-3.5" />
              Free cancellation up to {terms.cancellation.freeCancellationHours ?? 0} hrs before
              booking
            </div>
          )}
          {!terms?.terms?.length && !terms?.cancellation && (
            <p className="text-body-sm text-muted">No terms added.</p>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card title="Application Notes">
          <div className="text-body-sm text-muted rounded-md bg-black p-3 leading-relaxed whitespace-pre-wrap">
            {detailSpace?.adminNote || venue.adminInternalNotes || 'No notes yet.'}
            {escalation?.escalatedByName ? (
              <p className="text-body-sm text-muted mt-3">
                Escalated by {escalation.escalatedByName}
                {escalation.escalatedToName ? ` to ${escalation.escalatedToName}` : ''}.
                {escalation.escalationNote ? ` Note: ${escalation.escalationNote}` : ''}
              </p>
            ) : null}
          </div>
        </Card>

        <Card>
          <DecisionControlsHeader className="mb-4" />
          {!isDecisionPending && (
            <p className="text-body-sm text-muted mb-3 rounded-md bg-black px-3 py-2 font-medium">
              This space is currently{' '}
              <span className="font-bold text-white">{spaceStatus || '—'}</span>.
            </p>
          )}
          <DecisionControlButtons
            onApprove={() => openDecisionModal('approve')}
            onRequestChanges={() => openDecisionModal('requestChanges')}
            onEscalate={() => openDecisionModal('escalate')}
            onReject={() => openDecisionModal('reject')}
            showEscalate={isSuperAdmin}
            approveDisabled={decisionDisabled}
            requestChangesDisabled={decisionDisabled}
            escalateDisabled={escalateDisabled}
            rejectDisabled={decisionDisabled}
          />
        </Card>
      </div>

      <DecisionActionModal
        open={decisionModalOpen}
        variant={decisionVariant}
        title={
          decisionVariant === 'approve'
            ? 'Confirm Application'
            : decisionVariant === 'requestChanges'
              ? 'Request Changes'
              : decisionVariant === 'escalate'
                ? 'Escalate Application'
                : 'Reject Application'
        }
        headerDescription={
          decisionVariant === 'reject'
            ? 'This action cannot be reversed. And it will impact the user'
            : undefined
        }
        description={
          decisionVariant === 'approve'
            ? 'Are you sure you want to approve this application? The applicant will be notified via email.'
            : decisionVariant === 'requestChanges'
              ? 'Are you sure you want to Request Changes to this application? The applicant will be notified via email.'
              : decisionVariant === 'escalate'
                ? 'Are you sure you want to escalate this Application? This Post will be reviewed by the selected parties.'
                : 'Please select the reason to ask the user to re-submit the documents and go through verification again'
        }
        submitLabel={
          decisionVariant === 'approve'
            ? 'Confirm Approval'
            : decisionVariant === 'requestChanges'
              ? 'Request Changes'
              : decisionVariant === 'escalate'
                ? 'Escalate'
                : 'Reject Approval'
        }
        submitIcon={decisionVariant === 'reject' ? 'check' : undefined}
        reasonOptions={
          isDecisionRejectFlow
            ? decisionVariant === 'requestChanges'
              ? requestChangesReasonOptions
              : rejectReasonOptions
            : []
        }
        selectedReasons={decisionSelectedReasons}
        onReasonToggle={toggleDecisionReason}
        reason={decisionVariant === 'requestChanges' ? decisionRejectionReason : undefined}
        onReasonChange={
          decisionVariant === 'requestChanges' ? setDecisionRejectionReason : undefined
        }
        reasonLabel="Request Changes"
        showReasonsLabel={isDecisionRejectFlow}
        confirmationLabel={
          decisionVariant === 'reject'
            ? 'I confirm the documents are not approved due to above reasons.'
            : undefined
        }
        confirmationChecked={decisionConfirmed}
        onConfirmationChange={decisionVariant === 'reject' ? setDecisionConfirmed : undefined}
        adminNotes={decisionAdminNotes}
        onAdminNotesChange={setDecisionAdminNotes}
        escalationOptions={isEscalateFlow ? escalationOptions : []}
        selectedEscalationOption={selectedEscalationOption}
        onEscalationOptionChange={setSelectedEscalationOption}
        onClose={() => setDecisionModalOpen(false)}
        onSubmit={handleSubmitDecision}
        isSubmitting={isEscalateFlow ? escalateVenueSpace.isPending : spaceStatusMutation.isPending}
      />

      <DecisionActionModal
        open={Boolean(modalAction)}
        variant="suspend"
        title={modalAction === 'hide' ? 'Hide Space' : 'Suspend Space'}
        headerDescription={
          modalAction === 'hide'
            ? 'Are you sure you want to hide this space? This will prevent it from appearing in partner-facing listings.'
            : 'Are you sure you want to suspend this space? This action will prevent new bookings and notify existing customers.'
        }
        description=""
        submitLabel={modalAction === 'hide' ? 'Hide' : 'Suspend'}
        showHeroIcon={false}
        submitIcon="none"
        reasonOptions={suspendReasonOptions}
        selectedReasons={selectedReasons}
        onReasonToggle={toggleReason}
        showReasonsLabel
        reason={reasonDetails}
        onReasonChange={setReasonDetails}
        reasonLabel="Reasons"
        reasonRequired={false}
        reasonFieldType="input"
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
