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
    <div className="animate-in fade-in slide-in-from-right-4 bg-brand-surface mx-auto w-full max-w-[850px] rounded-lg border border-white/5 p-6 shadow-xl duration-300">
      <div className="mb-8">
        <h2 className="mb-1 text-[15px] font-bold text-white">About Venue</h2>
        <p className="text-body-sm text-muted font-medium">Venue details fetched from backend</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2.5">
          <label className="text-body-sm font-bold tracking-tight text-white">Venue Name *</label>
          <input
            type="text"
            value={venueData.venueName}
            disabled
            className="ui-input cursor-not-allowed opacity-80"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-2.5">
            <label className="text-body-sm font-bold tracking-tight text-white">Venue Type *</label>
            <input
              type="text"
              value={venueData.venueType}
              disabled
              className="ui-input cursor-not-allowed opacity-80"
            />
          </div>

          <div className="space-y-2.5">
            <label className="text-body-sm font-bold tracking-tight text-white">
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
              className="ui-input"
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
          <label className="text-body-sm font-bold tracking-tight text-white">About Venue *</label>
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
            className="ui-textarea"
          />
          <div className="text-body-sm text-muted text-right">
            {venueData.aboutVenue.length}/350
          </div>
        </div>
      </div>
    </div>
  )
}
