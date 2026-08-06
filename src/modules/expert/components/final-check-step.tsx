import { useState } from 'react'
import { MapPin, ParkingCircle, Accessibility, Wifi, Camera, X } from 'lucide-react'

import type { BlockedDateEntry, VenueFormData, WeeklyAvailabilityEntry } from '../utils/venue-form'

interface FinalCheckStepProps {
  venueData: VenueFormData
}

const GalleryPreviewModal = ({
  url,
  title,
  onClose,
}: {
  url: string
  title: string
  onClose: () => void
}) => (
  <div
    className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4"
    onClick={onClose}
  >
    <div
      className="ui-modal-shell flex max-h-[90vh] w-full max-w-4xl flex-col"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="ui-modal-header shrink-0">
        <h2 className="truncate text-lg font-semibold text-white">{title}</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close preview"
          className="hover:text-brand-accent text-white transition-colors"
        >
          <X className="size-5" />
        </button>
      </div>

      <div className="ui-modal-body min-h-0 overflow-auto">
        <img src={url} alt={title} className="mx-auto max-h-[70vh] w-full object-contain" />
      </div>
    </div>
  </div>
)

export const FinalCheckStep = ({ venueData }: FinalCheckStepProps) => {
  const [previewItem, setPreviewItem] = useState<{ url: string; title: string } | null>(null)
  const services = [
    {
      label: 'Parking Available',
      enabled: venueData.parkingAvailable,
      icon: ParkingCircle,
    },
    {
      label: 'Accessibility',
      enabled: venueData.accessibility,
      icon: Accessibility,
    },
    {
      label: 'Catering Available',
      enabled: venueData.inHouseCatering,
      icon: Wifi,
    },
    {
      label: 'Decoration Available',
      enabled: venueData.decorationAvailable,
      icon: Camera,
    },
  ]

  const coverSrc = venueData.venueCoverImage
    ? URL.createObjectURL(venueData.venueCoverImage)
    : venueData.venueImage
      ? URL.createObjectURL(venueData.venueImage)
      : venueData.venueCoverImageUrl || venueData.venueImageUrl || ''

  const availableDays = (venueData.weeklyAvailability || []).filter(
    (day: WeeklyAvailabilityEntry) => day.enabled,
  )
  const blockedDates: BlockedDateEntry[] = venueData.blockedDates || []

  const summariseAvailability = () => {
    if (availableDays.length === 0) return 'No availability set'
    const first = availableDays[0]
    const sameTime = availableDays.every(
      (d: WeeklyAvailabilityEntry) => d.from === first.from && d.to === first.to,
    )
    const dayList = availableDays.map((d: WeeklyAvailabilityEntry) => d.day.slice(0, 3)).join(', ')
    return sameTime
      ? `${dayList}, ${first.from} - ${first.to}`
      : availableDays
          .map((d: WeeklyAvailabilityEntry) => `${d.day.slice(0, 3)} ${d.from}-${d.to}`)
          .join(', ')
  }

  return (
    <>
      {previewItem && (
        <GalleryPreviewModal
          url={previewItem.url}
          title={previewItem.title}
          onClose={() => setPreviewItem(null)}
        />
      )}

      <div className="mx-auto w-full max-w-[1140px] space-y-6">
        <div className="bg-brand-surface overflow-hidden rounded-xl border border-white/10">
          {coverSrc ? (
            <img src={coverSrc} alt="Venue" className="h-[420px] w-full object-cover" />
          ) : (
            <div className="text-muted flex h-[420px] w-full items-center justify-center text-sm">
              No cover image uploaded
            </div>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          <div className="bg-brand-surface rounded-xl border border-white/10 p-6">
            <p className="text-muted mb-2 text-xs">{venueData.venueType || 'Indoor'}</p>

            <h2 className="text-3xl font-bold text-white">{venueData.venueName || 'Venue Name'}</h2>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="bg-brand-accent/30 text-brand-text-dark rounded-full px-3 py-1 text-xs">
                {venueData.spaceName || 'Space'}
              </span>

              <span className="bg-brand-accent text-brand-text-dark rounded-full px-3 py-1 text-xs">
                Premium
              </span>

              <span className="rounded-full bg-[#8EE69B] px-3 py-1 text-xs text-black">
                {venueData.spaceType || 'Venue'}
              </span>

              <span className="rounded-full bg-black px-3 py-1 text-xs text-white">
                {venueData.guestCount || '0'} Seating
              </span>

              <span className="rounded-full bg-black px-3 py-1 text-xs text-white">
                {venueData.areaSqFt || '0'} sq ft
              </span>
            </div>

            <p className="text-muted mt-5 text-sm leading-6">
              {venueData.aboutVenue || 'No description available'}
            </p>

            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-brand-positive font-semibold">Available:</span>
                <span className="text-white">{summariseAvailability()}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-brand-accent font-semibold">Unavailable:</span>
                <span className="text-white">
                  {blockedDates.length > 0
                    ? blockedDates
                        .map(
                          (d: BlockedDateEntry) => `${d.date}${d.from ? ` ${d.from}-${d.to}` : ''}`,
                        )
                        .join(', ')
                    : 'None'}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-brand-surface rounded-xl border border-white/10 p-5">
              <h3 className="mb-3 text-sm font-semibold text-white">Location</h3>

              <div className="flex items-start gap-3 rounded-lg bg-black p-4">
                <MapPin className="text-brand-accent mt-1 h-4 w-4" />

                <div>
                  <p className="text-sm text-white">{venueData.address}</p>

                  <p className="text-muted text-xs">
                    {venueData.landmark} {venueData.city}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-brand-surface rounded-xl border border-white/10 p-5">
              <h3 className="mb-4 text-lg font-semibold text-white">Pricing</h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-black p-4">
                  <p className="text-muted text-xs">Weekday</p>

                  <p className="mt-1 text-lg font-semibold text-white">
                    ₹ {venueData.weekdayPrice || '-'}
                  </p>
                </div>

                <div className="rounded-lg bg-black p-4">
                  <p className="text-muted text-xs">Weekend</p>

                  <p className="mt-1 text-lg font-semibold text-white">
                    ₹ {venueData.weekendPrice || '-'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="bg-brand-surface rounded-xl border border-white/10 p-6">
            <h3 className="mb-4 text-lg font-semibold text-white">About Venue</h3>

            <p className="text-muted text-sm leading-6">
              {venueData.aboutVenue || 'No venue description available'}
            </p>

            <div className="mt-6">
              <h4 className="mb-3 text-sm font-semibold text-white">Services Included</h4>

              <div className="space-y-3">
                {services
                  .filter((service) => service.enabled)
                  .map((service) => {
                    const Icon = service.icon

                    return (
                      <div key={service.label} className="flex items-center gap-3">
                        <Icon className="text-brand-accent h-4 w-4" />

                        <span className="text-muted text-sm">{service.label}</span>
                      </div>
                    )
                  })}
              </div>
            </div>
          </div>

          <div className="bg-brand-surface rounded-xl border border-white/10 p-6">
            <h3 className="mb-6 text-xl font-semibold text-white">Amenities</h3>

            <div className="grid grid-cols-3 gap-3">
              {venueData.amenities?.map((item, index) => (
                <div
                  key={index}
                  className="bg-brand-bg flex h-[42px] items-center justify-center gap-2 rounded-lg border border-white/10 px-3"
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-4 w-4 object-contain invert"
                      style={{
                        backgroundColor: 'white',
                        borderRadius: '4px',
                        padding: '2px',
                      }}
                    />
                  ) : (
                    <div className="h-5 w-5" />
                  )}

                  <span className="text-sm font-medium text-white">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-brand-surface rounded-xl border border-white/10 p-6">
            <h3 className="mb-5 text-lg font-semibold text-white">
              Gallery ({venueData.galleryPreviews.length})
            </h3>

            {venueData.galleryPreviews.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {venueData.galleryPreviews.map((preview, index) => (
                  <button
                    key={`${preview}-${index}`}
                    type="button"
                    onClick={() =>
                      setPreviewItem({
                        url: preview,
                        title: `Gallery image ${index + 1}`,
                      })
                    }
                    className="hover:border-brand-accent/40 size-16 overflow-hidden rounded-md border border-white/10 transition-colors"
                  >
                    <img
                      src={preview}
                      alt={`Gallery ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-muted text-xs">No gallery images uploaded.</p>
            )}
          </div>

          <div className="bg-brand-surface rounded-xl border border-white/10 p-6">
            <h3 className="mb-5 text-sm font-semibold text-white">Terms & Conditions</h3>

            <div className="text-muted flex flex-wrap items-center gap-6 text-xs">
              {(venueData.terms || '')
                .split('\n')
                .filter(Boolean)
                .map((term: string, index: number) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="bg-brand-positive h-2 w-2 rounded-full" />

                    <span>{term}</span>
                  </div>
                ))}
            </div>

            <div className="mt-5 text-center">
              <button type="button" className="text-muted text-xs underline">
                View Full Terms & Conditions
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
