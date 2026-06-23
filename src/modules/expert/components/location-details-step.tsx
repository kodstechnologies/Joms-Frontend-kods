interface LocationDetailsStepProps {
  venueData: {
    address: string
    landmark: string
    city: string
    parkingAvailable: boolean
    accessibility: boolean
  }
  setVenueData: React.Dispatch<React.SetStateAction<any>>
}

export const LocationDetailsStep = ({
  venueData,
  setVenueData,
}: LocationDetailsStepProps) => {
  return (
    <div className="mx-auto max-w-5xl">
  <div className="animate-in fade-in slide-in-from-right-4 duration-300 rounded-2xl border border-slate-800 bg-[#121212] p-8">
      <div className="mb-8">
        <h2 className="mb-1 text-[18px] font-bold text-white">
          Add Venue Location
        </h2>

        <p className="text-[14px] font-medium text-[#888888]">
          Provide venue location details
        </p>
      </div>

      <div className="space-y-6">
        {/* Address */}
        <div className="space-y-2.5">
          <label className="text-[14px] font-bold text-white">
            Address *
          </label>

          <input
            type="text"
            value={venueData.address}
            onChange={(e) =>
              setVenueData((prev: any) => ({
                ...prev,
                address: e.target.value,
              }))
            }
            className="w-full rounded-xl border border-white/10 outline-none focus:border-[#F5C37A] bg-black p-4 text-white"
          />
        </div>

        {/* Landmark & City */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-2.5">
            <label className="text-[14px] font-bold text-white">
              Landmark
            </label>

            <input
              type="text"
              value={venueData.landmark}
              onChange={(e) =>
                setVenueData((prev: any) => ({
                  ...prev,
                  landmark: e.target.value,
                }))
              }
              className="w-full rounded-xl border border-white/10 bg-black p-4 text-white outline-none focus:border-[#F5C37A]"
            />
          </div>

          <div className="space-y-2.5">
            <label className="text-[14px] font-bold text-white">
              City *
            </label>

            <input
              type="text"
              value={venueData.city}
              onChange={(e) =>
                setVenueData((prev: any) => ({
                  ...prev,
                  city: e.target.value,
                }))
              }
              className="w-full rounded-xl border border-white/10 bg-black p-4 text-white outline-none focus:border-[#F5C37A]"
            />
          </div>
        </div>

        {/* Parking & Accessibility */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-sm font-medium text-white">
                Parking availability
              </h4>

              <p className="mt-2 text-xs text-slate-500">
                Is parking available at your venue?
              </p>
            </div>

            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={venueData.parkingAvailable}
                onChange={(e) =>
                  setVenueData((prev: any) => ({
                    ...prev,
                    parkingAvailable: e.target.checked,
                  }))
                }
                className="peer sr-only"
              />

              <div
  className="
    relative h-[16px] w-[28px]
    rounded-full
    bg-black
    border border-[#3F3F46]
    after:absolute
    after:left-[2px]
    after:top-[2px]
    after:h-[10px]
    after:w-[10px]
    after:rounded-full
    after:bg-white
    after:transition-all
    peer-checked:bg-white
    peer-checked:after:bg-black
    peer-checked:after:translate-x-[12px]
  "
/>
            </label>
          </div>

          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-sm font-medium text-white">
                Accessibility
              </h4>

              <p className="mt-2 text-xs text-slate-500">
                Wheelchair access, lift support, and mobility features.
              </p>
            </div>

            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={venueData.accessibility}
                onChange={(e) =>
                  setVenueData((prev: any) => ({
                    ...prev,
                    accessibility: e.target.checked,
                  }))
                }
                className="peer sr-only"
              />

              <div
  className="
    relative h-[16px] w-[28px]
    rounded-full
    bg-black
    border border-[#3F3F46]
    after:absolute
    after:left-[2px]
    after:top-[2px]
    after:h-[10px]
    after:w-[10px]
    after:rounded-full
    after:bg-white
    after:transition-all
    peer-checked:bg-white
    peer-checked:after:bg-black
    peer-checked:after:translate-x-[12px]
  "
/>
            </label>
          </div>
        </div>
        {/* Map */}
         <div className="rounded-2xl border border-slate-800 bg-[#121212] p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">
                Location on Map
              </h3>

              <p className="text-xs text-slate-500">
                Based on the address you provided
              </p>
            </div>

            <input
              type="text"
              placeholder="Search by Location"
              className="w-64 rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none focus:border-[#F5C37A]"
            />
          </div>

           <div className="flex h-[220px] items-center justify-center rounded-xl border border-white/10 bg-black text-slate-500" >
            Google Map Here
          </div>
        </div>
      </div>
    </div>
    </div>
  )
}