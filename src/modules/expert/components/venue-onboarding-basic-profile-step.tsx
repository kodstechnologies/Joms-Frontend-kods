import { useRef } from 'react'
import { Search, Upload } from 'lucide-react'

import { useServiceCategoriesByType } from '../hooks/use-service-categories'
import type { VenueOnboardingFormData } from '../utils/venue-onboarding-form'

const fieldClass =
  'h-10 w-full rounded-md border border-white/10 bg-black px-3 text-sm text-white outline-none placeholder:text-[#666] focus:border-[#FBC078]'

type Props = {
  formData: VenueOnboardingFormData
  setFormData: React.Dispatch<React.SetStateAction<VenueOnboardingFormData>>
}

export const VenueOnboardingBasicProfileStep = ({ formData, setFormData }: Props) => {
  const profileInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)
  const { data: categoriesData, isLoading: isCategoriesLoading } =
    useServiceCategoriesByType('venue')
  const categoryGroups = categoriesData?.data || {}
  const categories = Object.values(categoryGroups).flat()

  const handleImageChange = (field: 'profileImage' | 'coverImage', file: File | null) => {
    setFormData((prev) => {
      if (field === 'profileImage') {
        return {
          ...prev,
          profileImage: file,
          profileImageUrl: file ? URL.createObjectURL(file) : prev.profileImageUrl,
        }
      }
      return {
        ...prev,
        coverImage: file,
        coverImageUrl: file ? URL.createObjectURL(file) : prev.coverImageUrl,
      }
    })
  }

  return (
    <div className="mx-auto w-full max-w-[850px]">
      <div className="animate-in fade-in slide-in-from-right-4 rounded-lg border border-white/5 bg-[#151515] p-6 duration-300">
        <div className="mb-6">
          <h2 className="text-sm font-bold text-white">Basic Profile Setup</h2>
          <p className="mt-1 text-xs text-[#777777]">
            Core identity details and profile media
          </p>
        </div>

        <div className="mb-8">
          <div className="relative">
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              className="flex h-32 w-full items-center justify-center rounded-md border border-dashed border-[#444] bg-black transition-colors hover:border-[#FBC078]/50"
            >
              {formData.coverImageUrl ? (
                <img
                  src={formData.coverImageUrl}
                  alt="Cover"
                  className="h-full w-full rounded-md object-cover"
                />
              ) : (
                <div className="text-center">
                  <Upload className="mx-auto mb-2 size-5 text-[#777]" />
                  <p className="text-xs text-[#777]">Upload Cover Image</p>
                </div>
              )}
            </button>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) =>
                handleImageChange('coverImage', e.target.files?.[0] ?? null)
              }
            />

            <button
              type="button"
              onClick={() => profileInputRef.current?.click()}
              className="absolute -bottom-8 left-6 size-16 overflow-hidden rounded-full border-4 border-[#151515] bg-slate-600"
            >
              {formData.profileImageUrl ? (
                <img
                  src={formData.profileImageUrl}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Upload className="size-4 text-[#999]" />
                </div>
              )}
            </button>
            <input
              ref={profileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) =>
                handleImageChange('profileImage', e.target.files?.[0] ?? null)
              }
            />
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs font-medium text-white">
              Venue Name *
            </label>
            <input
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Full Name"
              className={fieldClass}
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-white">
              Service Type
            </label>
            <input
              value={formData.venueType}
              disabled
              placeholder="Venue Partner"
              className={`${fieldClass} cursor-not-allowed text-[#888] opacity-70`}
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-white">
              Hosting since
            </label>
            <input
              value={formData.hostingSinceYears}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, hostingSinceYears: e.target.value }))
              }
              placeholder="Enter year"
              type="number"
              min={0}
              className={fieldClass}
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-white">
              Category *
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#777]" />
              <select
                value={formData.venueCategoryId}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, venueCategoryId: e.target.value }))
                }
                className={`${fieldClass} appearance-none pl-10`}
              >
                <option value="">
                  {isCategoriesLoading ? 'Loading categories...' : 'Search'}
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

          <div>
            <label className="mb-2 block text-xs font-medium text-white">POC Name</label>
            <input
              value={formData.pocName}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, pocName: e.target.value }))
              }
              placeholder="Enter Name"
              className={fieldClass}
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-white">
              POC Contact
            </label>
            <input
              value={formData.pocContactNumber}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, pocContactNumber: e.target.value }))
              }
              placeholder="Enter username"
              className={fieldClass}
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-white">
              Phone Number *
            </label>
            <input
              value={formData.phone}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, phone: e.target.value }))
              }
              placeholder="Enter phone number"
              className={fieldClass}
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-white">
              Email ID *
            </label>
            <input
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              placeholder="Enter Email ID"
              type="email"
              className={fieldClass}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
