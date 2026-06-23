import { Plus } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'

interface SpacesStepProps {
  venueData: any
  setVenueData: React.Dispatch<React.SetStateAction<any>>
}

export const SpacesStep = ({
  venueData,
  setVenueData,
}: SpacesStepProps) => {
  const capacityType =
    venueData.capacityType || 'seated'

  const locationType =
    venueData.locationType || 'same'

  return (
    <div className="mx-auto w-full max-w-[850px]">
      <div className="animate-in fade-in slide-in-from-right-4 duration-300 rounded-2xl border border-slate-800 bg-[#121212] p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="mb-1 text-[18px] font-bold text-white">
              Add Space Details
            </h2>

            <p className="text-[14px] font-medium text-[#888888]">
              Provide details about your service offering
            </p>
          </div>

          <Button className="bg-[#FBC078] text-black hover:bg-[#eeb46a]">
            <Plus className="mr-2 size-4" />
            Add Space
          </Button>
        </div>

        <div className="space-y-6">
          {/* Space Name */}
          <div className="space-y-2.5">
            <label className="font-bold text-white">
              Space Name
            </label>

            <input
              type="text"
              value={venueData.spaceName || ''}
              onChange={(e) =>
                setVenueData((prev: any) => ({
                  ...prev,
                  spaceName: e.target.value,
                }))
              }
              placeholder="e.g NDA Review & Legal Advisory"
              className="w-full rounded-xl border border-white/10 bg-black p-4 text-white outline-none focus:border-[#F5C37A]"
            />
          </div>

          {/* Space Type & Capacity */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-white">
                Space Type
              </label>

              <select
                value={venueData.spaceType || ''}
                onChange={(e) =>
                  setVenueData((prev: any) => ({
                    ...prev,
                    spaceType: e.target.value,
                  }))
                }
                className="w-full rounded-xl border border-white/10 bg-black p-4 text-white outline-none focus:border-[#F5C37A]"
              >
                <option value="">
                  Select Space Type
                </option>

                <option value="auditorium">
                  Auditorium
                </option>

                <option value="restaurant">
                  Restaurant
                </option>
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
                    setVenueData((prev: any) => ({
                      ...prev,
                      guestCount: e.target.value,
                    }))
                  }
                  placeholder="100-200"
                  className="w-full rounded-xl border border-white/10 bg-black p-4 text-white outline-none focus:border-[#F5C37A]"
                />
              </div>
            ) : (
              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Capacity
                </label>

                <div className="overflow-hidden rounded-xl border border-white/10">
                  <div className="flex">
                    <button
                      type="button"
                      onClick={() =>
                        setVenueData((prev: any) => ({
                          ...prev,
                          capacityType: 'seated',
                        }))
                      }
                      className={`flex-1 py-3 text-sm font-medium ${capacityType === 'seated'
                        ? 'bg-[#2A2A2A] text-white'
                        : 'bg-black text-white'
                        }`}
                    >
                      Seated
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setVenueData((prev: any) => ({
                          ...prev,
                          capacityType: 'standing',
                        }))
                      }
                      className={`flex-1 py-3 text-sm font-medium ${capacityType === 'standing'
                        ? 'bg-[#2A2A2A] text-white'
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
            className={`grid gap-6 ${capacityType === 'seated'
              ? 'grid-cols-3'
              : 'grid-cols-1'
              }`}
          >
            {venueData.spaceType !== 'restaurant' && (
              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Area Sq Feet
                </label>

                <input
                  type="text"
                  value={venueData.areaSqFt || ''}
                  onChange={(e) =>
                    setVenueData((prev: any) => ({
                      ...prev,
                      areaSqFt: e.target.value,
                    }))
                  }
                  placeholder="Enter Text"
                  className="w-full rounded-xl border border-white/10 bg-black p-4 text-white outline-none focus:border-[#F5C37A]"
                />
              </div>
            )}

            {venueData.spaceType !== 'restaurant' &&
              capacityType === 'seated' && (
                <>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-white">
                      How Many
                    </label>

                    <input
                      type="text"
                      value={venueData.guestCount || ''}
                      onChange={(e) =>
                        setVenueData((prev: any) => ({
                          ...prev,
                          guestCount: e.target.value,
                        }))
                      }
                      placeholder="100-150"
                      className="w-full rounded-xl border border-white/10 bg-black p-4 text-white outline-none focus:border-[#F5C37A]"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-white">
                      Seating Type
                    </label>

                    <input
                      type="text"
                      value={venueData.seatingType || ''}
                      onChange={(e) =>
                        setVenueData((prev: any) => ({
                          ...prev,
                          seatingType: e.target.value,
                        }))
                      }
                      placeholder="Theatre Seating"
                      className="w-full rounded-xl border border-white/10 bg-black p-4 text-white outline-none focus:border-[#F5C37A]"
                    />
                  </div>
                </>
              )}
          </div>


          <div>
            <label className="mb-2 block text-sm font-medium text-white">
              Location
            </label>

            <div className="overflow-hidden rounded-xl border border-white/10">
              <div className="flex">
                <button
                  type="button"
                  onClick={() =>
                    setVenueData((prev: any) => ({
                      ...prev,
                      locationType: 'same',
                    }))
                  }
                  className={`flex-1 py-3 text-sm font-medium ${locationType === 'same'
                    ? 'bg-[#2A2A2A] text-white'
                    : 'bg-black text-white'
                    }`}
                >
                  Same as venue
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setVenueData((prev: any) => ({
                      ...prev,
                      locationType: 'different',
                    }))
                  }
                  className={`flex-1 py-3 text-sm font-medium ${locationType === 'different'
                    ? 'bg-[#2A2A2A] text-white'
                    : 'bg-black text-white'
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
                Enter Address *
              </label>

              <textarea
                rows={3}
                className="w-full rounded-xl border border-white/10 bg-black p-4 text-white outline-none focus:border-[#F5C37A]"
              />
            </div>
          )}

          {/* Toggles */}
          <div className="grid grid-cols-2 gap-x-12 gap-y-8">
            {[
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
            ].map((item: any) => (
              <div
                key={item.title}
                className="flex items-start justify-between"
              >
                <div>
                  <h4 className="text-sm font-medium text-white">
                    {item.title}
                  </h4>

                  <p className="mt-2 text-xs text-slate-500">
                    {item.desc}
                  </p>
                </div>

                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={venueData[item.key] || false}
                    onChange={(e) =>
                      setVenueData((prev: any) => ({
                        ...prev,
                        [item.key]: e.target.checked,
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
            ))}
          </div>
        </div>
      </div>

      {locationType === 'different' && (
        <div className="mt-6 rounded-2xl border border-slate-800 bg-[#121212] p-6">
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

          <div className="flex h-[220px] items-center justify-center rounded-xl border border-white/10 bg-black text-slate-500">
            Google Map Here
          </div>
        </div>
      )}
    </div>
  )
}