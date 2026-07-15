import { useServiceCategoriesByType } from '../hooks/use-service-categories'
import type { VenueFormData } from '../utils/venue-form'

interface VenueDetailsStepProps {
  venueData: Pick<VenueFormData, 'venueName' | 'venueType' | 'venueCategory' | 'aboutVenue'>
  setVenueData: React.Dispatch<React.SetStateAction<VenueFormData>>
}

export const VenueDetailsStep = ({ venueData, setVenueData }: VenueDetailsStepProps) => {
  const { data: categoriesData, isLoading: isCategoriesLoading } =
    useServiceCategoriesByType('venue')
  const categoryGroups = categoriesData?.data || {}
  const categories = Object.values(categoryGroups).flat()

  return (
    <div className="animate-in fade-in slide-in-from-right-4 mx-auto w-full max-w-[850px] rounded-lg border border-white/5 bg-[#151515] p-6 shadow-xl duration-300">
      <div className="mb-8">
        <h2 className="mb-1 text-[15px] font-bold text-white">About Venue</h2>
        <p className="text-[12px] font-medium text-[#777777]">Venue details fetched from backend</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2.5">
          <label className="text-[12px] font-bold tracking-tight text-white">Venue Name *</label>
          <input
            type="text"
            value={venueData.venueName}
            disabled
            className="w-full cursor-not-allowed rounded-md border border-white/10 bg-black px-4 py-3 text-[12px] text-white opacity-80 outline-none"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-2.5">
            <label className="text-[12px] font-bold tracking-tight text-white">Venue Type *</label>
            <input
              type="text"
              value={venueData.venueType}
              disabled
              className="w-full cursor-not-allowed rounded-md border border-white/10 bg-black px-4 py-3 text-[12px] text-white opacity-80 outline-none"
            />
          </div>

          <div className="space-y-2.5">
            <label className="text-[12px] font-bold tracking-tight text-white">
              Venue Category *
            </label>
            <select
              value={venueData.venueCategory}
              onChange={(e) =>
                setVenueData((prev) => ({
                  ...prev,
                  venueCategory: e.target.value,
                }))
              }
              className="focus:border-brand-accent w-full rounded-md border border-white/10 bg-black px-4 py-3 text-[12px] text-white outline-none"
            >
              <option value="">
                {isCategoriesLoading ? 'Loading categories...' : 'Select category'}
              </option>
              {!isCategoriesLoading && categories.length === 0 && (
                <option value="" disabled>
                  No venue categories found
                </option>
              )}
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2.5">
          <label className="text-[12px] font-bold tracking-tight text-white">About Venue *</label>
          <textarea
            rows={6}
            value={venueData.aboutVenue}
            onChange={(e) =>
              setVenueData((prev) => ({
                ...prev,
                aboutVenue: e.target.value,
              }))
            }
            maxLength={350}
            className="focus:border-brand-accent w-full resize-none rounded-md border border-white/10 bg-black px-4 py-3 text-[12px] text-white outline-none"
          />
          <div className="text-right text-[11px] text-[#777777]">
            {venueData.aboutVenue.length}/350
          </div>
        </div>
      </div>
    </div>
  )
}
