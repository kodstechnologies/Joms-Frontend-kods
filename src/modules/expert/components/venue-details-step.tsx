import { useVenueCategories } from '../hooks/use-venue-categories'

interface VenueDetailsStepProps {
  venueData: {
    venueName: string
    venueType: string
    venueCategory: string
    aboutVenue: string
  }
  setVenueData: React.Dispatch<React.SetStateAction<any>>
}

export const VenueDetailsStep = ({
  venueData,
  setVenueData,
}: VenueDetailsStepProps) => {
  const { data: categoriesData } = useVenueCategories()
  const categories = categoriesData?.data || []

  return (
    <div className="mx-auto max-w-5xl">
      <div className="animate-in fade-in slide-in-from-right-4 duration-300 rounded-2xl border border-slate-800 bg-[#121212] p-8">
        <div className="mb-8">
          <h2 className="mb-1 text-[18px] font-bold text-white">
            About Venue
          </h2>
          <p className="text-[14px] font-medium text-[#888888]">
            Venue details fetched from backend
          </p>
        </div>

        <div className="space-y-6">
          {/* Venue Name — read only */}
          <div className="space-y-2.5">
            <label className="text-[14px] font-bold text-white">
              Venue Name *
            </label>
            <input
              type="text"
              value={venueData.venueName}
              disabled
              className="w-full cursor-not-allowed rounded-xl border border-white/10 bg-black p-4 text-white outline-none opacity-80"
            />
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Venue Type — read only */}
            <div className="space-y-2.5">
              <label className="text-[14px] font-bold text-white">
                Venue Type *
              </label>
              <input
                type="text"
                value={venueData.venueType}
                disabled
                className="w-full cursor-not-allowed rounded-xl border border-white/10 bg-black p-4 text-white outline-none opacity-80"
              />
            </div>

            {/* Venue Category — dynamic from API, stores _id */}
            <div className="space-y-2.5">
              <label className="text-[14px] font-bold text-white">
                Venue Category *
              </label>
              <select
                value={venueData.venueCategory}
                onChange={(e) =>
                  setVenueData((prev: any) => ({
                    ...prev,
                    venueCategory: e.target.value,
                  }))
                }
                className="w-full rounded-xl border border-white/10 bg-black p-4 text-white outline-none focus:border-[#F5C37A]"
              >
                <option value="">Select category</option>
                {categories.map((cat: { _id: string; name: string }) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* About Venue */}
          <div className="space-y-2.5">
            <label className="text-[14px] font-bold text-white">
              About Venue *
            </label>
            <textarea
              rows={6}
              value={venueData.aboutVenue}
              onChange={(e) =>
                setVenueData((prev: any) => ({
                  ...prev,
                  aboutVenue: e.target.value,
                }))
              }
              maxLength={350}
              className="w-full resize-none rounded-xl border border-white/10 bg-black p-4 text-white outline-none focus:border-[#F5C37A]"
            />
            <div className="text-right text-xs text-[#666666]">
              {venueData.aboutVenue.length}/350
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
