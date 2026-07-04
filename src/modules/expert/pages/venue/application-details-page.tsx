import { useMemo, useState, type ReactNode } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowLeft, CheckCircle2, ImageOff, MapPin, XCircle } from 'lucide-react'

import {
  fetchAmenityMasters,
  updateVenueSpaceStatus,
  type UpdateVenueSpaceStatusPayload,
} from '../../api/venue-api'
import { useVenueFullView } from '../../hooks/use-venues'
import type { VenueFullView, VenueFullViewGalleryImage } from '../../type/venue-full-view'
import {
  DecisionActionModal,
  type DecisionActionModalOption,
} from '@/shared/components/modal/decision-action-modal'
import { cn } from '@/shared/lib/cn'

type DecisionVariant = 'approve' | 'reject' | 'requestChanges'

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

export function ApplicationDetailsPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [modalVariant, setModalVariant] = useState<DecisionVariant>('approve')
  const [adminNotes, setAdminNotes] = useState('')
  const [selectedReasons, setSelectedReasons] = useState<string[]>([])
  const [rejectionReason, setRejectionReason] = useState('')

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
    },
  })

  const resetModal = () => {
    setAdminNotes('')
    setSelectedReasons([])
    setRejectionReason('')
  }

  const openModal = (variant: DecisionVariant) => {
    resetModal()
    setModalVariant(variant)
    setModalOpen(true)
  }

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="size-9 animate-spin rounded-full border-4 border-[#FBC078] border-t-transparent" />
      </div>
    )
  }

  if (isError || !fullView) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => navigate('/venues/management')}
          className="group flex w-fit items-center gap-2 font-heading text-[20px] font-bold text-white transition-colors hover:text-[#FBC078]"
        >
          <ArrowLeft className="size-5" />
          <span>Venue Application View</span>
        </button>
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-400">
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

  const isRejectFlow =
    modalVariant === 'reject' || modalVariant === 'requestChanges'

  const handleSubmitDecision = () => {
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
      if (!rejectionReason.trim()) {
        toast.error('Please provide a rejection reason.')
        return
      }
    }

    const payload: UpdateVenueSpaceStatusPayload =
      modalVariant === 'approve'
        ? { status: 'approved', adminNote: adminNotes.trim() }
        : {
          status: 'rejected',
          reasonFor: selectedReasons,
          rejectionReason: rejectionReason.trim(),
          adminNote: adminNotes.trim(),
        }

    spaceStatusMutation.mutate(
      { spaceId, payload },
      {
        onSuccess: () => {
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
          onClick={() => navigate('/venues/management')}
          className="group flex w-fit items-center gap-2 font-heading text-[20px] font-bold tracking-tight text-white transition-colors hover:text-[#FBC078]"
        >
          <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-1" />
          <span>Venue Application View</span>
        </button>
        <div className="flex items-center gap-1.5 pl-7 text-[12px] font-medium text-[#777777]">
          <button
            type="button"
            onClick={() => navigate('/venues/management')}
            className="transition-colors hover:text-white"
          >
            Event Management
          </button>
          <span className="text-[#333333]">/</span>
          <span className="font-bold text-white">{venue.venueType || venue.name}</span>
        </div>
      </header>

      <div className="overflow-hidden rounded-lg border border-white/5 bg-[#111111]">
        <SafeImage src={coverImage} alt={venue.name} className="h-64 w-full object-cover" />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.25fr_1fr]">
        <SectionCard>
          <p className="text-[11px] font-semibold text-[#777]">
            {venue.pocName || venue.name}
          </p>
          <h1 className="mt-2 text-xl font-bold text-white">{space?.name || venue.name}</h1>
          <div className="mt-3 flex flex-wrap gap-2">
            <Chip>{venue.venueType || 'Venue'}</Chip>
            <Chip>{space?.spaceType || 'Space'}</Chip>
            <Chip>{space?.guestLimit ? `${space.guestLimit} Guests` : 'Capacity —'}</Chip>
          </div>
        </SectionCard>

        <div className="grid grid-cols-1 gap-5">
          <SectionCard title="Location">
            <div className="flex items-start gap-3 rounded-md bg-black p-3">
              <MapPin className="mt-0.5 size-4 text-red-400" />
              <div>
                <p className="text-[12px] font-semibold text-white">
                  {venue.location?.city || summary?.city || '—'}
                </p>
                <p className="mt-1 text-[10px] text-[#777]">{address || '—'}</p>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Pricing">
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
          </SectionCard>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.2fr_1fr]">
        <SectionCard title="About the venue">
          <p className="text-[12px] leading-relaxed text-[#aaa]">
            {venue.aboutVenue || 'No venue description provided.'}
          </p>
          <h3 className="mt-5 text-[12px] font-bold text-white">Service Included</h3>
          <div className="mt-3 space-y-2">
            {serviceIncluded.length > 0 ? (
              serviceIncluded.map((service) => (
                <div key={service} className="flex items-center gap-2 text-[12px] text-[#bbb]">
                  <CheckCircle2 className="size-3.5 text-emerald-400" />
                  {service}
                </div>
              ))
            ) : (
              <p className="text-[12px] text-[#777]">No services listed.</p>
            )}
          </div>
        </SectionCard>

        <SectionCard title="Amenities">
          <div className="grid grid-cols-2 gap-3">
            {amenities.length > 0 ? (
              amenities.map((amenity) => (
                <div
                  key={amenity.id}
                  className="flex items-center gap-2 rounded-md bg-black px-3 py-2 text-[11px] font-semibold text-white"
                  title={amenity.categoryName}
                >
                  {amenity.image ? (
                    <img src={amenity.image} alt="" className="size-4 object-contain" />
                  ) : (
                    <CheckCircle2 className="size-4 text-[#FBC078]" />
                  )}
                  <span className="truncate">{amenity.name}</span>
                </div>
              ))
            ) : (
              <p className="col-span-2 text-[12px] text-[#777]">No amenities listed.</p>
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
          <p className="text-[12px] text-[#777]">No gallery images uploaded.</p>
        )}
      </SectionCard>

      <SectionCard title="Terms & Conditions">
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
              Free cancellation up to {terms.cancellation.freeCancellationHours ?? 0} days before event
            </div>
          )}
          {!terms?.terms?.length && !terms?.cancellation && (
            <p className="text-[12px] text-[#777]">No terms added.</p>
          )}
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <SectionCard title="Application Notes">
          <div className="rounded-md bg-black p-3 text-[12px] text-[#777]">
            {venue.adminInternalNotes || space?.adminNote || 'No notes yet.'}
          </div>
        </SectionCard>

        <SectionCard title="Decision Controls">
          {space?.status !== 'submitted' && (
            <p className="mb-3 rounded-md bg-black px-3 py-2 text-[11px] font-medium text-[#999]">
              This space is currently <span className="font-bold text-white">{space?.status || '—'}</span>.
            </p>
          )}
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => openModal('approve')}
              disabled={spaceStatusMutation.isPending || !space?._id}
              className="flex items-center gap-1.5 rounded-md bg-[#00B761] px-4 py-2.5 text-[11px] font-bold text-white transition-colors hover:bg-[#08a85d] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Approve
              <CheckCircle2 className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => openModal('requestChanges')}
              disabled={spaceStatusMutation.isPending || !space?._id}
              className="rounded-md bg-[#FBC078] px-4 py-2.5 text-[11px] font-bold text-black transition-colors hover:bg-[#eeb46a] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Ask for Re-Submit
            </button>
            <button
              type="button"
              onClick={() => toast.message('Escalate is coming soon')}
              className="rounded-md bg-[#1D4ED8] px-4 py-2.5 text-[11px] font-bold text-white transition-colors hover:bg-[#1e40af]"
            >
              Escalate
            </button>
            <button
              type="button"
              onClick={() => openModal('reject')}
              disabled={spaceStatusMutation.isPending || !space?._id}
              className="flex items-center gap-1.5 rounded-md bg-[#F02D2D] px-4 py-2.5 text-[11px] font-bold text-white transition-colors hover:bg-[#d92727] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Reject Application
              <XCircle className="size-3.5" />
            </button>
          </div>
        </SectionCard>
      </div>

      <DecisionActionModal
        open={modalOpen}
        variant={modalVariant}
        title={
          modalVariant === 'approve'
            ? 'Approve Space'
            : modalVariant === 'requestChanges'
              ? 'Request Changes'
              : 'Reject Space'
        }
        description={
          modalVariant === 'approve'
            ? 'Are you sure you want to approve this venue space?'
            : modalVariant === 'requestChanges'
              ? 'Are you sure you want to Request Changes to this application? The applicant will be notified via email.'
              : 'Please choose the rejection reasons and add notes for this venue space.'
        }
        submitLabel={
          modalVariant === 'approve'
            ? 'Approve'
            : modalVariant === 'requestChanges'
              ? 'Request Changes'
              : 'Reject'
        }
        reasonOptions={isRejectFlow ? REJECT_REASONS : []}
        selectedReasons={selectedReasons}
        onReasonToggle={(value) =>
          setSelectedReasons((current) =>
            current.includes(value)
              ? current.filter((reason) => reason !== value)
              : [...current, value],
          )
        }
        reason={isRejectFlow ? rejectionReason : undefined}
        onReasonChange={isRejectFlow ? setRejectionReason : undefined}
        adminNotes={adminNotes}
        onAdminNotesChange={setAdminNotes}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmitDecision}
        isSubmitting={spaceStatusMutation.isPending}
      />
    </div>
  )
}
