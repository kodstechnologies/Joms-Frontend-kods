import type { VenueFormData } from '../utils/venue-form'
import { RequiredMark } from '@/shared/components/form/required-mark'

interface LocationDetailsStepProps {
  venueData: Pick<
    VenueFormData,
    'address' | 'landmark' | 'city' | 'parkingAvailable' | 'accessibility'
  >
  setVenueData: React.Dispatch<React.SetStateAction<VenueFormData>>
}

export const LocationDetailsStep = ({ venueData, setVenueData }: LocationDetailsStepProps) => {
  return (
    <div className="animate-in fade-in slide-in-from-right-4 bg-brand-surface mx-auto w-full max-w-[1140px] rounded-lg border border-white/5 p-6 shadow-xl duration-300">
      <div className="mb-8">
        <h2 className="mb-1 text-[15px] font-bold text-white">Add Venue Location</h2>
        <p className="text-body-sm text-muted font-medium">Provide venue location details</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2.5">
          <label className="text-body-sm font-bold tracking-tight text-white">
            Address <RequiredMark />
          </label>

          <input
            type="text"
            value={venueData.address}
            onChange={(e) =>
              setVenueData((prev) => ({
                ...prev,
                address: e.target.value,
              }))
            }
            className="ui-input"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-2.5">
            <label className="text-body-sm font-bold tracking-tight text-white">Landmark</label>

            <input
              type="text"
              value={venueData.landmark}
              onChange={(e) =>
                setVenueData((prev) => ({
                  ...prev,
                  landmark: e.target.value,
                }))
              }
              className="ui-input"
            />
          </div>

          <div className="space-y-2.5">
            <label className="text-body-sm font-bold tracking-tight text-white">
              City <RequiredMark />
            </label>

            <input
              type="text"
              value={venueData.city}
              onChange={(e) =>
                setVenueData((prev) => ({
                  ...prev,
                  city: e.target.value,
                }))
              }
              className="ui-input"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-sm font-medium text-white">Parking availability</h4>

              <p className="text-muted mt-2 text-xs">Is parking available at your venue?</p>
            </div>

            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={venueData.parkingAvailable}
                onChange={(e) =>
                  setVenueData((prev) => ({
                    ...prev,
                    parkingAvailable: e.target.checked,
                  }))
                }
                className="peer sr-only"
              />

              <div className="relative h-[16px] w-[28px] rounded-full border border-[#3F3F46] bg-black peer-checked:bg-white after:absolute after:top-[2px] after:left-[2px] after:h-[10px] after:w-[10px] after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-[12px] peer-checked:after:bg-black" />
            </label>
          </div>

          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-sm font-medium text-white">Accessibility</h4>

              <p className="text-muted mt-2 text-xs">
                Wheelchair access, lift support, and mobility features.
              </p>
            </div>

            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={venueData.accessibility}
                onChange={(e) =>
                  setVenueData((prev) => ({
                    ...prev,
                    accessibility: e.target.checked,
                  }))
                }
                className="peer sr-only"
              />

              <div className="relative h-[16px] w-[28px] rounded-full border border-[#3F3F46] bg-black peer-checked:bg-white after:absolute after:top-[2px] after:left-[2px] after:h-[10px] after:w-[10px] after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-[12px] peer-checked:after:bg-black" />
            </label>
          </div>
        </div>
        <div className="rounded-lg border border-white/5 bg-black/40 p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Location on Map</h3>

              <p className="text-muted text-xs">Based on the address you provided</p>
            </div>

            <input type="text" placeholder="Search by Location" className="ui-input w-64" />
          </div>

          <div className="text-muted flex h-[220px] items-center justify-center rounded-xl border border-white/10 bg-black">
            Google Map Here
          </div>
        </div>
      </div>
    </div>
  )
}
