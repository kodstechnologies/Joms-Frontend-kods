import { type ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Accessibility,
  ArrowLeft,
  CalendarX,
  CheckCircle2,
  Clock,
  MapPin,
  MoreVertical,
  ParkingCircle,
  Sparkles,
  Star,
  UtensilsCrossed,
} from 'lucide-react'

import { useVenueFullView } from '../../hooks/use-venues'
import type {
  VenueFullView,
  VenueFullViewSpaceSummary,
} from '../../type/venue-full-view'
import { cn } from '@/shared/lib/cn'

const getApiErrorMessage = (error: unknown) => {
  const err = error as { response?: { data?: { message?: string } } }
  return err?.response?.data?.message || 'Unable to load space details.'
}

const formatCurrency = (value?: number | null) => {
  if (value === null || value === undefined) return '—'
  return `₹${value.toLocaleString('en-IN')}`
}

const formatBlockedDate = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
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
    <div
      className={cn('rounded-xl border border-white/5 bg-[#111111] p-5', className)}
    >
      {title && (
        <h3 className="mb-4 text-[13px] font-semibold text-white">{title}</h3>
      )}
      {children}
    </div>
  )
}

function ServiceItem({
  label,
  enabled,
}: {
  label: string
  enabled?: boolean
}) {
  return (
    <div className="flex items-center gap-2 text-[12px]">
      <CheckCircle2
        className={cn('size-4', enabled ? 'text-emerald-500' : 'text-[#555]')}
      />
      <span className={enabled ? 'text-white' : 'text-[#777] line-through'}>
        {label}
      </span>
    </div>
  )
}

function AmenityTile({
  label,
  icon,
}: {
  label: string
  icon: ReactNode
}) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-white/5 bg-black px-3 py-2.5 text-[11px] font-medium text-white">
      <span className="text-[#FBC078]">{icon}</span>
      {label}
    </div>
  )
}

export function SpaceDetailsPage() {
  const navigate = useNavigate()
  const { venueId, spaceId } = useParams<{
    venueId: string
    spaceId: string
  }>()

  const { data, isLoading, isError, error } = useVenueFullView(venueId)
  const fullView = data?.data as VenueFullView | undefined

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="size-9 animate-spin rounded-full border-4 border-[#FBC078] border-t-transparent" />
      </div>
    )
  }

  const backToProfile = () =>
    navigate(`/venues/management/profile/${venueId}`)

  if (isError || !fullView) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={backToProfile}
          className="group flex w-fit items-center gap-2 text-[20px] font-bold text-white transition-colors hover:text-[#FBC078]"
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
  const summary: VenueFullViewSpaceSummary | undefined = fullView.spaces.find(
    (item) => item.spaceId === spaceId,
  )
  const detailSpace = space && space._id === spaceId ? space : null

  const spaceName =
    detailSpace?.name || summary?.spaceName || 'Space Details'

  const galleryImages =
    gallery?.galleryImages?.map((image) => image.url) ??
    venue.venueImages ??
    []
  const coverImage =
    galleryImages[0] || summary?.coverImage || venue.coverImageUrl || null

  const location = detailSpace?.location || venue.location
  const addressLine = [
    location?.address,
    location?.city,
    location?.state,
    location?.pincode,
  ]
    .filter(Boolean)
    .join(', ')

  const weekday = summary?.weekdayPrice ?? null
  const weekend = summary?.weekendPrice ?? null

  const weeklyAvailability =
    detailSpace && availability ? availability.weeklyAvailability ?? [] : summary?.availability?.weeklyAvailability ?? []
  const blockedDates =
    detailSpace && availability ? availability.blockedDates ?? [] : summary?.availability?.blockedDates ?? []

  const capacity =
    detailSpace?.guestLimit ?? detailSpace?.capacityRange ?? summary?.capacity

  return (
    <div className="flex flex-col gap-5">
      <header className="flex items-start justify-between">
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={backToProfile}
            className="group flex w-fit items-center gap-2 text-[20px] font-bold tracking-tight text-white transition-colors hover:text-[#FBC078]"
          >
            <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-1" />
            <span>Space Details</span>
          </button>
          <div className="flex items-center gap-1.5 pl-7 text-[12px] font-medium text-[#777777]">
            <button
              type="button"
              onClick={backToProfile}
              className="transition-colors hover:text-white"
            >
              {venue.name}
            </button>
            <span className="text-[#333333]">/</span>
            <span className="font-bold text-white">{spaceName}</span>
          </div>
        </div>
        <span className="p-1 text-[#777]">
          <MoreVertical className="size-5" />
        </span>
      </header>

      <div className="relative h-56 w-full overflow-hidden rounded-xl border border-white/5 bg-[#1a1a1a]">
        {coverImage && (
          <img
            src={coverImage}
            alt={spaceName}
            className="size-full object-cover"
          />
        )}
        {galleryImages.length > 0 && (
          <span className="absolute bottom-3 right-3 rounded-md bg-black/70 px-2 py-1 text-[11px] font-medium text-white">
            {galleryImages.length} photo{galleryImages.length === 1 ? '' : 's'}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_360px]">
        <Card>
          <p className="text-[11px] text-[#999]">{venue.name}</p>
          <div className="mt-1 flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-white">{spaceName}</h2>
            {venue.ratings !== undefined && (
              <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-white">
                <Star className="size-4 fill-[#FBC078] text-[#FBC078]" />
                {venue.ratings}
              </span>
            )}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {detailSpace?.spaceType && (
              <span className="rounded-md bg-[#FBC078]/15 px-2.5 py-1 text-[11px] font-semibold capitalize text-[#FBC078]">
                {detailSpace.spaceType}
              </span>
            )}
            {detailSpace?.seatingStyle && (
              <span className="rounded-md bg-black px-2.5 py-1 text-[11px] font-semibold text-[#bbb]">
                {detailSpace.seatingStyle}
              </span>
            )}
            {capacity !== undefined && capacity !== null && (
              <span className="rounded-md bg-black px-2.5 py-1 text-[11px] font-semibold text-[#bbb]">
                {typeof capacity === 'number' ? `${capacity} guests` : capacity}
              </span>
            )}
            {detailSpace?.areaSqFeet && (
              <span className="rounded-md bg-black px-2.5 py-1 text-[11px] font-semibold text-[#bbb]">
                {detailSpace.areaSqFeet} sq.ft
              </span>
            )}
          </div>

          <div className="mt-4 space-y-2">
            {weeklyAvailability.length > 0 && (
              <p className="flex items-start gap-2 text-[12px] text-emerald-400">
                <Clock className="mt-0.5 size-3.5 shrink-0" />
                <span>
                  Available:{' '}
                  <span className="text-[#ccc]">
                    {weeklyAvailability
                      .map((slot) => `${slot.day} ${slot.from}-${slot.to}`)
                      .join(', ')}
                  </span>
                </span>
              </p>
            )}
            {blockedDates.length > 0 && (
              <p className="flex items-start gap-2 text-[12px] text-red-400">
                <CalendarX className="mt-0.5 size-3.5 shrink-0" />
                <span>
                  Unavailable:{' '}
                  <span className="text-[#ccc]">
                    {blockedDates
                      .map(
                        (slot) =>
                          `${formatBlockedDate(slot.date)} ${slot.from}-${slot.to}`,
                      )
                      .join(', ')}
                  </span>
                </span>
              </p>
            )}
          </div>
        </Card>

        <div className="flex flex-col gap-5">
          <Card title="Location">
            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0 text-[#FBC078]" />
              <p className="text-[12px] text-[#ccc]">{addressLine || '—'}</p>
            </div>
          </Card>
          <Card title="Pricing">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-white/5 bg-black p-3">
                <p className="text-[10px] text-[#777]">Weekday</p>
                <p className="mt-1 text-[14px] font-bold text-white">
                  {formatCurrency(weekday)}
                </p>
              </div>
              <div className="rounded-lg border border-white/5 bg-black p-3">
                <p className="text-[10px] text-[#777]">Weekend</p>
                <p className="mt-1 text-[14px] font-bold text-white">
                  {formatCurrency(weekend)}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card title="About the venue">
          <p className="text-[12px] leading-relaxed text-[#bbb]">
            {venue.aboutVenue || 'No description provided.'}
          </p>

          <h4 className="mb-3 mt-6 text-[13px] font-semibold text-white">
            Service Included
          </h4>
          <div className="grid grid-cols-2 gap-3">
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
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {(detailSpace?.parkingAvailable ?? venue.parkingAvailable) && (
              <AmenityTile label="Parking" icon={<ParkingCircle className="size-4" />} />
            )}
            {(detailSpace?.inHouseCatering ?? venue.inHouseCatering) && (
              <AmenityTile label="In-house Catering" icon={<UtensilsCrossed className="size-4" />} />
            )}
            {(detailSpace?.decorationAvailable ?? venue.decorationAvailable) && (
              <AmenityTile label="Decoration" icon={<Sparkles className="size-4" />} />
            )}
            {(detailSpace?.accessibility ?? venue.accessibility) && (
              <AmenityTile label="Accessibility" icon={<Accessibility className="size-4" />} />
            )}
          </div>
          {!venue.parkingAvailable &&
            !venue.inHouseCatering &&
            !venue.decorationAvailable &&
            !venue.accessibility && (
              <p className="text-[12px] text-[#777]">No amenities listed.</p>
            )}
        </Card>
      </div>

      {galleryImages.length > 0 && (
        <Card title="Gallery">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {galleryImages.map((src, index) => (
              <a
                key={`${src}-${index}`}
                href={src}
                target="_blank"
                rel="noreferrer"
                className="block aspect-square overflow-hidden rounded-lg border border-white/5"
              >
                <img src={src} alt={`Gallery ${index + 1}`} className="size-full object-cover" />
              </a>
            ))}
          </div>
        </Card>
      )}

      {(terms?.terms?.length || terms?.cancellation) && (
        <Card title="Terms & Conditions">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {terms?.cancellation && (
              <ServiceItem
                label={`Free cancellation up to ${terms.cancellation.freeCancellationHours ?? 0} hrs before booking (${terms.cancellation.refundPercentage ?? 0}% refund)`}
                enabled
              />
            )}
            {terms?.terms?.map((term, index) => (
              <ServiceItem key={`${term}-${index}`} label={term} enabled />
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
