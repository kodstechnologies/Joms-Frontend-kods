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
    <div className="animate-in fade-in slide-in-from-right-4 mx-auto w-full max-w-[850px] rounded-lg border border-white/5 bg-[#151515] p-6 shadow-xl duration-300">
      <div className="mb-8">
        <h2 className="mb-1 text-[15px] font-bold text-white">About Venue</h2>
        <p className="text-[12px] font-medium text-[#777777]">
          Venue details fetched from backend
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2.5">
          <label className="text-[12px] font-bold tracking-tight text-white">
            Venue Name *
          </label>
          <input
            type="text"
            value={venueData.venueName}
            disabled
            className="w-full cursor-not-allowed rounded-md border border-white/10 bg-black px-4 py-3 text-[12px] text-white outline-none opacity-80"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-2.5">
            <label className="text-[12px] font-bold tracking-tight text-white">
              Venue Type *
            </label>
            <input
              type="text"
              value={venueData.venueType}
              disabled
              className="w-full cursor-not-allowed rounded-md border border-white/10 bg-black px-4 py-3 text-[12px] text-white outline-none opacity-80"
            />
          </div>

          <div className="space-y-2.5">
            <label className="text-[12px] font-bold tracking-tight text-white">
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
              className="w-full rounded-md border border-white/10 bg-black px-4 py-3 text-[12px] text-white outline-none focus:border-[#FBC078]"
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

        <div className="space-y-2.5">
          <label className="text-[12px] font-bold tracking-tight text-white">
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
            className="w-full resize-none rounded-md border border-white/10 bg-black px-4 py-3 text-[12px] text-white outline-none focus:border-[#FBC078]"
          />
          <div className="text-right text-[11px] text-[#777777]">
            {venueData.aboutVenue.length}/350
          </div>
        </div>
      </div>
    </div>
  )
}
