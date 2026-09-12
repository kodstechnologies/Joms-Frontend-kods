import { GoogleMapPicker } from '@/shared/components/map'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'

import { navigateBackOrFallback } from '@/shared/lib/navigation'
import { PageBreadcrumb } from '@/shared/components/navigation/page-breadcrumb'
import { toast } from 'sonner'
import { ArrowLeft, CheckCircle2, MapPin } from 'lucide-react'

import {
  fetchAmenityMasters,
  updateVenueSpaceStatus,
  type UpdateVenueSpaceStatusPayload,
} from '../../api/venue-api'
import { useVenueFullView } from '../../hooks/use-venues'
import type { VenueFullView, VenueFullViewGalleryImage } from '../../type/venue-full-view'
import {
  DecisionControlButtons,
  DecisionControlsHeader,
} from '@/shared/components/decision-controls'
import {
  DecisionActionModal,
  type DecisionActionModalOption,
} from '@/shared/components/modal/decision-action-modal'
import { cn } from '@/shared/lib/cn'
import { useAuthStore } from '@/modules/auth/store/auth-store'
import { MODERATION_CATEGORY_SLUGS } from '@/modules/settings/api/templates-api'
import {
  useModerationReasonOptions,
  useRecordModerationReasonUsage,
} from '@/modules/settings/hooks/use-templates'
import { useVenueManagementControls } from '@/modules/settings/hooks/use-venue-public-settings'
import {
  useAdminEscalation,
  useEscalateVenueSpaceApplication,
  useEscalationAssignees,
  useStartAdminEscalationReview,
} from '@/modules/my-tasks/hooks/use-admin-escalation'
import { apiErrorMessage as getApiErrorMessage } from '@/shared/lib/api-error'
import { SafeImage } from '@/shared/components/media/safe-image'

type DecisionVariant = 'approve' | 'reject' | 'requestChanges' | 'escalate'

type AmenitySubCategory = {
  _id: string
  name: string
  image?: string
  icon?: string
}

type AmenityCategory = {
  _id: string
  category: string
  subCategories?: AmenitySubCategory[]
}

const formatCurrency = (value?: number | null) => {
  if (value === null || value === undefined) return '—'
  return `₹${value.toLocaleString('en-IN')}`
}

function SectionCard({
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

function resolveAmenities(data: VenueFullView, masters: AmenityCategory[]) {
  const categories = new Map(masters.map((category) => [String(category._id), category]))
  const subCategories = new Map<string, AmenitySubCategory & { categoryName?: string }>()

  masters.forEach((category) => {
    category.subCategories?.forEach((subCategory) => {
      subCategories.set(String(subCategory._id), {
        ...subCategory,
        categoryName: category.category,
      })
    })
  })

  return (data.overview.amenities?.amenities || []).flatMap((amenity) => {
    const category = categories.get(String(amenity.categoryId))
    if (Array.isArray(amenity.items) && amenity.items.length) {
      return amenity.items.map((item) => ({
        id: `${amenity.categoryId}-${item._id}`,
        categoryName: amenity.category || category?.category || String(amenity.categoryId),
        name: item.name || String(item._id),
        image: item.image || item.icon || null,
      }))
    }

    return (amenity.subCategoryIds || []).map((subCategoryId) => {
      const id = String(subCategoryId)
      const subCategory = subCategories.get(id)
      return {
        id: `${amenity.categoryId}-${id}`,
        categoryName: category?.category || String(amenity.categoryId),
        name: subCategory?.name || id,
        image: subCategory?.image || subCategory?.icon || null,
      }
    })
  })
}

export function ApplicationDetailsPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [modalVariant, setModalVariant] = useState<DecisionVariant>('approve')
  const [adminNotes, setAdminNotes] = useState('')
  const [selectedReasons, setSelectedReasons] = useState<string[]>([])
  const [rejectionReason, setRejectionReason] = useState('')
  const [decisionConfirmed, setDecisionConfirmed] = useState(false)
  const [selectedEscalationOption, setSelectedEscalationOption] = useState('')

  const user = useAuthStore((state) => state.user)
  const isSuperAdmin = Boolean(user?.isSuperAdmin)
  const { allowApproveVenues } = useVenueManagementControls()

  const { data, isLoading, isError, error } = useVenueFullView(id)
  const { data: amenityMasters } = useQuery({
    queryKey: ['amenities-master'],
    queryFn: fetchAmenityMasters,
  })

  const fullView = data?.data
  const amenities = useMemo(
    () => (fullView ? resolveAmenities(fullView, amenityMasters?.data || []) : []),
    [amenityMasters?.data, fullView],
  )

  const spaceStatusMutation = useMutation({
    mutationFn: ({
      spaceId,
      payload,
    }: {
      spaceId: string
      payload: UpdateVenueSpaceStatusPayload
    }) => updateVenueSpaceStatus(spaceId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venue-full-view', id] })
      queryClient.invalidateQueries({ queryKey: ['venues'] })
      queryClient.invalidateQueries({ queryKey: ['my-tasks'] })
    },
  })

  const resetModal = () => {
    setAdminNotes('')
    setSelectedReasons([])
    setRejectionReason('')
    setDecisionConfirmed(false)
    setSelectedEscalationOption('')
  }

  const spaceId = fullView?.overview?.space?._id
  const { data: assigneesData } = useEscalationAssignees('venues.*')
  const { data: escalationData } = useAdminEscalation('venue_space', spaceId)
  const escalateVenueSpace = useEscalateVenueSpaceApplication(spaceId, id)
  const startEscalationReview = useStartAdminEscalationReview('venue_space', spaceId)
  const recordReasonUsage = useRecordModerationReasonUsage()
  const { options: rejectReasonOptions, buildPayload: buildRejectReasonPayload } =
    useModerationReasonOptions(MODERATION_CATEGORY_SLUGS.rejectVenue)
  const { options: requestChangesReasonOptions, buildPayload: buildRequestChangesReasonPayload } =
    useModerationReasonOptions(MODERATION_CATEGORY_SLUGS.requestChangesVenue)

  useEffect(() => {
    if (!spaceId || isSuperAdmin) return
    startEscalationReview.mutate()
  }, [spaceId, isSuperAdmin, startEscalationReview])

  const openModal = (variant: DecisionVariant) => {
    if (variant === 'approve' && !allowApproveVenues) {
      toast.error('Approving venues is turned off in Venue Management settings')
      return
    }
    resetModal()
    setModalVariant(variant)
    setModalOpen(true)
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
          onClick={() => navigateBackOrFallback(navigate, '/venues/management')}
          className="group font-heading hover:text-brand-accent text-h3 flex w-fit items-center gap-2 font-bold text-white transition-colors"
        >
          <ArrowLeft className="size-5" />
          <span>Venue Application View</span>
        </button>
        <div className="bg-brand-danger/10 text-brand-danger rounded-lg border border-red-500/40 px-4 py-3 text-sm">
          {getApiErrorMessage(error)}
        </div>
      </div>
    )
  }

  const { venue, space, gallery, terms } = fullView.overview
  const summary = fullView.spaces[0]
  const galleryImages: VenueFullViewGalleryImage[] = [
    ...(gallery?.venueCoverImages || []),
    ...(gallery?.spaceCoverImages || []),
    ...(gallery?.galleryImages || []),
  ]
  const coverImage =
    gallery?.venueCoverImages?.[0]?.url ||
    venue.coverImageUrl ||
    gallery?.galleryImages?.[0]?.url ||
    null
  const address = [
    venue.location?.address,
    venue.location?.landmark,
    venue.location?.city,
    venue.location?.state,
    venue.location?.pincode,
    venue.location?.country,
  ]
    .filter(Boolean)
    .join(', ')
  const serviceIncluded = [
    venue.parkingAvailable ? 'Parking Available' : null,
    venue.inHouseCatering ? 'Catering service available' : null,
    venue.decorationAvailable ? 'Decoration available' : null,
    venue.accessibility ? 'Accessibility' : null,
  ].filter(Boolean)

  const isRejectFlow = modalVariant === 'reject' || modalVariant === 'requestChanges'
  const isEscalateFlow = modalVariant === 'escalate'
  const escalation = escalationData?.data
  const escalationOptions: DecisionActionModalOption[] =
    assigneesData?.data.map((assignee) => ({
      label: assignee.fullname,
      value: assignee.id,
    })) || []
  const escalateDisabled =
    space?.status === 'approved' || escalateVenueSpace.isPending || !space?._id

  const handleSubmitDecision = () => {
    if (isEscalateFlow) {
      if (!space?._id) {
        toast.error('No space found for this venue.')
        return
      }
      if (!selectedEscalationOption) {
        toast.error('Please select a sub-admin to assign.')
        return
      }
      if (!adminNotes.trim()) {
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
          adminNote: adminNotes.trim(),
          venueId: id,
          applicationUrl: `/venues/management/application/${id}`,
          entityTitle: space?.name || venue.name,
        },
        {
          onSuccess: () => {
            toast.success('Application assigned successfully')
            setModalOpen(false)
          },
          onError: (err) => toast.error(getApiErrorMessage(err)),
        },
      )
      return
    }

    const spaceId = space?._id
    if (!spaceId) {
      toast.error('No space found for this venue.')
      return
    }
    if (!adminNotes.trim()) {
      toast.error('Admin notes are required.')
      return
    }
    if (isRejectFlow) {
      if (selectedReasons.length === 0) {
        toast.error('Please select at least one reason.')
        return
      }
      if (modalVariant === 'reject' && !decisionConfirmed) {
        toast.error('Please confirm the rejection reasons before continuing.')
        return
      }
      if (modalVariant === 'requestChanges' && !rejectionReason.trim()) {
        toast.error('Please provide request change details.')
        return
      }
    }

    const reasonPayload =
      modalVariant === 'requestChanges'
        ? buildRequestChangesReasonPayload(selectedReasons)
        : buildRejectReasonPayload(selectedReasons)

    if (isRejectFlow && reasonPayload.selectedReasons.length === 0) {
      toast.error('Selected reasons are no longer available. Please refresh and try again.')
      return
    }

    const payload: UpdateVenueSpaceStatusPayload =
      modalVariant === 'approve'
        ? { status: 'approved', adminNote: adminNotes.trim() }
        : {
            status: 'rejected',
            reasonFor: reasonPayload.selectedReasons,
            rejectionReason:
              modalVariant === 'requestChanges'
                ? rejectionReason.trim() || reasonPayload.reasonDetails
                : reasonPayload.selectedReasons.join(', '),
            adminNote: adminNotes.trim(),
          }

    spaceStatusMutation.mutate(
      { spaceId, payload },
      {
        onSuccess: () => {
          if (isRejectFlow && reasonPayload.reasonIds.length > 0) {
            recordReasonUsage.mutate(reasonPayload.reasonIds)
          }
          toast.success(
            modalVariant === 'approve'
              ? 'Space approved successfully'
              : modalVariant === 'requestChanges'
                ? 'Resubmission requested successfully'
                : 'Space rejected successfully',
          )
          setModalOpen(false)
        },
        onError: (err) => toast.error(getApiErrorMessage(err)),
      },
    )
  }

  return (
    <div className="mx-auto flex max-w-[1120px] flex-col gap-5">
      <header className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => navigateBackOrFallback(navigate, '/venues/management')}
          className="group font-heading hover:text-brand-accent text-h3 flex w-fit items-center gap-2 font-bold tracking-tight text-white transition-colors"
        >
          <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-1" />
          <span>Venue Application View</span>
        </button>
        <div className="pl-7">
          <PageBreadcrumb
            items={[
              { label: 'Venue Management', to: '/venues/management' },
              { label: 'Manage Venues', to: '/venues/management' },
              { label: venue.venueType || venue.name, isActive: true },
            ]}
          />
        </div>
      </header>

      <div className="rounded-brand-lg bg-brand-surface overflow-hidden border border-white/5">
        <SafeImage src={coverImage} alt={venue.name} className="h-64 w-full object-cover" />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.25fr_1fr]">
        <SectionCard>
          <p className="text-body-sm text-muted font-semibold">{venue.pocName || venue.name}</p>
          <h1 className="mt-2 text-xl font-bold text-white">{space?.name || venue.name}</h1>
          <div className="mt-3 flex flex-wrap gap-2">
            <Chip>{venue.venueType || 'Venue'}</Chip>
            <Chip>{space?.spaceType || 'Space'}</Chip>
            <Chip>{space?.guestLimit ? `${space.guestLimit} Guests` : 'Capacity —'}</Chip>
          </div>
        </SectionCard>

        <div className="grid grid-cols-1 gap-5">
          <SectionCard title="Location">
            <div className="mb-3 flex items-start gap-3 rounded-md bg-black p-3">
              <MapPin className="text-brand-danger mt-0.5 size-4" />
              <div>
                <p className="text-body-sm font-semibold text-white">
                  {venue.location?.city || summary?.city || '—'}
                </p>
                <p className="text-muted mt-1 text-[10px]">{address || '—'}</p>
              </div>
            </div>
            {venue.location && (
              <GoogleMapPicker
                latitude={venue.location.latitude}
                longitude={venue.location.longitude}
                address={venue.location.address}
                city={venue.location.city}
                landmark={venue.location.landmark}
                height="200px"
                readOnly={true}
                showSearch={false}
              />
            )}
          </SectionCard>

          <SectionCard title="Pricing">
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
          </SectionCard>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.2fr_1fr]">
        <SectionCard title="About the venue">
          <p className="text-body-sm text-muted leading-relaxed">
            {venue.aboutVenue || 'No venue description provided.'}
          </p>
          <h3 className="text-body-sm mt-5 font-bold text-white">Service Included</h3>
          <div className="mt-3 space-y-2">
            {serviceIncluded.length > 0 ? (
              serviceIncluded.map((service) => (
                <div key={service} className="text-body-sm text-muted flex items-center gap-2">
                  <CheckCircle2 className="text-brand-positive size-3.5" />
                  {service}
                </div>
              ))
            ) : (
              <p className="text-body-sm text-muted">No services listed.</p>
            )}
          </div>
        </SectionCard>

        <SectionCard title="Amenities">
          <div className="grid grid-cols-2 gap-3">
            {amenities.length > 0 ? (
              amenities.map((amenity) => (
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
        </SectionCard>
      </div>

      <SectionCard title="Gallery">
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
      </SectionCard>

      <SectionCard title="Terms & Conditions">
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
              Free cancellation up to {terms.cancellation.freeCancellationHours ?? 0} days before
              event
              {terms.cancellation.feeType === 'no_fee'
                ? ' · no cancellation fee'
                : terms.cancellation.feeType === 'custom'
                  ? ` · custom fee ₹${terms.cancellation.feeCustomAmount ?? 0}`
                  : terms.cancellation.feePercent != null
                    ? ` · ${terms.cancellation.feePercent}% cancellation fee`
                    : terms.cancellation.refundPercentage != null
                      ? ` · ${terms.cancellation.refundPercentage}% refund after free window`
                      : ''}
            </div>
          )}
          {!terms?.terms?.length && !terms?.cancellation && (
            <p className="text-body-sm text-muted">No terms added.</p>
          )}
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <SectionCard title="Application Notes">
          <div className="text-body-sm text-muted rounded-md bg-black p-3">
            {venue.adminInternalNotes || space?.adminNote || 'No notes yet.'}
            {escalation?.escalatedByName ? (
              <p className="text-body-sm text-muted mt-3">
                Escalated by {escalation.escalatedByName}
                {escalation.escalatedToName ? ` to ${escalation.escalatedToName}` : ''}.
                {escalation.escalationNote ? ` Note: ${escalation.escalationNote}` : ''}
              </p>
            ) : null}
          </div>
        </SectionCard>

        <SectionCard>
          <DecisionControlsHeader className="mb-4" />
          {space?.status !== 'submitted' && (
            <p className="text-body-sm text-muted mb-3 rounded-md bg-black px-3 py-2 font-medium">
              This space is currently{' '}
              <span className="font-bold text-white">{space?.status || '—'}</span>.
            </p>
          )}
          <DecisionControlButtons
            onApprove={() => openModal('approve')}
            onRequestChanges={() => openModal('requestChanges')}
            onEscalate={() => openModal('escalate')}
            onReject={() => openModal('reject')}
            showEscalate
            approveDisabled={spaceStatusMutation.isPending || !space?._id || !allowApproveVenues}
            requestChangesDisabled={spaceStatusMutation.isPending || !space?._id}
            escalateDisabled={escalateDisabled}
            rejectDisabled={spaceStatusMutation.isPending || !space?._id}
          />
        </SectionCard>
      </div>

      <DecisionActionModal
        open={modalOpen}
        variant={modalVariant}
        title={
          modalVariant === 'approve'
            ? 'Confirm Application'
            : modalVariant === 'requestChanges'
              ? 'Request Changes'
              : modalVariant === 'escalate'
                ? 'Escalate Application'
                : 'Reject Application'
        }
        headerDescription={
          modalVariant === 'reject'
            ? 'This action cannot be reversed. And it will impact the user'
            : undefined
        }
        description={
          modalVariant === 'approve'
            ? 'Are you sure you want to approve this application? The applicant will be notified via email.'
            : modalVariant === 'requestChanges'
              ? 'Are you sure you want to Request Changes to this application? The applicant will be notified via email.'
              : modalVariant === 'escalate'
                ? 'Are you sure you want to escalate this Application? This Post will be reviewed by the selected parties.'
                : 'Please select the reason to ask the user to re-submit the documents and go through verification again'
        }
        submitLabel={
          modalVariant === 'approve'
            ? 'Confirm Approval'
            : modalVariant === 'requestChanges'
              ? 'Request Changes'
              : modalVariant === 'escalate'
                ? 'Escalate'
                : 'Reject Approval'
        }
        submitIcon={modalVariant === 'reject' ? 'check' : undefined}
        reasonOptions={
          isRejectFlow
            ? modalVariant === 'requestChanges'
              ? requestChangesReasonOptions
              : rejectReasonOptions
            : []
        }
        selectedReasons={selectedReasons}
        onReasonToggle={(value) =>
          setSelectedReasons((current) =>
            current.includes(value)
              ? current.filter((reason) => reason !== value)
              : [...current, value],
          )
        }
        reason={modalVariant === 'requestChanges' ? rejectionReason : undefined}
        onReasonChange={modalVariant === 'requestChanges' ? setRejectionReason : undefined}
        reasonLabel="Request Changes"
        showReasonsLabel={isRejectFlow}
        confirmationLabel={
          modalVariant === 'reject'
            ? 'I confirm the documents are not approved due to above reasons.'
            : undefined
        }
        confirmationChecked={decisionConfirmed}
        onConfirmationChange={modalVariant === 'reject' ? setDecisionConfirmed : undefined}
        adminNotes={adminNotes}
        onAdminNotesChange={setAdminNotes}
        escalationOptions={isEscalateFlow ? escalationOptions : []}
        selectedEscalationOption={selectedEscalationOption}
        onEscalationOptionChange={setSelectedEscalationOption}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmitDecision}
        isSubmitting={isEscalateFlow ? escalateVenueSpace.isPending : spaceStatusMutation.isPending}
      />
    </div>
  )
}
