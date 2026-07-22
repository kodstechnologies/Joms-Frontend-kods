import { useRef } from 'react'
import { Search, Upload } from 'lucide-react'

import { useServiceCategoriesByType } from '../hooks/use-service-categories'
import type { VenueOnboardingFormData } from '../utils/venue-onboarding-form'
import { sanitizeMobileNumber } from '@/shared/lib/phone'

const fieldClass = 'ui-input'

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
      <div className="animate-in fade-in slide-in-from-right-4 bg-brand-surface rounded-lg border border-white/5 p-6 duration-300">
        <div className="mb-6">
          <h2 className="text-sm font-bold text-white">Basic Profile Setup</h2>
          <p className="text-muted mt-1 text-xs">Core identity details and profile media</p>
        </div>

        <div className="mb-8">
          <div className="relative">
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              className="hover:border-brand-accent/50 flex h-32 w-full items-center justify-center rounded-md border border-dashed border-white/20 bg-black transition-colors"
            >
              {formData.coverImageUrl ? (
                <img
                  src={formData.coverImageUrl}
                  alt="Cover"
                  className="h-full w-full rounded-md object-cover"
                />
              ) : (
                <div className="text-center">
                  <Upload className="text-muted mx-auto mb-2 size-5" />
                  <p className="text-muted text-xs">Upload Cover Image</p>
                </div>
              )}
            </button>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleImageChange('coverImage', e.target.files?.[0] ?? null)}
            />

            <button
              type="button"
              onClick={() => profileInputRef.current?.click()}
              className="border-brand-surface absolute -bottom-8 left-6 size-16 overflow-hidden rounded-full border-4 bg-slate-600"
            >
              {formData.profileImageUrl ? (
                <img
                  src={formData.profileImageUrl}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Upload className="text-muted size-4" />
                </div>
              )}
            </button>
            <input
              ref={profileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleImageChange('profileImage', e.target.files?.[0] ?? null)}
            />
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs font-medium text-white">Venue Name *</label>
            <input
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Full Name"
              className={fieldClass}
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-white">Service Type</label>
            <input
              value={formData.venueType}
              disabled
              placeholder="Venue Partner"
              className={`${fieldClass} text-muted cursor-not-allowed opacity-70`}
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-white">Hosting since</label>
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
            <label className="mb-2 block text-xs font-medium text-white">Category *</label>
            <div className="relative">
              <Search className="text-muted absolute top-1/2 left-3 size-4 -translate-y-1/2" />
              <select
                value={formData.venueCategoryId}
                onChange={(e) => {
                  const selectedId = e.target.value
                  const selectedCategory = categories.find((cat) => cat.id === selectedId)
                  setFormData((prev) => ({
                    ...prev,
                    venueCategoryId: selectedId,
                    venueCategoryName: selectedCategory?.name || '',
                  }))
                }}
                className={`${fieldClass} appearance-none pl-10`}
              >
                <option value="">{isCategoriesLoading ? 'Loading categories...' : 'Search'}</option>
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
              onChange={(e) => setFormData((prev) => ({ ...prev, pocName: e.target.value }))}
              placeholder="Enter Name"
              className={fieldClass}
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-white">POC Contact</label>
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
            <label className="mb-2 block text-xs font-medium text-white">Phone Number *</label>
            <input
              type="tel"
              inputMode="numeric"
              maxLength={10}
              value={formData.phone}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  phone: sanitizeMobileNumber(e.target.value),
                }))
              }
              placeholder="Enter 10-digit mobile number"
              className={fieldClass}
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-white">Email ID *</label>
            <input
              value={formData.email}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
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
