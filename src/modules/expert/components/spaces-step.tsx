import type { VenueFormData } from '../utils/venue-form'
import { RequiredMark } from '@/shared/components/form/required-mark'

interface SpacesStepProps {
  venueData: VenueFormData
  setVenueData: React.Dispatch<React.SetStateAction<VenueFormData>>
  isEditMode?: boolean
}

type ToggleKey = 'parkingAvailable' | 'accessibility' | 'inHouseCatering' | 'decorationAvailable'

const TOGGLE_ITEMS: Array<{ title: string; key: ToggleKey; desc: string }> = [
  {
    title: 'Parking availability',
    key: 'parkingAvailable',
    desc: 'Is parking available at your venue?',
  },
  {
    title: 'Accessibility',
    key: 'accessibility',
    desc: 'Wheelchair access, lift support, and essential mobility features included.',
  },
  {
    title: 'In-house catering',
    key: 'inHouseCatering',
    desc: 'Do you provide catering service in your venue?',
  },
  {
    title: 'Decoration',
    key: 'decorationAvailable',
    desc: 'Do you provide decoration in your venue?',
  },
]

export const SpacesStep = ({ venueData, setVenueData, isEditMode = false }: SpacesStepProps) => {
  const capacityType = venueData.capacityType || 'seated'

  const locationType = venueData.locationType || 'same'

  return (
    <div className="mx-auto w-full max-w-[1140px] space-y-6">
      <div className="animate-in fade-in slide-in-from-right-4 bg-brand-surface rounded-lg border border-white/5 p-6 shadow-xl duration-300">
        <div className="mb-8">
          <h2 className="mb-1 text-[15px] font-bold text-white">
            {isEditMode ? 'Edit Space Details' : 'Add Space Details'}
          </h2>
          <p className="text-body-sm text-muted font-medium">
            Provide details about your space offering
          </p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2.5">
            <label className="font-bold text-white">Space Name</label>

            <input
              type="text"
              value={venueData.spaceName || ''}
              onChange={(e) =>
                setVenueData((prev) => ({
                  ...prev,
                  spaceName: e.target.value,
                }))
              }
              placeholder="e.g NDA Review & Legal Advisory"
              className="focus:border-brand-accent w-full rounded-xl border border-white/10 bg-black p-4 text-white outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-white">Space Type</label>

              <select
                value={venueData.spaceType || ''}
                onChange={(e) =>
                  setVenueData((prev) => ({
                    ...prev,
                    spaceType: e.target.value,
                  }))
                }
                className="focus:border-brand-accent w-full rounded-xl border border-white/10 bg-black p-4 text-white outline-none"
              >
                <option value="">Select Space Type</option>

                <option value="auditorium">Auditorium</option>

                <option value="restaurant">Restaurant</option>
              </select>
            </div>

            {venueData.spaceType === 'restaurant' ? (
              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  No. Guests Allowed
                </label>

                <input
                  type="text"
                  value={venueData.guestCount || ''}
                  onChange={(e) =>
                    setVenueData((prev) => ({
                      ...prev,
                      guestCount: e.target.value,
                    }))
                  }
                  placeholder="100-200"
                  className="focus:border-brand-accent w-full rounded-xl border border-white/10 bg-black p-4 text-white outline-none"
                />
              </div>
            ) : (
              <div>
                <label className="mb-2 block text-sm font-medium text-white">Capacity</label>

                <div className="overflow-hidden rounded-xl border border-white/10">
                  <div className="flex">
                    <button
                      type="button"
                      onClick={() =>
                        setVenueData((prev) => ({
                          ...prev,
                          capacityType: 'seated',
                        }))
                      }
                      className={`flex-1 py-3 text-sm font-medium ${
                        capacityType === 'seated' ? 'bg-white/7 text-white' : 'bg-black text-white'
                      }`}
                    >
                      Seated
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setVenueData((prev) => ({
                          ...prev,
                          capacityType: 'standing',
                        }))
                      }
                      className={`flex-1 py-3 text-sm font-medium ${
                        capacityType === 'standing'
                          ? 'bg-white/7 text-white'
                          : 'bg-black text-white'
                      }`}
                    >
                      Standing
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div
            className={`grid gap-6 ${capacityType === 'seated' ? 'grid-cols-3' : 'grid-cols-1'}`}
          >
            {venueData.spaceType !== 'restaurant' && (
              <div>
                <label className="mb-2 block text-sm font-medium text-white">Area Sq Feet</label>

                <input
                  type="text"
                  value={venueData.areaSqFt || ''}
                  onChange={(e) =>
                    setVenueData((prev) => ({
                      ...prev,
                      areaSqFt: e.target.value,
                    }))
                  }
                  placeholder="Enter Text"
                  className="focus:border-brand-accent w-full rounded-xl border border-white/10 bg-black p-4 text-white outline-none"
                />
              </div>
            )}

            {venueData.spaceType !== 'restaurant' && capacityType === 'seated' && (
              <>
                <div>
                  <label className="mb-2 block text-sm font-medium text-white">How Many</label>

                  <input
                    type="text"
                    value={venueData.guestCount || ''}
                    onChange={(e) =>
                      setVenueData((prev) => ({
                        ...prev,
                        guestCount: e.target.value,
                      }))
                    }
                    placeholder="100-150"
                    className="focus:border-brand-accent w-full rounded-xl border border-white/10 bg-black p-4 text-white outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-white">Seating Type</label>

                  <input
                    type="text"
                    value={venueData.seatingType || ''}
                    onChange={(e) =>
                      setVenueData((prev) => ({
                        ...prev,
                        seatingType: e.target.value,
                      }))
                    }
                    placeholder="Theatre Seating"
                    className="focus:border-brand-accent w-full rounded-xl border border-white/10 bg-black p-4 text-white outline-none"
                  />
                </div>
              </>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-white">Location</label>

            <div className="overflow-hidden rounded-xl border border-white/10">
              <div className="flex">
                <button
                  type="button"
                  onClick={() =>
                    setVenueData((prev) => ({
                      ...prev,
                      locationType: 'same',
                    }))
                  }
                  className={`flex-1 py-3 text-sm font-medium ${
                    locationType === 'same' ? 'bg-white/7 text-white' : 'bg-black text-white'
                  }`}
                >
                  Same as venue
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setVenueData((prev) => ({
                      ...prev,
                      locationType: 'different',
                    }))
                  }
                  className={`flex-1 py-3 text-sm font-medium ${
                    locationType === 'different' ? 'bg-white/7 text-white' : 'bg-black text-white'
                  }`}
                >
                  Different
                </button>
              </div>
            </div>
          </div>

          {locationType === 'different' && (
            <div>
              <label className="mb-2 block text-sm font-medium text-white">
                Enter Address <RequiredMark />
              </label>

              <textarea
                rows={3}
                className="focus:border-brand-accent w-full rounded-xl border border-white/10 bg-black p-4 text-white outline-none"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-x-12 gap-y-8">
            {TOGGLE_ITEMS.map((item) => (
              <div key={item.title} className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-medium text-white">{item.title}</h4>

                  <p className="text-muted mt-2 text-xs">{item.desc}</p>
                </div>

                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={Boolean(venueData[item.key])}
                    onChange={(e) =>
                      setVenueData((prev) => ({
                        ...prev,
                        [item.key]: e.target.checked,
                      }))
                    }
                    className="peer sr-only"
                  />

                  <div className="relative h-[16px] w-[28px] rounded-full border border-[#3F3F46] bg-black peer-checked:bg-white after:absolute after:top-[2px] after:left-[2px] after:h-[10px] after:w-[10px] after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-[12px] peer-checked:after:bg-black" />
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>

      {locationType === 'different' && (
        <div className="bg-brand-surface rounded-lg border border-white/5 p-5 shadow-xl">
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
      )}
    </div>
  )
}
